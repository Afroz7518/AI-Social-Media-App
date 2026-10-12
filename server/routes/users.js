import express from 'express';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Media from '../models/Media.js';
import Notification from '../models/Notification.js';
import SocialAccount from '../models/SocialAccount.js';
import Team from '../models/Team.js';
import Template from '../models/Template.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/users/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, bio, company, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (company !== undefined) user.company = company;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/preferences
router.put('/preferences', protect, async (req, res) => {
  try {
    const { theme, preferences } = req.body;
    const user = await User.findById(req.user._id);

    if (theme) user.theme = theme;
    if (preferences) {
      user.preferences = { ...user.preferences.toObject(), ...preferences };
    }

    await user.save();
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/password
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/users/account - Permanently delete user account and cascade data
const handleDeleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password is required to confirm account deletion' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect password. Account deletion aborted.' });
    }

    const userId = req.user._id;

    // Cascade delete all associated resources
    await Promise.all([
      Post.deleteMany({ user: userId }),
      Media.deleteMany({ user: userId }),
      Notification.deleteMany({ user: userId }),
      SocialAccount.deleteMany({ user: userId }),
      Template.deleteMany({ user: userId }),
      Team.deleteMany({ owner: userId }),
      Team.updateMany({ 'members.user': userId }, { $pull: { members: { user: userId } } }),
      User.findByIdAndDelete(userId),
    ]);

    res.json({ message: 'User account and all associated resources have been permanently deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

router.delete('/account', protect, handleDeleteAccount);
router.delete('/profile', protect, handleDeleteAccount);

export default router;
