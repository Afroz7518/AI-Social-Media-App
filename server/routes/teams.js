import express from 'express';
import Team from '../models/Team.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/teams - get user's teams (owned + member of)
router.get('/', protect, async (req, res) => {
  try {
    const teams = await Team.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id, 'members.status': 'active' }
      ]
    }).populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.json({ teams });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/teams - create team
router.post('/', protect, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Team name is required' });

    const team = await Team.create({
      owner: req.user._id,
      name,
      description: description || '',
      members: [{
        user: req.user._id,
        email: req.user.email,
        role: 'admin',
        status: 'active',
        joinedAt: new Date()
      }]
    });

    await team.populate('owner', 'name email avatar');
    await team.populate('members.user', 'name email avatar');

    res.status(201).json({ team });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/teams/:id/invite - invite member
router.post('/:id/invite', protect, async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const team = await Team.findOne({ _id: req.params.id, owner: req.user._id });
    if (!team) return res.status(404).json({ error: 'Team not found or not owner' });

    // Check if already a member
    const existing = team.members.find(m => m.email === email.toLowerCase());
    if (existing && existing.status !== 'removed') {
      return res.status(400).json({ error: 'This email is already a team member or has a pending invite' });
    }

    // Check if user exists
    const invitedUser = await User.findOne({ email: email.toLowerCase() });

    if (existing && existing.status === 'removed') {
      existing.status = 'pending';
      existing.role = role || team.settings.defaultRole;
      existing.invitedAt = new Date();
      existing.user = invitedUser?._id || null;
    } else {
      team.members.push({
        user: invitedUser?._id || null,
        email: email.toLowerCase(),
        role: role || team.settings.defaultRole,
        status: 'pending',
        invitedAt: new Date()
      });
    }

    await team.save();
    await team.populate('members.user', 'name email avatar');

    res.json({ team, message: `Invitation sent to ${email}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/teams/:id/members/:memberId - update member role
router.put('/:id/members/:memberId', protect, async (req, res) => {
  try {
    const { role } = req.body;
    const team = await Team.findOne({ _id: req.params.id, owner: req.user._id });
    if (!team) return res.status(404).json({ error: 'Team not found or not owner' });

    const member = team.members.id(req.params.memberId);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    if (member.user?.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    if (role) member.role = role;
    await team.save();
    await team.populate('members.user', 'name email avatar');

    res.json({ team });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/teams/:id/accept - accept invite (by invited user)
router.post('/:id/accept', protect, async (req, res) => {
  try {
    const team = await Team.findOne({
      _id: req.params.id,
      'members.email': req.user.email,
      'members.status': 'pending'
    });
    if (!team) return res.status(404).json({ error: 'No pending invite found' });

    const member = team.members.find(
      m => m.email === req.user.email && m.status === 'pending'
    );
    if (member) {
      member.status = 'active';
      member.user = req.user._id;
      member.joinedAt = new Date();
    }

    await team.save();
    await team.populate('owner', 'name email avatar');
    await team.populate('members.user', 'name email avatar');

    res.json({ team, message: 'Invite accepted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/teams/:id/members/:memberId - remove member
router.delete('/:id/members/:memberId', protect, async (req, res) => {
  try {
    const team = await Team.findOne({ _id: req.params.id, owner: req.user._id });
    if (!team) return res.status(404).json({ error: 'Team not found or not owner' });

    const member = team.members.id(req.params.memberId);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    if (member.user?.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot remove yourself' });
    }

    member.status = 'removed';
    await team.save();
    await team.populate('members.user', 'name email avatar');

    res.json({ team, message: 'Member removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/teams/:id/settings - update team settings
router.put('/:id/settings', protect, async (req, res) => {
  try {
    const team = await Team.findOne({ _id: req.params.id, owner: req.user._id });
    if (!team) return res.status(404).json({ error: 'Team not found or not owner' });

    const { name, description, settings } = req.body;
    if (name) team.name = name;
    if (description !== undefined) team.description = description;
    if (settings) {
      team.settings = { ...team.settings.toObject?.() || team.settings, ...settings };
    }

    await team.save();
    await team.populate('owner', 'name email avatar');
    await team.populate('members.user', 'name email avatar');

    res.json({ team });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/teams/:id/posts - get posts for approval (pending review)
router.get('/:id/posts', protect, async (req, res) => {
  try {
    const team = await Team.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id, 'members.status': 'active' }
      ]
    });
    if (!team) return res.status(404).json({ error: 'Team not found' });

    // Get posts from all team members
    const memberUserIds = team.members
      .filter(m => m.status === 'active' && m.user)
      .map(m => m.user);

    const posts = await Post.find({
      user: { $in: memberUserIds },
      status: 'draft'
    }).sort('-createdAt').limit(50).populate('user', 'name email avatar');

    res.json({ posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/teams/:id - delete team
router.delete('/:id', protect, async (req, res) => {
  try {
    const team = await Team.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!team) return res.status(404).json({ error: 'Team not found or not owner' });
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
