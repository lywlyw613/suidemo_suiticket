import mongoose, { Schema, Document } from 'mongoose';

export interface ITicketVerification extends Document {
  ticketId?: string;
  eventId: string;
  verifierId?: string;
  ticketNumber?: string;
  suiObjectId?: string;
  verificationResult: string;
  errorMessage?: string;
  verifiedAt: Date;
}

const TicketVerificationSchema = new Schema<ITicketVerification>(
  {
    ticketId: String,
    eventId: { type: String, required: true, index: true },
    verifierId: String,
    ticketNumber: String,
    suiObjectId: String,
    verificationResult: { type: String, required: true },
    errorMessage: String,
    verifiedAt: { type: Date, default: Date.now, index: true },
  }
);

TicketVerificationSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

TicketVerificationSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const TicketVerification = mongoose.model<ITicketVerification>(
  'TicketVerification',
  TicketVerificationSchema
);

