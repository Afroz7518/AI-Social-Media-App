import express from 'express';
import SocialAccount from '../models/SocialAccount.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/social/accounts
router.get('/accounts', protect, async (req, res) => {
  try {
    const accounts = await SocialAccount.find({ user: req.user._id });
    res.json({ accounts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/social/connect - Mock connect a social account
router.post('/connect', protect, async (req, res) => {
  try {
    const { platform, accountName, accountHandle } = req.body;

    if (!platform || !accountName || !accountHandle) {
      return res.status(400).json({ error: 'Platform, account name and handle are required' });
    }

    const existing = await SocialAccount.findOne({
      user: req.user._id,
      platform,
      accountHandle
    });

    if (existing) {
      return res.status(400).json({ error: 'This account is already connected' });
    }

    // Mock data for demo
    const mockFollowers = Math.floor(Math.random() * 50000) + 500;
    const account = await SocialAccount.create({
      user: req.user._id,
      platform,
      accountName,
      accountHandle,
      isConnected: true,
      followers: mockFollowers,
      following: Math.floor(mockFollowers * 0.3),
      postsCount: Math.floor(Math.random() * 500) + 10,
      lastSynced: new Date()
    });

    res.status(201).json({ account });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/social/disconnect/:id
router.put('/disconnect/:id', protect, async (req, res) => {
  try {
    const account = await SocialAccount.findOne({ _id: req.params.id, user: req.user._id });
    if (!account) return res.status(404).json({ error: 'Account not found' });

    account.isConnected = false;
    await account.save();
    res.json({ account });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/social/reconnect/:id
router.put('/reconnect/:id', protect, async (req, res) => {
  try {
    const account = await SocialAccount.findOne({ _id: req.params.id, user: req.user._id });
    if (!account) return res.status(404).json({ error: 'Account not found' });

    account.isConnected = true;
    account.lastSynced = new Date();
    await account.save();
    res.json({ account });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/social/accounts/:id
router.delete('/accounts/:id', protect, async (req, res) => {
  try {
    const account = await SocialAccount.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!account) return res.status(404).json({ error: 'Account not found' });
    res.json({ message: 'Account removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
