"""
Supabase Service — Database Client & Lead Operations

Provides:
  - Supabase client initialization
  - Lead CRUD operations (insert, list)
"""

import os
import logging
from datetime import datetime, timezone
from typing import Any

from supabase import create_client, Client

logger = logging.getLogger(__name__)

# ------------------------------------------------------------------ #
#  Client                                                              #
# ------------------------------------------------------------------ #

_client: Client | None = None


def get_supabase() -> Client:
    """Return a singleton Supabase client."""
    global _client
    if _client is None:
        url = os.getenv("SUPABASE_URL", "")
        key = os.getenv("SUPABASE_KEY", "")
        if not url or not key:
            raise RuntimeError(
                "SUPABASE_URL and SUPABASE_KEY must be set in .env"
            )
        _client = create_client(url, key)
        logger.info("Supabase client initialized")
    return _client


# ------------------------------------------------------------------ #
#  Lead Operations                                                     #
# ------------------------------------------------------------------ #

LEADS_TABLE = "leads"


async def insert_lead(lead_data: dict[str, Any]) -> dict[str, Any]:
    """
    Insert a new lead into the `leads` table.

    Args:
        lead_data: Dictionary with all lead fields.

    Returns:
        The inserted row as a dictionary.

    Raises:
        RuntimeError: If the insert fails.
    """
    try:
        client = get_supabase()
        response = (
            client.table(LEADS_TABLE)
            .insert(lead_data)
            .execute()
        )

        if response.data and len(response.data) > 0:
            logger.info("Lead inserted: %s", response.data[0].get("id", "?"))
            return response.data[0]

        raise RuntimeError("Insert returned empty data")

    except Exception as exc:
        logger.error("Failed to insert lead: %s", exc)
        raise RuntimeError(f"Database insert failed: {exc}") from exc


async def get_all_leads(
    limit: int = 100,
    offset: int = 0,
    status_filter: str | None = None,
) -> list[dict[str, Any]]:
    """
    Retrieve leads from the `leads` table.

    Args:
        limit:          Max rows to return (default 100).
        offset:         Pagination offset.
        status_filter:  Optional filter by status (e.g. 'New', 'Contacted').

    Returns:
        List of lead dictionaries, ordered by created_at descending.
    """
    try:
        client = get_supabase()
        query = (
            client.table(LEADS_TABLE)
            .select("*")
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
        )

        if status_filter:
            query = query.eq("status", status_filter)

        response = query.execute()
        return response.data or []

    except Exception as exc:
        logger.error("Failed to fetch leads: %s", exc)
        raise RuntimeError(f"Database query failed: {exc}") from exc


async def get_lead_count() -> int:
    """Return total number of leads in the database."""
    try:
        client = get_supabase()
        response = (
            client.table(LEADS_TABLE)
            .select("id", count="exact")
            .execute()
        )
        return response.count or 0
    except Exception as exc:
        logger.error("Failed to count leads: %s", exc)
        return 0


async def update_lead_status(lead_id: str, status: str) -> dict[str, Any]:
    """
    Update the status of a lead.

    Args:
        lead_id: UUID of the lead to update.
        status:  New status value (e.g. 'Contacted', 'Qualified').

    Returns:
        The updated row as a dictionary.

    Raises:
        RuntimeError: If the update fails or lead is not found.
    """
    try:
        client = get_supabase()
        response = (
            client.table(LEADS_TABLE)
            .update({"status": status})
            .eq("id", lead_id)
            .execute()
        )

        if response.data and len(response.data) > 0:
            logger.info("Lead %s status updated to '%s'", lead_id, status)
            return response.data[0]

        raise RuntimeError(f"Lead {lead_id} not found")

    except Exception as exc:
        logger.error("Failed to update lead status: %s", exc)
        raise RuntimeError(f"Database update failed: {exc}") from exc
