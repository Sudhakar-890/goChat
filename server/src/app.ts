import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import roomRoutes from './routes/rooms';
import messageRoutes from './routes/messages';
import mediaRoutes from './routes/media';
import webhookRoutes from './routes/webhooks';

dotenv.config();

const app = express();

// ==================
// Middleware
// ==================

// Security headers
app.use(helmet());

// CORS — allow localhost for dev; update with Netlify URL for production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  })
);

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// ==================
// Routes
// ==================

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/rooms', roomRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/webhooks', webhookRoutes);

// ==================
// Error handling
// ==================
app.use(errorHandler);

export default app;
