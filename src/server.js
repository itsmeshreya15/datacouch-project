// ============================================
// server.js — Main Application Entry Point
// ============================================
// This is the starting point of the AI-Powered Code Analyzer.
// It sets up the Express web server, connects the API routes,
// and integrates Inngest for background task processing.
//
// ARCHITECTURE OVERVIEW:
//   ┌─────────────┐      ┌──────────────┐      ┌─────────────┐
//   │   Client    │ ──── │  Express API │ ──── │   Inngest   │
//   │ (sends code)│      │ (receives &  │      │ (background │
//   └─────────────┘      │  queues job) │      │  AI worker) │
//                        └──────────────┘      └──────┬──────┘
//                                                     │
//                                              ┌──────▼──────┐
//                                              │  Gemini AI  │
//                                              │ (analyzes   │
//                                              │   code)     │
//                                              └─────────────┘
// ============================================

const express = require("express");
const cors = require("cors");
const path = require("path");
const { serve } = require("inngest/express");
require("dotenv").config();

// --- Import Our Modules ---
const { inngest } = require("./inngest/client");
const { analyzeCodeFunction } = require("./inngest/functions");
const analyzeRoutes = require("./routes/analyze");

// --- Initialize Express App ---
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// Middleware Setup
// ============================================
// Middleware runs on EVERY request before it reaches our routes.

// cors() — Allows requests from other domains (needed for frontend apps)
app.use(cors());

// express.json() — Parses incoming JSON request bodies
// Without this, req.body would be undefined!
app.use(express.json({ limit: "10mb" }));

// --- Request Logger Middleware ---
// Logs every incoming request for debugging purposes
// (Skips Inngest internal requests to reduce terminal noise)
app.use((req, res, next) => {
  if (req.path.includes('inngest') || req.path.includes('.netlify') || req.path.includes('.redwood') || req.path === '/x/inngest') {
    return next(); // Skip Inngest sync/heartbeat/discovery requests
  }
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// ============================================
// Static Files & Route Registration
// ============================================

// --- Serve the Frontend ---
// Express serves all files from the /public folder (our HTML/CSS/JS frontend)
app.use(express.static(path.join(__dirname, "..", "public")));

// --- Health Check API Endpoint ---
// Visit http://localhost:3000/api/health to verify the server is running
app.get("/api/health", (req, res) => {
  res.json({
    name: "🛡️ AI-Powered Code Analyzer",
    version: "1.0.0",
    status: "running",
    endpoints: {
      "GET /": "Frontend UI",
      "POST /api/analyze": "Submit code for analysis",
      "GET /api/status/:jobId": "Check analysis status and results",
      "GET /api/jobs": "List all analysis jobs",
    },
  });
});

// --- Mount the Analysis Routes ---
// All routes defined in analyze.js will be prefixed with /api
// e.g., POST /api/analyze, GET /api/status/:id
app.use("/api", analyzeRoutes);

// --- Inngest Serve Endpoint ---
// This exposes Inngest's internal endpoint at /api/inngest
// The Inngest Dev Server communicates with our app through this endpoint
// to discover and trigger our background functions
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [analyzeCodeFunction],  // Register all our background functions
  })
);

// ============================================
// Error Handling Middleware
// ============================================
// This catches any unhandled errors in our routes
// and returns a clean JSON error response instead of crashing
app.use((err, req, res, next) => {
  console.error("💥 Unhandled Error:", err.message);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: err.message,
  });
});

// ============================================
// Start the Server
// ============================================
app.listen(PORT, () => {
  console.log(`\n AI-Powered Code Analyzer`);
  console.log(`   Server running on http://localhost:${PORT}`);
  console.log(`   Frontend:  http://localhost:${PORT}`);
  console.log(`   API:       http://localhost:${PORT}/api\n`);
});

// Export the app (useful for testing)
module.exports = app;
