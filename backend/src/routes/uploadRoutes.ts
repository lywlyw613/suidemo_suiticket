import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import * as walrusService from '../services/walrusService.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

/**
 * 上傳圖片到 Walrus
 * POST /api/upload/image
 */
router.post(
  '/image',
  upload.single('image'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded',
        });
      }

      logger.info('Uploading image to Walrus', {
        filename: req.file.originalname,
        size: req.file.size,
      });

      // Upload to Walrus
      const blobId = await walrusService.uploadImageToWalrus(req.file.buffer);
      const imageUrl = walrusService.getWalrusUrl(blobId);

      res.json({
        success: true,
        data: {
          blobId,
          imageUrl,
        },
      });
    } catch (error: any) {
      logger.error('Image upload failed', { error: error.message });
      next(error);
    }
  }
);

export default router;

