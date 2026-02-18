"use client";

import React from "react";
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

export default function HeroSection() {
    return (
        <Box
            id="hero"
            sx={{
                minHeight: { xs: "auto", md: "92vh" },
                display: "flex",
                alignItems: "center",
                pt: { xs: 12, md: 0 },
                pb: { xs: 8, md: 0 },
                background:
                    "linear-gradient(135deg, #f8faff 0%, #eef2ff 50%, #e8edff 100%)",
                overflow: "hidden",
                position: "relative",
            }}
        >
            {/* Subtle decorative circle */}
            <Box
                sx={{
                    position: "absolute",
                    top: -120,
                    right: -120,
                    width: 400,
                    height: 400,
                    borderRadius: "50%",
                    background:
                        "radial-gradient(circle, rgba(67,97,238,0.06) 0%, transparent 70%)",
                    pointerEvents: "none",
                }}
            />

            <Container maxWidth="lg">
                <Grid container spacing={6} alignItems="center">
                    {/* ---- Left: Text ---- */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box
                            sx={{
                                px: 1,
                                display: "inline-block",
                                mb: 2,
                                py: 0.5,
                                borderRadius: "4px",
                                backgroundColor: "rgba(67,97,238,0.08)",
                                border: "1px solid rgba(67,97,238,0.15)",
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    color: "#4361ee",
                                    fontWeight: 600,
                                    letterSpacing: "0.05em",
                                    textTransform: "uppercase",
                                    fontSize: "0.7rem",
                                    px: 1,
                                }}
                            >
                                AI-Powered Lead Management
                            </Typography>
                        </Box>

                        <Typography
                            variant="h2"
                            component="h1"
                            sx={{
                                fontWeight: 800,
                                color: "#0f172a",
                                lineHeight: 1.15,
                                fontSize: { xs: "2.2rem", sm: "2.8rem", md: "3.2rem" },
                                mb: 1,
                                letterSpacing: "-0.02em",
                            }}
                        >
                            LinguaLead{" "}
                            <Box
                                component="span"
                                sx={{
                                    background:
                                        "linear-gradient(135deg, #4361ee 0%, #3a86ff 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                }}
                            >
                                AI
                            </Box>
                        </Typography>

                        <Typography
                            variant="h5"
                            component="p"
                            sx={{
                                fontWeight: 500,
                                color: "#334155",
                                mb: 2.5,
                                lineHeight: 1.4,
                                fontSize: { xs: "1.1rem", md: "1.3rem" },
                            }}
                        >
                            Turn Every Language Into a Sales Opportunity.
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{
                                color: "#64748b",
                                mb: 4,
                                maxWidth: 480,
                                lineHeight: 1.7,
                                fontSize: "0.95rem",
                            }}
                        >
                            AI-powered language detection, real-time translation, smart
                            tagging, and automatic lead assignment — all in one platform.
                        </Typography>

                        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                            <Button
                                id="hero-get-started"
                                variant="contained"
                                size="large"
                                endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
                                href="/submit"
                                sx={{
                                    px: 3.5,
                                    py: 1.4,
                                    borderRadius: "8px",
                                    textTransform: "none",
                                    fontWeight: 600,
                                    fontSize: "0.95rem",
                                    backgroundColor: "#4361ee",
                                    boxShadow: "0 4px 14px rgba(67,97,238,0.3)",
                                    "&:hover": {
                                        backgroundColor: "#3a56d4",
                                        boxShadow: "0 6px 20px rgba(67,97,238,0.4)",
                                    },
                                }}
                            >
                                Get Started
                            </Button>

                            <Button
                                id="hero-view-demo"
                                variant="outlined"
                                size="large"
                                startIcon={<PlayArrowIcon />}
                                sx={{
                                    px: 3.5,
                                    py: 1.4,
                                    borderRadius: "8px",
                                    textTransform: "none",
                                    fontWeight: 600,
                                    fontSize: "0.95rem",
                                    color: "#4361ee",
                                    borderColor: "rgba(67,97,238,0.3)",
                                    "&:hover": {
                                        borderColor: "#4361ee",
                                        backgroundColor: "rgba(67,97,238,0.04)",
                                    },
                                }}
                            >
                                View Demo
                            </Button>
                        </Box>
                    </Grid>

                    {/* ---- Right: Visual ---- */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box
                            sx={{
                                position: "relative",
                                width: "100%",
                                minHeight: { xs: 280, md: 420 },
                                borderRadius: "16px",
                                background:
                                    "linear-gradient(145deg, #4361ee 0%, #3a86ff 40%, #60a5fa 100%)",
                                overflow: "hidden",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 20px 60px rgba(67,97,238,0.2)",
                            }}
                        >
                            {/* Decorative elements */}
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: 30,
                                    left: 30,
                                    width: 120,
                                    height: 120,
                                    borderRadius: "50%",
                                    border: "2px solid rgba(255,255,255,0.15)",
                                }}
                            />
                            <Box
                                sx={{
                                    position: "absolute",
                                    bottom: 40,
                                    right: 40,
                                    width: 80,
                                    height: 80,
                                    borderRadius: "50%",
                                    backgroundColor: "rgba(255,255,255,0.08)",
                                }}
                            />
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    width: 200,
                                    height: 200,
                                    borderRadius: "50%",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                }}
                            />

                            {/* Central content */}
                            <Box sx={{ textAlign: "center", zIndex: 1, px: 3 }}>
                                <Typography
                                    sx={{
                                        fontSize: { xs: "3rem", md: "4rem" },
                                        mb: 1,
                                    }}
                                >
                                    🌍
                                </Typography>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        color: "rgba(255,255,255,0.95)",
                                        fontWeight: 700,
                                        mb: 1,
                                    }}
                                >
                                    8 Languages
                                </Typography>
                                <Typography
                                    sx={{
                                        color: "rgba(255,255,255,0.7)",
                                        fontSize: "0.9rem",
                                    }}
                                >
                                    Detect • Translate • Assign
                                </Typography>

                                {/* Language chips */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: 1,
                                        justifyContent: "center",
                                        mt: 3,
                                    }}
                                >
                                    {["EN", "HI", "ES", "FR", "DE", "AR", "PT", "ZH"].map(
                                        (code) => (
                                            <Box
                                                key={code}
                                                sx={{
                                                    px: 1.5,
                                                    py: 0.4,
                                                    borderRadius: "4px",
                                                    backgroundColor: "rgba(255,255,255,0.15)",
                                                    color: "rgba(255,255,255,0.9)",
                                                    fontSize: "0.75rem",
                                                    fontWeight: 600,
                                                    letterSpacing: "0.05em",
                                                }}
                                            >
                                                {code}
                                            </Box>
                                        )
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
