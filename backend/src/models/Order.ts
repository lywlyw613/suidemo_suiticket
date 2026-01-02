import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  userId: string;
  eventId: string;
  totalAmount: number;
  paymentMethod?: string;
  paymentStatus: string;
  paymentTransactionId?: string;
  nftMintStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: String, required: true, index: true },
    eventId: { type: String, required: true, index: true },
    totalAmount: { type: Number, required: true },
    paymentMethod: String,
    paymentStatus: { type: String, default: 'pending', index: true },
    paymentTransactionId: String,
    nftMintStatus: { type: String, default: 'pending' },
  },
  {
    timestamps: true,
  }
);

OrderSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

OrderSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Order = mongoose.model<IOrder>('Order', OrderSchema);

