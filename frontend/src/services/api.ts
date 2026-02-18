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
