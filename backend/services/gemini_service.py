"""
Gemini AI Service — Language Detection & Translation

Uses Google's Gemini API (google-genai SDK) for:
  1. Detecting the language of incoming text (8 supported languages)
  2. Translating non-English text to English

Safe fallback: if the API is unreachable or returns garbage,
functions return sensible defaults so the lead is never lost.
"""

import os
import logging
import time

from google import genai

logger = logging.getLogger(__name__)

# ------------------------------------------------------------------ #
#  Configuration                                                      #
# ------------------------------------------------------------------ #

def _get_api_key() -> str:
    """Read the Gemini API key lazily (after load_dotenv has run)."""
    return os.getenv("GEMINI_API_KEY", "")


SUPPORTED_LANGUAGES = {
    "english",
    "hindi",
    "spanish",
    "french",
    "german",
    "arabic",
    "portuguese",
    "chinese",
}

# Map short codes → full names (used in prompts / responses)
LANG_CODE_MAP: dict[str, str] = {
    "en": "english",
    "hi": "hindi",
    "es": "spanish",
    "fr": "french",
    "de": "german",
    "ar": "arabic",
    "pt": "portuguese",
    "zh": "chinese",
}

LANG_NAME_TO_CODE: dict[str, str] = {v: k for k, v in LANG_CODE_MAP.items()}


def _get_client() -> genai.Client:
    """Return a configured Gemini client instance."""
    return genai.Client(api_key=_get_api_key())


# Use flash-lite for more generous free-tier quota
GEMINI_MODEL = "gemini-2.5-flash"
MAX_RETRIES = 3


def _generate_with_retry(client: genai.Client, prompt: str) -> str:
    """Call Gemini with exponential backoff on 429 rate-limit errors."""
    for attempt in range(MAX_RETRIES):
        try:
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
            )
            return response.text.strip()
        except Exception as exc:
            if "429" in str(exc) and attempt < MAX_RETRIES - 1:
                wait = 2 ** (attempt + 1)  # 2s, 4s, 8s
                logger.warning(
                    "Rate limited (attempt %d/%d), retrying in %ds…",
                    attempt + 1, MAX_RETRIES, wait,
                )
                time.sleep(wait)
            else:
                raise
    return ""  # should never reach here


# ------------------------------------------------------------------ #
#  Language Detection                                                  #
# ------------------------------------------------------------------ #

async def detect_language(text: str) -> dict[str, str]:
    """
    Detect the language of *text*.

    Returns:
        {
          "detected_language": "<language name>",   # e.g. "hindi"
          "language_code": "<2-letter code>",       # e.g. "hi"
          "confidence": "high" | "medium" | "low"
        }

    Fallback: returns english / "en" / "low" if anything goes wrong.
    """
    if not _get_api_key():
        logger.warning("GEMINI_API_KEY not set — skipping detection")
        return _fallback_detection()

    if not text or not text.strip():
        return _fallback_detection()

    prompt = (
        "Detect the language of the following text. "
        "Respond with ONLY the language name in lowercase. "
        "Supported languages: english, hindi, spanish, french, german, arabic, portuguese, chinese. "
        "If the language is not in the list, respond with 'english'.\n\n"
        f"Text: \"{text.strip()}\""
    )

    try:
        client = _get_client()
        raw = _generate_with_retry(client, prompt).lower().rstrip(".")

        # Validate against supported set
        detected = raw if raw in SUPPORTED_LANGUAGES else "english"
        code = LANG_NAME_TO_CODE.get(detected, "en")

        confidence = "high" if detected != "english" or _looks_english(text) else "medium"

        return {
            "detected_language": detected,
            "language_code": code,
            "confidence": confidence,
        }

    except Exception as exc:
        logger.error("Gemini detect_language failed: %s", exc)
        return _fallback_detection()


# ------------------------------------------------------------------ #
#  Translation                                                         #
# ------------------------------------------------------------------ #

