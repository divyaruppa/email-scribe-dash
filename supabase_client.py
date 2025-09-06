import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")  # Must be Service Role Key

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def fetch_all_emails():
    try:
        # fetch all emails, sorted by sent_date descending
        response = supabase.table("Emails").select("*").order("sent_date", desc=True).execute()
        # .data contains the table rows
        return response.data or []
    except Exception as e:
        # Any network or permission issues will be caught here
        print("Exception fetching supabase data:", e)
        return {"error": str(e)}
