import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  githubId: string;
  username: string;
  email: string;
  avatarUrl: string;
  accessToken: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  githubId: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
    default: '',
  },
  avatarUrl: {
    type: String,
  },
  accessToken: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

export const User = mongoose.model<IUser>('User', UserSchema);
