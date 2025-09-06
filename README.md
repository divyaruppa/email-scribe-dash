# AI Email Management Backend

This is the backend for the AI-powered Email Management Dashboard (Lovable frontend).

## Setup

1. Open VS Code → **File → Open Folder** → select project folder
2. Create virtual environment:
   # Windows
   python -m venv venv
   venv\Scripts\activate
   # Mac/Linux
   python -m venv venv
   source venv/bin/activate
3. Install dependencies:
   pip install -r requirements.txt
4. Rename `.env.example` → `.env` and fill credentials
5. Run backend:
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
6. Open browser → `http://127.0.0.1:8000/docs` to test endpoints

## Expose backend to Lovable frontend

1. Install ngrok → run:
   ngrok http 8000
2. Copy the https URL from ngrok
3. Update Lovable frontend API constants:
   const EMAILS_API = "https://abcd1234.ngrok.io/emails";
   const ANALYTICS_API = "https://abcd1234.ngrok.io/analytics";
4. Redeploy frontend
