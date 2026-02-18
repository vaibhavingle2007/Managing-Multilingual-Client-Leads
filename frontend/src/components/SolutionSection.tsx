"use client";

import React from "react";
import {
    Box,
    Card,
    CardContent,
    Container,
    Grid,
    Typography,
} from "@mui/material";
import PublicIcon from "@mui/icons-material/Public";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import LabelIcon from "@mui/icons-material/Label";
import DashboardIcon from "@mui/icons-material/Dashboard";

const FEATURES = [
    {
        icon: <PublicIcon sx={{ fontSize: 28, color: "#4361ee" }} />,
        emoji: "🌍",
        title: "8 Language Support",
        description:
            "Detect and translate leads automatically across English, Hindi, Spanish, French, German, Arabic, Portuguese, and Chinese.",
    },
    {
        icon: <SmartToyIcon sx={{ fontSize: 28, color: "#4361ee" }} />,
        emoji: "🤖",
        title: "Smart Auto-Assignment",
        description:
            "Balanced round-robin distribution ensures every sales rep gets an equal share of incoming leads.",
    },
    {
        icon: <LabelIcon sx={{ fontSize: 28, color: "#4361ee" }} />,
        emoji: "🏷️",
        title: "Intelligent Tagging",
        description:
            "Keyword-based categorization automatically labels leads by topic, urgency, and intent.",
    },
    {
        icon: <DashboardIcon sx={{ fontSize: 28, color: "#4361ee" }} />,
        emoji: "📊",
        title: "Centralized Mini-CRM",
        description:
            "A structured dashboard for sales teams to view, filter, and manage all leads in one place.",
    },
];

export default function SolutionSection() {
    return (
        <Box
            id="solution"
            sx={{
                py: { xs: 8, md: 12 },
                backgroundColor: "#f8faff",
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
                        The Solution
                    </Typography>
                    <Typography
                        variant="h3"
                        component="h2"
                        sx={{
                            fontWeight: 700,
                            color: "#0f172a",
                            fontSize: { xs: "1.8rem", md: "2.4rem" },
                            letterSpacing: "-0.01em",
                            mb: 1,
                        }}
                    >
                        AI-Powered Smart Lead Processing
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: "#64748b",
                            maxWidth: 560,
                            mx: "auto",
                            lineHeight: 1.7,
                        }}
                    >
                        From detection to assignment, every step is automated so your team
                        can focus on closing deals.
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {FEATURES.map((feature, idx) => (
                        <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                            <Card
                                elevation={0}
                                sx={{
                                    height: "100%",
                                    border: "1px solid #eef2ff",
                                    borderRadius: "12px",
                                    backgroundColor: "#ffffff",
                                    transition: "transform 0.2s, box-shadow 0.2s",
                                    "&:hover": {
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 8px 30px rgba(67,97,238,0.08)",
                                    },
                                }}
                            >
                                <CardContent sx={{ p: { xs: 3, md: 3.5 } }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                                        <Box
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: "10px",
                                                backgroundColor: "rgba(67,97,238,0.06)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "1.4rem",
                                            }}
                                        >
                                            {feature.emoji}
                                        </Box>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 650,
                                                color: "#0f172a",
                                                fontSize: "1.05rem",
                                            }}
                                        >
                                            {feature.title}
                                        </Typography>
                                    </Box>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: "#64748b",
                                            lineHeight: 1.7,
                                        }}
                                    >
                                        {feature.description}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}
