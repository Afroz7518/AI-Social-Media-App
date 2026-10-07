import express from 'express';
import Post from '../models/Post.js';
import SocialAccount from '../models/SocialAccount.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/analytics/overview
router.get('/overview', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalPosts = await Post.countDocuments({ user: userId });
    const scheduledPosts = await Post.countDocuments({ user: userId, status: 'scheduled' });
    const publishedPosts = await Post.countDocuments({ user: userId, status: 'published' });
    const draftPosts = await Post.countDocuments({ user: userId, status: 'draft' });

    const posts = await Post.find({ user: userId, status: 'published' });
    const totalEngagement = posts.reduce((acc, post) => ({
      likes: acc.likes + post.engagement.likes,
      comments: acc.comments + post.engagement.comments,
      shares: acc.shares + post.engagement.shares,
      reach: acc.reach + post.engagement.reach,
      impressions: acc.impressions + post.engagement.impressions,
      clicks: acc.clicks + post.engagement.clicks
    }), { likes: 0, comments: 0, shares: 0, reach: 0, impressions: 0, clicks: 0 });

    const accounts = await SocialAccount.find({ user: userId, isConnected: true });
    const totalFollowers = accounts.reduce((sum, acc) => sum + acc.followers, 0);

    res.json({
      overview: {
        totalPosts,
        scheduledPosts,
        publishedPosts,
        draftPosts,
        totalFollowers,
        connectedAccounts: accounts.length,
        engagement: totalEngagement
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/engagement
router.get('/engagement', protect, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const posts = await Post.find({
      user: req.user._id,
      status: 'published',
      publishedAt: { $gte: startDate }
    }).sort('publishedAt');

    // Generate daily engagement data
    const dailyData = [];
    for (let i = parseInt(days) - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayPosts = posts.filter(p => {
        const pDate = new Date(p.publishedAt).toISOString().split('T')[0];
        return pDate === dateStr;
      });

      const dayEngagement = dayPosts.reduce((acc, p) => ({
        likes: acc.likes + p.engagement.likes,
        comments: acc.comments + p.engagement.comments,
        shares: acc.shares + p.engagement.shares,
        reach: acc.reach + p.engagement.reach
      }), { likes: 0, comments: 0, shares: 0, reach: 0 });

      dailyData.push({
        date: dateStr,
        ...dayEngagement,
        posts: dayPosts.length
      });
    }

    res.json({ engagement: dailyData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/platforms
router.get('/platforms', protect, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user._id, status: 'published' });

    const platformStats = {};
    ['instagram', 'facebook', 'linkedin', 'x'].forEach(platform => {
      const platformPosts = posts.filter(p => p.platforms.includes(platform));
      platformStats[platform] = {
        posts: platformPosts.length,
        likes: platformPosts.reduce((sum, p) => sum + p.engagement.likes, 0),
        comments: platformPosts.reduce((sum, p) => sum + p.engagement.comments, 0),
        shares: platformPosts.reduce((sum, p) => sum + p.engagement.shares, 0),
        reach: platformPosts.reduce((sum, p) => sum + p.engagement.reach, 0)
      };
    });

    res.json({ platforms: platformStats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/top-posts
router.get('/top-posts', protect, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user._id, status: 'published' })
      .sort('-engagement.likes')
      .limit(5);
    res.json({ posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
