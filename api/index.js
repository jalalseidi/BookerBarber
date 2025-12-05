// Vercel serverless function wrapper for Express app
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

// Import the Express app (we'll need to export it from server.js)
const app = require('../server/server.js');

// Export the Express app for Vercel serverless
module.exports = app;
