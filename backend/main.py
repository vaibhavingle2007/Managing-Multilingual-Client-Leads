"""
FastAPI Backend Server
Multilingual Client Leads Management API
"""

import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv

from services.gemini_service import detect_language, translate_to_english

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Multilingual Client Leads API",
    description="Backend API for managing multilingual client leads",
    version="0.2.0",
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
    """Response returned after processing a lead."""
    name: str
    email: str
    phone: str
    original_message: str
    translated_message: str
    detected_language: str
    language_code: str
    confidence: str
    status: str


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

    1. Detect the language of the message (Gemini AI).
    2. Translate the message to English if needed.
    3. Return the processed lead with detection + translation results.

    No database storage yet — just processes and returns.
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

    # --- Build response ---
    return LeadResponse(
        name=lead.name.strip(),
        email=lead.email.strip(),
        phone=lead.phone.strip(),
        original_message=lead.message.strip(),
        translated_message=translated_message,
        detected_language=detected_lang,
        language_code=lang_code,
        confidence=confidence,
        status="processed",
    )
