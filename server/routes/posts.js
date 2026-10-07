import express from 'express';
import Post from '../models/Post.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/posts
router.get('/', protect, async (req, res) => {
  try {
    const { status, platform, page = 1, limit = 20, sort = '-createdAt' } = req.query;
    const query = { user: req.user._id };

    if (status) query.status = status;
    if (platform) query.platforms = platform;

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      posts,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/posts/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, user: req.user._id });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/posts
router.post('/', protect, async (req, res) => {
  try {
    const { content, caption, hashtags, media, platforms, status, scheduledAt, aiGenerated } = req.body;

    if (!content) return res.status(400).json({ error: 'Content is required' });
    if (!platforms || platforms.length === 0) return res.status(400).json({ error: 'At least one platform is required' });

    const post = await Post.create({
      user: req.user._id,
      content,
      caption,
      hashtags,
      media,
      platforms,
      status: status || 'draft',
      scheduledAt,
      aiGenerated: aiGenerated || false
    });

    res.status(201).json({ post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/posts/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, user: req.user._id });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const updates = ['content', 'caption', 'hashtags', 'media', 'platforms', 'status', 'scheduledAt'];
    updates.forEach(field => {
      if (req.body[field] !== undefined) post[field] = req.body[field];
    });

    if (req.body.status === 'published') post.publishedAt = new Date();

    await post.save();
    res.json({ post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/posts/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/posts/bulk-delete
router.post('/bulk-delete', protect, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Provide an array of post IDs' });
    }
    const result = await Post.deleteMany({ _id: { $in: ids }, user: req.user._id });
    res.json({ message: `${result.deletedCount} posts deleted` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/posts/bulk-status
router.put('/bulk-status', protect, async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Provide an array of post IDs' });
    }
    if (!['draft', 'scheduled', 'published'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData = { status };
    if (status === 'published') updateData.publishedAt = new Date();

    const result = await Post.updateMany(
      { _id: { $in: ids }, user: req.user._id },
      updateData
    );
    res.json({ message: `${result.modifiedCount} posts updated` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/posts/:id/duplicate
router.post('/:id/duplicate', protect, async (req, res) => {
  try {
    const original = await Post.findOne({ _id: req.params.id, user: req.user._id });
    if (!original) return res.status(404).json({ error: 'Post not found' });

    const duplicate = await Post.create({
      user: req.user._id,
      content: original.content,
      caption: original.caption,
      hashtags: original.hashtags,
      media: original.media,
      platforms: original.platforms,
      status: 'draft',
      aiGenerated: original.aiGenerated
    });

    res.status(201).json({ post: duplicate });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
