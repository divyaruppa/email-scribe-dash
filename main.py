# main.py
import os
import asyncio
from queue import PriorityQueue
from typing import Optional, List
from datetime import datetime, timezone, timedelta
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Field, create_engine, Session, select
import csv
import io
from dateutil import parser as dateparser
from dotenv import load_dotenv
from pydantic import BaseModel

from ai_helpers import call_openai_for_sentiment_and_summary, generate_reply_with_kb
from supabase_client import fetch_all_emails  # Import Supabase client functions

# ---------------- Load environment ----------------
load_dotenv()

# ---------------- Database Setup ----------------
DB_URL = os.getenv("DATABASE_URL", "sqlite:///./emails.db")
engine = create_engine(DB_URL, echo=False, connect_args={"check_same_thread": False} if "sqlite" in DB_URL else {})

app = FastAPI(title="AI Email Management Backend")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPPORT_KEYWORDS = ["support", "query", "request", "help"]
URGENT_KEYWORDS = ["immediately", "urgent", "critical", "cannot access", "asap", "fail", "blocked"]

# ---------- DB Models ----------
class Email(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    sender: str
    subject: str
    body: str
    received_at: datetime
    sentiment: Optional[str] = None
    priority: Optional[str] = None
    extracted_info: Optional[str] = None
    ai_reply: Optional[str] = None
    resolved: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

SQLModel.metadata.create_all(engine)

# ---------- Priority queue ----------
processing_queue = PriorityQueue()

# ---------- Utilities ----------
def contains_keywords(text: str, keywords: List[str]) -> bool:
    t = text.lower()
    return any(kw.lower() in t for kw in keywords)

# ---------- Background processing ----------
async def process_email_pipeline(email_id: int):
    with Session(engine) as session:
        email_obj = session.get(Email, email_id)
        if not email_obj:
            return
        try:
            ai_result = await call_openai_for_sentiment_and_summary(email_obj.body)
        except Exception:
            ai_result = {"sentiment": "Neutral", "extracted": "", "reply": "Unable to generate reply due to API error."}
        priority = "Urgent" if contains_keywords(email_obj.body, URGENT_KEYWORDS) or contains_keywords(email_obj.subject, URGENT_KEYWORDS) else "Not urgent"
        email_obj.sentiment = ai_result.get("sentiment") or "Neutral"
        email_obj.extracted_info = ai_result.get("extracted") or ai_result.get("summary") or ""
        email_obj.ai_reply = ai_result.get("reply") or await generate_reply_with_kb(email_obj.body, None)
        email_obj.priority = priority
        session.add(email_obj)
        session.commit()

async def background_worker():
    while True:
        try:
            priority_score, email_id = processing_queue.get(block=False)
        except Exception:
            await asyncio.sleep(1.0)
            continue
        try:
            await process_email_pipeline(email_id)
        except Exception as e:
            print("Error processing email", email_id, e)
        await asyncio.sleep(0.1)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(background_worker())

# ---------- API Models ----------
class UploadCSVResponse(BaseModel):
    inserted: int

class EmailOut(BaseModel):
    id: int
    sender: str
    subject: str
    received_at: datetime
    sentiment: Optional[str]
    priority: Optional[str]
    extracted_info: Optional[str]
    ai_reply: Optional[str]
    resolved: bool

class SendReplyIn(BaseModel):
    reply_text: Optional[str] = None
    send_now: bool = False

# ---------- API Endpoints ----------
@app.get("/")
async def root():
    return {"message": "AI Email Management Backend is running!"}

@app.post("/upload-csv", response_model=UploadCSVResponse)
async def upload_csv(file: UploadFile = File(...)):
    content = await file.read()
    stream = io.StringIO(content.decode("utf-8", errors="replace"))
    reader = csv.DictReader(stream)
    inserted = 0
    with Session(engine) as session:
        for row in reader:
            sender = row.get("sender") or row.get("from") or ""
            subject = row.get("subject") or ""
            body = row.get("body") or row.get("email_body") or ""
            received_at_raw = row.get("received_at") or row.get("date") or ""
            try:
                received_at = dateparser.parse(received_at_raw) if received_at_raw else datetime.now(timezone.utc)
            except:
                received_at = datetime.now(timezone.utc)
            email_obj = Email(sender=sender, subject=subject, body=body, received_at=received_at)
            session.add(email_obj)
            session.commit()
            priority_score = 0 if contains_keywords(subject + " " + body, URGENT_KEYWORDS) else 1
            processing_queue.put((priority_score, email_obj.id))
            inserted += 1
    return {"inserted": inserted}

@app.get("/emails", response_model=List[EmailOut])
async def list_emails(limit: int = 100, offset: int = 0, sentiment: Optional[str] = None, priority: Optional[str] = None):
    with Session(engine) as session:
        query = select(Email).order_by(Email.received_at.desc()).offset(offset).limit(limit)
        if sentiment:
            query = query.where(Email.sentiment == sentiment)
        if priority:
            query = query.where(Email.priority == priority)
        results = session.exec(query).all()
        return [EmailOut(**vars(e)) for e in results]

@app.get("/emails/{email_id}")
async def get_email(email_id: int):
    with Session(engine) as session:
        e = session.get(Email, email_id)
        if not e:
            raise HTTPException(status_code=404, detail="Email not found")
        return e

@app.post("/emails/{email_id}/reply")
async def reply_email(email_id: int, payload: SendReplyIn):
    with Session(engine) as session:
        e = session.get(Email, email_id)
        if not e:
            raise HTTPException(status_code=404, detail="Email not found")
        text = payload.reply_text or e.ai_reply or ""
        e.ai_reply = text
        if payload.send_now:
            e.resolved = True
        session.add(e)
        session.commit()
        return {"ok": True, "reply_saved": True}

@app.get("/analytics")
async def analytics():
    since_24h = datetime.now(timezone.utc) - timedelta(hours=24)
    with Session(engine) as session:
        total_24 = session.exec(select(Email).where(Email.received_at >= since_24h)).count()
        resolved = session.exec(select(Email).where(Email.resolved == True)).count()
        pending = session.exec(select(Email).where(Email.resolved == False)).count()
        by_sentiment = {
            "Positive": session.exec(select(Email).where(Email.sentiment == "Positive")).count(),
            "Neutral": session.exec(select(Email).where(Email.sentiment == "Neutral")).count(),
            "Negative": session.exec(select(Email).where(Email.sentiment == "Negative")).count(),
        }
        by_priority = {
            "Urgent": session.exec(select(Email).where(Email.priority == "Urgent")).count(),
            "Not urgent": session.exec(select(Email).where(Email.priority == "Not urgent")).count(),
        }
    return {
        "total_last_24h": total_24,
        "resolved": resolved,
        "pending": pending,
        "by_sentiment": by_sentiment,
        "by_priority": by_priority
    }

@app.get("/health")
async def health():
    return {"status": "ok"}

# ---------- Supabase Endpoint ----------
from fastapi import FastAPI
from supabase_client import fetch_all_emails

app = FastAPI()

@app.get("/get-data")
def get_data_endpoint():
    data = fetch_all_emails()
    return {"data": data}



