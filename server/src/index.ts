import express from 'express';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes';
import doctorRoutes from './routes/doctor.routes';
import appointmentRoutes from './routes/appointment.routes';
import patientRoutes from './routes/patient.routes';
import chatRoutes from './routes/chat.routes';
import earningsRoutes from './routes/earnings.routes';
import aiRoutes from './routes/ai.routes';

// Import socket handlers
import { setupSocketHandlers } from './utils/socketHandlers';

// Initialize express app
const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(helmet());

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/earnings', earningsRoutes);
app.use('/api/ai', aiRoutes);

// Setup socket.io handlers
setupSocketHandlers(io);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI!, {
    dbName: 'healthcare_app'
  })
  .then(() => {
    console.log('Connected to MongoDB Atlas successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
}).on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try a different port or close the existing process.`);
    process.exit(1);
  } else {
    console.error(`Error starting server: ${error.message}`);
    process.exit(1);
  }
});

export { app, io }; 