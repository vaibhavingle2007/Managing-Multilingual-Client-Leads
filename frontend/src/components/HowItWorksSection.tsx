"use client";

import React from "react";
import { Box, Container, Grid, Typography } from "@mui/material";

const STEPS = [
    {
        number: "01",
        title: "Customer Submits Inquiry",
        description:
            "A prospect fills out the contact form in any of the 8 supported languages.",
    },
    {
        number: "02",
        title: "AI Detects & Translates",
        description:
            "Gemini AI instantly identifies the language and translates the message to English.",
    },
    {
        number: "03",
        title: "Lead Is Tagged & Assigned",
        description:
            "The system categorizes the lead and assigns it to the right sales rep automatically.",
    },
];

export default function HowItWorksSection() {
    return (
        <Box
            id="how-it-works"
            sx={{
                py: { xs: 8, md: 12 },
                backgroundColor: "#ffffff",
            }}
        >
            <Container maxWidth="lg">
                <Box sx={{ textAlign: "center", mb: { xs: 5, md: 7 } }}>
                    <Typography
                        variant="overline"
                        sx={{
                            color: "#4361ee",
                            fontWeight: 600,
                            letterSpacing: "0.1em",
                            fontSize: "0.75rem",
                            mb: 1.5,
                            display: "block",
                        }}
                    >
                        How it Works
                    </Typography>
                    <Typography
                        variant="h3"
                        component="h2"
                        sx={{
                            fontWeight: 700,
                            color: "#0f172a",
                            fontSize: { xs: "1.8rem", md: "2.4rem" },
                            letterSpacing: "-0.01em",
                        }}
                    >
                        Three Simple Steps
                    </Typography>
                </Box>

                <Grid container spacing={4} alignItems="stretch">
                    {STEPS.map((step, idx) => (
                        <Grid size={{ xs: 12, md: 4 }} key={idx}>
                            <Box
                                sx={{
                                    height: "100%",
                                    position: "relative",
                                    textAlign: "center",
                                    px: { xs: 2, md: 3 },
                                    py: 4,
                                }}
                            >
                                {/* Step number */}
                                <Typography
                                    sx={{
                                        fontSize: "3.5rem",
                                        fontWeight: 800,
                                        color: "rgba(67,97,238,0.08)",
                                        lineHeight: 1,
                                        mb: 2,
                                        fontVariantNumeric: "tabular-nums",
                                    }}
                                >
                                    {step.number}
                                </Typography>

                                {/* Connector line (between steps on desktop) */}
                                {idx < STEPS.length - 1 && (
                                    <Box
                                        sx={{
                                            display: { xs: "none", md: "block" },
                                            position: "absolute",
                                            top: "32%",
                                            right: -20,
                                            width: 40,
                                            height: 2,
                                            backgroundColor: "rgba(67,97,238,0.15)",
                                        }}
                                    />
                                )}

                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 650,
                                        color: "#0f172a",
                                        mb: 1.5,
                                        fontSize: "1.05rem",
                                    }}
                                >
                                    {step.title}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: "#64748b",
                                        lineHeight: 1.7,
                                        maxWidth: 280,
                                        mx: "auto",
                                    }}
                                >
                                    {step.description}
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}
