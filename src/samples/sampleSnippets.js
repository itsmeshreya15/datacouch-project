// ============================================
// sampleSnippets.js — Dummy Code Snippets for Testing
// ============================================
// These are intentionally VULNERABLE code snippets used to test
// the AI Code Analyzer. Each snippet contains known security issues
// that the AI should detect.
//
// USE THESE to test your API by sending them to POST /api/analyze
// ============================================

const samples = {
  // --- Sample 1: SQL Injection Vulnerability ---
  // The user input is directly concatenated into the SQL query
  // instead of using parameterized queries
  sqlInjection: {
    language: "javascript",
    code: `
const express = require('express');
const mysql = require('mysql');

const app = express();
const db = mysql.createConnection({ host: 'localhost', user: 'root', password: 'admin123', database: 'users_db' });

app.get('/user', (req, res) => {
  const userId = req.query.id;
  const query = "SELECT * FROM users WHERE id = '" + userId + "'";
  db.query(query, (err, results) => {
    res.json(results);
  });
});

app.listen(3000);
    `.trim(),
  },

  // --- Sample 2: Cross-Site Scripting (XSS) ---
  // User input is directly rendered into HTML without sanitization
  xssVulnerability: {
    language: "javascript",
    code: `
const express = require('express');
const app = express();

app.get('/search', (req, res) => {
  const searchTerm = req.query.q;
  res.send('<html><body><h1>Search Results for: ' + searchTerm + '</h1></body></html>');
});

app.get('/profile', (req, res) => {
  const username = req.query.name;
  res.send(\`<div class="profile">Welcome, \${username}!</div>\`);
});

app.listen(3000);
    `.trim(),
  },

  // --- Sample 3: Hardcoded Credentials & Sensitive Data ---
  // API keys, passwords, and secrets should NEVER be in source code
  hardcodedSecrets: {
    language: "javascript",
    code: `
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');

const API_KEY = 'sk-abc123def456ghi789jkl012mno345pqr678';
const DB_PASSWORD = 'SuperSecret123!';
const JWT_SECRET = 'my-secret-key-do-not-share';

const s3 = new AWS.S3({
  accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
  secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
});

function generateToken(user) {
  return jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
}

function connectDB() {
  return mysql.createConnection({
    host: 'production-db.company.com',
    user: 'admin',
    password: DB_PASSWORD
  });
}
    `.trim(),
  },

  // --- Sample 4: Safe Code (No Vulnerabilities) ---
  // This code follows security best practices
  safeCode: {
    language: "javascript",
    code: `
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const app = express();
app.use(helmet());
app.use(express.json({ limit: '10kb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

app.post('/api/data',
  body('email').isEmail().normalizeEmail(),
  body('name').trim().escape(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    res.json({ success: true });
  }
);
    `.trim(),
  },
};

module.exports = samples;
