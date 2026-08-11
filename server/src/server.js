// server.js - Main Express Application Server Entry Point
const express = require('express');
const cors = require('cors');
const path = require('path');

const apiRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS & JSON Request Body Parsing
app.use(cors());
app.use(express.json());

// API Endpoints
app.use('/api/v1', apiRouter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'Veritus - Deciding in the Dark',
    timestamp: new Date().toISOString()
  });
});

// Serve Client Build Assets in Production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` Veritus Platform Backend API running on port ${PORT}`);
  console.log(` Health Check: http://localhost:${PORT}/api/health`);
  console.log(` API Endpoint: http://localhost:${PORT}/api/v1/questions`);
  console.log(`====================================================`);
});
