"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Box,
    Container,
    Typography,
    Paper,
    Chip,
    CircularProgress,
    Alert,
    IconButton,
    Tooltip,
    Button,
    TextField,
    InputAdornment,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import TranslateIcon from "@mui/icons-material/Translate";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import GroupIcon from "@mui/icons-material/Group";
import LabelIcon from "@mui/icons-material/Label";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { fetchLeads, type Lead, type LeadsListResponse } from "@/services/api";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const AGENTS = ["Agent A", "Agent B", "Agent C"];

const TAG_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    pricing: { bg: "rgba(251,191,36,0.12)", text: "#fbbf24", border: "rgba(251,191,36,0.3)" },
    demo: { bg: "rgba(96,165,250,0.12)", text: "#60a5fa", border: "rgba(96,165,250,0.3)" },
    support: { bg: "rgba(248,113,113,0.12)", text: "#f87171", border: "rgba(248,113,113,0.3)" },
    enterprise: { bg: "rgba(167,139,250,0.12)", text: "#a78bfa", border: "rgba(167,139,250,0.3)" },
    general: { bg: "rgba(148,163,184,0.12)", text: "#94a3b8", border: "rgba(148,163,184,0.3)" },
};

const AGENT_COLORS: Record<string, string> = {
    "Agent A": "#60a5fa",
    "Agent B": "#34d399",
    "Agent C": "#fbbf24",
};

