// ============================================
// functions.js — Inngest Background Functions
// ============================================
// This file defines the background functions that Inngest will run.
// Think of each function as a "worker" that processes a specific type of job.
//
// FLOW:
// 1. User submits code via API → triggers an "analyze.code" event
// 2. Inngest picks up the event and runs this function in the background
// 3. This function calls Gemini AI to analyze the code
// 4. The result is saved to our results store
// 5. The user can check the status/result anytime via the status endpoint
// ============================================

const { inngest } = require("./client");
const { analyzeCode } = require("../services/geminiService");
const { saveResult } = require("../store/resultsStore");

// --- Define the Code Analysis Background Function ---
// This function is triggered whenever an "analyze.code" event is sent.
// Inngest automatically handles:
//   - Queuing: Jobs are processed in order
//   - Retries: If the AI call fails, Inngest retries up to 3 times
//   - Logging: Every step is logged for debugging
const analyzeCodeFunction = inngest.createFunction(
  {
    id: "analyze-code-vulnerability",     // Unique function identifier
    name: "Analyze Code for Vulnerabilities", // Human-readable name
    retries: 3,                            // Retry up to 3 times on failure
    triggers: [{ event: "analyze.code" }], // Trigger: listen for "analyze.code" events
  },
  async ({ event, step }) => {
    // --- Extract Data from the Event ---
    // The event.data contains everything the user submitted
    const { jobId, codeSnippet, language } = event.data;

    console.log(`\n📋 Job ${jobId}: Starting analysis...`);
    console.log(`   Language: ${language === 'auto' ? 'Auto-detect' : language}`);
    console.log(`   Code length: ${codeSnippet.length} characters\n`);

    try {
      // --- Step 1: Update Status to "processing" ---
      // We save the status so the user can poll the /status endpoint
      // and see that their job is being worked on
      await step.run("update-status-processing", async () => {
        saveResult(jobId, {
          status: "processing",
          message: "AI is analyzing your code...",
          submittedAt: event.data.submittedAt,
        });
        console.log(`📋 Job ${jobId}: Status updated to "processing"`);
      });

      // --- Step 2: Call Gemini AI for Analysis ---
      // This is the main step — it calls the AI and waits for the response.
      // Inngest runs this in the background, so there's no HTTP timeout risk.
      // If this step fails, Inngest will automatically retry it.
      const analysisResult = await step.run("call-gemini-ai", async () => {
        console.log(`🤖 Job ${jobId}: Calling Gemini AI...`);
        const result = await analyzeCode(codeSnippet, language);
        console.log(`✅ Job ${jobId}: AI analysis received!`);
        return result;
      });

      // --- Step 3: Save the Final Result ---
      // Store the completed analysis so the user can retrieve it
      await step.run("save-analysis-result", async () => {
        saveResult(jobId, {
          status: "completed",
          submittedAt: event.data.submittedAt,
          completedAt: new Date().toISOString(),
          language: language,
          codeSnippet: codeSnippet,
          analysis: analysisResult,
        });
        console.log(`✅ Job ${jobId}: Analysis complete and saved!`);
      });

      // --- Return the Result ---
      // This return value is logged by Inngest for debugging
      return {
        jobId,
        status: "completed",
        riskLevel: analysisResult.riskLevel,
        totalVulnerabilities: analysisResult.totalVulnerabilities,
      };
    } catch (error) {
      // --- Error Handling ---
      // If anything goes wrong (bad API key, network error, etc.),
      // update the status to "failed" so the user isn't stuck waiting
      console.error(`❌ Job ${jobId}: Analysis failed!`, error.message);
      saveResult(jobId, {
        status: "failed",
        error: error.message,
        submittedAt: event.data.submittedAt,
        failedAt: new Date().toISOString(),
      });
      throw error; // Re-throw so Inngest can retry
    }
  }
);

// Export the function so the server can register it with Inngest
module.exports = { analyzeCodeFunction };
