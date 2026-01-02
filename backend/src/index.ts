import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import verificationRoutes from './routes/verificationRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import { connectMongoDB } from './config/mongodb.js';
import mongoose from 'mongoose';

// Load environment variables
// dotenv.config() by default reads .env from the current working directory
dotenv.config();

// Debug: Log MongoDB URI (masked) to verify it's loaded
const mongoUri = process.env.MONGODB_URI;
if (mongoUri) {
  const maskedUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
  console.log('📋 MongoDB URI loaded:', maskedUri);
  console.log('📋 MongoDB URI starts with mongodb+srv:', mongoUri.startsWith('mongodb+srv://'));
} else {
  console.warn('⚠️  MONGODB_URI not found in environment variables');
}

// Connect to MongoDB (非阻塞，失敗時使用內存存儲)
connectMongoDB().then(() => {
  console.log('✅ MongoDB 連接成功');
}).catch((error) => {
  console.error('⚠️  MongoDB 連接失敗，將使用內存存儲（僅開發模式）');
  console.error('💡 服務器將繼續運行，數據會保存在內存中');
});

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// CORS 配置 - 必須在所有路由之前
const allowedOrigins = [
  'http://localhost:3000',
  'https://suidemo-suiticket.vercel.app',
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : []),
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // For development, allow localhost with any port
      if (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// API Routes
app.get('/api', (req, res) => {
  res.json({ message: 'NFT Ticketing API v1' });
});

// Test MongoDB connection
app.get('/api/test-db', async (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  
  // 如果 MongoDB 未連接，直接返回友好信息，不嘗試查詢
  if (!isConnected) {
    return res.json({ 
      success: false, 
      mongodb: 'disconnected',
      message: 'MongoDB 未連接。服務器正在使用內存存儲（僅開發模式）。',
      suggestion: '要連接 MongoDB，請：1) 啟動 MongoDB 服務，或 2) 配置 MONGODB_URI 環境變量',
      userCount: null,
    });
  }

  try {
    const { User } = await import('./config/database.js');
    const count = await User.countDocuments();
    res.json({ 
      success: true, 
      mongodb: 'connected',
      userCount: count,
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    });
  }
});

// Auth routes
app.use('/api/auth', authRoutes);

// Verification routes
app.use('/api/verification', verificationRoutes);

// Upload routes
app.use('/api/upload', uploadRoutes);

// Event routes
app.use('/api/events', eventRoutes);

// User routes
app.use('/api/users', authRoutes);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

