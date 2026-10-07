import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    maxlength: [2200, 'Content cannot exceed 2200 characters']
  },
  caption: {
    type: String,
    maxlength: [500, 'Caption cannot exceed 500 characters'],
    default: ''
  },
  hashtags: [{
    type: String,
    trim: true
  }],
  media: [{
    url: String,
    type: { type: String, enum: ['image', 'video', 'gif'] },
    alt: String
  }],
  platforms: [{
    type: String,
    enum: ['instagram', 'facebook', 'linkedin', 'x'],
    required: true
  }],
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published', 'failed'],
    default: 'draft'
  },
  scheduledAt: {
    type: Date
  },
  publishedAt: {
    type: Date
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  engagement: {
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    reach: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

postSchema.index({ user: 1, status: 1 });
postSchema.index({ scheduledAt: 1 });

export default mongoose.model('Post', postSchema);
