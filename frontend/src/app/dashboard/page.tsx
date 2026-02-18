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
    IconButton,
    Tooltip,
    Button,
    TextField,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Snackbar,
    Collapse,
    type SelectChangeEvent,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import TranslateIcon from "@mui/icons-material/Translate";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import GroupIcon from "@mui/icons-material/Group";
import LabelIcon from "@mui/icons-material/Label";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ReplyIcon from "@mui/icons-material/Reply";
import SendIcon from "@mui/icons-material/Send";
import LogoutIcon from "@mui/icons-material/Logout";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import {
    fetchLeads,
    updateLeadStatus,
    sendReply,
    fetchReplies,
    type Lead,
    type LeadsListResponse,
    type Reply,
} from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STATUSES = ["New", "Contacted", "Qualified", "Lost", "Won"];

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    New: { bg: "rgba(96,165,250,0.12)", text: "#60a5fa", border: "rgba(96,165,250,0.3)" },
    Contacted: { bg: "rgba(251,191,36,0.12)", text: "#fbbf24", border: "rgba(251,191,36,0.3)" },
    Qualified: { bg: "rgba(52,211,153,0.12)", text: "#34d399", border: "rgba(52,211,153,0.3)" },
    Lost: { bg: "rgba(248,113,113,0.12)", text: "#f87171", border: "rgba(248,113,113,0.3)" },
    Won: { bg: "rgba(167,139,250,0.12)", text: "#a78bfa", border: "rgba(167,139,250,0.3)" },
};

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
    english: "🇬🇧", hindi: "🇮🇳", spanish: "🇪🇸", french: "🇫🇷",
    german: "🇩🇪", arabic: "🇸🇦", portuguese: "🇧🇷", chinese: "🇨🇳",
};

/* ------------------------------------------------------------------ */
/*  Shared styles                                                      */
/* ------------------------------------------------------------------ */

const cellSx = {
    color: "rgba(255,255,255,0.75)",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "0.85rem",
    py: 1.8,
};

