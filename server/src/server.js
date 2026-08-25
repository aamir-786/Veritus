// server.js - Main Express Application Server Entry Point
const express = require('express');
const cors = require('cors');
const path = require('path');

const apiRouter = require('./routes/api');
const uploadRoute = require('./routes/upload');

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Enable CORS & JSON Request Body Parsing
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition']
}));
app.options('*', cors());
app.use(express.json());

// API Endpoints (Support both /api and /api/v1 prefixes)
app.use('/api/v1/admin/upload', uploadRoute);
app.use('/api/admin/upload', uploadRoute);
app.use('/api/v1', apiRouter);
app.use('/api', apiRouter);

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

// API 404 Handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: 'API Endpoint Not Found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

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
