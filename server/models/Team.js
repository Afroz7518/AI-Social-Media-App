import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null  // null for pending invites
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'editor', 'viewer'],
    default: 'viewer'
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'removed'],
    default: 'pending'
  },
  invitedAt: {
    type: Date,
    default: Date.now
  },
  joinedAt: Date
});

const teamSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    maxlength: [80, 'Team name cannot exceed 80 characters']
  },
  description: {
    type: String,
    default: '',
    maxlength: [300, 'Description cannot exceed 300 characters']
  },
  members: [teamMemberSchema],
  settings: {
    requireApproval: { type: Boolean, default: true },
    defaultRole: { type: String, enum: ['editor', 'viewer'], default: 'editor' }
  }
}, {
  timestamps: true
});

teamSchema.index({ owner: 1 });
teamSchema.index({ 'members.user': 1 });
teamSchema.index({ 'members.email': 1 });

export default mongoose.model('Team', teamSchema);
