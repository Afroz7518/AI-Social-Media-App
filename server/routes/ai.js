import express from 'express';
import { generateContent } from '../services/aiService.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// POST /api/ai/generate
router.post('/generate', protect, async (req, res) => {
  try {
    const { platform, topic, tone, contentType } = req.body;

    if (!platform || !topic || !tone || !contentType) {
      return res.status(400).json({
        error: 'Please provide platform, topic, tone, and contentType'
      });
    }

    const validPlatforms = ['instagram', 'facebook', 'linkedin', 'x'];
    const validTones = ['professional', 'casual', 'humorous', 'inspirational', 'educational', 'promotional'];
    const validTypes = ['post', 'story', 'reel', 'thread', 'article', 'ad'];

    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ error: `Platform must be one of: ${validPlatforms.join(', ')}` });
    }
    if (!validTones.includes(tone)) {
      return res.status(400).json({ error: `Tone must be one of: ${validTones.join(', ')}` });
    }
    if (!validTypes.includes(contentType)) {
      return res.status(400).json({ error: `Content type must be one of: ${validTypes.join(', ')}` });
    }

    const result = await generateContent({ platform, topic, tone, contentType });
    res.json({ content: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
