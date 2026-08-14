// server.js - Main Express Application Server Entry Point
const express = require('express');
const cors = require('cors');
const path = require('path');

const apiRouter = require('./routes/api');
const uploadRoute = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS & JSON Request Body Parsing
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.options('*', cors());
app.use(express.json());

// API Endpoints
app.use('/api/v1', apiRouter);
app.use('/api/v1/admin/upload', uploadRoute);

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

const startServer = (portToTry) => {
  const server = app.listen(portToTry, () => {
    console.log(`====================================================`);
    console.log(` Veritus Platform Backend API running on port ${portToTry}`);
    console.log(` Health Check: http://localhost:${portToTry}/api/health`);
    console.log(` API Endpoint: http://localhost:${portToTry}/api/v1/questions`);
    console.log(`====================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[Port Alert] Port ${portToTry} is occupied. Retrying on port ${portToTry + 1}...`);
      startServer(portToTry + 1);
    } else {
      console.error('Server Listen Error:', err);
    }
  });
};

startServer(PORT);
