import express from 'express';
import Post from '../models/Post.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/schedule - Get all scheduled posts
router.get('/', protect, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { user: req.user._id, status: { $in: ['scheduled', 'published'] } };

    if (startDate && endDate) {
      query.scheduledAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const posts = await Post.find(query).sort('scheduledAt');
    res.json({ posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/schedule/:id - Schedule a post
router.put('/:id', protect, async (req, res) => {
  try {
    const { scheduledAt } = req.body;
    if (!scheduledAt) return res.status(400).json({ error: 'Scheduled date is required' });

    const post = await Post.findOne({ _id: req.params.id, user: req.user._id });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.scheduledAt = new Date(scheduledAt);
    post.status = 'scheduled';
    await post.save();

    res.json({ post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/schedule/calendar - Get posts for calendar view
router.get('/calendar', protect, async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const posts = await Post.find({
      user: req.user._id,
      scheduledAt: { $gte: startDate, $lte: endDate },
      status: { $in: ['scheduled', 'published'] }
    }).sort('scheduledAt');

    res.json({ posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
