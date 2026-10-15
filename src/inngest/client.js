// ============================================
// client.js — Inngest Client Initialization
// ============================================
// Inngest is an event-driven task runner that lets us process
// long-running tasks (like AI calls) in the background.
//
// WHY INNGEST? When we call an AI model, it can take 10-30 seconds
// to respond. If we do this inside a normal API request, the request
// might timeout (especially on serverless platforms like Vercel).
// Inngest solves this by:
//   1. Accepting an event (trigger)
//   2. Running the AI call in the background
//   3. Automatically retrying if something fails
// ============================================

const { Inngest } = require("inngest");

// Create and configure the Inngest client
// The "id" is a unique name for your app in Inngest's system
const inngest = new Inngest({
  id: "ai-code-analyzer",           // Unique app identifier
  eventKey: process.env.INNGEST_EVENT_KEY || "local-dev-key",
});

// Export the client so other files can use it to send events
// and define functions
module.exports = { inngest };
