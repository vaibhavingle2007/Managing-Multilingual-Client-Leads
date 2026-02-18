"use client";

import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
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
    type SelectChangeEvent,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import TranslateIcon from "@mui/icons-material/Translate";
import LogoutIcon from "@mui/icons-material/Logout";
import InboxIcon from "@mui/icons-material/Inbox";
import { submitLead, type LeadPayload } from "@/services/api";
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
/*  Component                                                          */
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

export default function SubmitLeadPage() {
    const { user, loading: authLoading, signOut } = useAuth();
    const router = useRouter();

    /* ---- state ---- */
    const [lang, setLang] = useState<SupportedLang>("en");
    const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false);

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
        setLang(detectBrowserLanguage());
    }, []);

    if (authLoading || !user) {
        return (
            <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(145deg, #000214 0%, #0f172a 50%, #0c1222 100%)" }}>
                <CircularProgress sx={{ color: "#4361ee" }} />
            </Box>
        );
    }

    /* ---- handlers ---- */

    function handleLangChange(e: SelectChangeEvent) {
        setLang(e.target.value as SupportedLang);
        // Re-validate with new language strings
        if (Object.keys(touched).length > 0) {
            const newT = getTranslations(e.target.value);
            setErrors(validate(values, newT));
        }
    }

    function handleChange(
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));

        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    }

    function handleBlur(
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
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
            setSnackbar({
                open: true,
                severity: "success",
                message: t.successMessage,
            });
            setValues(INITIAL_VALUES);
            setTouched({});
            setErrors({});
        } else {
            setSnackbar({
                open: true,
                severity: "error",
                message: result.error || t.errorMessage,
            });
        }
    }

    function handleCloseSnackbar() {
        setSnackbar((prev) => ({ ...prev, open: false }));
    }

    /* ---- helpers ---- */

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
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                px: 2,
                py: 6,
            }}
        >
            {/* ---- User Bar ---- */}
            <Box sx={{ width: "100%", maxWidth: 600, mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between", px: 1 }}>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)" }}>
                    Signed in as <strong style={{ color: "#e2e8f0" }}>{user.displayName || user.email}</strong>
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                        href="/my-leads"
                        size="small"
                        startIcon={<InboxIcon />}
                        sx={{ color: "rgba(255,255,255,0.5)", textTransform: "none", fontSize: "0.8rem", "&:hover": { color: "#4361ee" } }}
                    >
                        My Leads
                    </Button>
                    <Tooltip title="Sign out">
                        <IconButton onClick={signOut} size="small" sx={{ color: "rgba(255,255,255,0.4)", "&:hover": { color: "#f87171" } }}>
                            <LogoutIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
            <Container maxWidth="sm">
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, sm: 5 },
                        borderRadius: "2px",
                        border: "1px solid rgba(255,255,255,0.08)",
                        backgroundColor: "rgba(15, 23, 42, 0.85)",
                    }}
                >
                    {/* ---- Header row ---- */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 2,
                            mb: 3,
                            flexWrap: "wrap",
                        }}
                    >
                        <Box sx={{ flex: 1, minWidth: 200 }}>
                            <Typography
                                variant="h4"
                                component="h1"
                                sx={{
                                    fontWeight: 700,
                                    color: "#f1f5f9",
                                    mb: 0.5,
                                    letterSpacing: "-0.02em",
                                    fontFamily: "var(--font-inter), sans-serif",
                                }}
                            >
                                {t.pageTitle}
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "#94a3b8",
                                    fontFamily: "var(--font-inter), sans-serif",
                                }}
                            >
                                {t.pageSubtitle}
                            </Typography>
                        </Box>

                        {/* ---- Language selector ---- */}
                        <FormControl
                            size="small"
                            sx={{ minWidth: 150, ...selectSx }}
                        >
                            <InputLabel
                                id="language-select-label"
                                sx={{
                                    color: "#94a3b8",
                                    fontFamily: "var(--font-inter), sans-serif",
                                    "&.Mui-focused": { color: "#e11d48" },
                                }}
                            >
                                <TranslateIcon
                                    sx={{ fontSize: 16, mr: 0.5, verticalAlign: "text-bottom" }}
                                />
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
                                    color: "#e2e8f0",
                                    fontFamily: "var(--font-inter), sans-serif",
                                    borderRadius: "2px",
                                    "& .MuiSvgIcon-root": { color: "#94a3b8" },
                                }}
                                MenuProps={{
                                    PaperProps: {
                                        sx: {
                                            backgroundColor: "#1e293b",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: "2px",
                                            "& .MuiMenuItem-root": {
                                                color: "#e2e8f0",
                                                fontFamily: "var(--font-inter), sans-serif",
                                                "&:hover": { backgroundColor: "rgba(225,29,72,0.15)" },
                                                "&.Mui-selected": {
                                                    backgroundColor: "rgba(225,29,72,0.25)",
                                                    "&:hover": {
                                                        backgroundColor: "rgba(225,29,72,0.3)",
                                                    },
                                                },
                                            },
                                        },
                                    },
                                }}
                            >
                                {SUPPORTED_LANGUAGES.map((l) => (
                                    <MenuItem key={l.code} value={l.code}>
                                        <Box
                                            component="span"
                                            sx={{ mr: 1, fontSize: "1.1rem" }}
                                        >
                                            {l.flag}
                                        </Box>
                                        {l.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {/* ---- Form ---- */}
                    <Box
                        component="form"
                        noValidate
                        onSubmit={handleSubmit}
                        sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
                    >
                        <TextField
                            id="lead-name"
                            label={t.labelName}
                            placeholder={t.placeholderName}
                            fullWidth
                            required
                            disabled={loading}
                            {...fieldProps("name")}
                            sx={textFieldSx}
                        />

                        <TextField
                            id="lead-email"
                            label={t.labelEmail}
                            placeholder={t.placeholderEmail}
                            type="email"
                            fullWidth
                            required
                            disabled={loading}
                            {...fieldProps("email")}
                            sx={textFieldSx}
                        />

                        <TextField
                            id="lead-phone"
                            label={t.labelPhone}
                            placeholder={t.placeholderPhone}
                            type="tel"
                            fullWidth
                            required
                            disabled={loading}
                            {...fieldProps("phone")}
                            sx={textFieldSx}
                        />

                        <TextField
                            id="lead-message"
                            label={t.labelMessage}
                            placeholder={t.placeholderMessage}
                            fullWidth
                            required
                            multiline
                            rows={4}
                            disabled={loading}
                            {...fieldProps("message")}
                            sx={textFieldSx}
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
                                    <SendIcon
                                        fontSize="small"
                                        sx={{
                                            transform: isRTL ? "scaleX(-1)" : "none",
                                        }}
                                    />
                                )
                            }
                            sx={{
                                mt: 1,
                                py: 1.4,
                                borderRadius: "2px",
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: "0.95rem",
                                fontFamily: "var(--font-inter), sans-serif",
                                backgroundColor: "#e11d48",
                                "&:hover": { backgroundColor: "#be123c" },
                            }}
                        >
                            {loading ? t.submitting : t.submitButton}
                        </Button>
                    </Box>
                </Paper>
            </Container>

            {/* ---- Snackbar ---- */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: "100%", borderRadius: "2px" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

/* ------------------------------------------------------------------ */
/*  Shared styles                                                      */
/* ------------------------------------------------------------------ */

const textFieldSx = {
    "& .MuiOutlinedInput-root": {
        borderRadius: "2px",
        fontFamily: "var(--font-inter), sans-serif",
        color: "#e2e8f0",
        "& fieldset": { borderColor: "rgba(148,163,184,0.25)" },
        "&:hover fieldset": { borderColor: "rgba(148,163,184,0.5)" },
        "&.Mui-focused fieldset": { borderColor: "#e11d48" },
    },
    "& .MuiInputLabel-root": {
        color: "#94a3b8",
        fontFamily: "var(--font-inter), sans-serif",
        "&.Mui-focused": { color: "#e11d48" },
    },
    "& .MuiFormHelperText-root": {
        fontFamily: "var(--font-inter), sans-serif",
    },
};

const selectSx = {
    "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(148,163,184,0.25)",
        borderRadius: "2px",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(148,163,184,0.5)",
    },
    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#e11d48",
    },
};
