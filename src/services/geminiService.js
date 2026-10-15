// ============================================
// geminiService.js — Google Gemini AI Integration
// ============================================
// This module handles all communication with Google's Gemini AI.
// It sends a code snippet to Gemini and asks it to analyze the code
// for security vulnerabilities, returning a structured JSON response.
//
// WHY A SEPARATE SERVICE? Keeping AI logic in its own file follows
// the "Separation of Concerns" principle — each file has one job.
// ============================================

require("dotenv").config();

// --- Configuration ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-3.5-flash-lite"; // Lightweight model - less congested, fast response
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Analyze a code snippet for security vulnerabilities using Gemini AI.
 * Includes automatic retry (up to 3 times) if Gemini is busy.
 *
 * @param {string} codeSnippet - The code to analyze
 * @param {string} language - The programming language (e.g., "javascript")
 * @returns {object} Structured analysis result with riskLevel and findings
 */
async function analyzeCode(codeSnippet, language = "auto") {
  // --- Step 1: Craft the AI Prompt ---
  const langInstruction = language === "auto"
    ? "First, detect the programming language of the code below."
    : `The code is written in ${language}.`;

  const prompt = `
You are an expert code security analyst. ${langInstruction} Analyze the following code snippet for security vulnerabilities.

**CODE TO ANALYZE:**
\`\`\`
${codeSnippet}
\`\`\`

**INSTRUCTIONS:**
1. Detect the programming language if not specified.
2. Identify ALL security vulnerabilities in the code.
3. For each vulnerability, provide:
   - The type of vulnerability (e.g., "SQL Injection", "XSS", "Hardcoded Credentials")
   - The specific line or section of code that is vulnerable
   - A severity rating: "CRITICAL", "HIGH", "MEDIUM", or "LOW"
   - A clear explanation of WHY it's a vulnerability
   - A recommended fix with a corrected code example
4. Assign an overall risk level: "CRITICAL", "HIGH", "MEDIUM", "LOW", or "SAFE"
5. If the code has no vulnerabilities, set riskLevel to "SAFE" and return an empty findings array.

**YOU MUST RESPOND IN THIS EXACT JSON FORMAT AND NOTHING ELSE:**
{
  "riskLevel": "HIGH",
  "summary": "Brief overall summary of the security analysis",
  "findings": [
    {
      "id": 1,
      "vulnerability": "Name of the vulnerability",
      "severity": "CRITICAL|HIGH|MEDIUM|LOW",
      "vulnerableCode": "the problematic code snippet",
      "explanation": "Why this is a security risk",
      "recommendation": "How to fix it",
      "fixedCode": "the corrected code snippet"
    }
  ],
  "totalVulnerabilities": 1,
  "analyzedLanguage": "detected language name (e.g. JavaScript, Python, Java)"
}

IMPORTANT: Return ONLY valid JSON. No markdown, no code fences, no extra text.
`;

  // --- Step 2: Send to Gemini with Retry Logic ---
  const MAX_RETRIES = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`🤖 Sending code to Gemini AI (attempt ${attempt}/${MAX_RETRIES})...`);

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      const data = await response.json();

      // --- Check for API Errors ---
      if (data.error) {
        // If busy/rate-limited, wait and retry
        const isBusy = data.error.message.includes("high demand") ||
                       response.status === 429 || response.status === 503;

        if (isBusy && attempt < MAX_RETRIES) {
          console.log(`⏳ Gemini is busy. Waiting 5 seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        }
        throw new Error(`Gemini API error: ${data.error.message}`);
      }

      // --- Extract the Response Text ---
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error("Gemini returned an empty response");
      }

      // --- Parse the JSON Response ---
      const cleanedText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      const analysisResult = JSON.parse(cleanedText);

      console.log("✅ Gemini analysis complete!");
      return analysisResult;

    } catch (error) {
      lastError = error;
      console.error(`❌ Attempt ${attempt} failed:`, error.message);

      // If it's a retryable error and we have retries left, continue
      if (attempt < MAX_RETRIES && !error.message.includes("API_KEY")) {
        console.log(`⏳ Waiting 3 seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        continue;
      }
    }
  }

  // --- All retries exhausted ---
  throw new Error(`AI analysis failed after ${MAX_RETRIES} attempts: ${lastError?.message}`);
}

// Export the function so other modules can use it
module.exports = { analyzeCode };
