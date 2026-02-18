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

from services.gemini_service import detect_language, translate_to_english
from services.supabase_service import insert_lead, get_all_leads, get_lead_count

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
    allow_origins=["http://localhost:3000"],
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

    # If frontend sent a language hint, prefer it when confidence is low
    if lead.language and confidence == "low":
        from services.gemini_service import LANG_CODE_MAP
        hint = LANG_CODE_MAP.get(lead.language, "")
        if hint:
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
