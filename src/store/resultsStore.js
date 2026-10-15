// ============================================
// resultsStore.js — In-Memory Results Storage
// ============================================
// This module acts as a simple in-memory database to store
// the results of our AI code analysis jobs. In a production app,
// you'd use a real database (e.g., MongoDB, PostgreSQL).
//
// WHY IN-MEMORY? For this lab, we keep things simple so students
// can focus on the AI workflow, not database setup.
// ============================================

// A JavaScript Map to store analysis results, keyed by job ID
const results = new Map();

/**
 * Save an analysis result to the store.
 * @param {string} jobId - The unique identifier for the analysis job
 * @param {object} data - The analysis result data to store
 */
function saveResult(jobId, data) {
  results.set(jobId, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Retrieve an analysis result from the store.
 * @param {string} jobId - The unique identifier for the analysis job
 * @returns {object|null} The stored result, or null if not found
 */
function getResult(jobId) {
  return results.get(jobId) || null;
}

/**
 * Get all stored results (useful for debugging).
 * @returns {Array} Array of all stored results
 */
function getAllResults() {
  return Array.from(results.entries()).map(([id, data]) => ({
    jobId: id,
    ...data,
  }));
}

// Export functions so other modules can use them
module.exports = { saveResult, getResult, getAllResults };
