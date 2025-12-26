import mongoose, { Document, Schema } from 'mongoose';

export interface IRepository extends Document {
  userId: mongoose.Types.ObjectId;
  githubRepoId: number;
  name: string;
  fullName: string;
  description: string;
  owner: string;
  isPrivate: boolean;
  defaultBranch: string;
  automationEnabled: boolean;
  lastAutomationRun: Date | null;
  automationSchedule: string;
  scheduledTime: string; // Format: "HH:MM" (24-hour format)
  timezone: string; // IANA timezone (e.g., "America/New_York")
  createdAt: Date;
  updatedAt: Date;
}

const RepositorySchema = new Schema<IRepository>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  githubRepoId: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  owner: {
    type: String,
    required: true,
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  defaultBranch: {
    type: String,
    default: 'main',
  },
  automationEnabled: {
    type: Boolean,
    default: false,
  },
  lastAutomationRun: {
    type: Date,
    default: null,
  },
  automationSchedule: {
    type: String,
    default: '0 0 * * *', // Daily at midnight
  },
  scheduledTime: {
    type: String,
    default: '00:00', // Midnight by default
  },
  timezone: {
    type: String,
    default: 'UTC',
  },
}, {
  timestamps: true,
});

// Compound index for user and repo
RepositorySchema.index({ userId: 1, githubRepoId: 1 }, { unique: true });

export const Repository = mongoose.model<IRepository>('Repository', RepositorySchema);
