# ai_helpers.py
import os
import openai
from typing import Optional

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY

async def call_openai_for_sentiment_and_summary(text: str) -> dict:
    """
    Call OpenAI to get sentiment, summary, extracted info, and draft reply.
    """
    if not OPENAI_API_KEY:
        return {"sentiment": "Neutral", "summary": "", "extracted": "", "reply": ""}

    system_prompt = (
        "You are an assistant that extracts sentiment, short summary (1-2 sentences),"
        " essential contact/account info, and drafts a professional, empathetic reply when needed."
    )
    user_prompt = f"""Email body:
{text}

Return a JSON object with keys: sentiment (Positive/Negative/Neutral),
summary (1-2 sentences), extracted (bullet points or JSON string of contact info / requirements),
reply (a draft professional response). Keep reply <= 200 words.
"""

    try:
        resp = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=400,
            temperature=0.0,
        )
        text_out = resp.choices[0].message.content.strip()
        import json
        parsed = json.loads(text_out)
        return parsed
    except Exception:
        # fallback if JSON parse fails
        return {"sentiment": "Neutral", "summary": "", "extracted": "", "reply": text_out}

async def generate_reply_with_kb(email_body: str, kb_context: Optional[str]) -> str:
    """
    RAG-style reply: use KB context if available, else rely on the model.
    """
    prompt = "You are a professional customer support agent. Use the KB context when relevant."
    user = f"KB Context:\n{kb_context or 'N/A'}\n\nCustomer email:\n{email_body}\n\nDraft a concise, empathetic reply (<=200 words)."
    try:
        resp = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": prompt}, {"role": "user", "content": user}],
            max_tokens=400,
            temperature=0.2
        )
        return resp.choices[0].message.content.strip()
    except Exception:
        return "Unable to generate reply due to API error."
