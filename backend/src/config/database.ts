// MongoDB connection (replaces Prisma)
import { connectMongoDB } from './mongodb.js';

// Initialize MongoDB connection
connectMongoDB().catch(console.error);

// Export all models
export * from '../models/index.js';

