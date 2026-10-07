import express from 'express';
import Post from '../models/Post.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/search?q=query
router.get('/', protect, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ posts: [], total: 0 });
    }

    const regex = { $regex: q, $options: 'i' };

    const posts = await Post.find({
      user: req.user._id,
      $or: [
        { content: regex },
        { caption: regex },
        { hashtags: regex }
      ]
    })
      .sort('-createdAt')
      .limit(10)
      .select('content status platforms scheduledAt createdAt');

    res.json({ posts, total: posts.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
