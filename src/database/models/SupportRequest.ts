/**
 * SupportRequest model - To store support request data
 */
import { Document, Schema } from 'mongoose';
import { mongoose } from '../mongoose';
import { User } from './User';

const supportRequestSchema = new mongoose.Schema({
  subject: { type: String, trim: true },
  message: { type: String, trim: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'open', enum: ['open', 'processing', 'closed'] },
  closedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  closedAt: { type: Date },
  comments: [
    {
      message: { type: String },
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now }
    }
  ],
}, {
  timestamps: true,
});

export interface SupportRequest extends Document {
  subject: string,
  message: string,
  user: Schema.Types.ObjectId | User,
  closedBy: Schema.Types.ObjectId | User,
  status: string,
  closedAt: Date,
  createdAt: Date,
  updatedAt: Date,
  comments: [
    {
      message: string,
      user: Schema.Types.ObjectId,
      createdAt: Date,
    }
  ],
}

const MSupportRequest = mongoose.model<SupportRequest>('SupportRequest', supportRequestSchema);

export default MSupportRequest;