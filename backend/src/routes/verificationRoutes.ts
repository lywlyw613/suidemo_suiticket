import { Router, Request, Response, NextFunction } from 'express';
import * as verificationService from '../services/verificationService.js';
import { logger } from '../utils/logger';

const router = Router();

/**
 * 驗證票券
 * POST /api/verification/verify
 */
router.post('/verify', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ticketId, eventId } = req.body;
    const verifierId = (req as any).user?.id; // 從認證中間件獲取

    if (!ticketId || !eventId) {
      return res.status(400).json({
        success: false,
        error: 'ticketId and eventId are required',
      });
    }

    const result = await verificationService.verifyTicket(
      ticketId,
      eventId,
      verifierId
    );

    if (result.valid) {
      res.json({
        success: true,
        data: result.ticketInfo,
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * 獲取驗證記錄
 * GET /api/verification/records
 */
router.get('/records', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const options = {
      eventId: req.query.eventId as string | undefined,
      startDate: req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined,
      endDate: req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 50,
    };

    const result = await verificationService.getVerificationRecords(options);

    res.json({
      success: true,
      data: result.records,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

