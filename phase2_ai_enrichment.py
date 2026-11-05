import asyncio
import os
import sys
import re
from urllib.parse import urljoin, urlparse

# Ensure locally installed persistent packages in .python_packages are loaded
pkg_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".python_packages")
if os.path.exists(pkg_dir) and pkg_dir not in sys.path:
    sys.path.insert(0, pkg_dir)

import aiohttp
from bs4 import BeautifulSoup
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from supabase import Client, create_client

# ----------------- LOAD .ENV IF PRESENT -----------------
env_file = os.path.join(os.getcwd(), ".env")
if os.path.exists(env_file):
    try:
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    k, v = k.strip(), v.strip().strip("'\"")
                    if k and not os.environ.get(k):
                        os.environ[k] = v
    except Exception:
        pass

# ----------------- CONFIG & SECRETS -----------------
SUPABASE_URL = (
    os.environ.get("SUPABASE_URL") or 
    os.environ.get("VITE_SUPABASE_URL") or 
    "https://papzanzgzoghrrgdzvfo.supabase.co"
)
SUPABASE_SERVICE_ROLE_KEY = (
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or 
    os.environ.get("SUPABASE_KEY") or 
    os.environ.get("VITE_SUPABASE_ANON_KEY") or
    "sb_publishable_VVfSEHC_sej3qB_Qtxl5yA_fS1ZleG2"
)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("VITE_GEMINI_API_KEY")

print(f"[*] Supabase URL: {SUPABASE_URL}")
print(f"[*] Supabase Key: {'Configured (' + SUPABASE_SERVICE_ROLE_KEY[:10] + '...)' if SUPABASE_SERVICE_ROLE_KEY else 'Missing'}")
if GEMINI_API_KEY:
    print(f"[*] Gemini AI: Configured ({GEMINI_API_KEY[:8]}...) - Using gemini-2.5-flash")
else:
    print("[!] Notice: GEMINI_API_KEY not set. Using web crawler heuristics (set GEMINI_API_KEY for deep AI extraction).")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
ai_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

ROUTE_KEYWORDS = ["booking", "contact", "about", "rentals", "production", "staff", "hire"]


# ----------------- PYDANTIC SCHEMA FOR STRUCTURED OUTPUT -----------------
class VenueContactExtraction(BaseModel):
    booking_email: str | None = Field(
        default=None,
        description="The primary direct email for booking, talent buying, private events, or general contact. Must be a valid email string or null.",
    )
    talent_buyer_name: str | None = Field(
        default=None,
        description="Name of the talent buyer, booking agent, promoter, or production manager if explicitly stated.",
    )
    phone: str | None = Field(
        default=None,
        description="Direct booking or box office phone number. Format as standard US phone (e.g., (503) 555-0199) or null.",
    )
    notes: str | None = Field(
        default=None,
        description="Brief notes regarding their booking guidelines (e.g., 'submit via web form', 'no covers', '21+ only').",
    )


# ----------------- HTML FETCHER & CLEANER -----------------
async def fetch_html(session: aiohttp.ClientSession, url: str) -> str | None:
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        )
    }
    try:
        async with session.get(
            url, headers=headers, timeout=aiohttp.ClientTimeout(total=8), ssl=False
        ) as resp:
            if resp.status == 200 and "text/html" in resp.headers.get("Content-Type", ""):
                return await resp.text()
    except Exception:
        return None
    return None


def clean_html_to_text(html: str) -> str:
    """Strips CSS, scripts, and navigation boilerplate, returning concise readable text."""
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "svg", "noscript", "iframe"]):
        tag.decompose()

    # Extract clean lines
    lines = (line.strip() for line in soup.get_text().splitlines())
    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
    text = "\n".join(chunk for chunk in chunks if chunk)
    return text[:8000]  # Cap token length per venue crawl


# ----------------- AI EXTRACTION ENGINE -----------------
def extract_contacts_with_gemini(venue_name: str, site_text: str) -> VenueContactExtraction:
    if not ai_client:
        # Regex heuristic fallback when GEMINI_API_KEY is not provided
        email_matches = re.findall(r"\b[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,6}\b", site_text)
        valid_emails = [
            e for e in email_matches 
            if not e.lower().endswith((".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif", ".js"))
        ]
        booking_emails = [e for e in valid_emails if any(k in e.lower() for k in ["book", "talent", "band", "music", "live", "info", "events"])]
        chosen_email = booking_emails[0] if booking_emails else (valid_emails[0] if valid_emails else None)
        if chosen_email:
            # Strip accidental leading 5-digit zip codes
            chosen_email = re.sub(r"^[0-9]{5}", "", chosen_email)

        phone_match = re.search(r"\(?\b[2-9][0-9]{2}\)?[-. ]?[0-9]{3}[-. ]?[0-9]{4}\b", site_text)
        chosen_phone = phone_match.group(0) if phone_match else None

        return VenueContactExtraction(
            booking_email=chosen_email,
            phone=chosen_phone,
            notes="Extracted via crawler pattern analysis (export GEMINI_API_KEY for deep AI extraction)."
        )

    prompt = f"""
    Analyze the following website text for the music venue: "{venue_name}".
    Extract any direct booking email, talent buyer contact, or venue phone number.
    
    WEBSITE TEXT:
    {site_text}
    """

    try:
        response = ai_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=VenueContactExtraction,
                temperature=0.1,
                system_instruction=(
                    "You are an expert booking assistant for GigLizard.us. Extract exact booking emails, "
                    "talent buyer names, and contact phone lines from venue website text. Prioritize booking/talent/production "
                    "contacts over generic webmaster or press emails. Return null if none are present."
                ),
            ),
        )
        return VenueContactExtraction.model_validate_json(response.text)
    except Exception as e:
        print(f"[!] AI extraction error for {venue_name}: {e}")
        return VenueContactExtraction()


