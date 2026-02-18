"use client";

import { useState, useEffect, useCallback, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Alert,
    TextField,
    Tooltip,
    Typography,
    Divider,
    type SelectChangeEvent,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import TranslateIcon from "@mui/icons-material/Translate";
import LogoutIcon from "@mui/icons-material/Logout";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import LanguageIcon from "@mui/icons-material/Language";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
    submitLead,
    fetchLeads,
    fetchReplies,
    type LeadPayload,
    type Lead,
    type LeadsListResponse,
    type Reply,
} from "@/services/api";
import {
    SUPPORTED_LANGUAGES,
    type SupportedLang,
    getTranslations,
    detectBrowserLanguage,
} from "@/lib/translations";
import { useAuth } from "@/contexts/AuthContext";

/* ------------------------------------------------------------------ */
/*  Validation                                                         */
/* ------------------------------------------------------------------ */

interface FormErrors {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s\-()]{7,20}$/;

function validate(
    values: Omit<LeadPayload, "language">,
    t: ReturnType<typeof getTranslations>
): FormErrors {
    const errors: FormErrors = {};

    if (!values.name.trim()) {
        errors.name = t.required;
    } else if (values.name.trim().length < 2) {
        errors.name = t.nameTooShort;
    }

    if (!values.email.trim()) {
        errors.email = t.required;
    } else if (!EMAIL_RE.test(values.email)) {
        errors.email = t.invalidEmail;
    }

    if (!values.phone.trim()) {
        errors.phone = t.required;
    } else if (!PHONE_RE.test(values.phone)) {
        errors.phone = t.invalidPhone;
    }

    if (!values.message.trim()) {
        errors.message = t.required;
    } else if (values.message.trim().length < 10) {
        errors.message = t.messageTooShort;
    }

    return errors;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

interface FormValues {
    name: string;
    email: string;
    phone: string;
    message: string;
}

const INITIAL_VALUES: FormValues = {
    name: "",
    email: "",
    phone: "",
    message: "",
};

const STATUS_COLORS: Record<string, { bg: string; text: string; glow: string }> = {
    New: { bg: "rgba(96,165,250,0.10)", text: "#60a5fa", glow: "rgba(96,165,250,0.25)" },
    Contacted: { bg: "rgba(251,191,36,0.10)", text: "#fbbf24", glow: "rgba(251,191,36,0.25)" },
    Qualified: { bg: "rgba(52,211,153,0.10)", text: "#34d399", glow: "rgba(52,211,153,0.25)" },
    Lost: { bg: "rgba(248,113,113,0.10)", text: "#f87171", glow: "rgba(248,113,113,0.25)" },
    Won: { bg: "rgba(167,139,250,0.10)", text: "#a78bfa", glow: "rgba(167,139,250,0.25)" },
};

const LANG_FLAGS: Record<string, string> = {
    english: "🇬🇧", hindi: "🇮🇳", spanish: "🇪🇸", french: "🇫🇷",
    german: "🇩🇪", arabic: "🇸🇦", portuguese: "🇧🇷", chinese: "🇨🇳",
    japanese: "🇯🇵", korean: "🇰🇷", russian: "🇷🇺", italian: "🇮🇹",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SubmitLeadPage() {
    const { user, role, loading: authLoading, signOut } = useAuth();
    const router = useRouter();

    /* ---- form state ---- */
    const [lang, setLang] = useState<SupportedLang>("en");
    const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false);

    /* ---- leads + replies state ---- */
    const [myLeads, setMyLeads] = useState<Lead[]>([]);
    const [leadsLoading, setLeadsLoading] = useState(true);
    const [repliesMap, setRepliesMap] = useState<Record<string, Reply[]>>({});
    const [loadingRepliesFor, setLoadingRepliesFor] = useState<string | null>(null);
    const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);

    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        severity: "success" | "error";
        message: string;
    }>({ open: false, severity: "success", message: "" });

    const t = getTranslations(lang);
    const isRTL = lang === "ar";

    /* ---- auth guard ---- */
    useEffect(() => {
        if (!authLoading && !user) {
            router.replace("/login");
        }
    }, [authLoading, user, router]);

    /* ---- pre-fill from Firebase profile ---- */
    useEffect(() => {
        if (user) {
            setValues((prev) => ({
                ...prev,
                name: prev.name || user.displayName || "",
                email: prev.email || user.email || "",
            }));
        }
    }, [user]);

    /* ---- auto-detect browser language on mount ---- */
    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        setLang(detectBrowserLanguage());
    }, []);

    /* ---- fetch my leads ---- */
    const loadMyLeads = useCallback(async () => {
        if (!user?.email) return;
        setLeadsLoading(true);
        const result = await fetchLeads(200, 0);
        if (result.success && result.data) {
            const data = result.data as LeadsListResponse;
            const mine = data.leads.filter(
                (l) => l.email.toLowerCase() === user.email?.toLowerCase()
            );
            setMyLeads(mine);
        }
        setLeadsLoading(false);
    }, [user]);

    useEffect(() => {
        if (user) {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            loadMyLeads();
            const interval = setInterval(loadMyLeads, 20000);
            return () => clearInterval(interval);
        }
    }, [loadMyLeads, user]);

    /* ---- load replies for a lead ---- */
    async function loadReplies(leadId: string) {
        setLoadingRepliesFor(leadId);
        const replies = await fetchReplies(leadId);
        setRepliesMap((prev) => ({ ...prev, [leadId]: replies }));
        setLoadingRepliesFor(null);
    }

    function toggleLead(leadId: string) {
        if (expandedLeadId === leadId) {
            setExpandedLeadId(null);
        } else {
            setExpandedLeadId(leadId);
            if (!repliesMap[leadId]) loadReplies(leadId);
        }
    }

    /* ---- loading guard ---- */
    if (authLoading || !user) {
        return (
            <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(145deg, #000214 0%, #0f172a 50%, #0c1222 100%)" }}>
                <CircularProgress sx={{ color: "#4361ee" }} />
            </Box>
        );
    }

    /* ---- form handlers ---- */

    function handleLangChange(e: SelectChangeEvent) {
        setLang(e.target.value as SupportedLang);
        if (Object.keys(touched).length > 0) {
            const newT = getTranslations(e.target.value);
            setErrors(validate(values, newT));
        }
    }

    function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    }

    function handleBlur(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        const fieldErrors = validate(values, t);
        setErrors((prev) => ({
            ...prev,
            [name]: fieldErrors[name as keyof FormErrors],
        }));
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const fieldErrors = validate(values, t);
        setErrors(fieldErrors);
        setTouched({ name: true, email: true, phone: true, message: true });
        if (Object.keys(fieldErrors).length > 0) return;

        setLoading(true);
        const payload: LeadPayload = { ...values, language: lang };
        const result = await submitLead(payload);
        setLoading(false);

        if (result.success) {
            setSnackbar({ open: true, severity: "success", message: t.successMessage });
            setValues((prev) => ({ ...prev, phone: "", message: "" }));
            setTouched({});
            setErrors({});
            await loadMyLeads();
        } else {
            setSnackbar({ open: true, severity: "error", message: result.error || t.errorMessage });
        }
    }

    function fieldProps(field: keyof FormValues) {
        return {
            name: field,
            value: values[field],
            onChange: handleChange,
            onBlur: handleBlur,
            error: touched[field] && Boolean(errors[field]),
            helperText: touched[field] ? errors[field] : undefined,
        };
    }

    /* ---- render ---- */

    return (
        <Box
            dir={isRTL ? "rtl" : "ltr"}
            sx={{
                minHeight: "100vh",
                background: "linear-gradient(145deg, #000214 0%, #0a0f24 40%, #0f172a 100%)",
                pb: 10,
            }}
        >
            {/* ===================== STICKY TOP BAR ===================== */}
            <Box
                sx={{
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    backdropFilter: "blur(16px)",
                    backgroundColor: "rgba(0,2,20,0.65)",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Button
                                href="/"
                                startIcon={<ArrowBackIcon />}
                                sx={{ color: "rgba(255,255,255,0.5)", textTransform: "none", fontWeight: 500, fontSize: "0.82rem", "&:hover": { color: "#fff", backgroundColor: "rgba(255,255,255,0.04)" } }}
                            >
                                Home
                            </Button>
                            <Box sx={{ width: 1, height: 20, backgroundColor: "rgba(255,255,255,0.1)" }} />
                            <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", fontSize: "1.05rem" }}>
                                <LanguageIcon sx={{ fontSize: 18, mr: 0.8, verticalAlign: "text-bottom", color: "#4361ee" }} />
                                Lead Portal
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                                <Box sx={{ width: 28, height: 28, borderRadius: "8px", background: "linear-gradient(135deg, #4361ee 0%, #7c3aed 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "#fff" }}>
                                    {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
                                </Box>
                                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", fontWeight: 500 }}>
                                    {user.displayName || user.email}
                                </Typography>
                            </Box>
                            {role === "agent" && (
                                <Button
                                    href="/dashboard"
                                    size="small"
                                    sx={{ color: "#4361ee", textTransform: "none", fontSize: "0.78rem", fontWeight: 600, "&:hover": { backgroundColor: "rgba(67,97,238,0.08)" } }}
                                >
                                    Dashboard
                                </Button>
                            )}
                            <Tooltip title="Sign out">
                                <IconButton onClick={signOut} size="small" sx={{ color: "rgba(255,255,255,0.35)", "&:hover": { color: "#f87171", backgroundColor: "rgba(248,113,113,0.08)" } }}>
                                    <LogoutIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ mt: 5 }}>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "5fr 7fr" }, gap: 4, alignItems: "flex-start" }}>

                    {/* ===================== LEFT: SUBMIT FORM ===================== */}
                    <Box>
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 3, sm: 4 },
                                borderRadius: "16px",
                                border: "1px solid rgba(255,255,255,0.06)",
                                backgroundColor: "rgba(15,23,42,0.65)",
                                backdropFilter: "blur(12px)",
                                position: "sticky",
                                top: 80,
                            }}
                        >
                            {/* Header */}
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, mb: 3 }}>
                                <Box>
                                    <Typography
                                        variant="h5"
                                        component="h1"
                                        sx={{ fontWeight: 700, color: "#f1f5f9", mb: 0.5, letterSpacing: "-0.02em", fontSize: "1.3rem" }}
                                    >
                                        {t.pageTitle}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.82rem" }}>
                                        {t.pageSubtitle}
                                    </Typography>
                                </Box>

                                {/* Language selector */}
                                <FormControl size="small" sx={{ minWidth: 130, ...selectSx }}>
                                    <InputLabel
                                        id="language-select-label"
                                        sx={{ color: "#64748b", "&.Mui-focused": { color: "#4361ee" } }}
                                    >
                                        <TranslateIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: "text-bottom" }} />
                                        {t.labelLanguage}
                                    </InputLabel>
                                    <Select
                                        labelId="language-select-label"
                                        id="language-select"
                                        value={lang}
                                        label={t.labelLanguage + "   "}
                                        onChange={handleLangChange}
                                        disabled={loading}
                                        sx={{
                                            color: "#e2e8f0", fontSize: "0.82rem", borderRadius: "10px",
                                            "& .MuiSvgIcon-root": { color: "#64748b" },
                                        }}
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    backgroundColor: "#1e293b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px",
                                                    "& .MuiMenuItem-root": {
                                                        color: "#e2e8f0", fontSize: "0.82rem",
                                                        "&:hover": { backgroundColor: "rgba(67,97,238,0.12)" },
                                                        "&.Mui-selected": { backgroundColor: "rgba(67,97,238,0.2)" },
                                                    },
                                                },
                                            },
                                        }}
                                    >
                                        {SUPPORTED_LANGUAGES.map((l) => (
                                            <MenuItem key={l.code} value={l.code}>
                                                <Box component="span" sx={{ mr: 0.8, fontSize: "1rem" }}>{l.flag}</Box>
                                                {l.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>

                            {/* Form */}
                            <Box
                                component="form"
                                noValidate
                                onSubmit={handleSubmit}
                                sx={{ display: "flex", flexDirection: "column", gap: 2.2 }}
                            >
                                <TextField
                                    id="lead-name"
                                    label={t.labelName}
                                    placeholder={t.placeholderName}
                                    fullWidth required disabled={loading}
                                    {...fieldProps("name")}
                                    sx={inputSx}
                                />
                                <TextField
                                    id="lead-email"
                                    label={t.labelEmail}
                                    placeholder={t.placeholderEmail}
                                    type="email" fullWidth required disabled={loading}
                                    {...fieldProps("email")}
                                    sx={inputSx}
                                />
                                <TextField
                                    id="lead-phone"
                                    label={t.labelPhone}
                                    placeholder={t.placeholderPhone}
                                    type="tel" fullWidth required disabled={loading}
                                    {...fieldProps("phone")}
                                    sx={inputSx}
                                />
                                <TextField
                                    id="lead-message"
                                    label={t.labelMessage}
                                    placeholder={t.placeholderMessage}
                                    fullWidth required multiline rows={4} disabled={loading}
                                    {...fieldProps("message")}
                                    sx={inputSx}
                                />

                                <Button
                                    id="submit-lead-btn"
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    disabled={loading}
                                    endIcon={
                                        loading ? (
                                            <CircularProgress size={18} color="inherit" />
                                        ) : (
                                            <SendIcon fontSize="small" sx={{ transform: isRTL ? "scaleX(-1)" : "none" }} />
                                        )
                                    }
                                    sx={{
                                        mt: 0.5,
                                        py: 1.4,
                                        borderRadius: "12px",
                                        textTransform: "none",
                                        fontWeight: 600,
                                        fontSize: "0.92rem",
                                        background: "linear-gradient(135deg, #4361ee 0%, #7c3aed 100%)",
                                        boxShadow: "0 4px 20px rgba(67,97,238,0.3)",
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            background: "linear-gradient(135deg, #3a56d4 0%, #6d2fcf 100%)",
                                            boxShadow: "0 6px 28px rgba(67,97,238,0.45)",
                                            transform: "translateY(-1px)",
                                        },
                                    }}
                                >
                                    {loading ? t.submitting : t.submitButton}
                                </Button>
                            </Box>
                        </Paper>
                    </Box>

                    {/* ===================== RIGHT: MY LEADS ===================== */}
                    <Box>
                        {/* Section header */}
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.01em", fontSize: "1.1rem" }}>
                                    My Submissions
                                </Typography>
                                <Typography variant="caption" sx={{ color: "#475569", fontSize: "0.75rem" }}>
                                    {myLeads.length > 0 ? `${myLeads.length} lead${myLeads.length > 1 ? "s" : ""} submitted` : "Your leads will appear here"}
                                </Typography>
                            </Box>
                            {myLeads.length > 0 && (
                                <Chip
                                    icon={<FiberManualRecordIcon sx={{ fontSize: "8px !important", animation: "pulse 2s ease-in-out infinite", "@keyframes pulse": { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0.4 } } }} />}
                                    label="Live"
                                    size="small"
                                    sx={{
                                        backgroundColor: "rgba(52,211,153,0.1)",
                                        color: "#34d399",
                                        border: "1px solid rgba(52,211,153,0.2)",
                                        fontWeight: 600,
                                        fontSize: "0.68rem",
                                        "& .MuiChip-icon": { color: "#34d399" },
                                    }}
                                />
                            )}
                        </Box>

                        {/* Loading */}
                        {leadsLoading && myLeads.length === 0 && (
                            <Box sx={{ textAlign: "center", py: 8 }}>
                                <CircularProgress size={28} sx={{ color: "rgba(255,255,255,0.2)" }} />
                                <Typography sx={{ color: "rgba(255,255,255,0.25)", mt: 2, fontSize: "0.82rem" }}>Loading your leads…</Typography>
                            </Box>
                        )}

                        {/* Empty state */}
                        {!leadsLoading && myLeads.length === 0 && (
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 5, borderRadius: "16px", textAlign: "center",
                                    border: "1px dashed rgba(255,255,255,0.08)",
                                    backgroundColor: "rgba(15,23,42,0.3)",
                                }}
                            >
                                <Box sx={{ width: 56, height: 56, borderRadius: "14px", background: "rgba(67,97,238,0.08)", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
                                    <ChatBubbleOutlineIcon sx={{ color: "#4361ee", fontSize: 26 }} />
                                </Box>
                                <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.4)", fontWeight: 600, mb: 0.5 }}>
                                    No leads yet
                                </Typography>
                                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.2)", fontSize: "0.82rem" }}>
                                    Submit your first lead using the form — agent replies will show up here.
                                </Typography>
                            </Paper>
                        )}

                        {/* Lead cards */}
                        {myLeads.map((lead, idx) => {
                            const statusStyle = STATUS_COLORS[lead.status] || STATUS_COLORS.New;
                            const isExpanded = expandedLeadId === lead.id;
                            const replies = repliesMap[lead.id] || [];
                            const isLoadingReplies = loadingRepliesFor === lead.id;
                            const hasReplies = replies.length > 0;
                            const langFlag = LANG_FLAGS[lead.language] || "🌐";

                            return (
                                <Paper
                                    key={lead.id}
                                    elevation={0}
                                    onClick={() => toggleLead(lead.id)}
                                    sx={{
                                        mb: 2, borderRadius: "14px",
                                        border: isExpanded
                                            ? "1px solid rgba(67,97,238,0.2)"
                                            : "1px solid rgba(255,255,255,0.05)",
                                        backgroundColor: isExpanded
                                            ? "rgba(15,23,42,0.75)"
                                            : "rgba(15,23,42,0.45)",
                                        backdropFilter: "blur(8px)",
                                        cursor: "pointer",
                                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                        overflow: "hidden",
                                        "&:hover": {
                                            border: "1px solid rgba(67,97,238,0.15)",
                                            backgroundColor: "rgba(15,23,42,0.65)",
                                            transform: "translateY(-1px)",
                                            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                                        },
                                    }}
                                >
                                    {/* Card header */}
                                    <Box sx={{ p: 2.5 }}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                                {/* Number badge */}
                                                <Box sx={{
                                                    width: 32, height: 32, borderRadius: "9px",
                                                    background: `linear-gradient(135deg, ${statusStyle.text}18, ${statusStyle.text}08)`,
                                                    border: `1px solid ${statusStyle.text}25`,
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    fontSize: "0.72rem", fontWeight: 700, color: statusStyle.text,
                                                    flexShrink: 0,
                                                }}>
                                                    #{myLeads.length - idx}
                                                </Box>
                                                <Box>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                                                        <Typography variant="body2" sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#e2e8f0" }}>
                                                            {langFlag} {capitalize(lead.language)}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.2)", fontSize: "0.68rem" }}>•</Typography>
                                                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", display: "flex", alignItems: "center", gap: 0.3 }}>
                                                            <AccessTimeIcon sx={{ fontSize: 11 }} />
                                                            {timeAgo(lead.created_at)}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                {hasReplies && (
                                                    <Chip
                                                        icon={<ChatBubbleOutlineIcon sx={{ fontSize: "12px !important" }} />}
                                                        label={replies.length}
                                                        size="small"
                                                        sx={{
                                                            height: 22,
                                                            backgroundColor: "rgba(67,97,238,0.1)",
                                                            color: "#4361ee",
                                                            border: "1px solid rgba(67,97,238,0.2)",
                                                            fontWeight: 700, fontSize: "0.68rem",
                                                            "& .MuiChip-icon": { color: "#4361ee" },
                                                        }}
                                                    />
                                                )}
                                                <Chip
                                                    label={lead.status}
                                                    size="small"
                                                    sx={{
                                                        height: 22,
                                                        backgroundColor: statusStyle.bg,
                                                        color: statusStyle.text,
                                                        fontWeight: 600, fontSize: "0.68rem",
                                                        border: `1px solid ${statusStyle.text}20`,
                                                    }}
                                                />
                                            </Box>
                                        </Box>

                                        {/* Message preview */}
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: "rgba(255,255,255,0.55)",
                                                fontSize: "0.82rem",
                                                lineHeight: 1.55,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                display: "-webkit-box",
                                                WebkitLineClamp: isExpanded ? 10 : 2,
                                                WebkitBoxOrient: "vertical",
                                            }}
                                        >
                                            {lead.original_message || lead.translated_message}
                                        </Typography>

                                        {/* Assigned agent info */}
                                        {lead.assigned_to && (
                                            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.25)", mt: 1, display: "block", fontSize: "0.7rem" }}>
                                                Assigned to <strong style={{ color: "#60a5fa" }}>{lead.assigned_to}</strong>
                                            </Typography>
                                        )}
                                    </Box>

                                    {/* Expanded: Replies section */}
                                    {isExpanded && (
                                        <Box
                                            onClick={(e) => e.stopPropagation()}
                                            sx={{ px: 2.5, pb: 2.5 }}
                                        >
                                            <Divider sx={{ borderColor: "rgba(255,255,255,0.05)", mb: 2 }} />

                                            {isLoadingReplies && (
                                                <Box sx={{ py: 2, textAlign: "center" }}>
                                                    <CircularProgress size={20} sx={{ color: "rgba(255,255,255,0.2)" }} />
                                                </Box>
                                            )}

                                            {!isLoadingReplies && replies.length === 0 && (
                                                <Box sx={{ py: 2, textAlign: "center" }}>
                                                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.2)", fontSize: "0.78rem" }}>
                                                        ⏳ No replies yet — an agent will respond soon
                                                    </Typography>
                                                </Box>
                                            )}

                                            {replies.map((reply) => (
                                                <Box
                                                    key={reply.id}
                                                    sx={{
                                                        mb: 1.5,
                                                        p: 2,
                                                        borderRadius: "11px",
                                                        backgroundColor: "rgba(67,97,238,0.05)",
                                                        border: "1px solid rgba(67,97,238,0.1)",
                                                        transition: "all 0.2s ease",
                                                        "&:hover": { backgroundColor: "rgba(67,97,238,0.08)" },
                                                    }}
                                                >
                                                    {/* Reply header */}
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 1 }}>
                                                        <Box sx={{
                                                            width: 20, height: 20, borderRadius: "6px",
                                                            background: "linear-gradient(135deg, #4361ee, #7c3aed)",
                                                            display: "flex", alignItems: "center", justifyContent: "center",
                                                            fontSize: "0.55rem", fontWeight: 700, color: "#fff",
                                                        }}>
                                                            {(reply.agent_name || "A").charAt(0).toUpperCase()}
                                                        </Box>
                                                        <Typography variant="caption" sx={{ color: "#4361ee", fontWeight: 600, fontSize: "0.75rem" }}>
                                                            {reply.agent_name}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.2)", ml: "auto", fontSize: "0.68rem" }}>
                                                            {timeAgo(reply.created_at)}
                                                        </Typography>
                                                    </Box>

                                                    {/* Translated message (prominent) */}
                                                    <Typography variant="body2" sx={{ color: "#e2e8f0", fontSize: "0.85rem", lineHeight: 1.6 }}>
                                                        {LANG_FLAGS[reply.target_language] || "🌐"} {reply.translated_message}
                                                    </Typography>

                                                    {/* Original English (subtle) */}
                                                    {reply.original_message !== reply.translated_message && (
                                                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.25)", display: "block", mt: 0.8, fontSize: "0.72rem", fontStyle: "italic" }}>
                                                            🇬🇧 {reply.original_message}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            ))}

                                            {replies.length > 0 && (
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
                                                    <CheckCircleOutlineIcon sx={{ fontSize: 13, color: "#34d399" }} />
                                                    <Typography variant="caption" sx={{ color: "#34d399", fontSize: "0.68rem", fontWeight: 500 }}>
                                                        Auto-translated from English
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    )}
                                </Paper>
                            );
                        })}
                    </Box>
                </Box>
            </Container>

            {/* ---- Snackbar ---- */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ borderRadius: "10px" }}
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

/* ------------------------------------------------------------------ */
/*  Shared styles                                                      */
/* ------------------------------------------------------------------ */

const inputSx = {
    "& .MuiOutlinedInput-root": {
        borderRadius: "10px",
        color: "#e2e8f0",
        fontSize: "0.88rem",
        "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
        "&:hover fieldset": { borderColor: "rgba(255,255,255,0.15)" },
        "&.Mui-focused fieldset": { borderColor: "#4361ee" },
    },
    "& .MuiInputLabel-root": {
        color: "#64748b",
        fontSize: "0.85rem",
        "&.Mui-focused": { color: "#4361ee" },
    },
    "& .MuiFormHelperText-root": { fontSize: "0.72rem" },
};

const selectSx = {
    "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(255,255,255,0.08)",
        borderRadius: "10px",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(255,255,255,0.15)",
    },
    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#4361ee",
    },
};
