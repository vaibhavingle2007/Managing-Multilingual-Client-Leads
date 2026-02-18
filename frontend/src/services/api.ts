/**
 * API Service
 *
 * Centralized HTTP client for communicating with the FastAPI backend.
 * All fetch calls go through here for consistent error handling.
 */

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/** Shape of data sent when submitting a new lead */
export interface LeadPayload {
    name: string;
    email: string;
    phone: string;
    message: string;
    language: string;
}

/** Generic API response wrapper */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

/** Shape of a lead returned from the backend */
export interface Lead {
    id: string;
    name: string;
    email: string;
    phone: string;
    original_message: string;
    translated_message: string;
    language: string;
    tag: string | null;
    status: string;
    assigned_to: string | null;
    created_at: string;
}

/** Shape of the paginated leads list response */
export interface LeadsListResponse {
    leads: Lead[];
    total: number;
    limit: number;
    offset: number;
}

/**
 * Submit a new lead to the backend.
 *
 * POST /leads
 */
export async function submitLead(
    payload: LeadPayload
): Promise<ApiResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/leads`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => null);
            return {
                success: false,
                error:
                    errorBody?.detail ||
                    `Request failed with status ${response.status}`,
            };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (err) {
        const message =
            err instanceof Error ? err.message : "Network error — is the backend running?";
        return { success: false, error: message };
    }
}

/**
 * Fetch leads from the backend.
 *
 * GET /leads
 */
export async function fetchLeads(
    limit = 50,
    offset = 0,
    status?: string
): Promise<ApiResponse<LeadsListResponse>> {
    try {
        const params = new URLSearchParams({
            limit: String(limit),
            offset: String(offset),
        });
        if (status) params.set("status", status);

        const response = await fetch(`${API_BASE_URL}/leads?${params}`);

        if (!response.ok) {
            const errorBody = await response.json().catch(() => null);
            return {
                success: false,
                error:
                    errorBody?.detail ||
                    `Request failed with status ${response.status}`,
            };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (err) {
        const message =
            err instanceof Error ? err.message : "Network error — is the backend running?";
        return { success: false, error: message };
    }
}

/**
 * Update a lead's status.
 *
 * PATCH /leads/{id}
 */
export async function updateLeadStatus(
    leadId: string,
    status: string
): Promise<ApiResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/leads/${leadId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => null);
            return {
                success: false,
                error:
                    errorBody?.detail ||
                    `Request failed with status ${response.status}`,
            };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (err) {
        const message =
            err instanceof Error ? err.message : "Network error — is the backend running?";
        return { success: false, error: message };
    }
}
