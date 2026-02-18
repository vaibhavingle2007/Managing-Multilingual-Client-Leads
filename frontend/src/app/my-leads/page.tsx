"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Box,
    Container,
    Typography,
    Paper,
    Chip,
    CircularProgress,
    Alert,
    Button,
    Snackbar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TranslateIcon from "@mui/icons-material/Translate";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import AddIcon from "@mui/icons-material/Add";
import LogoutIcon from "@mui/icons-material/Logout";
import {
    fetchLeads,
    fetchReplies,
    type Lead,
    type LeadsListResponse,
    type Reply,
} from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    New: { bg: "rgba(96,165,250,0.12)", text: "#60a5fa" },
    Contacted: { bg: "rgba(251,191,36,0.12)", text: "#fbbf24" },
    Qualified: { bg: "rgba(52,211,153,0.12)", text: "#34d399" },
    Lost: { bg: "rgba(248,113,113,0.12)", text: "#f87171" },
    Won: { bg: "rgba(167,139,250,0.12)", text: "#a78bfa" },
};

const LANG_FLAGS: Record<string, string> = {
    english: "🇬🇧", hindi: "🇮🇳", spanish: "🇪🇸", french: "🇫🇷",
    german: "🇩🇪", arabic: "🇸🇦", portuguese: "🇧🇷", chinese: "🇨🇳",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function MyLeadsPage() {
    const { user, loading: authLoading, signOut } = useAuth();
    const router = useRouter();

    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [repliesMap, setRepliesMap] = useState<Record<string, Reply[]>>({});
    const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>({});

    /* ---- Auth guard ---- */
    useEffect(() => {
        if (!authLoading && !user) {
            router.replace("/login");
        }
    }, [authLoading, user, router]);

    /* ---- Fetch leads ---- */
    const loadLeads = useCallback(async () => {
        if (!user?.email) return;
        setLoading(true);
        setError(null);

        const result = await fetchLeads(200, 0);
        if (result.success && result.data) {
            const data = result.data as LeadsListResponse;
            // Filter leads belonging to current user by email
            const myLeads = data.leads.filter(
                (l) => l.email.toLowerCase() === user.email?.toLowerCase()
            );
            setLeads(myLeads);

            // Load replies for each lead
            for (const lead of myLeads) {
                setLoadingReplies((prev) => ({ ...prev, [lead.id]: true }));
                const replies = await fetchReplies(lead.id);
                setRepliesMap((prev) => ({ ...prev, [lead.id]: replies }));
                setLoadingReplies((prev) => ({ ...prev, [lead.id]: false }));
            }
        } else {
            setError(result.error || "Failed to fetch leads");
        }
        setLoading(false);
    }, [user?.email]);

    useEffect(() => {
        if (user) {
            loadLeads();
            const interval = setInterval(loadLeads, 30000);
            return () => clearInterval(interval);
        }
    }, [loadLeads, user]);

    if (authLoading || !user) {
        return (
            <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(145deg, #000214 0%, #0f172a 50%, #0c1222 100%)" }}>
                <CircularProgress sx={{ color: "#4361ee" }} />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                background: "linear-gradient(145deg, #000214 0%, #0f172a 50%, #0c1222 100%)",
                pb: 8,
            }}
        >
            {/* ---- Top Bar ---- */}
            <Box
                sx={{
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    backdropFilter: "blur(12px)",
                    backgroundColor: "rgba(0,2,20,0.7)",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                }}
            >
                <Container maxWidth="md">
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Button
                                href="/submit"
                                startIcon={<ArrowBackIcon />}
                                sx={{ color: "rgba(255,255,255,0.6)", textTransform: "none", "&:hover": { color: "#fff", backgroundColor: "rgba(255,255,255,0.05)" } }}
                            >
                                Submit Lead
                            </Button>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
                                My Leads
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.35)" }}>
                                {user.displayName || user.email}
                            </Typography>
                            <Button
                                onClick={signOut}
                                size="small"
                                startIcon={<LogoutIcon />}
                                sx={{ color: "rgba(255,255,255,0.4)", textTransform: "none", "&:hover": { color: "#f87171" } }}
                            >
                                Sign out
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="md" sx={{ mt: 4 }}>
                {/* ---- Error ---- */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: "10px", backgroundColor: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}>
                        {error}
                    </Alert>
                )}

                {/* ---- Loading ---- */}
                {loading && (
                    <Box sx={{ textAlign: "center", py: 10 }}>
                        <CircularProgress sx={{ color: "#4361ee" }} />
                        <Typography sx={{ color: "rgba(255,255,255,0.4)", mt: 2 }}>Loading your leads…</Typography>
                    </Box>
                )}

                {/* ---- Empty ---- */}
                {!loading && leads.length === 0 && (
                    <Box sx={{ textAlign: "center", py: 10 }}>
                        <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.3)", mb: 1 }}>
                            No leads yet
                        </Typography>
                        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.2)", mb: 3 }}>
                            Submit your first lead to get started.
                        </Typography>
                        <Button
                            href="/submit"
                            variant="contained"
                            startIcon={<AddIcon />}
                            sx={{
                                borderRadius: "10px", textTransform: "none", fontWeight: 600,
                                background: "linear-gradient(135deg, #4361ee 0%, #7c3aed 100%)",
                            }}
                        >
                            Submit a Lead
                        </Button>
                    </Box>
                )}

                {/* ---- Lead cards ---- */}
                {!loading && leads.map((lead) => {
                    const replies = repliesMap[lead.id] || [];
                    const isLoading = loadingReplies[lead.id];
                    const statusStyle = STATUS_COLORS[lead.status] || STATUS_COLORS.New;

                    return (
                        <Paper
                            key={lead.id}
                            elevation={0}
                            sx={{
                                mb: 3, p: 3, borderRadius: "14px",
                                border: "1px solid rgba(255,255,255,0.06)",
                                backgroundColor: "rgba(15,23,42,0.6)",
                                backdropFilter: "blur(8px)",
                                transition: "all 0.3s ease",
                                "&:hover": { border: "1px solid rgba(255,255,255,0.1)" },
                            }}
                        >
                            {/* Lead header */}
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                                <Box>
                                    <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.35)", fontSize: "0.72rem" }}>
                                        {new Date(lead.created_at).toLocaleDateString(undefined, {
                                            weekday: "short", month: "short", day: "numeric", year: "numeric",
                                        })}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                    <Chip
                                        label={lead.status}
                                        size="small"
                                        sx={{
                                            backgroundColor: statusStyle.bg, color: statusStyle.text,
                                            fontWeight: 600, fontSize: "0.72rem",
                                            border: `1px solid ${statusStyle.text}30`,
                                        }}
                                    />
                                    <Chip
                                        icon={<TranslateIcon sx={{ fontSize: "13px !important" }} />}
                                        label={`${LANG_FLAGS[lead.language] || "🌐"} ${lead.language}`}
                                        size="small"
                                        sx={{
                                            backgroundColor: "rgba(96,165,250,0.1)", color: "#60a5fa",
                                            border: "1px solid rgba(96,165,250,0.2)", fontWeight: 500,
                                            fontSize: "0.72rem", "& .MuiChip-icon": { color: "#60a5fa" },
                                        }}
                                    />
                                </Box>
                            </Box>

                            {/* Original message */}
                            <Box sx={{ p: 2, borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)", mb: 2 }}>
                                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.6, fontSize: "0.9rem" }}>
                                    {lead.original_message || lead.translated_message}
                                </Typography>
                            </Box>

                            {/* Agent info */}
                            {lead.assigned_to && (
                                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.3)", display: "block", mb: 1.5 }}>
                                    Assigned to: <strong style={{ color: "#60a5fa" }}>{lead.assigned_to}</strong>
                                </Typography>
                            )}

                            {/* Replies */}
                            {isLoading && (
                                <Box sx={{ py: 1 }}>
                                    <CircularProgress size={16} sx={{ color: "rgba(255,255,255,0.3)" }} />
                                </Box>
                            )}

                            {replies.length > 0 && (
                                <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 1.5, display: "block" }}>
                                        <ChatBubbleOutlineIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: "middle" }} />
                                        Replies ({replies.length})
                                    </Typography>

                                    {replies.map((reply) => (
                                        <Box
                                            key={reply.id}
                                            sx={{
                                                mb: 1.5, p: 2, borderRadius: "10px",
                                                backgroundColor: "rgba(67,97,238,0.06)",
                                                border: "1px solid rgba(67,97,238,0.12)",
                                            }}
                                        >
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                                <Typography variant="caption" sx={{ color: "#4361ee", fontWeight: 600 }}>
                                                    {reply.agent_name}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.25)", ml: "auto" }}>
                                                    {new Date(reply.created_at).toLocaleString()}
                                                </Typography>
                                            </Box>

                                            {/* Show translated reply (in client's language) prominently */}
                                            <Typography variant="body2" sx={{ color: "#e2e8f0", fontSize: "0.9rem", mb: 0.5, lineHeight: 1.6 }}>
                                                {LANG_FLAGS[reply.target_language] || "🌐"} {reply.translated_message}
                                            </Typography>

                                            {/* Show original English reply smaller */}
                                            {reply.original_message !== reply.translated_message && (
                                                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.3)", display: "block", mt: 0.5 }}>
                                                    🇬🇧 Original: {reply.original_message}
                                                </Typography>
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                            )}

                            {!isLoading && replies.length === 0 && (
                                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.2)", display: "block", mt: 1 }}>
                                    No replies yet — an agent will respond soon.
                                </Typography>
                            )}
                        </Paper>
                    );
                })}
            </Container>
        </Box>
    );
}
