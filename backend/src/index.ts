import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Routes
import authRoutes from './routes/auth';
import examRoutes from './routes/exam';
import questionRoutes from './routes/question';
import submissionRoutes from './routes/submissionRoutes';
import proctoringRoutes from './routes/proctorRoutes';
import enrollmentRoutes from './routes/enrollments';
import gradeRoutes from './routes/grades';
import analyticsRoutes from './routes/analytics';

// Middleware
import { errorHandler } from './middleware/errorHandler';
import { corsOptions } from './middleware/cors';

const app = express();
const server = createServer(app);

// Socket.IO for real-time proctoring
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Global middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // For base64 images
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/proctoring', proctoringRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/analytics', analyticsRoutes);

// Socket.IO for real-time proctoring
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join exam room
  socket.on('join-exam', (examAttemptId) => {
    socket.join(`exam-${examAttemptId}`);
    console.log(`User joined exam room: exam-${examAttemptId}`);
  });

  // Handle proctoring events
  socket.on('focus-lost', (data) => {
    socket.to(`exam-${data.examAttemptId}`).emit('violation-detected', {
      type: 'focus_lost',
      timestamp: new Date().toISOString(),
      userId: data.userId
    });
  });

  socket.on('tab-switch', (data) => {
    socket.to(`exam-${data.examAttemptId}`).emit('violation-detected', {
      type: 'tab_switch',
      timestamp: new Date().toISOString(),
      userId: data.userId
    });
  });

  socket.on('multiple-faces', (data) => {
    socket.to(`exam-${data.examAttemptId}`).emit('violation-detected', {
      type: 'multiple_faces',
      timestamp: new Date().toISOString(),
      userId: data.userId
    });
  });

  socket.on('no-face', (data) => {
    socket.to(`exam-${data.examAttemptId}`).emit('violation-detected', {
      type: 'no_face',
      timestamp: new Date().toISOString(),
      userId: data.userId
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;