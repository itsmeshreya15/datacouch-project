// ============================================
// testAnalyzer.js — Quick Test Script
// ============================================
// Run this script to test the API by sending a vulnerable
// code snippet to the analyzer.
//
// USAGE: node src/test/testAnalyzer.js
// (Make sure the server is running first!)
// ============================================

const samples = require("../samples/sampleSnippets");

// Configuration
const API_URL = "http://localhost:3000";

/**
 * Submit a code snippet for analysis and poll for the result.
 */
async function testAnalyzer() {
  console.log("🧪 Testing AI-Powered Code Analyzer\n");
  console.log("=".repeat(50));

  // --- Step 1: Pick a sample to test ---
  const testSample = samples.sqlInjection;
  console.log(`\n📝 Submitting ${testSample.language} code for analysis...`);
  console.log(`   Code preview: ${testSample.code.substring(0, 80)}...\n`);

  try {
    // --- Step 2: Submit the code for analysis ---
    const submitResponse = await fetch(`${API_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: testSample.code,
        language: testSample.language,
      }),
    });

    const submitData = await submitResponse.json();
    console.log("✅ Job submitted successfully!");
    console.log(`   Job ID: ${submitData.jobId}`);
    console.log(`   Status: ${submitData.status}\n`);

    // --- Step 3: Poll for the result ---
    console.log("⏳ Waiting for AI analysis (polling every 3 seconds)...\n");

    let attempts = 0;
    const maxAttempts = 20; // Wait up to 60 seconds

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait 3 seconds
      attempts++;

      const statusResponse = await fetch(
        `${API_URL}/api/status/${submitData.jobId}`
      );
      const statusData = await statusResponse.json();

      console.log(`   Attempt ${attempts}: Status = ${statusData.status}`);

      if (statusData.status === "completed") {
        console.log("\n" + "=".repeat(50));
        console.log("🎉 ANALYSIS COMPLETE!\n");
        console.log(JSON.stringify(statusData.analysis, null, 2));
        console.log("\n" + "=".repeat(50));
        return;
      }

      if (statusData.status === "failed") {
        console.error("\n❌ Analysis failed:", statusData.error);
        return;
      }
    }

    console.log("\n⚠️ Timeout: Analysis took too long. Check the server logs.");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.log("\n💡 Make sure the server is running: npm run dev");
    console.log("💡 Make sure Inngest dev server is running: npm run inngest-dev");
  }
}

// Run the test
testAnalyzer();