const headerCellSx = {
    ...cellSx,
    color: "rgba(255,255,255,0.4)",
    fontWeight: 600,
    fontSize: "0.72rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
    const { user, loading: authLoading, signOut } = useAuth();
    const router = useRouter();

    const [leads, setLeads] = useState<Lead[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // Reply state
    const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");
    const [sendingReply, setSendingReply] = useState(false);
    const [repliesMap, setRepliesMap] = useState<Record<string, Reply[]>>({});

    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        severity: "success" | "error";
        message: string;
    }>({ open: false, severity: "success", message: "" });

    /* ---- Auth guard ---- */
    useEffect(() => {
        if (!authLoading && !user) {
            router.replace("/login");
        }
    }, [authLoading, user, router]);

    /* ---- Fetch leads ---- */
    const loadLeads = useCallback(async () => {
        setLoading(true);
        setError(null);
        const result = await fetchLeads(200, 0, statusFilter || undefined);
        if (result.success && result.data) {
            const data = result.data as LeadsListResponse;
            setLeads(data.leads);
            setTotal(data.total);
        } else {
            setError(result.error || "Failed to fetch leads");
        }
        setLoading(false);
        setLastRefresh(new Date());
    }, [statusFilter]);

    useEffect(() => {
        if (user) {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            loadLeads();
            const interval = setInterval(loadLeads, 15000);
            return () => clearInterval(interval);
        }
    }, [loadLeads, user]);

    /* ---- Load replies for a lead ---- */
    async function loadReplies(leadId: string) {
        const replies = await fetchReplies(leadId);
        setRepliesMap((prev) => ({ ...prev, [leadId]: replies }));
    }

    /* ---- Toggle reply panel ---- */
    function toggleReplyPanel(leadId: string) {
        if (expandedLeadId === leadId) {
            setExpandedLeadId(null);
            setReplyText("");
        } else {
            setExpandedLeadId(leadId);
            setReplyText("");
            loadReplies(leadId);
        }
    }

    /* ---- Send reply ---- */
    async function handleSendReply(leadId: string) {
        if (!replyText.trim() || !user) return;
        setSendingReply(true);

        const result = await sendReply(
            leadId,
            replyText.trim(),
            user.email || "",
            user.displayName || ""
        );

        if (result.success) {
            setSnackbar({
                open: true,
                severity: "success",
                message: "Reply sent & translated! Email notification sent to client.",
            });
            setReplyText("");
            await loadReplies(leadId);
        } else {
            setSnackbar({
                open: true,
                severity: "error",
                message: result.error || "Failed to send reply",
            });
        }
        setSendingReply(false);
    }

    /* ---- Status update handler ---- */
    async function handleStatusChange(leadId: string, newStatus: string) {
        setUpdatingId(leadId);
        const result = await updateLeadStatus(leadId, newStatus);
        if (result.success) {
            setSnackbar({
                open: true,
                severity: "success",
                message: `Status updated to "${newStatus}"`,
            });
            await loadLeads();
        } else {
            setSnackbar({
                open: true,
                severity: "error",
                message: result.error || "Failed to update status",
            });
        }
        setUpdatingId(null);
    }

    /* ---- Filtering (client-side search) ---- */
    const filtered = leads.filter((lead) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            lead.name.toLowerCase().includes(q) ||
            lead.email.toLowerCase().includes(q) ||
            (lead.translated_message || "").toLowerCase().includes(q) ||
            (lead.tag || "").toLowerCase().includes(q) ||
            (lead.assigned_to || "").toLowerCase().includes(q)
        );
    });

    /* ---- Stats ---- */
    const statCards = [
        { label: "Total Leads", value: total, icon: <TrendingUpIcon />, color: "#4361ee" },
        { label: "Agents Active", value: new Set(leads.map((l) => l.assigned_to).filter(Boolean)).size, icon: <GroupIcon />, color: "#34d399" },
        { label: "Tags Used", value: new Set(leads.map((l) => l.tag).filter(Boolean)).size, icon: <LabelIcon />, color: "#fbbf24" },
        { label: "Latest", value: leads.length > 0 ? timeAgo(leads[0].created_at) : "—", icon: <AccessTimeIcon />, color: "#f87171" },
    ];

    /* ---- Auth loading / guard ---- */
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
                <Container maxWidth="xl">
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Button
                                href="/"
                                startIcon={<ArrowBackIcon />}
                                sx={{ color: "rgba(255,255,255,0.6)", textTransform: "none", "&:hover": { color: "#fff", backgroundColor: "rgba(255,255,255,0.05)" } }}
                            >
                                Home
                            </Button>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
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
                                    "@keyframes pulse": { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0.6 } },
                                }}
                            />
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.35)", mr: 1 }}>
                                {user.displayName || user.email} • Updated {lastRefresh.toLocaleTimeString()}
                            </Typography>
                            <Tooltip title="Refresh now">
                                <IconButton
                                    onClick={loadLeads}
                                    disabled={loading}
                                    sx={{ color: "rgba(255,255,255,0.5)", "&:hover": { color: "#fff" } }}
                                >
                                    <RefreshIcon
                                        sx={{
                                            animation: loading ? "spin 1s linear infinite" : "none",
                                            "@keyframes spin": { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } },
                                        }}
                                    />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Sign out">
                                <IconButton
                                    onClick={signOut}
                                    sx={{ color: "rgba(255,255,255,0.5)", "&:hover": { color: "#f87171" } }}
                                >
                                    <LogoutIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="xl" sx={{ mt: 4 }}>
                {/* ---- Stat Cards ---- */}
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2.5, mb: 4 }}>
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
                                "&:hover": { border: `1px solid ${stat.color}33`, transform: "translateY(-2px)" },
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                <Box
                                    sx={{
                                        width: 40, height: 40, borderRadius: "10px",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        backgroundColor: `${stat.color}18`, color: stat.color,
                                    }}
                                >
                                    {stat.icon}
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
                                        {stat.label}
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#fff", lineHeight: 1.2, fontSize: typeof stat.value === "string" ? "1rem" : "1.5rem" }}>
                                        {stat.value}
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    ))}
                </Box>

                {/* ---- Filter Bar ---- */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2.5, mb: 3, borderRadius: "12px",
                        border: "1px solid rgba(255,255,255,0.06)",
                        backgroundColor: "rgba(15,23,42,0.6)",
                        backdropFilter: "blur(8px)",
                    }}
                >
                    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2 }}>
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
                                minWidth: 240,
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "8px", color: "#e2e8f0", fontSize: "0.85rem",
                                    "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                                    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                                    "&.Mui-focused fieldset": { borderColor: "#4361ee" },
                                },
                            }}
                        />

                        <FormControl size="small" sx={{ minWidth: 160 }}>
                            <InputLabel
                                id="status-filter-label"
                                sx={{ color: "rgba(255,255,255,0.4)", "&.Mui-focused": { color: "#4361ee" } }}
                            >
                                Filter by Status
                            </InputLabel>
                            <Select
                                labelId="status-filter-label"
                                id="status-filter"
                                value={statusFilter}
                                label="Filter by Status"
                                onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value)}
                                sx={{
                                    borderRadius: "8px", color: "#e2e8f0", fontSize: "0.85rem",
                                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.1)" },
                                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.2)" },
                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#4361ee" },
                                    "& .MuiSvgIcon-root": { color: "rgba(255,255,255,0.4)" },
                                }}
                                MenuProps={{
                                    PaperProps: {
                                        sx: {
                                            backgroundColor: "#1e293b",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: "8px",
                                            "& .MuiMenuItem-root": {
                                                color: "#e2e8f0", fontSize: "0.85rem",
                                                "&:hover": { backgroundColor: "rgba(67,97,238,0.15)" },
                                                "&.Mui-selected": { backgroundColor: "rgba(67,97,238,0.25)" },
                                            },
                                        },
                                    },
                                }}
                            >
                                <MenuItem value="">All Statuses</MenuItem>
                                {STATUSES.map((s) => (
                                    <MenuItem key={s} value={s}>
                                        <Box component="span" sx={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: STATUS_COLORS[s]?.text || "#94a3b8", mr: 1 }} />
                                        {s}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.3)", ml: "auto", fontWeight: 500 }}>
                            {filtered.length} of {total} leads
                        </Typography>
                    </Box>
                </Paper>

                {/* ---- Error ---- */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: "10px", backgroundColor: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}>
                        {error}
                    </Alert>
                )}

                {/* ---- Loading ---- */}
                {loading && leads.length === 0 && (
                    <Box sx={{ textAlign: "center", py: 10 }}>
                        <CircularProgress sx={{ color: "#4361ee" }} />
                        <Typography sx={{ color: "rgba(255,255,255,0.4)", mt: 2 }}>Loading leads…</Typography>
                    </Box>
                )}

                {/* ---- Empty ---- */}
                {!loading && filtered.length === 0 && (
                    <Box sx={{ textAlign: "center", py: 10 }}>
                        <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.3)", mb: 1 }}>
                            {leads.length === 0 ? "No leads yet" : "No leads match your filters"}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.2)" }}>
                            {leads.length === 0 ? "Submit a lead from the form to see it here." : "Try adjusting your search or filter."}
                        </Typography>
                    </Box>
                )}

                {/* ---- Data Table ---- */}
                {filtered.length > 0 && (
                    <TableContainer
                        component={Paper}
                        elevation={0}
                        sx={{
                            borderRadius: "12px",
                            border: "1px solid rgba(255,255,255,0.06)",
                            backgroundColor: "rgba(15,23,42,0.6)",
                            backdropFilter: "blur(8px)",
                            overflow: "hidden",
                        }}
                    >
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={headerCellSx}>Name</TableCell>
                                    <TableCell sx={headerCellSx}>Language</TableCell>
                                    <TableCell sx={{ ...headerCellSx, minWidth: 220 }}>Translated Message</TableCell>
                                    <TableCell sx={headerCellSx}>Tag</TableCell>
                                    <TableCell sx={headerCellSx}>Assigned To</TableCell>
                                    <TableCell sx={{ ...headerCellSx, minWidth: 140 }}>Status</TableCell>
                                    <TableCell sx={{ ...headerCellSx, minWidth: 90 }}>Reply</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filtered.map((lead) => {
                                    const tagStyle = TAG_COLORS[lead.tag || "general"] || TAG_COLORS.general;
                                    const statusStyle = STATUS_COLORS[lead.status] || STATUS_COLORS.New;
                                    const agentColor = AGENT_COLORS[lead.assigned_to || ""] || "#94a3b8";
                                    const isUpdating = updatingId === lead.id;
                                    const isExpanded = expandedLeadId === lead.id;
                                    const leadReplies = repliesMap[lead.id] || [];

                                    return (
                                        <><TableRow
                                            key={lead.id}
                                            sx={{
                                                transition: "background-color 0.2s ease",
                                                "&:hover": { backgroundColor: "rgba(255,255,255,0.02)" },
                                                opacity: isUpdating ? 0.6 : 1,
                                            }}
                                        >
                                            {/* Name */}
                                            <TableCell sx={cellSx}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                                    <Box
                                                        sx={{
                                                            width: 34, height: 34, borderRadius: "8px",
                                                            background: `linear-gradient(135deg, ${agentColor}30, ${agentColor}10)`,
                                                            border: `1px solid ${agentColor}40`,
                                                            display: "flex", alignItems: "center", justifyContent: "center",
                                                            fontWeight: 700, color: agentColor, fontSize: "0.8rem", flexShrink: 0,
                                                        }}
                                                    >
                                                        {lead.name.charAt(0).toUpperCase()}
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#f1f5f9", lineHeight: 1.3 }}>
                                                            {lead.name}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.35)", fontSize: "0.7rem" }}>
                                                            {lead.email}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>

                                            {/* Language */}
                                            <TableCell sx={cellSx}>
                                                <Chip
                                                    icon={<TranslateIcon sx={{ fontSize: "13px !important" }} />}
                                                    label={`${LANG_FLAGS[lead.language] || "🌐"} ${capitalize(lead.language)}`}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: "rgba(96,165,250,0.1)", color: "#60a5fa",
                                                        border: "1px solid rgba(96,165,250,0.2)", fontWeight: 500,
                                                        fontSize: "0.72rem", "& .MuiChip-icon": { color: "#60a5fa" },
                                                    }}
                                                />
                                            </TableCell>

                                            {/* Translated Message */}
                                            <TableCell sx={{ ...cellSx, maxWidth: 300 }}>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: "rgba(255,255,255,0.6)", fontSize: "0.82rem", lineHeight: 1.5,
                                                        overflow: "hidden", textOverflow: "ellipsis",
                                                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                                                    }}
                                                >
                                                    {lead.translated_message}
                                                </Typography>
                                            </TableCell>

                                            {/* Tag */}
                                            <TableCell sx={cellSx}>
                                                <Chip
                                                    icon={<LocalOfferIcon sx={{ fontSize: "13px !important" }} />}
                                                    label={capitalize(lead.tag || "general")}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: tagStyle.bg, color: tagStyle.text,
                                                        border: `1px solid ${tagStyle.border}`,
                                                        fontWeight: 600, fontSize: "0.72rem",
                                                        "& .MuiChip-icon": { color: tagStyle.text },
                                                    }}
                                                />
                                            </TableCell>

                                            {/* Assigned To */}
                                            <TableCell sx={cellSx}>
                                                {lead.assigned_to && (
                                                    <Chip
                                                        icon={<AssignmentIndIcon sx={{ fontSize: "13px !important" }} />}
                                                        label={lead.assigned_to}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: `${agentColor}15`, color: agentColor,
                                                            border: `1px solid ${agentColor}35`,
                                                            fontWeight: 600, fontSize: "0.72rem",
                                                            "& .MuiChip-icon": { color: agentColor },
                                                        }}
                                                    />
                                                )}
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell sx={cellSx}>
                                                <Select
                                                    size="small"
                                                    value={lead.status}
                                                    disabled={isUpdating}
                                                    onChange={(e: SelectChangeEvent) => handleStatusChange(lead.id, e.target.value)}
                                                    sx={{
                                                        minWidth: 120, borderRadius: "8px", fontSize: "0.8rem", fontWeight: 600,
                                                        color: statusStyle.text, backgroundColor: statusStyle.bg,
                                                        "& .MuiOutlinedInput-notchedOutline": { borderColor: statusStyle.border },
                                                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: statusStyle.text },
                                                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: statusStyle.text },
                                                        "& .MuiSvgIcon-root": { color: statusStyle.text },
                                                    }}
                                                    MenuProps={{ PaperProps: { sx: { backgroundColor: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", "& .MuiMenuItem-root": { color: "#e2e8f0", fontSize: "0.82rem", "&:hover": { backgroundColor: "rgba(67,97,238,0.15)" }, "&.Mui-selected": { backgroundColor: "rgba(67,97,238,0.25)" } } } } }}
                                                >
                                                    {STATUSES.map((s) => {
                                                        const sStyle = STATUS_COLORS[s];
                                                        return (
                                                            <MenuItem key={s} value={s}>
                                                                <Box component="span" sx={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: sStyle.text, mr: 1 }} />
                                                                {s}
                                                            </MenuItem>
                                                        );
                                                    })}
                                                </Select>
                                            </TableCell>

                                            {/* Reply button */}
                                            <TableCell sx={cellSx}>
                                                <Tooltip title={isExpanded ? "Close reply" : "Reply to client"}>
                                                    <IconButton
                                                        onClick={() => toggleReplyPanel(lead.id)}
                                                        sx={{
                                                            color: isExpanded ? "#4361ee" : "rgba(255,255,255,0.4)",
                                                            backgroundColor: isExpanded ? "rgba(67,97,238,0.15)" : "transparent",
                                                            "&:hover": { color: "#4361ee", backgroundColor: "rgba(67,97,238,0.1)" },
                                                        }}
                                                    >
                                                        <ReplyIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>

                                            {/* Reply panel (expandable row) */}
                                            <TableRow key={`${lead.id}-reply`}>
                                                <TableCell colSpan={7} sx={{ py: 0, borderBottom: isExpanded ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                                                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                                        <Box sx={{ py: 2.5, px: 2 }}>
                                                            {/* Previous replies */}
                                                            {leadReplies.length > 0 && (
                                                                <Box sx={{ mb: 2.5 }}>
                                                                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 1.5, display: "block" }}>
                                                                        Previous Replies ({leadReplies.length})
                                                                    </Typography>
                                                                    {leadReplies.map((reply) => (
                                                                        <Box
                                                                            key={reply.id}
                                                                            sx={{
                                                                                mb: 1.5, p: 2, borderRadius: "10px",
                                                                                backgroundColor: "rgba(67,97,238,0.06)",
                                                                                border: "1px solid rgba(67,97,238,0.12)",
                                                                            }}
                                                                        >
                                                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                                                                <ChatBubbleOutlineIcon sx={{ fontSize: 14, color: "#4361ee" }} />
                                                                                <Typography variant="caption" sx={{ color: "#4361ee", fontWeight: 600 }}>
                                                                                    {reply.agent_name}
                                                                                </Typography>
                                                                                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.25)", ml: "auto" }}>
                                                                                    {new Date(reply.created_at).toLocaleString()}
                                                                                </Typography>
                                                                            </Box>
                                                                            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.82rem", mb: 0.5 }}>
                                                                                🇬🇧 {reply.original_message}
                                                                            </Typography>
                                                                            <Typography variant="body2" sx={{ color: "#34d399", fontSize: "0.82rem" }}>
                                                                                {LANG_FLAGS[reply.target_language] || "🌐"} {reply.translated_message}
                                                                            </Typography>
                                                                        </Box>
                                                                    ))}
                                                                </Box>
                                                            )}

                                                            {/* Reply input */}
                                                            <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-end" }}>
                                                                <TextField
                                                                    fullWidth
                                                                    multiline
                                                                    maxRows={3}
                                                                    size="small"
                                                                    placeholder={`Reply in English — will be auto-translated to ${capitalize(lead.language)}…`}
                                                                    value={replyText}
                                                                    onChange={(e) => setReplyText(e.target.value)}
                                                                    disabled={sendingReply}
                                                                    sx={{
                                                                        "& .MuiOutlinedInput-root": {
                                                                            borderRadius: "10px", color: "#e2e8f0", fontSize: "0.85rem",
                                                                            backgroundColor: "rgba(15,23,42,0.5)",
                                                                            "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                                                                            "&:hover fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                                                                            "&.Mui-focused fieldset": { borderColor: "#4361ee" },
                                                                        },
                                                                    }}
                                                                />
                                                                <Button
                                                                    variant="contained"
                                                                    onClick={() => handleSendReply(lead.id)}
                                                                    disabled={sendingReply || !replyText.trim()}
                                                                    startIcon={sendingReply ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <SendIcon />}
                                                                    sx={{
                                                                        borderRadius: "10px", textTransform: "none", fontWeight: 600,
                                                                        px: 3, py: 1.2, whiteSpace: "nowrap",
                                                                        background: "linear-gradient(135deg, #4361ee 0%, #7c3aed 100%)",
                                                                        "&:hover": { background: "linear-gradient(135deg, #3a56d4 0%, #6d2fcf 100%)" },
                                                                    }}
                                                                >
                                                                    Send
                                                                </Button>
                                                            </Box>
                                                            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.25)", mt: 0.5, display: "block" }}>
                                                                💡 Your reply will be auto-translated to {LANG_FLAGS[lead.language] || "🌐"} {capitalize(lead.language)} and emailed to {lead.email}
                                                            </Typography>
                                                        </Box>
                                                    </Collapse>
                                                </TableCell>
                                            </TableRow>
                                        </>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Container>

            {/* ---- Snackbar ---- */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ borderRadius: "8px" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
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
    return `${Math.floor(hrs / 24)}d ago`;
}
