import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from 'passport';
import authRoutes from './api/routes/auth';
import importRoutes from './api/routes/import';
import listsRoutes from './api/routes/lists';
import placesRoutes from './api/routes/places';
import { initializePassport } from './api/auth/passport';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport
initializePassport(passport);
app.use(passport.initialize());

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Trustmap API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/import', importRoutes);
app.use('/api/lists', listsRoutes);
app.use('/api/places', placesRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

export default app;
