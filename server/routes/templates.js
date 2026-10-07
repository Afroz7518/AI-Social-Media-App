import express from 'express';
import Template from '../models/Template.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/templates - list templates
router.get('/', protect, async (req, res) => {
  try {
    const { category, platform, search, favorites, page = 1, limit = 30 } = req.query;
    const query = {
      $or: [
        { isSystem: true },
        { user: req.user._id }
      ]
    };

    if (category) query.category = category;
    if (platform && platform !== 'all') query.platform = { $in: [platform, 'all'] };
    if (favorites === 'true') query.isFavorite = true;
    if (search) {
      query.$and = [
        { $or: query.$or },
        { $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]}
      ];
      delete query.$or;
    }

    const total = await Template.countDocuments(query);
    const templates = await Template.find(query)
      .sort('-usageCount -createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Get category counts
    const categories = await Template.aggregate([
      { $match: { $or: [{ isSystem: true }, { user: req.user._id }] } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      templates,
      categories,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/templates - create template
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, category, platform, tone, contentType, promptTemplate, variables, icon } = req.body;

    if (!name || !promptTemplate) {
      return res.status(400).json({ error: 'Name and prompt template are required' });
    }

    const template = await Template.create({
      user: req.user._id,
      name,
      description,
      category: category || 'custom',
      platform: platform || 'all',
      tone: tone || 'professional',
      contentType: contentType || 'post',
      promptTemplate,
      variables: variables || [],
      icon: icon || '✨',
      isSystem: false
    });

    res.status(201).json({ template });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/templates/:id - update template
router.put('/:id', protect, async (req, res) => {
  try {
    const template = await Template.findOne({ _id: req.params.id, user: req.user._id });
    if (!template) return res.status(404).json({ error: 'Template not found or not editable' });

    const updates = ['name', 'description', 'category', 'platform', 'tone', 'contentType', 'promptTemplate', 'variables', 'icon', 'isFavorite'];
    updates.forEach(field => {
      if (req.body[field] !== undefined) template[field] = req.body[field];
    });

    await template.save();
    res.json({ template });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/templates/:id/favorite - toggle favorite
router.put('/:id/favorite', protect, async (req, res) => {
  try {
    const template = await Template.findOne({
      _id: req.params.id,
      $or: [{ isSystem: true }, { user: req.user._id }]
    });
    if (!template) return res.status(404).json({ error: 'Template not found' });

    template.isFavorite = !template.isFavorite;
    await template.save();
    res.json({ template });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/templates/:id/use - increment usage count and generate
router.post('/:id/use', protect, async (req, res) => {
  try {
    const template = await Template.findOne({
      _id: req.params.id,
      $or: [{ isSystem: true }, { user: req.user._id }]
    });
    if (!template) return res.status(404).json({ error: 'Template not found' });

    template.usageCount += 1;
    await template.save();

    res.json({ template, message: 'Template usage recorded' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/templates/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const template = await Template.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
      isSystem: false
    });
    if (!template) return res.status(404).json({ error: 'Template not found or system template cannot be deleted' });
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
