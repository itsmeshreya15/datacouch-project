// ============================================
// analyze.js — API Routes for Code Analysis
// ============================================
// This file defines the API endpoints (routes) that users
// interact with to submit code for analysis and check results.
//
// ENDPOINTS:
//   POST /api/analyze    → Submit code for analysis (returns a jobId)
//   GET  /api/status/:id → Check the status/result of a job
//   GET  /api/jobs       → List all analysis jobs (for debugging)
// ============================================

const express = require("express");
const crypto = require("crypto");
const { inngest } = require("../inngest/client");
const { saveResult, getResult, getAllResults } = require("../store/resultsStore");

// Create an Express Router to group related routes
const router = express.Router();

// ============================================
// POST /api/analyze — Submit Code for Analysis
// ============================================
// This endpoint receives a code snippet from the user,
// generates a unique job ID, triggers an Inngest background event,
// and immediately returns the job ID (no waiting for AI!).
//
// REQUEST BODY:
// {
//   "code": "const password = '12345';",
//   "language": "javascript"
// }
//
// RESPONSE:
// {
//   "success": true,
//   "jobId": "abc-123-def",
//   "message": "Analysis job submitted! Check status at /api/status/abc-123-def"
// }
router.post("/analyze", async (req, res) => {
  try {
    // --- Step 1: Validate the Request ---
    // Make sure the user actually sent code to analyze
    const { code, language } = req.body;

    if (!code || typeof code !== "string" || code.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Missing or empty 'code' field. Please provide a code snippet to analyze.",
        example: {
          code: 'const query = "SELECT * FROM users WHERE id = " + userId;',
          language: "javascript",
        },
      });
    }

    // --- Step 2: Generate a Unique Job ID ---
    // This ID lets the user track their analysis job
    const jobId = crypto.randomUUID();
    const submittedAt = new Date().toISOString();

    // --- Step 3: Save Initial Job Status ---
    // Mark the job as "queued" so the user knows it's been received
    saveResult(jobId, {
      status: "queued",
      message: "Job received and queued for processing",
      submittedAt: submittedAt,
      language: language || "auto",
    });

    // --- Step 4: Trigger the Inngest Background Event ---
    // This sends an "analyze.code" event to Inngest, which will
    // pick it up and run our analyzeCodeFunction in the background.
    // The API response is returned IMMEDIATELY — the user doesn't
    // wait for the AI to finish!
    await inngest.send({
      name: "analyze.code",         // Event name (must match the function trigger)
      data: {
        jobId: jobId,
        codeSnippet: code,
        language: language || "auto",
        submittedAt: submittedAt,
      },
    });

    console.log(`\n🚀 New analysis job submitted: ${jobId}`);

    // --- Step 5: Return the Job ID Immediately ---
    // The user can use this ID to check the result later
    res.status(202).json({
      success: true,
      jobId: jobId,
      status: "queued",
      message: `Analysis job submitted! Check status at /api/status/${jobId}`,
      statusUrl: `/api/status/${jobId}`,
    });
  } catch (error) {
    console.error("❌ Failed to submit analysis job:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to submit analysis job. Please try again.",
      details: error.message,
    });
  }
});

// ============================================
// GET /api/status/:jobId — Check Job Status
// ============================================
// Poll this endpoint to check if the AI analysis is done.
// Possible statuses: "queued" → "processing" → "completed"
//
// RESPONSE (when completed):
// {
//   "success": true,
//   "jobId": "abc-123-def",
//   "status": "completed",
//   "analysis": { riskLevel, findings, ... }
// }
router.get("/status/:jobId", (req, res) => {
  const { jobId } = req.params;

  // Look up the job in our results store
  const result = getResult(jobId);

  // If the job doesn't exist, return a 404
  if (!result) {
    return res.status(404).json({
      success: false,
      error: `No job found with ID: ${jobId}`,
      hint: "Make sure you're using the jobId returned from POST /api/analyze",
    });
  }

  // Return the current status and any available results
  res.status(200).json({
    success: true,
    jobId: jobId,
    ...result,
  });
});

// ============================================
// GET /api/jobs — List All Jobs (Debug)
// ============================================
// Returns all analysis jobs. Useful for debugging.
router.get("/jobs", (req, res) => {
  const allJobs = getAllResults();
  res.status(200).json({
    success: true,
    totalJobs: allJobs.length,
    jobs: allJobs,
  });
});

// Export the router so the main server can use it
module.exports = router;
