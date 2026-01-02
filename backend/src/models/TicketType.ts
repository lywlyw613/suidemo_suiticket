import mongoose, { Schema, Document } from 'mongoose';

export interface ITicketType extends Document {
  eventId: string;
  name: string; // Ticket type name, e.g., "VIP", "Standard", "Zone A"
  description?: string;
  price: number; // Price in SUI (or smallest unit)
  quantity: number; // Total quantity available
  soldCount: number; // Number of tickets sold
  // Seating zone/area for tiered pricing
  seatingZone?: string; // e.g., "VIP", "Zone A", "Zone B", "Balcony"
  // Reserved seats for this ticket type (if hasSeating is true)
  reservedSeats?: string[]; // Seat IDs reserved for this ticket type
  // Listing status
  isListed: boolean; // Whether this ticket type is listed for sale
  resellable: boolean;
  maxResellPrice?: number;
  createdAt: Date;
  updatedAt: Date;
}

const TicketTypeSchema = new Schema<ITicketType>(
  {
    eventId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    soldCount: { type: Number, default: 0 },
    seatingZone: String,
    reservedSeats: [String], // Seat IDs reserved for this ticket type
    isListed: { type: Boolean, default: true }, // Whether listed for sale
    resellable: { type: Boolean, default: true },
    maxResellPrice: Number,
  },
  {
    timestamps: true,
  }
);

TicketTypeSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

TicketTypeSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const TicketType = mongoose.model<ITicketType>('TicketType', TicketTypeSchema);