# ----------------- WORKFLOW COORDINATOR -----------------
async def process_venue(session: aiohttp.ClientSession, venue: dict):
    venue_id = venue["id"]
    name = venue["name"]
    base_url = venue.get("website_url") or venue.get("website")

    if not base_url or "ticketmaster.com" in base_url:
        print(f"[-] Skipping {name}: Missing custom venue domain.")
        return venue_id, None, "unsupported_domain"

    if not base_url.startswith("http"):
        base_url = "https://" + base_url

    parsed_base = urlparse(base_url)
    domain = parsed_base.netloc
    print(f"[*] Crawling: {name} ({domain})")

    # 1. Fetch Homepage
    homepage_html = await fetch_html(session, base_url)
    gathered_text = ""
    subpages_to_check = set()

    if homepage_html:
        gathered_text += clean_html_to_text(homepage_html)
        soup = BeautifulSoup(homepage_html, "html.parser")
        for link in soup.find_all("a", href=True):
            href = link["href"].strip()
            text = (link.get_text() or "").lower()
            if any(k in href.lower() or k in text for k in ROUTE_KEYWORDS):
                full_url = urljoin(base_url, href)
                if urlparse(full_url).netloc == domain:
                    subpages_to_check.add(full_url)

    # 2. Fetch up to 2 targeted subpages (/booking, /contact)
    for sub_url in list(subpages_to_check)[:2]:
        sub_html = await fetch_html(session, sub_url)
        if sub_html:
            gathered_text += "\n--- SUBPAGE: " + sub_url + " ---\n"
            gathered_text += clean_html_to_text(sub_html)

    if not gathered_text.strip():
        print(f"[!] No content fetched for {name}.")
        return venue_id, None, "failed_empty_content"

    # 3. Process via Gemini Structured Output
    contact_data = extract_contacts_with_gemini(name, gathered_text)
    print(f"[+] Result for {name}: Email={contact_data.booking_email}, Phone={contact_data.phone}")
    return venue_id, contact_data, "enriched"


async def main():
    batch_size = int(os.environ.get("BATCH_SIZE", "50"))
    max_rounds = int(os.environ.get("MAX_ROUNDS", "1"))
    
    total_processed_overall = 0
    total_enriched_overall = 0

    for round_num in range(1, max_rounds + 1):
        print(f"\n[*] --- Round {round_num}/{max_rounds}: Querying up to {batch_size} pending venues ---")
        res = (
            supabase.table("venues")
            .select("*")
            .eq("status", "pending_crawl")
            .limit(batch_size)
            .execute()
        )
        pending_venues = res.data or []

        if not pending_venues:
            print("[+] No remaining venues with status='pending_crawl' in Supabase.")
            break

        print(f"[*] Found {len(pending_venues)} venues with status='pending_crawl'. Starting async crawling...")

        connector = aiohttp.TCPConnector(limit=10)
        async with aiohttp.ClientSession(connector=connector) as session:
            tasks = [process_venue(session, v) for v in pending_venues]
            results = await asyncio.gather(*tasks)

        # Persist updates to Supabase
        updated_count = 0
        enriched_count = 0
        rls_blocked_count = 0
        for venue_id, contact_data, status in results:
            payload = {"status": status}
            if contact_data:
                if contact_data.booking_email:
                    payload["booking_email"] = contact_data.booking_email
                    enriched_count += 1
                if contact_data.phone:
                    payload["phone"] = contact_data.phone

            try:
                update_res = supabase.table("venues").update(payload).eq("id", venue_id).execute()
                if update_res.data:
                    updated_count += 1
                else:
                    rls_blocked_count += 1
            except Exception as update_err:
                print(f"[!] Supabase update error for venue {venue_id}: {update_err}")

        total_processed_overall += updated_count
        total_enriched_overall += enriched_count

        if rls_blocked_count > 0 and updated_count == 0:
            print(f"\n[!] Notice: {rls_blocked_count} venues were crawled successfully, but Supabase RLS requires SUPABASE_SERVICE_ROLE_KEY to persist updates.")
            print("    Run: export SUPABASE_SERVICE_ROLE_KEY='your-service-role-secret-key'")
            print("    Then run: python phase2_ai_enrichment.py")
            break
        else:
            print(f"[+] Round {round_num} complete: processed & persisted {updated_count} venues ({enriched_count} contacts extracted).")

    print(f"\n[+] Total completed: {total_processed_overall} venues processed, {total_enriched_overall} direct contacts extracted & persisted.")


if __name__ == "__main__":
    asyncio.run(main())
