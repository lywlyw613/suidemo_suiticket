import { Router, Request, Response, NextFunction } from 'express';
import { Event } from '../models/Event.js';
import { TicketType } from '../models/TicketType.js';
import { Order } from '../models/Order.js';
import { NFTTicket } from '../models/NFTTicket.js';
import { logger } from '../utils/logger.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { checkMongoDB } from '../middleware/mongodbCheck.js';
import mongoose from 'mongoose';

const router = Router();

// Middleware to verify organizer authentication
const verifyOrganizer = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
    });
  }
  req.organizerId = req.user.userId; // Store organizer ID
  next();
};

/**
 * Search/List public events (for customers to browse)
 * GET /api/events/search
 * Query params: category, eventType, startTime, endTime, location, page, limit
 */
router.get('/search', checkMongoDB, async (req: Request, res: Response, next: NextFunction) => {
  try {

    const {
      category,
      eventType,
      startTime,
      endTime,
      location,
      search, // Text search in name/description
      page = 1,
      limit = 20,
    } = req.query;

    // Build query - only show published, public events
    const query: any = {
      status: 'published',
      visibility: 'public',
    };

    // Category filter
    if (category) {
      query.category = category;
    }

    // Event type filter
    if (eventType) {
      query.eventType = eventType;
    }

    // Time range filter
    if (startTime) {
      query.startTime = { $gte: new Date(startTime as string) };
    }
    if (endTime) {
      query.endTime = { $lte: new Date(endTime as string) };
    }

    // Location filter (venue name or address)
    if (location) {
      query.$or = [
        { venueName: { $regex: location, $options: 'i' } },
        { venueAddress: { $regex: location, $options: 'i' } },
      ];
    }

    // Text search in name/description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Execute query with pagination
    const events = await Event.find(query)
      .sort({ startTime: 1 }) // Sort by start time (upcoming first)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .select('-__v'); // Exclude version field

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get all events for organizer
 * GET /api/events/organizer
 */
router.get('/organizer', authenticate, verifyOrganizer, checkMongoDB, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {

    const organizerId = req.organizerId!;
    const { status, page = 1, limit = 10 } = req.query;

    const query: any = { organizerId };
    if (status) {
      query.status = status;
    }

    const events = await Event.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get event by ID (public)
 * GET /api/events/:id
 */
router.get('/:id', checkMongoDB, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
      });
    }

    // Get ticket types
    const ticketTypes = await TicketType.find({ eventId: event.id, isListed: true });

    res.json({
      success: true,
      data: {
        event,
        ticketTypes,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Create new event
 * POST /api/events
 */
router.post('/', authenticate, verifyOrganizer, checkMongoDB, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {

    const organizerId = req.organizerId!;
    const eventData = {
      ...req.body,
      organizerId,
      status: 'draft', // Always start as draft
    };

    const event = await Event.create(eventData);

    logger.info('Event created', { eventId: event.id, organizerId });

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error: any) {
    logger.error('Event creation failed', { error: error.message });
    
    // Handle MongoDB timeout errors specifically (in case connection drops during operation)
    if (error.message?.includes('buffering timed out') || error.message?.includes('timeout')) {
      return res.status(503).json({
        success: false,
        error: 'Database operation timeout',
        message: 'The database operation timed out. Please check your MongoDB connection.',
        suggestion: 'Ensure MongoDB is running and accessible. Check your MONGODB_URI configuration.',
      });
    }
    
    next(error);
  }
});

/**
 * Update event
 * PUT /api/events/:id
 */
router.put('/:id', authenticate, verifyOrganizer, checkMongoDB, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const organizerId = req.organizerId!;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
      });
    }

    if (event.organizerId !== organizerId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
      });
    }

    Object.assign(event, req.body);
    await event.save();

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Publish event
 * POST /api/events/:id/publish
 */
router.post('/:id/publish', authenticate, verifyOrganizer, checkMongoDB, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const organizerId = req.organizerId!;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
      });
    }

    if (event.organizerId !== organizerId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
      });
    }

    // Validate required fields
    if (!event.name || !event.startTime || !event.endTime || !event.heroImageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    // Check if has ticket types
    const ticketTypes = await TicketType.find({ eventId: event.id });
    if (ticketTypes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Event must have at least one ticket type',
      });
    }

    event.status = 'published';
    await event.save();

    logger.info('Event published', { eventId: event.id });

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get event statistics
 * GET /api/events/:id/stats
 */
