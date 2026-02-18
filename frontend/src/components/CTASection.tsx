"use client";

import React from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function CTASection() {
    return (
        <Box
            id="cta"
            sx={{
                py: { xs: 8, md: 10 },
                background: "linear-gradient(135deg, #4361ee 0%, #3a86ff 100%)",
                textAlign: "center",
            }}
        >
            <Container maxWidth="sm">
                <Typography
                    variant="h3"
                    component="h2"
                    sx={{
                        fontWeight: 700,
                        color: "#ffffff",
                        fontSize: { xs: "1.8rem", md: "2.4rem" },
                        mb: 2,
                        letterSpacing: "-0.01em",
                    }}
                >
                    Ready to Capture Every Lead?
                </Typography>

                <Typography
                    variant="body1"
                    sx={{
                        color: "rgba(255,255,255,0.8)",
                        mb: 4,
                        lineHeight: 1.7,
                        fontSize: "1rem",
                    }}
                >
                    Stop losing prospects to language barriers. Start converting leads
                    from every corner of the world.
                </Typography>

                <Button
                    id="cta-start-free"
                    variant="contained"
                    size="large"
                    href="/submit"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                        px: 5,
                        py: 1.6,
                        borderRadius: "8px",
                        textTransform: "none",
                        fontWeight: 700,
                        fontSize: "1rem",
                        backgroundColor: "#ffffff",
                        color: "#4361ee",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                        "&:hover": {
                            backgroundColor: "#f8faff",
                            boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
                        },
                    }}
                >
                    Start Free
                </Button>
            </Container>
        </Box>
    );
}
