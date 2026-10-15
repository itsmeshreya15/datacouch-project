📌 Overview

Calling large language models (LLMs) like Google Gemini can take anywhere from 10 to 30 seconds. In conventional synchronous APIs, this causes HTTP gateway timeouts (e.g., Vercel, AWS Lambda, Cloudflare limits) and freezes user interfaces.

AI-Powered Code Analyzer solves this with an asynchronous, event-driven job queue architecture:

Clients submit code and receive an immediate HTTP 202 response with a unique jobId in < 200ms.
Inngest processes the analysis task in the background with automated retries and exponential backoff.
Google Gemini 2.0 Flash Lite inspects the code for security flaws (SQL Injection, XSS, Hardcoded Secrets, etc.) and returns structured JSON findings.
The client or web dashboard polls the job status until completed.

Preview unavailable

✨ Key Features
⚡ Non-Blocking REST API: Immediate job queueing via Express and UUID-based task tracking.
🔁 Resilient Background Execution: Uses Inngest to manage tasks with automatic retries and concurrency control.
🤖 Google Gemini 2.0 AI Integration: Leverages structured prompt engineering to receive clean JSON output with zero heavy client SDKs (native fetch).
🛡️ Comprehensive Vulnerability Detection: Identifies critical vulnerabilities (SQL Injection, XSS, hardcoded credentials, buffer flaws) with line snippets, severity levels, explanations, and remediation code.
🔄 Rate-Limit Resilience: Built-in retry mechanism handling Google Gemini 429 (Rate Limit) and 503 (High Demand) spikes.
💻 Interactive Web Dashboard: Built-in responsive UI with sample vulnerability presets, live status indicators, severity badges, and code fix suggestions.
🧪 Pre-configured Test Suite: Ready-to-run CLI test script with multiple vulnerability snippets.
🏗️ Architecture

Preview unavailable

End-to-End Data Flow
📂 Project Structure
text
ai-code-analyzer/
├── images/                   # Screenshots & architectural diagrams
│   ├── architecture.png
│   ├── frontend-result.png
│   └── test-output.png
├── public/                   # Frontend assets
│   └── index.html            # Single-page web dashboard
├── src/
│   ├── inngest/              # Inngest background event processing
│   │   ├── client.js         # Inngest client configuration
│   │   └── functions.js      # Background worker functions
│   ├── routes/               # API route definitions
│   │   └── analyze.js        # /api/analyze, /api/status/:id, /api/jobs
│   ├── samples/              # Test code samples
│   │   └── sampleSnippets.js # SQLi, XSS, Secret leak, Safe code
│   ├── services/             # External service wrappers
│   │   └── geminiService.js  # Gemini API integration & retry logic
│   ├── store/                # In-memory storage layer
│   │   └── resultsStore.js   # Job state & results map
│   ├── test/                 # Test scripts
│   │   └── testAnalyzer.js   # CLI test suite
│   └── server.js             # Express application entrypoint
├── .env.example              # Environment variables template
├── lab_doc.md                # Detailed hands-on lab manual
├── presentation.pptx         # Project slide deck
└── package.json              # Project dependencies & scripts
🚀 Getting Started
Prerequisites
Node.js
 v18.0.0 or higher
npm
 v9.0.0 or higher
A free Google Gemini API Key
1. Clone the Repository
bash
git clone https://github.com/itsmeshreya15/datacouch-project.git
cd datacouch-project
2. Install Dependencies
bash
npm install
3. Configure Environment Variables

Copy .env.example to create your local .env file:

bash
cp .env.example .env

Open .env and fill in your Gemini API key:

env
# Google Gemini API Key
GEMINI_API_KEY=your_actual_gemini_api_key_here
# Express Server Port
PORT=3000
# Inngest Configuration (Local Dev)
INNGEST_DEV=1
INNGEST_EVENT_KEY=local-dev-key
🏃 Running the Application

You will need two terminal tabs:

Terminal 1: Start the Express Server
bash
npm run dev

The API will be available at http://localhost:3000 and the web dashboard at http://localhost:3000/.

Terminal 2: Start the Inngest Dev Server
bash
npm run inngest-dev

The Inngest dev dashboard will start at http://localhost:8288 to monitor background functions and event executions.

🧪 Testing
Automated CLI Test

You can run the included test suite against vulnerable code samples (e.g. SQL Injection):

bash
npm test

Preview unavailable

📡 API Reference
1. Health Check
http
GET /api/health

Response (200 OK):

json
{
  "name": "🛡️ AI-Powered Code Analyzer",
  "version": "1.0.0",
  "status": "running"
}
2. Submit Code for Analysis
http
POST /api/analyze
Content-Type: application/json

Request Body:

json
{
  "code": "const query = 'SELECT * FROM users WHERE id = ' + userId;",
  "language": "javascript"
}

Response (202 Accepted):

json
{
  "success": true,
  "jobId": "f29db42a-a53d-4c55-b045-f09bf2e29381",
  "status": "queued",
  "message": "Analysis job submitted! Check status at /api/status/f29db42a-a53d-4c55-b045-f09bf2e29381",
  "statusUrl": "/api/status/f29db42a-a53d-4c55-b045-f09bf2e29381"
}
3. Check Job Status & Results
http
GET /api/status/:jobId

Response (200 OK - Completed):

json
{
  "success": true,
  "jobId": "f29db42a-a53d-4c55-b045-f09bf2e29381",
  "status": "completed",
  "analysis": {
    "riskLevel": "CRITICAL",
    "summary": "Critical SQL Injection vulnerability detected in user query concatenation.",
    "analyzedLanguage": "JavaScript",
    "totalVulnerabilities": 1,
    "findings": [
      {
        "id": 1,
        "vulnerability": "SQL Injection",
        "severity": "CRITICAL",
        "vulnerableCode": "const query = 'SELECT * FROM users WHERE id = ' + userId;",
        "explanation": "Untrusted user input is directly concatenated into an SQL query string, allowing attackers to execute arbitrary database queries.",
        "recommendation": "Use parameterized queries or prepared statements.",
        "fixedCode": "const query = 'SELECT * FROM users WHERE id = ?';\ndb.query(query, [userId], callback);"
      }
    ]
  }
}
4. List All Jobs (Debug)
http
GET /api/jobs
🛠️ Tech Stack
Layer	Technology	Description
Runtime	Node.js
 (v18+)	Server-side JavaScript runtime with native fetch
Framework	Express 5
	Fast, unopinionated web server and routing framework
Task Queue	Inngest
	Event-driven background job orchestration with automated retries
AI Model	Google Gemini 2.0 Flash Lite
	High-speed, structured code security analysis
Frontend	HTML5 / CSS3 / Vanilla JS	Clean dashboard with live polling and syntax highlighting
Presentations	PptxGenJS
	Programmatic slide deck generation
📖 Documentation & Resources
📘 Hands-On Lab Manual (lab_doc.md) - Step-by-step training guide explaining event queues and Gemini prompts.
📊 Presentation Slides (presentation.pptx) - Project slides for demos and workshops.
🤝 Contributing

Contributions, issues, and feature requests are welcome!

Fork the Project
Create your Feature Branch (git checkout -b feature/AmazingFeature)
Commit your Changes (git commit -m 'Add some AmazingFeature')
Push to the Branch (git push origin feature/AmazingFeature)
Open a Pull Request
📄 License

This project is licensed under the ISC License.
