import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  name: string;
  description?: string;
  category?: string; // Event category
  eventType?: string;
  startTime: Date;
  endTime: Date;
  saleStartTime?: Date;
  saleEndTime?: Date;
  venueName?: string;
  venueAddress?: string;
  venueLat?: number;
  venueLng?: number;
  // Seating configuration
  hasSeating: boolean; // Whether event has assigned seating
  seatingConfig?: {
    rows: number; // Number of rows (for rectangular venue like cinema)
    seatsPerRow: number; // Seats per row
    reservedSeats?: string[]; // Seat IDs that are reserved (not for sale), e.g., ["A1", "A2", "B5"]
  };
  // Purchase limits
  maxTicketsPerBuyer?: number; // Maximum tickets a buyer can purchase
  // Images
  heroImageUrl?: string; // Main poster (required)
  heroImageBlobId?: string; // Walrus blob ID
  bannerUrl?: string;
  galleryUrls?: string[]; // Additional images (max 5)
  galleryBlobIds?: string[]; // Walrus blob IDs
  videoUrl?: string;
  seatMapUrl?: string; // Seating chart image
  seatMapBlobId?: string; // Walrus blob ID
  // Status
  status: string; // draft, published, paused, cancelled, ended
  visibility: string; // public, private
  organizerId: string;
  // On-chain data
  suiEventObjectId?: string; // Sui Object ID of the event on-chain (if created on-chain)
  // Statistics (indexed from chain)
  totalTicketsSold?: number; // Total tickets sold (synced from chain)
  totalRevenue?: number; // Total revenue in SUI (synced from chain)
  lastSyncedAt?: Date; // Last time stats were synced from chain
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    organizerId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: String,
    category: String,
    eventType: String,
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true },
    saleStartTime: Date,
    saleEndTime: Date,
    venueName: String,
    venueAddress: String,
    venueLat: Number,
    venueLng: Number,
    // Seating
    hasSeating: { type: Boolean, default: false },
    seatingConfig: {
      rows: Number,
      seatsPerRow: Number,
      reservedSeats: [String],
    },
    maxTicketsPerBuyer: Number,
    // Images
    heroImageUrl: String,
    heroImageBlobId: String,
    bannerUrl: String,
    galleryUrls: [String],
    galleryBlobIds: [String],
    videoUrl: String,
    seatMapUrl: String,
    seatMapBlobId: String,
    // Status
    status: { type: String, default: 'draft', index: true },
    visibility: { type: String, default: 'public' },
    // On-chain data
    suiEventObjectId: { type: String, index: true },
    // Statistics (indexed from chain)
    totalTicketsSold: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    lastSyncedAt: Date,
  },
  {
    timestamps: true,
  }
);

EventSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

EventSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Event = mongoose.model<IEvent>('Event', EventSchema);

