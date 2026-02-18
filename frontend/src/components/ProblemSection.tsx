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
import TranslateIcon from "@mui/icons-material/Translate";
import GroupsIcon from "@mui/icons-material/Groups";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

const PROBLEMS = [
    {
        icon: <TranslateIcon sx={{ fontSize: 32, color: "#4361ee" }} />,
        title: "Language Barriers Delay Responses",
        description:
            "When leads arrive in unfamiliar languages, teams waste hours finding translators — and prospects move on.",
    },
    {
        icon: <GroupsIcon sx={{ fontSize: 32, color: "#4361ee" }} />,
        title: "Manual Lead Distribution Wastes Time",
        description:
            "Manually assigning leads to sales reps is slow, unbalanced, and prone to human error.",
    },
    {
        icon: <TrendingDownIcon sx={{ fontSize: 32, color: "#4361ee" }} />,
        title: "Unstructured Tracking Causes Missed Follow-ups",
        description:
            "Without a centralized system, leads fall through the cracks and revenue is lost.",
    },
];

export default function ProblemSection() {
    return (
        <Box
            id="problem"
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
                        The Problem
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
                        Businesses Are Losing Leads Every Day
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {PROBLEMS.map((problem, idx) => (
                        <Grid size={{ xs: 12, md: 4 }} key={idx}>
                            <Card
                                elevation={0}
                                sx={{
                                    height: "100%",
                                    border: "1px solid #f1f5f9",
                                    borderRadius: "12px",
                                    transition: "border-color 0.2s, box-shadow 0.2s",
                                    "&:hover": {
                                        borderColor: "rgba(67,97,238,0.2)",
                                        boxShadow: "0 4px 20px rgba(67,97,238,0.08)",
                                    },
                                }}
                            >
                                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                                    <Box
                                        sx={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: "10px",
                                            backgroundColor: "rgba(67,97,238,0.06)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            mb: 2.5,
                                        }}
                                    >
                                        {problem.icon}
                                    </Box>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 650,
                                            color: "#0f172a",
                                            mb: 1.5,
                                            fontSize: "1.05rem",
                                        }}
                                    >
                                        {problem.title}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: "#64748b",
                                            lineHeight: 1.7,
                                        }}
                                    >
                                        {problem.description}
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
