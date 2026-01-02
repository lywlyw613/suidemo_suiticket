import mongoose, { Schema, Document } from 'mongoose';

export interface INFTTicket extends Document {
  orderId: string;
  orderItemId?: string;
  userId: string;
  eventId: string;
  ticketTypeId: string;
  suiObjectId: string;
  ticketNumber: string;
  seatZone?: string;
  seatNumber?: string;
  purchasePrice: number;
  purchaseTime?: Date;
  isUsed: boolean;
  usedAt?: Date;
  isResold: boolean;
  resoldAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NFTTicketSchema = new Schema<INFTTicket>(
  {
    orderId: { type: String, required: true, index: true },
    orderItemId: String,
    userId: { type: String, required: true, index: true },
    eventId: { type: String, required: true, index: true },
    ticketTypeId: { type: String, required: true },
    suiObjectId: { type: String, required: true, unique: true, index: true },
    ticketNumber: { type: String, required: true, unique: true, index: true },
    seatZone: String,
    seatNumber: String,
    purchasePrice: { type: Number, required: true },
    purchaseTime: Date,
    isUsed: { type: Boolean, default: false, index: true },
    usedAt: Date,
    isResold: { type: Boolean, default: false },
    resoldAt: Date,
  },
  {
    timestamps: true,
  }
);

NFTTicketSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

NFTTicketSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const NFTTicket = mongoose.model<INFTTicket>('NFTTicket', NFTTicketSchema);

