import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  id: string;
  suiAddress: string;
  email?: string;
  name?: string;
  avatar?: string;
  loginMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    suiAddress: { type: String, required: true, unique: true, index: true },
    email: { type: String, index: true },
    name: String,
    avatar: String,
    loginMethod: String,
  },
  {
    timestamps: true,
  }
);

// 添加虛擬 id 字段（轉換 _id 為 id）
UserSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

UserSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.model<IUser>('User', UserSchema);

