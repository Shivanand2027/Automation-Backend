import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkspaceSession extends Document {
  userId: mongoose.Types.ObjectId;
  repositoryId: mongoose.Types.ObjectId;
  currentBranch: string;
  openFiles: Array<{
    path: string;
    content: string;
    modified: boolean;
    language: string;
  }>;
  lastActivity: Date;
  activeAgentTask: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceSessionSchema = new Schema<IWorkspaceSession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  repositoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Repository',
    required: true,
  },
  currentBranch: {
    type: String,
    default: 'main',
  },
  openFiles: [{
    path: { type: String, required: true },
    content: { type: String, required: true },
    modified: { type: Boolean, default: false },
    language: { type: String, default: 'plaintext' },
  }],
  lastActivity: {
    type: Date,
    default: Date.now,
  },
  activeAgentTask: {
    type: Schema.Types.ObjectId,
    ref: 'PendingChange',
    default: null,
  },
}, {
  timestamps: true,
});

// Index for faster queries
WorkspaceSessionSchema.index({ userId: 1, repositoryId: 1 });
WorkspaceSessionSchema.index({ lastActivity: 1 });

export const WorkspaceSession = mongoose.model<IWorkspaceSession>('WorkspaceSession', WorkspaceSessionSchema);
