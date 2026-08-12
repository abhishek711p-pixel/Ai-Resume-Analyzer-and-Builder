/**
 * ResuAI Server Entry Point
 * 
 * This is the main Express application configuration and startup file. It sets up:
 * 1. Environment configuration via dotenv
 * 2. MongoDB connection setup
 * 3. Middleware configuration (CORS, body parser, urlencoded parser)
 * 4. API routes forwarding (auth, resumes, AI, file uploads)
 * 5. Health checks and server listener
 * 
 * @author ResuAI Development Team
 * @version 1.0.0
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { seedDatabase } from './config/seeder';
import authRoutes from './routes/authRoutes';
import resumeRoutes from './routes/resumeRoutes';
import aiRoutes from './routes/aiRoutes';
import uploadRoutes from './routes/uploadRoutes';

// Load environment variables from .env file
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB (either local Memory Server or Atlas cloud instance based on config)
connectDB().then(() => {
  seedDatabase();
});

/**
 * Middleware Configuration
 */
app.use(cors({
  origin: '*', // Allow frontend client requests from any host
  credentials: true
}));
app.use(express.json()); // JSON parser for incoming body payloads
app.use(express.urlencoded({ extended: true })); // URL-encoded body parser

/**
 * API Routes Mount Points
 */
app.use('/api/auth', authRoutes);     // User registration, profile updates, and JWT sessions
app.use('/api/resumes', resumeRoutes); // User-created resume document storage and CRUD operations
app.use('/api/ai', aiRoutes);         // AI enhancer, ATS audit and suggestions (Groq SDK)
app.use('/api/upload', uploadRoutes); // PDF file parsing route

/**
 * Health Check Endpoint
 * Used to verify server uptime and connectivity.
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'ResuAI Server is running smoothly' });
});

// Start listening for client requests
app.listen(PORT, () => {
  console.log(`[Express Server] Server running on http://localhost:${PORT}`);
});

