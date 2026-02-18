"use client";

import React from "react";
import dynamic from "next/dynamic";
import {
    Box,
    Container,
    Typography,
    Button,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DashboardIcon from "@mui/icons-material/Dashboard";

// Lazy-load Spline (WebGL needs client-side only)
const Spline = dynamic(() => import("@splinetool/react-spline"), {
    ssr: false,
});

const SPLINE_SCENE =
    "https://prod.spline.design/f6NKFfB4OTuY1xZY/scene.splinecode";

export default function HeroSection() {
    return (
        <Box
            id="hero"
            sx={{
                position: "relative",
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                overflow: "hidden",
                backgroundColor: "#000214",
            }}
        >
            {/* ---- Spline 3D Background ---- */}
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 0,
                }}
            >
                <Spline scene={SPLINE_SCENE} />
            </Box>

            {/* ---- Dark overlay for text readability ---- */}
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background:
                        "linear-gradient(90deg, rgba(0,2,20,0.85) 0%, rgba(0,2,20,0.5) 50%, transparent 100%)",
                    zIndex: 1,
                    pointerEvents: "none",
                }}
            />

            {/* ---- Content ---- */}
            <Container
                maxWidth="lg"
                sx={{
                    position: "relative",
                    zIndex: 2,
                    py: { xs: 12, md: 0 },
                    pointerEvents: "auto",
                }}
            >
                <Box sx={{ maxWidth: { xs: "100%", md: "55%" } }}>
                    <Box
                        sx={{
                            display: "inline-block",
                            mb: 2,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: "4px",
                            backgroundColor: "rgba(67,97,238,0.15)",
                            border: "1px solid rgba(67,97,238,0.3)",
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                color: "#93b4ff",
                                fontWeight: 600,
                                letterSpacing: "0.05em",
                                textTransform: "uppercase",
                                fontSize: "0.7rem",
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
                            color: "#ffffff",
                            lineHeight: 1.15,
                            fontSize: { xs: "2.2rem", sm: "2.8rem", md: "3.4rem" },
                            mb: 1,
                            letterSpacing: "-0.02em",
                        }}
                    >
                        LinguaLead{" "}
                        <Box
                            component="span"
                            sx={{
                                background:
                                    "linear-gradient(135deg, #60a5fa 0%, #93b4ff 100%)",
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
                            color: "rgba(255,255,255,0.9)",
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
                            color: "rgba(255,255,255,0.6)",
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
                                boxShadow: "0 4px 14px rgba(67,97,238,0.4)",
                                "&:hover": {
                                    backgroundColor: "#3a56d4",
                                    boxShadow: "0 6px 20px rgba(67,97,238,0.5)",
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
                                color: "rgba(255,255,255,0.9)",
                                borderColor: "rgba(255,255,255,0.25)",
                                "&:hover": {
                                    borderColor: "rgba(255,255,255,0.5)",
                                    backgroundColor: "rgba(255,255,255,0.05)",
                                },
                            }}
                        >
                            View Demo
                        </Button>


                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
