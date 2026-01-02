import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem extends Document {
  orderId: string;
  ticketTypeId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    orderId: { type: String, required: true, index: true },
    ticketTypeId: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

OrderItemSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

OrderItemSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const OrderItem = mongoose.model<IOrderItem>('OrderItem', OrderItemSchema);

