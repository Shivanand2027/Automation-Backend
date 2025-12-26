import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes';
import repositoryRoutes from './routes/repository.routes';
import automationRoutes from './routes/automation.routes';
import workspaceRoutes from './routes/workspace.routes';
import aiAgentRoutes from './routes/aiAgent.routes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { initializeScheduler } from './services/scheduler.service';
import { initializeEnhancedScheduler } from './services/enhancedScheduler.service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'GitHub Automation API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      repositories: '/api/repositories',
      automation: '/api/automation',
      workspace: '/api/workspace',
      agent: '/api/agent',
      health: '/health'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/repositories', repositoryRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/workspace', workspaceRoutes);
app.use('/api/agent', aiAgentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/github-automation');
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Initialize enhanced automation scheduler with per-repository scheduling
    initializeEnhancedScheduler();
    logger.info('Enhanced automation scheduler initialized');
  });
};

startServer();

export default app;
