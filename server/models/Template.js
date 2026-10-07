import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null  // null = system template, objectId = user-created
  },
  name: {
    type: String,
    required: [true, 'Template name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [300, 'Description cannot exceed 300 characters'],
    default: ''
  },
  category: {
    type: String,
    enum: [
      'product-launch', 'behind-the-scenes', 'engagement',
      'educational', 'promotional', 'seasonal', 'storytelling',
      'testimonial', 'tips-tricks', 'announcement', 'custom'
    ],
    default: 'custom'
  },
  platform: {
    type: String,
    enum: ['instagram', 'facebook', 'linkedin', 'x', 'all'],
    default: 'all'
  },
  tone: {
    type: String,
    enum: ['professional', 'casual', 'humorous', 'inspirational', 'educational', 'promotional'],
    default: 'professional'
  },
  contentType: {
    type: String,
    enum: ['post', 'story', 'reel', 'thread', 'article', 'ad'],
    default: 'post'
  },
  promptTemplate: {
    type: String,
    required: [true, 'Prompt template is required'],
    maxlength: [2000, 'Prompt template cannot exceed 2000 characters']
  },
  variables: [{
    name: { type: String, required: true },
    placeholder: { type: String, default: '' },
    required: { type: Boolean, default: false }
  }],
  icon: {
    type: String,
    default: '✨'
  },
  isSystem: {
    type: Boolean,
    default: false
  },
  usageCount: {
    type: Number,
    default: 0
  },
  isFavorite: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

templateSchema.index({ user: 1, category: 1 });
templateSchema.index({ isSystem: 1 });
templateSchema.index({ usageCount: -1 });

export default mongoose.model('Template', templateSchema);
