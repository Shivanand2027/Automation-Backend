import mongoose, { Document, Schema } from 'mongoose';

export interface IFileChange {
  filePath: string;
  action: 'create' | 'update' | 'delete';
  originalContent: string;
  modifiedContent: string;
  diff: string;
  reason: string;
}

export interface IPendingChange extends Document {
  workspaceSessionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  repositoryId: mongoose.Types.ObjectId;
  aiPrompt: string;
  agentPlan: string;
  changes: IFileChange[];
  commitMessage: string;
  risk: 'low' | 'medium' | 'high';
  explanation: string;
  status: 'pending' | 'approved' | 'rejected' | 'committed';
  commitSha: string | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const PendingChangeSchema = new Schema<IPendingChange>({
  workspaceSessionId: {
    type: Schema.Types.ObjectId,
    ref: 'WorkspaceSession',
    required: true,
  },
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
  aiPrompt: {
    type: String,
    required: true,
  },
  agentPlan: {
    type: String,
    required: true,
  },
  changes: [{
    filePath: { type: String, required: true },
    action: { type: String, enum: ['create', 'update', 'delete'], required: true },
    originalContent: { type: String, default: '' },
    modifiedContent: { type: String, default: '' },
    diff: { type: String, required: true },
    reason: { type: String, required: true },
  }],
  commitMessage: {
    type: String,
    required: true,
  },
  risk: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low',
  },
  explanation: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'committed'],
    default: 'pending',
  },
  commitSha: {
    type: String,
    default: null,
  },
  errorMessage: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

// Indexes
PendingChangeSchema.index({ workspaceSessionId: 1 });
PendingChangeSchema.index({ userId: 1, status: 1 });
PendingChangeSchema.index({ createdAt: -1 });

export const PendingChange = mongoose.model<IPendingChange>('PendingChange', PendingChangeSchema);
