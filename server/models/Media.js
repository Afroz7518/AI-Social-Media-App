import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: [true, 'Filename is required']
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['image', 'video', 'gif'],
    required: true
  },
  alt: {
    type: String,
    default: ''
  },
  folder: {
    type: String,
    default: 'uncategorized'
  },
  tags: [{
    type: String,
    trim: true
  }],
  width: Number,
  height: Number,
  duration: Number, // for videos, in seconds
  usedInPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }]
}, {
  timestamps: true
});

mediaSchema.index({ user: 1, folder: 1 });
mediaSchema.index({ user: 1, type: 1 });
mediaSchema.index({ user: 1, tags: 1 });

export default mongoose.model('Media', mediaSchema);
