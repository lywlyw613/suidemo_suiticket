import mongoose, { Schema, Document } from 'mongoose';

export interface IConversationMessage {
  role: string;
  content: string;
  metadata?: any;
  timestamp: Date;
}

export interface IConversation extends Document {
  userId: string;
  context?: any;
  messages: IConversationMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ConversationMessageSchema = new Schema<IConversationMessage>(
  {
    role: { type: String, required: true },
    content: { type: String, required: true },
    metadata: Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ConversationSchema = new Schema<IConversation>(
  {
    userId: { type: String, required: true, index: true },
    context: Schema.Types.Mixed,
    messages: [ConversationMessageSchema],
  },
  {
    timestamps: true,
  }
);

ConversationSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

ConversationSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);

