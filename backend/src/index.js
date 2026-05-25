import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import summarizeRoutes from './routes/summarize.js';
import historyRoutes from './routes/history.js';

// Load environmental properties
dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing
app.use(cors({
  origin: '*', // Allow all origins in development; adjust for production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Express parse middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    message: 'SmartSumm AI API server is fully functional and online',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Register api routes
app.use('/api/auth', authRoutes);
app.use('/api/summarize', summarizeRoutes);
app.use('/api/history', historyRoutes);

// Wildcard 404 router handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, error: `Route not found: ${req.originalUrl}` });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error occurred. Please try again.',
  });
});

// Start Express server when running locally (skip when deployed as serverless on Vercel)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`SmartSumm AI Server is active in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

export default app;