async def translate_to_english(text: str, source_language: str = "") -> dict[str, str]:
    """
    Translate *text* to English.

    Args:
        text:            The text to translate.
        source_language: Optional hint (e.g. "hindi"). If empty, Gemini auto-detects.

    Returns:
        {
          "original_text": "<input text>",
          "translated_text": "<english translation>",
          "source_language": "<detected or provided language>"
        }

    Fallback: returns the original text unchanged.
    """
    if not _get_api_key():
        logger.warning("GEMINI_API_KEY not set — skipping translation")
        return _fallback_translation(text, source_language)

    if not text or not text.strip():
        logger.warning("Empty text — skipping translation")
        return _fallback_translation(text, source_language)

    # If already English, skip the API call
    if source_language.lower() == "english":
        logger.info("Source is English — skipping translation")
        return {
            "original_text": text,
            "translated_text": text,
            "source_language": "english",
        }

    lang_hint = f" from {source_language}" if source_language else ""
    prompt = (
        f"Translate the following text{lang_hint} to English. "
        "Respond with ONLY the translated text, nothing else.\n\n"
        f"Text: \"{text.strip()}\""
    )

    logger.info("Calling Gemini for translation from '%s' to English", source_language)

    try:
        client = _get_client()
        translated = _generate_with_retry(client, prompt)

        # Strip surrounding quotes if Gemini wraps the response
        if translated.startswith('"') and translated.endswith('"'):
            translated = translated[1:-1]

        logger.info("Gemini translation result: '%s' → '%s'",
                    text[:50], translated[:50])

        return {
            "original_text": text,
            "translated_text": translated,
            "source_language": source_language or "unknown",
        }

    except Exception as exc:
        logger.error("Gemini translate_to_english failed: %s", exc)
        return _fallback_translation(text, source_language)


# ------------------------------------------------------------------ #
#  Reverse Translation (English → Target Language)                     #
# ------------------------------------------------------------------ #

async def translate_from_english(text: str, target_language: str = "") -> dict[str, str]:
    """
    Translate English *text* into *target_language*.

    Used for agent replies — agents write in English,
    the system translates to the client's original language.

    Returns:
        {
          "original_text": "<english input>",
          "translated_text": "<translated output>",
          "target_language": "<target language name>"
        }

    Fallback: returns the original English text unchanged.
    """
    if not _get_api_key():
        logger.warning("GEMINI_API_KEY not set — skipping reverse translation")
        return {"original_text": text, "translated_text": text, "target_language": target_language}

    if not text or not text.strip():
        return {"original_text": text, "translated_text": text, "target_language": target_language}

    # If target is English, no translation needed
    if not target_language or target_language.lower() == "english":
        return {"original_text": text, "translated_text": text, "target_language": "english"}

    prompt = (
        f"Translate the following English text to {target_language}. "
        "Respond with ONLY the translated text, nothing else.\n\n"
        f"Text: \"{text.strip()}\""
    )

    logger.info("Calling Gemini for reverse translation English → '%s'", target_language)

    try:
        client = _get_client()
        translated = _generate_with_retry(client, prompt)

        if translated.startswith('"') and translated.endswith('"'):
            translated = translated[1:-1]

        logger.info("Reverse translation result: '%s' → '%s'",
                    text[:50], translated[:50])

        return {
            "original_text": text,
            "translated_text": translated,
            "target_language": target_language,
        }

    except Exception as exc:
        logger.error("Gemini translate_from_english failed: %s", exc)
        return {"original_text": text, "translated_text": text, "target_language": target_language}


# ------------------------------------------------------------------ #
#  Fallback helpers                                                    #
# ------------------------------------------------------------------ #

def _fallback_detection() -> dict[str, str]:
    """Safe default when detection is unavailable."""
    return {
        "detected_language": "english",
        "language_code": "en",
        "confidence": "low",
    }


def _fallback_translation(text: str, source_language: str = "") -> dict[str, str]:
    """Safe default when translation is unavailable."""
    return {
        "original_text": text,
        "translated_text": text,
        "source_language": source_language or "unknown",
    }


def _looks_english(text: str) -> bool:
    """Quick heuristic: if most characters are ASCII letters, it's probably English."""
    if not text:
        return True
    ascii_count = sum(1 for c in text if c.isascii() and c.isalpha())
    total_alpha = sum(1 for c in text if c.isalpha())
    if total_alpha == 0:
        return True
    return (ascii_count / total_alpha) > 0.8
