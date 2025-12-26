import mongoose, { Document, Schema } from 'mongoose';

export interface ICommitLog extends Document {
  repositoryId: mongoose.Types.ObjectId;
  commitSha: string;
  commitMessage: string;
  filesChanged: string[];
  aiAnalysis: string;
  status: 'success' | 'failed';
  errorMessage?: string;
  createdAt: Date;
}

const CommitLogSchema = new Schema<ICommitLog>({
  repositoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Repository',
    required: true,
  },
  commitSha: {
    type: String,
    required: false,
    default: '',
  },
  commitMessage: {
    type: String,
    required: true,
  },
  filesChanged: [{
    type: String,
  }],
  aiAnalysis: {
    type: String,
    required: false,
    default: '',
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    required: true,
  },
  errorMessage: {
    type: String,
  },
}, {
  timestamps: true,
});

CommitLogSchema.index({ repositoryId: 1, createdAt: -1 });

export const CommitLog = mongoose.model<ICommitLog>('CommitLog', CommitLogSchema);
