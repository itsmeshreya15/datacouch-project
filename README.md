# 🛡️ AI-Powered Code Analyzer

An AI-powered security vulnerability scanner built with **Node.js**, **Google Gemini AI**, and **Inngest** (async background task runner).

Submit any code snippet and get a detailed security analysis with risk levels, vulnerability descriptions, and recommended fixes — all returned as structured JSON.

## 🏗️ Architecture

![Architecture Diagram](images/architecture.png)

## 📁 Project Structure

```
ai-code-analyzer/
├── .env                         # Environment variables (API keys)
├── package.json                 # Dependencies and scripts
├── src/
│   ├── server.js                # Main Express server entry point
│   ├── inngest/
│   │   ├── client.js            # Inngest client initialization
│   │   └── functions.js         # Background job definitions
│   ├── services/
│   │   └── geminiService.js     # Google Gemini AI integration
│   ├── routes/
│   │   └── analyze.js           # API endpoint definitions
│   ├── store/
│   │   └── resultsStore.js      # In-memory results storage
│   ├── samples/
│   │   └── sampleSnippets.js    # Test code snippets with vulnerabilities
│   └── test/
│       └── testAnalyzer.js      # Automated test script
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18 or higher
- **Google Gemini API Key** (free at https://aistudio.google.com/app/apikey)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Edit the `.env` file and add your Gemini API key:
```
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Start the Express Server
```bash
npm run dev
```

### 4. Start the Inngest Dev Server (in a new terminal)
```bash
npm run inngest-dev
```

### 5. Test the API
```bash
# Submit code for analysis
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"code": "const query = \"SELECT * FROM users WHERE id = \" + userId;", "language": "javascript"}'

# Check the result (use the jobId from the response above)
curl http://localhost:3000/api/status/<jobId>
```

Or run the automated test:
```bash
npm test
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check & API info |
| `POST` | `/api/analyze` | Submit code for security analysis |
| `GET` | `/api/status/:jobId` | Check analysis status & results |
| `GET` | `/api/jobs` | List all analysis jobs |

### Example Request
```json
POST /api/analyze
{
  "code": "const password = 'admin123';",
  "language": "javascript"
}
```

### Example Response (completed)
```json
{
  "success": true,
  "jobId": "abc-123-def",
  "status": "completed",
  "analysis": {
    "riskLevel": "HIGH",
    "summary": "Hardcoded credentials detected",
    "findings": [
      {
        "id": 1,
        "vulnerability": "Hardcoded Credentials",
        "severity": "HIGH",
        "explanation": "Passwords should never be stored in source code",
        "recommendation": "Use environment variables"
      }
    ],
    "totalVulnerabilities": 1
  }
}
```

## 🛠️ Tech Stack

- **Node.js** — JavaScript runtime
- **Express** — Web framework for API endpoints
- **Google Gemini AI** — LLM for code security analysis
- **Inngest** — Event-driven background task processing
- **dotenv** — Environment variable management
- **uuid** — Unique job ID generation