const LANG_FLAGS: Record<string, string> = {
    english: "🇬🇧",
    hindi: "🇮🇳",
    spanish: "🇪🇸",
    french: "🇫🇷",
    german: "🇩🇪",
    arabic: "🇸🇦",
    portuguese: "🇧🇷",
    chinese: "🇨🇳",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [filterAgent, setFilterAgent] = useState<string | null>(null);
    const [filterTag, setFilterTag] = useState<string | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    const loadLeads = useCallback(async () => {
        setLoading(true);
        setError(null);
        const result = await fetchLeads(200, 0);
        if (result.success && result.data) {
            const data = result.data as LeadsListResponse;
            setLeads(data.leads);
            setTotal(data.total);
        } else {
            setError(result.error || "Failed to fetch leads");
        }
        setLoading(false);
        setLastRefresh(new Date());
    }, []);

    useEffect(() => {
        loadLeads();
        const interval = setInterval(loadLeads, 15000);
        return () => clearInterval(interval);
    }, [loadLeads]);

    /* ---- Filtering ---- */
    const filtered = leads.filter((lead) => {
        if (filterAgent && lead.assigned_to !== filterAgent) return false;
        if (filterTag && lead.tag !== filterTag) return false;
        if (search) {
            const q = search.toLowerCase();
            return (
                lead.name.toLowerCase().includes(q) ||
                lead.email.toLowerCase().includes(q) ||
                lead.original_message.toLowerCase().includes(q) ||
                lead.translated_message.toLowerCase().includes(q)
            );
        }
        return true;
    });

    /* ---- Stats ---- */
    const statCards = [
        {
            label: "Total Leads",
            value: total,
            icon: <TrendingUpIcon />,
            color: "#4361ee",
        },
        {
            label: "Agents Active",
            value: new Set(leads.map((l) => l.assigned_to).filter(Boolean)).size,
            icon: <GroupIcon />,
            color: "#34d399",
        },
        {
            label: "Tags Used",
            value: new Set(leads.map((l) => l.tag).filter(Boolean)).size,
            icon: <LabelIcon />,
            color: "#fbbf24",
        },
        {
            label: "Latest",
            value: leads.length > 0
                ? timeAgo(leads[0].created_at)
                : "—",
            icon: <AccessTimeIcon />,
            color: "#f87171",
        },
    ];

    /* ---- Render ---- */
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
                <Container maxWidth="xl">
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            py: 2,
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Button
                                href="/"
                                startIcon={<ArrowBackIcon />}
                                sx={{
                                    color: "rgba(255,255,255,0.6)",
                                    textTransform: "none",
                                    "&:hover": { color: "#fff", backgroundColor: "rgba(255,255,255,0.05)" },
                                }}
                            >
                                Home
                            </Button>
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 700,
                                    color: "#fff",
                                    letterSpacing: "-0.02em",
                                    fontFamily: "var(--font-inter), sans-serif",
                                }}
                            >
                                Agent Dashboard
                            </Typography>
                            <Chip
                                label="Live"
                                size="small"
                                sx={{
                                    backgroundColor: "rgba(52,211,153,0.15)",
                                    color: "#34d399",
                                    border: "1px solid rgba(52,211,153,0.3)",
                                    fontWeight: 600,
                                    fontSize: "0.7rem",
                                    animation: "pulse 2s ease-in-out infinite",
                                    "@keyframes pulse": {
                                        "0%, 100%": { opacity: 1 },
                                        "50%": { opacity: 0.6 },
                                    },
                                }}
                            />
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography
                                variant="caption"
                                sx={{ color: "rgba(255,255,255,0.35)", mr: 1 }}
                            >
                                Updated {lastRefresh.toLocaleTimeString()}
                            </Typography>
                            <Tooltip title="Refresh now">
                                <IconButton
                                    onClick={loadLeads}
                                    disabled={loading}
                                    sx={{
                                        color: "rgba(255,255,255,0.5)",
                                        "&:hover": { color: "#fff" },
                                    }}
                                >
                                    <RefreshIcon
                                        sx={{
                                            animation: loading ? "spin 1s linear infinite" : "none",
                                            "@keyframes spin": {
                                                from: { transform: "rotate(0deg)" },
                                                to: { transform: "rotate(360deg)" },
                                            },
                                        }}
                                    />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="xl" sx={{ mt: 4 }}>
                {/* ---- Stat Cards ---- */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
                        gap: 2.5,
                        mb: 4,
                    }}
                >
                    {statCards.map((stat) => (
                        <Paper
                            key={stat.label}
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: "12px",
                                border: "1px solid rgba(255,255,255,0.06)",
                                backgroundColor: "rgba(15,23,42,0.6)",
                                backdropFilter: "blur(8px)",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    border: `1px solid ${stat.color}33`,
                                    transform: "translateY(-2px)",
                                },
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: "10px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: `${stat.color}18`,
                                        color: stat.color,
                                    }}
                                >
                                    {stat.icon}
                                </Box>
                                <Box>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: "rgba(255,255,255,0.45)",
                                            fontSize: "0.72rem",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em",
                                            fontWeight: 500,
                                        }}
                                    >
                                        {stat.label}
                                    </Typography>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            fontWeight: 700,
                                            color: "#fff",
                                            lineHeight: 1.2,
                                            fontSize: typeof stat.value === "string" ? "1rem" : "1.5rem",
                                        }}
                                    >
                                        {stat.value}
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    ))}
                </Box>

                {/* ---- Filters Bar ---- */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2.5,
                        mb: 3,
                        borderRadius: "12px",
                        border: "1px solid rgba(255,255,255,0.06)",
                        backgroundColor: "rgba(15,23,42,0.6)",
                        backdropFilter: "blur(8px)",
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            alignItems: "center",
                            gap: 2,
                        }}
                    >
                        {/* Search */}
                        <TextField
                            size="small"
                            placeholder="Search leads…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: "rgba(255,255,255,0.3)", fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                minWidth: 220,
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "8px",
                                    color: "#e2e8f0",
                                    fontSize: "0.85rem",
                                    "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                                    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                                    "&.Mui-focused fieldset": { borderColor: "#4361ee" },
                                },
                            }}
                        />

                        <Box sx={{ height: 24, width: 1, backgroundColor: "rgba(255,255,255,0.08)" }} />

                        {/* Agent filters */}
                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
                            Agent:
                        </Typography>
                        <Chip
                            label="All"
                            size="small"
                            onClick={() => setFilterAgent(null)}
                            sx={chipFilterSx(filterAgent === null, "#4361ee")}
                        />
                        {AGENTS.map((agent) => (
                            <Chip
                                key={agent}
                                label={agent}
                                size="small"
                                onClick={() =>
                                    setFilterAgent(filterAgent === agent ? null : agent)
                                }
                                sx={chipFilterSx(filterAgent === agent, AGENT_COLORS[agent])}
                            />
                        ))}

                        <Box sx={{ height: 24, width: 1, backgroundColor: "rgba(255,255,255,0.08)" }} />

                        {/* Tag filters */}
                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
                            Tag:
                        </Typography>
                        <Chip
                            label="All"
                            size="small"
                            onClick={() => setFilterTag(null)}
                            sx={chipFilterSx(filterTag === null, "#4361ee")}
                        />
                        {Object.keys(TAG_COLORS).map((tag) => (
                            <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                onClick={() =>
                                    setFilterTag(filterTag === tag ? null : tag)
                                }
                                sx={chipFilterSx(filterTag === tag, TAG_COLORS[tag].text)}
                            />
                        ))}
                    </Box>
                </Paper>

                {/* ---- Error ---- */}
                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 3,
                            borderRadius: "10px",
                            backgroundColor: "rgba(248,113,113,0.1)",
                            color: "#f87171",
                            border: "1px solid rgba(248,113,113,0.2)",
                        }}
                    >
                        {error}
                    </Alert>
                )}

                {/* ---- Loading state ---- */}
                {loading && leads.length === 0 && (
                    <Box sx={{ textAlign: "center", py: 10 }}>
                        <CircularProgress sx={{ color: "#4361ee" }} />
                        <Typography sx={{ color: "rgba(255,255,255,0.4)", mt: 2 }}>
                            Loading leads…
                        </Typography>
                    </Box>
                )}

                {/* ---- Empty state ---- */}
                {!loading && filtered.length === 0 && (
                    <Box sx={{ textAlign: "center", py: 10 }}>
                        <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.3)", mb: 1 }}>
                            {leads.length === 0 ? "No leads yet" : "No leads match your filters"}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.2)" }}>
                            {leads.length === 0
                                ? "Submit a lead from the form to see it appear here."
                                : "Try adjusting your search or filter criteria."}
                        </Typography>
                    </Box>
                )}

                {/* ---- Results count ---- */}
                {filtered.length > 0 && (
                    <Typography
                        variant="body2"
                        sx={{ color: "rgba(255,255,255,0.3)", mb: 2, fontWeight: 500 }}
                    >
                        Showing {filtered.length} of {total} leads
                    </Typography>
                )}

                {/* ---- Lead Cards ---- */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {filtered.map((lead) => (
                        <LeadCard key={lead.id} lead={lead} />
                    ))}
                </Box>
            </Container>
        </Box>
    );
}

