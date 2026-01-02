import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

/**
 * Middleware to check MongoDB connection before database operations
 * Returns 503 Service Unavailable if MongoDB is not connected
 */
export function checkMongoDB(req: Request, res: Response, next: NextFunction) {
  const isConnected = mongoose.connection.readyState === 1;
  
  if (!isConnected) {
    return res.status(503).json({
      success: false,
      error: 'Database not connected',
      message: 'MongoDB is not connected. Please ensure MongoDB is running or configure MONGODB_URI environment variable.',
      suggestion: 'For development, you can use MongoDB Atlas (cloud) or local MongoDB instance.',
    });
  }
  
  next();
}

/**
 * Middleware to check MongoDB connection but allow empty results (for GET requests)
 * Returns empty data instead of error if MongoDB is not connected
 */
export function checkMongoDBOptional(req: Request, res: Response, next: NextFunction) {
  const isConnected = mongoose.connection.readyState === 1;
  
  if (!isConnected) {
    // For GET requests, return empty data instead of error
    if (req.method === 'GET') {
      // This will be handled by individual routes
      return next();
    }
    
    // For other methods, return error
    return res.status(503).json({
      success: false,
      error: 'Database not connected',
      message: 'MongoDB is not connected. Please ensure MongoDB is running.',
    });
  }
  
  next();
}

