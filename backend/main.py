"""
FastAPI Backend Server
Multilingual Client Leads Management API
"""

import logging
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from services.gemini_service import detect_language, translate_to_english, translate_from_english
from services.supabase_service import (
    insert_lead, get_all_leads, get_lead_count, update_lead_status,
    get_lead_by_id, insert_reply, get_replies_for_lead,
)

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Multilingual Client Leads API",
    description="Backend API for managing multilingual client leads",
    version="0.3.0",
)

# CORS configuration — allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------------------------------------ #
#  Auto-assignment agents                                              #
# ------------------------------------------------------------------ #

AGENTS = ["Agent A", "Agent B", "Agent C"]


def tag_lead(translated_message: str) -> str:
    """Derive a tag from the translated (English) message content."""
    text = translated_message.lower()
    if "price" in text or "cost" in text:
        return "pricing"
    if "demo" in text:
        return "demo"
    if "support" in text or "issue" in text:
        return "support"
    if "enterprise" in text:
        return "enterprise"
    return "general"


# ------------------------------------------------------------------ #
#  Models                                                              #
# ------------------------------------------------------------------ #

class LeadRequest(BaseModel):
    """Incoming lead submission from the frontend."""
    name: str
    email: str
    phone: str
    message: str
    language: str = ""  # optional hint from frontend dropdown


class LeadResponse(BaseModel):
    """Response returned after processing and persisting a lead."""
    id: str
    name: str
    email: str
    phone: str
    original_message: str
    translated_message: str
    detected_language: str
    language_code: str
    confidence: str
    status: str
    tag: Optional[str] = None
    assigned_to: Optional[str] = None


class LeadsListResponse(BaseModel):
    """Response for listing leads."""
    leads: list[dict]
    total: int
    limit: int
    offset: int


ALLOWED_STATUSES = ["New", "Contacted", "Qualified", "Lost", "Won"]


class StatusUpdate(BaseModel):
    """Payload for updating a lead's status."""
    status: str


class ReplyRequest(BaseModel):
    """Payload for an agent reply."""
    message: str
    agent_email: str
    agent_name: str = ""


# ------------------------------------------------------------------ #
#  Endpoints                                                           #
# ------------------------------------------------------------------ #

@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "API running"}


@app.post("/leads", response_model=LeadResponse)
async def create_lead(lead: LeadRequest):
    """
    Accept a new lead submission.

    1. Validate input.
    2. Detect the language of the message (Gemini AI).
    3. Translate the message to English if needed.
    4. Persist to Supabase.
    5. Return the processed lead.
    """
    logger.info("Received lead from %s (%s)", lead.name, lead.email)

    # --- Validate basic fields ---
    if not lead.name.strip():
        raise HTTPException(status_code=422, detail="Name is required")
    if not lead.message.strip():
        raise HTTPException(status_code=422, detail="Message is required")

    # --- Step 1: Detect language ---
    detection = await detect_language(lead.message)
    detected_lang = detection["detected_language"]
    lang_code = detection["language_code"]
    confidence = detection["confidence"]

    # If frontend sent a language hint, use it ONLY when Gemini
    # defaulted to English with low confidence (i.e. couldn't detect).
    # If Gemini detected a non-English language, trust that result.
    if lead.language and confidence == "low" and detected_lang == "english":
        from services.gemini_service import LANG_CODE_MAP
        hint = LANG_CODE_MAP.get(lead.language, "")
        if hint and hint != "english":
            detected_lang = hint
            lang_code = lead.language
            confidence = "hint"

    logger.info("Detected language: %s (%s, confidence: %s)",
                detected_lang, lang_code, confidence)

    # --- Step 2: Translate to English ---
    translation = await translate_to_english(lead.message, detected_lang)
    translated_message = translation["translated_text"]

    logger.info("Translation complete: %d → %d chars",
                len(lead.message), len(translated_message))

    # --- Step 3: Auto-assignment (round-robin) ---
    current_count = await get_lead_count()
    agent_index = current_count % len(AGENTS)
    assigned_to = AGENTS[agent_index]
    logger.info("Auto-assigned to %s (index %d of %d leads)",
                assigned_to, agent_index, current_count)

    # --- Step 4: Keyword-based tagging ---
    tag = tag_lead(translated_message)
    logger.info("Tagged lead as: %s", tag)

    # --- Step 5: Persist to Supabase ---
    lead_record = {
        "name": lead.name.strip(),
        "email": lead.email.strip(),
        "phone": lead.phone.strip(),
        "original_message": lead.message.strip(),
        "translated_message": translated_message,
        "language": detected_lang,
        "tag": tag,
        "status": "New",
        "assigned_to": assigned_to,
    }

    try:
        inserted = await insert_lead(lead_record)
        lead_id = inserted.get("id", "")
        logger.info("Lead persisted with id: %s", lead_id)
    except RuntimeError as exc:
        logger.error("Failed to persist lead: %s", exc)
        raise HTTPException(
            status_code=500,
            detail="Lead processed but failed to save. Please try again.",
        )

    # --- Build response ---
    return LeadResponse(
        id=lead_id,
        name=lead.name.strip(),
        email=lead.email.strip(),
        phone=lead.phone.strip(),
        original_message=lead.message.strip(),
        translated_message=translated_message,
        detected_language=detected_lang,
        language_code=lang_code,
        confidence=confidence,
        status="New",
        tag=tag,
        assigned_to=assigned_to,
    )


