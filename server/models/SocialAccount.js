import mongoose from 'mongoose';

const socialAccountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  platform: {
    type: String,
    enum: ['instagram', 'facebook', 'linkedin', 'x'],
    required: true
  },
  accountName: {
    type: String,
    required: true
  },
  accountHandle: {
    type: String,
    required: true
  },
  profileUrl: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  isConnected: {
    type: Boolean,
    default: true
  },
  followers: {
    type: Number,
    default: 0
  },
  following: {
    type: Number,
    default: 0
  },
  postsCount: {
    type: Number,
    default: 0
  },
  accessToken: {
    type: String,
    select: false
  },
  refreshToken: {
    type: String,
    select: false
  },
  tokenExpiry: {
    type: Date
  },
  lastSynced: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

socialAccountSchema.index({ user: 1, platform: 1 });

export default mongoose.model('SocialAccount', socialAccountSchema);
