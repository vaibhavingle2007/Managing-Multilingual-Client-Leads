"use client";

import React from "react";
import { Box, Container, Grid, Link, Typography } from "@mui/material";

const FOOTER_LINKS = [
    { label: "Login", href: "/login" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Submit Lead", href: "/submit" },
    { label: "Contact", href: "#" },
];

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <Box
            component="footer"
            id="footer"
            sx={{
                py: { xs: 5, md: 6 },
                backgroundColor: "#0f172a",
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={4} alignItems="flex-start">
                    {/* Brand */}
                    <Grid size={{ xs: 12, md: 5 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 700,
                                color: "#f1f5f9",
                                mb: 1,
                                fontSize: "1.1rem",
                            }}
                        >
                            LinguaLead{" "}
                            <Box
                                component="span"
                                sx={{ color: "#4361ee", fontWeight: 800 }}
                            >
                                AI
                            </Box>
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: "#94a3b8",
                                maxWidth: 320,
                                lineHeight: 1.7,
                            }}
                        >
                            AI-powered multilingual lead management platform.
                            Detect, translate, tag, and assign — automatically.
                        </Typography>
                    </Grid>

                    {/* Links */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Typography
                            variant="caption"
                            sx={{
                                color: "#64748b",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: "0.1em",
                                mb: 2,
                                display: "block",
                                fontSize: "0.7rem",
                            }}
                        >
                            Quick Links
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            {FOOTER_LINKS.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    underline="none"
                                    sx={{
                                        color: "#94a3b8",
                                        fontSize: "0.9rem",
                                        transition: "color 0.15s",
                                        "&:hover": { color: "#e2e8f0" },
                                    }}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </Box>
                    </Grid>

                    {/* Status */}
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Typography
                            variant="caption"
                            sx={{
                                color: "#64748b",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: "0.1em",
                                mb: 2,
                                display: "block",
                                fontSize: "0.7rem",
                            }}
                        >
                            Platform
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <Box
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    backgroundColor: "#22c55e",
                                }}
                            />
                            <Typography
                                variant="body2"
                                sx={{ color: "#94a3b8", fontSize: "0.85rem" }}
                            >
                                All systems operational
                            </Typography>
                        </Box>
                        <Typography
                            variant="body2"
                            sx={{ color: "#64748b", fontSize: "0.8rem" }}
                        >
                            8 languages supported
                        </Typography>
                    </Grid>
                </Grid>

                {/* Copyright */}
                <Box
                    sx={{
                        mt: 5,
                        pt: 3,
                        borderTop: "1px solid rgba(148,163,184,0.1)",
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            color: "#475569",
                            textAlign: "center",
                            fontSize: "0.8rem",
                        }}
                    >
                        © {currentYear} LinguaLead AI. Built during ENKRYPTIA 2K26 Hackathon.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}