@app.get("/leads", response_model=LeadsListResponse)
async def list_leads(
    limit: int = Query(default=50, ge=1, le=200, description="Max leads to return"),
    offset: int = Query(default=0, ge=0, description="Pagination offset"),
    status: Optional[str] = Query(default=None, description="Filter by status"),
):
    """
    Retrieve all leads from the database.

    Supports pagination and optional status filtering.
    Results are ordered by created_at descending (newest first).
    """
    try:
        leads = await get_all_leads(
            limit=limit,
            offset=offset,
            status_filter=status,
        )
        total = await get_lead_count()

        return LeadsListResponse(
            leads=leads,
            total=total,
            limit=limit,
            offset=offset,
        )
    except RuntimeError as exc:
        logger.error("Failed to list leads: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to fetch leads")


@app.patch("/leads/{lead_id}")
async def patch_lead_status(lead_id: str, body: StatusUpdate):
    """
    Update the status of an existing lead.

    Allowed statuses: New, Contacted, Qualified, Lost, Won.
    """
    if body.status not in ALLOWED_STATUSES:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid status '{body.status}'. Allowed: {ALLOWED_STATUSES}",
        )

    try:
        updated = await update_lead_status(lead_id, body.status)
        return {"success": True, "lead": updated}
    except RuntimeError as exc:
        logger.error("Failed to update lead %s: %s", lead_id, exc)
        raise HTTPException(status_code=500, detail=str(exc))

# ------------------------------------------------------------------ #
#  Reply Endpoints                                                     #
# ------------------------------------------------------------------ #

@app.post("/leads/{lead_id}/replies")
async def create_reply(lead_id: str, body: ReplyRequest):
    """
    Agent sends a reply to a lead.

    1. Fetch the lead to get the client's language.
    2. Translate the agent's English reply to the client's language.
    3. Persist the reply.
    4. Send email notification to the client.
    """
    if not body.message.strip():
        raise HTTPException(status_code=422, detail="Reply message is required")

    # Fetch lead to determine target language
    lead = await get_lead_by_id(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail=f"Lead {lead_id} not found")

    client_language = lead.get("language", "english")
    client_email = lead.get("email", "")
    client_name = lead.get("name", "Client")

    logger.info("Agent %s replying to lead %s (language: %s)",
                body.agent_email, lead_id, client_language)

    # Translate English reply to client's language
    translation = await translate_from_english(body.message, client_language)
    translated_reply = translation["translated_text"]

    logger.info("Reply translated: EN → %s (%d chars → %d chars)",
                client_language, len(body.message), len(translated_reply))

    # Persist reply
    reply_record = {
        "lead_id": lead_id,
        "agent_email": body.agent_email,
        "agent_name": body.agent_name or body.agent_email.split("@")[0],
        "original_message": body.message.strip(),
        "translated_message": translated_reply,
        "target_language": client_language,
    }

    try:
        inserted = await insert_reply(reply_record)
    except RuntimeError as exc:
        logger.error("Failed to persist reply: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to save reply")

    # Send email notification (best-effort, don't block on failure)
    try:
        _send_reply_email(
            to_email=client_email,
            to_name=client_name,
            agent_name=reply_record["agent_name"],
            original_reply=body.message,
            translated_reply=translated_reply,
            client_language=client_language,
        )
    except Exception as exc:
        logger.warning("Email send failed (non-blocking): %s", exc)

    return {"success": True, "reply": inserted}


@app.get("/leads/{lead_id}/replies")
async def list_replies(lead_id: str):
    """Retrieve all replies for a given lead."""
    replies = await get_replies_for_lead(lead_id)
    return {"replies": replies}


# ------------------------------------------------------------------ #
#  Email helper                                                        #
# ------------------------------------------------------------------ #

def _send_reply_email(
    to_email: str,
    to_name: str,
    agent_name: str,
    original_reply: str,
    translated_reply: str,
    client_language: str,
) -> None:
    """
    Send email notification to the client about the agent's reply.
    Uses SMTP configuration from environment variables.
    Falls back to logging if SMTP is not configured.
    """
    import os
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart

    smtp_host = os.getenv("SMTP_HOST", "")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_pass = os.getenv("SMTP_PASS", "")
    from_email = os.getenv("SMTP_FROM", smtp_user)

    if not smtp_host or not smtp_user:
        logger.info(
            "SMTP not configured — email would be sent to %s:\n"
            "  Agent: %s\n  Reply (EN): %s\n  Reply (%s): %s",
            to_email, agent_name, original_reply,
            client_language, translated_reply,
        )
        return

    # Build HTML email
    html_body = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #4361ee;">New Reply from {agent_name}</h2>
        <p>Hi {to_name},</p>
        <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; font-size: 16px;">{translated_reply}</p>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0;" />
        <p style="color: #94a3b8; font-size: 12px;">Original (English): {original_reply}</p>
        <p style="color: #94a3b8; font-size: 12px;">— Multilingual Client Leads Manager</p>
    </div>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Reply from {agent_name} — Multilingual Leads"
    msg["From"] = from_email
    msg["To"] = to_email
    msg.attach(MIMEText(translated_reply, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.sendmail(from_email, to_email, msg.as_string())

    logger.info("Reply email sent to %s", to_email)
