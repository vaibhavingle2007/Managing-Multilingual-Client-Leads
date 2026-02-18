"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    Divider,
    Alert,
    CircularProgress,
    Link as MuiLink,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import LanguageIcon from "@mui/icons-material/Language";
import { useAuth } from "@/contexts/AuthContext";

/* ------------------------------------------------------------------ */
/*  Shared dark-field style                                            */
/* ------------------------------------------------------------------ */

const fieldSx = {
    "& .MuiOutlinedInput-root": {
        borderRadius: "8px",
        color: "#e2e8f0",
        fontSize: "0.9rem",
        backgroundColor: "rgba(15,23,42,0.5)",
        "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
        "&:hover fieldset": { borderColor: "rgba(255,255,255,0.25)" },
        "&.Mui-focused fieldset": { borderColor: "#4361ee" },
    },
    "& .MuiInputLabel-root": {
        color: "rgba(255,255,255,0.4)",
        "&.Mui-focused": { color: "#4361ee" },
    },
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function LoginPage() {
    const { signIn, signInWithGoogle, user, role } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /* ---- Redirect if already logged in ---- */
    if (user) {
        router.replace(role === "agent" ? "/dashboard" : "/submit");
        return null;
    }

    async function handleEmailLogin(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await signIn(email, password);
            // Role-based redirect happens via auth state change
        } catch (err) {
            const msg =
                err instanceof Error ? err.message : "Login failed";
            if (msg.includes("user-not-found") || msg.includes("invalid-credential")) {
                setError("Invalid email or password. Try again or register.");
            } else if (msg.includes("wrong-password")) {
                setError("Incorrect password.");
            } else {
                setError(msg);
            }
        }
        setLoading(false);
    }

    async function handleGoogleLogin() {
        setError(null);
        setLoading(true);
        try {
            await signInWithGoogle();
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Google login failed";
            if (!msg.includes("popup-closed")) {
                setError(msg);
            }
        }
        setLoading(false);
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                    "linear-gradient(145deg, #000214 0%, #0f172a 50%, #0c1222 100%)",
                p: 2,
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, sm: 5 },
                        borderRadius: "16px",
                        border: "1px solid rgba(255,255,255,0.06)",
                        backgroundColor: "rgba(15,23,42,0.7)",
                        backdropFilter: "blur(16px)",
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            textAlign: "center",
                            mb: 4,
                        }}
                    >
                        <Box
                            sx={{
                                width: 56,
                                height: 56,
                                borderRadius: "14px",
                                background:
                                    "linear-gradient(135deg, #4361ee 0%, #7c3aed 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mx: "auto",
                                mb: 2,
                            }}
                        >
                            <LanguageIcon
                                sx={{ color: "#fff", fontSize: 28 }}
                            />
                        </Box>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                color: "#fff",
                                letterSpacing: "-0.02em",
                                mb: 0.5,
                            }}
                        >
                            Welcome Back
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ color: "rgba(255,255,255,0.45)" }}
                        >
                            Sign in to manage your multilingual leads
                        </Typography>
                    </Box>

                    {/* Error */}
                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 3,
                                borderRadius: "8px",
                                backgroundColor: "rgba(248,113,113,0.1)",
                                color: "#f87171",
                                border: "1px solid rgba(248,113,113,0.2)",
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    {/* Google Sign In */}
                    <Button
                        id="google-login-btn"
                        fullWidth
                        variant="outlined"
                        startIcon={
                            <GoogleIcon sx={{ fontSize: "20px !important" }} />
                        }
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        sx={{
                            py: 1.4,
                            borderRadius: "8px",
                            textTransform: "none",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                            color: "#e2e8f0",
                            borderColor: "rgba(255,255,255,0.15)",
                            backgroundColor: "rgba(255,255,255,0.03)",
                            "&:hover": {
                                borderColor: "rgba(255,255,255,0.3)",
                                backgroundColor: "rgba(255,255,255,0.06)",
                            },
                        }}
                    >
                        Continue with Google
                    </Button>

                    {/* Divider */}
                    <Divider
                        sx={{
                            my: 3,
                            "&::before, &::after": {
                                borderColor: "rgba(255,255,255,0.08)",
                            },
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                color: "rgba(255,255,255,0.3)",
                                px: 2,
                                fontSize: "0.75rem",
                            }}
                        >
                            or sign in with email
                        </Typography>
                    </Divider>

                    {/* Email / Password */}
                    <Box
                        component="form"
                        onSubmit={handleEmailLogin}
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2.5,
                        }}
                    >
                        <TextField
                            id="login-email"
                            label="Email"
                            type="email"
                            fullWidth
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <EmailIcon
                                            sx={{
                                                color: "rgba(255,255,255,0.3)",
                                                mr: 1,
                                                fontSize: 20,
                                            }}
                                        />
                                    ),
                                },
                            }}
                            sx={fieldSx}
                        />
                        <TextField
                            id="login-password"
                            label="Password"
                            type="password"
                            fullWidth
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <LockIcon
                                            sx={{
                                                color: "rgba(255,255,255,0.3)",
                                                mr: 1,
                                                fontSize: 20,
                                            }}
                                        />
                                    ),
                                },
                            }}
                            sx={fieldSx}
                        />

                        <Button
                            id="login-submit-btn"
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{
                                py: 1.4,
                                borderRadius: "8px",
                                textTransform: "none",
                                fontWeight: 700,
                                fontSize: "0.95rem",
                                background:
                                    "linear-gradient(135deg, #4361ee 0%, #7c3aed 100%)",
                                boxShadow: "0 4px 20px rgba(67,97,238,0.3)",
                                "&:hover": {
                                    background:
                                        "linear-gradient(135deg, #3a56d4 0%, #6d2fcf 100%)",
                                },
                            }}
                        >
                            {loading ? (
                                <CircularProgress
                                    size={22}
                                    sx={{ color: "#fff" }}
                                />
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </Box>

                    {/* Register link */}
                    <Typography
                        variant="body2"
                        sx={{
                            textAlign: "center",
                            mt: 3,
                            color: "rgba(255,255,255,0.4)",
                        }}
                    >
                        Don&apos;t have an account?{" "}
                        <MuiLink
                            href="/register"
                            sx={{
                                color: "#4361ee",
                                fontWeight: 600,
                                textDecoration: "none",
                                "&:hover": { textDecoration: "underline" },
                            }}
                        >
                            Register here
                        </MuiLink>
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
}
