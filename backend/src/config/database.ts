// MongoDB connection (replaces Prisma)
import { connectMongoDB } from './mongodb';

// Initialize MongoDB connection
connectMongoDB().catch(console.error);

// Export all models
export * from '../models';

