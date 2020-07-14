/**
 * User model - To store user data
 */
import { Document } from 'mongoose';
import { mongoose } from '../mongoose';

const { Schema } = mongoose;

const userSchema = new Schema({
  lastName: { type: String, trim: true },
  firstName: { type: String, trim: true },
  email: { type: String, trim: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ['admin', 'agent', 'user'], default: 'user' },
}, {
  timestamps: true,
});

export interface User extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string,
  role: string,
  createdAt: Date,
  updatedAt: Date,
}

const MUser = mongoose.model<User>('User', userSchema);

export default MUser;