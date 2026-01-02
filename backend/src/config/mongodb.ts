import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nft_ticketing';

export async function connectMongoDB() {
  // 如果已經連接，直接返回
  if (mongoose.connection.readyState === 1) {
    console.log('✅ MongoDB already connected');
    return;
  }

  try {
    const maskedUri = MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@'); // 隱藏密碼
    console.log('🔌 嘗試連接 MongoDB:', maskedUri);
    console.log('🔌 連接字符串長度:', MONGODB_URI.length);
    
    // 設置連接選項
    const options: any = {
      serverSelectionTimeoutMS: 10000, // 10 秒
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    };

    // 如果是 mongodb+srv，添加額外選項
    if (MONGODB_URI.startsWith('mongodb+srv://')) {
      options.retryWrites = true;
      options.w = 'majority';
    }
    
    await mongoose.connect(MONGODB_URI, options);
    
    // 監聽連接事件
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connected successfully');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });
    
    console.log('✅ MongoDB connection established');
  } catch (error: any) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error name:', error.name);
    if (error.reason) {
      console.error('❌ Error reason:', error.reason);
    }
    // 不拋出錯誤，讓服務器繼續運行（使用內存存儲）
  }
}

export default mongoose;