/* ------------------------------------------------------------------ */
/*  Lead Card                                                          */
/* ------------------------------------------------------------------ */

function LeadCard({ lead }: { lead: Lead }) {
    const tagStyle = TAG_COLORS[lead.tag || "general"] || TAG_COLORS.general;
    const agentColor = AGENT_COLORS[lead.assigned_to || ""] || "#94a3b8";

    return (
        <Paper
            elevation={0}
            sx={{
                p: 0,
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.06)",
                backgroundColor: "rgba(15,23,42,0.5)",
                backdropFilter: "blur(8px)",
                overflow: "hidden",
                transition: "all 0.25s ease",
                "&:hover": {
                    border: "1px solid rgba(255,255,255,0.12)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                },
            }}
        >
            {/* Top colored bar */}
            <Box sx={{ height: 3, background: `linear-gradient(90deg, ${agentColor}, ${tagStyle.text})` }} />

            <Box sx={{ p: 3 }}>
                {/* ---- Header row ---- */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: 1.5,
                        mb: 2,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        {/* Avatar placeholder */}
                        <Box
                            sx={{
                                width: 42,
                                height: 42,
                                borderRadius: "10px",
                                background: `linear-gradient(135deg, ${agentColor}30, ${agentColor}10)`,
                                border: `1px solid ${agentColor}40`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                                color: agentColor,
                                fontSize: "1rem",
                            }}
                        >
                            {lead.name.charAt(0).toUpperCase()}
                        </Box>
                        <Box>
                            <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 600, color: "#f1f5f9", lineHeight: 1.3 }}
                            >
                                {lead.name}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                                    <EmailIcon sx={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }} />
                                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.45)" }}>
                                        {lead.email}
                                    </Typography>
                                </Box>
                                {lead.phone && (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                                        <PhoneIcon sx={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }} />
                                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.45)" }}>
                                            {lead.phone}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Box>

                    {/* Chips */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        {/* Language */}
                        <Chip
                            icon={<TranslateIcon sx={{ fontSize: "14px !important" }} />}
                            label={`${LANG_FLAGS[lead.language] || "🌐"} ${capitalize(lead.language)}`}
                            size="small"
                            sx={{
                                backgroundColor: "rgba(96,165,250,0.1)",
                                color: "#60a5fa",
                                border: "1px solid rgba(96,165,250,0.2)",
                                fontWeight: 500,
                                fontSize: "0.72rem",
                                "& .MuiChip-icon": { color: "#60a5fa" },
                            }}
                        />

                        {/* Tag */}
                        <Chip
                            icon={<LocalOfferIcon sx={{ fontSize: "14px !important" }} />}
                            label={capitalize(lead.tag || "general")}
                            size="small"
                            sx={{
                                backgroundColor: tagStyle.bg,
                                color: tagStyle.text,
                                border: `1px solid ${tagStyle.border}`,
                                fontWeight: 600,
                                fontSize: "0.72rem",
                                "& .MuiChip-icon": { color: tagStyle.text },
                            }}
                        />

                        {/* Assigned Agent */}
                        {lead.assigned_to && (
                            <Chip
                                icon={<AssignmentIndIcon sx={{ fontSize: "14px !important" }} />}
                                label={lead.assigned_to}
                                size="small"
                                sx={{
                                    backgroundColor: `${agentColor}15`,
                                    color: agentColor,
                                    border: `1px solid ${agentColor}35`,
                                    fontWeight: 600,
                                    fontSize: "0.72rem",
                                    "& .MuiChip-icon": { color: agentColor },
                                }}
                            />
                        )}

                        {/* Status */}
                        <Chip
                            label={lead.status}
                            size="small"
                            sx={{
                                backgroundColor: "rgba(52,211,153,0.1)",
                                color: "#34d399",
                                border: "1px solid rgba(52,211,153,0.2)",
                                fontWeight: 600,
                                fontSize: "0.72rem",
                            }}
                        />
                    </Box>
                </Box>

                {/* ---- Messages ---- */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                        gap: 2,
                    }}
                >
                    <Box
                        sx={{
                            p: 2,
                            borderRadius: "8px",
                            backgroundColor: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.05)",
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                color: "rgba(255,255,255,0.35)",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                fontSize: "0.65rem",
                                display: "block",
                                mb: 0.5,
                            }}
                        >
                            Original Message
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.6, fontSize: "0.85rem" }}
                        >
                            {lead.original_message}
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            p: 2,
                            borderRadius: "8px",
                            backgroundColor: "rgba(67,97,238,0.04)",
                            border: "1px solid rgba(67,97,238,0.1)",
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                color: "rgba(255,255,255,0.35)",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                fontSize: "0.65rem",
                                display: "block",
                                mb: 0.5,
                            }}
                        >
                            Translated (English)
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.6, fontSize: "0.85rem" }}
                        >
                            {lead.translated_message}
                        </Typography>
                    </Box>
                </Box>

                {/* ---- Footer ---- */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        mt: 2,
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{ color: "rgba(255,255,255,0.25)", fontSize: "0.7rem" }}
                    >
                        {new Date(lead.created_at).toLocaleString()}
                    </Typography>
                </Box>
            </Box>
        </Paper>
    );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

function chipFilterSx(active: boolean, color: string) {
    return {
        cursor: "pointer",
        fontWeight: 600,
        fontSize: "0.72rem",
        transition: "all 0.2s ease",
        backgroundColor: active ? `${color}20` : "transparent",
        color: active ? color : "rgba(255,255,255,0.4)",
        border: `1px solid ${active ? `${color}40` : "rgba(255,255,255,0.1)"}`,
        "&:hover": {
            backgroundColor: `${color}15`,
            color: color,
            borderColor: `${color}30`,
        },
    };
}
