import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganizer extends Document {
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  verificationStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizerSchema = new Schema<IOrganizer>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: String,
    phone: String,
    address: String,
    verificationStatus: { type: String, default: 'pending', index: true },
  },
  {
    timestamps: true,
  }
);

OrganizerSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

OrganizerSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Organizer = mongoose.model<IOrganizer>('Organizer', OrganizerSchema);