router.get('/:id/stats', authenticate, verifyOrganizer, checkMongoDB, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const organizerId = req.organizerId!;
    const event = await Event.findById(req.params.id);

    if (!event || event.organizerId !== organizerId) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
      });
    }

    // Get ticket types
    const ticketTypes = await TicketType.find({ eventId: event.id });
    const totalTickets = ticketTypes.reduce((sum, tt) => sum + tt.quantity, 0);
    const soldTickets = ticketTypes.reduce((sum, tt) => sum + tt.soldCount, 0);
    const salesRatio = totalTickets > 0 ? (soldTickets / totalTickets) * 100 : 0;

    // Get orders
    const orders = await Order.find({ eventId: event.id });
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    res.json({
      success: true,
      data: {
        totalTickets,
        soldTickets,
        availableTickets: totalTickets - soldTickets,
        salesRatio: Math.round(salesRatio * 100) / 100,
        totalRevenue,
        totalOrders: orders.length,
        ticketTypes: ticketTypes.map(tt => ({
          id: tt.id,
          name: tt.name,
          quantity: tt.quantity,
          soldCount: tt.soldCount,
          salesRatio: tt.quantity > 0 ? Math.round((tt.soldCount / tt.quantity) * 100 * 100) / 100 : 0,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Create ticket type
 * POST /api/events/:id/ticket-types
 */
router.post('/:id/ticket-types', authenticate, verifyOrganizer, checkMongoDB, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const organizerId = req.organizerId!;
    const event = await Event.findById(req.params.id);

    if (!event || event.organizerId !== organizerId) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
      });
    }

    const ticketType = await TicketType.create({
      ...req.body,
      eventId: event.id,
      soldCount: 0,
      isListed: req.body.isListed !== undefined ? req.body.isListed : true,
    });

    res.status(201).json({
      success: true,
      data: ticketType,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Update ticket type
 * PUT /api/events/:id/ticket-types/:ticketTypeId
 */
router.put('/:id/ticket-types/:ticketTypeId', authenticate, verifyOrganizer, checkMongoDB, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const organizerId = req.organizerId!;
    const event = await Event.findById(req.params.id);

    if (!event || event.organizerId !== organizerId) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
      });
    }

    const ticketType = await TicketType.findById(req.params.ticketTypeId);
    if (!ticketType || ticketType.eventId !== event.id) {
      return res.status(404).json({
        success: false,
        error: 'Ticket type not found',
      });
    }

    Object.assign(ticketType, req.body);
    await ticketType.save();

    res.json({
      success: true,
      data: ticketType,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Toggle ticket type listing status
 * POST /api/events/:id/ticket-types/:ticketTypeId/toggle-listing
 */
router.post('/:id/ticket-types/:ticketTypeId/toggle-listing', authenticate, verifyOrganizer, checkMongoDB, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const organizerId = req.organizerId!;
    const event = await Event.findById(req.params.id);

    if (!event || event.organizerId !== organizerId) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
      });
    }

    const ticketType = await TicketType.findById(req.params.ticketTypeId);
    if (!ticketType || ticketType.eventId !== event.id) {
      return res.status(404).json({
        success: false,
        error: 'Ticket type not found',
      });
    }

    ticketType.isListed = !ticketType.isListed;
    await ticketType.save();

    res.json({
      success: true,
      data: ticketType,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

