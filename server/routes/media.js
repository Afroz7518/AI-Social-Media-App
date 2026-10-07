import express from 'express';
import Media from '../models/Media.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/media - list all media for user
router.get('/', protect, async (req, res) => {
  try {
    const { type, folder, search, page = 1, limit = 24, sort = '-createdAt' } = req.query;
    const query = { user: req.user._id };

    if (type) query.type = type;
    if (folder) query.folder = folder;
    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { alt: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Media.countDocuments(query);
    const items = await Media.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Storage summary
    const storage = await Media.aggregate([
      { $match: { user: req.user._id } },
      { $group: {
        _id: null,
        totalSize: { $sum: '$size' },
        totalCount: { $sum: 1 },
        images: { $sum: { $cond: [{ $eq: ['$type', 'image'] }, 1, 0] } },
        videos: { $sum: { $cond: [{ $eq: ['$type', 'video'] }, 1, 0] } },
        gifs: { $sum: { $cond: [{ $eq: ['$type', 'gif'] }, 1, 0] } }
      }}
    ]);

    // Get distinct folders
    const folders = await Media.distinct('folder', { user: req.user._id });

    res.json({
      items,
      folders,
      storage: storage[0] || { totalSize: 0, totalCount: 0, images: 0, videos: 0, gifs: 0 },
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/media - upload media (stores URL-based, for demo purposes)
router.post('/', protect, async (req, res) => {
  try {
    const { url, originalName, mimeType, size, type, alt, folder, tags, width, height, duration } = req.body;

    if (!url || !originalName || !type) {
      return res.status(400).json({ error: 'URL, originalName, and type are required' });
    }

    const media = await Media.create({
      user: req.user._id,
      filename: `${Date.now()}-${originalName.replace(/\s+/g, '-')}`,
      originalName,
      mimeType: mimeType || 'image/jpeg',
      size: size || 0,
      url,
      thumbnail: type === 'video' ? '' : url,
      type,
      alt: alt || '',
      folder: folder || 'uncategorized',
      tags: tags || [],
      width, height, duration
    });

    res.status(201).json({ media });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/media/:id - update media metadata
router.put('/:id', protect, async (req, res) => {
  try {
    const media = await Media.findOne({ _id: req.params.id, user: req.user._id });
    if (!media) return res.status(404).json({ error: 'Media not found' });

    const updates = ['alt', 'folder', 'tags'];
    updates.forEach(field => {
      if (req.body[field] !== undefined) media[field] = req.body[field];
    });

    await media.save();
    res.json({ media });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/media/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const media = await Media.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!media) return res.status(404).json({ error: 'Media not found' });
    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/media/bulk - bulk delete
router.post('/bulk-delete', protect, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Provide an array of IDs' });
    }
    const result = await Media.deleteMany({ _id: { $in: ids }, user: req.user._id });
    res.json({ message: `${result.deletedCount} items deleted` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
