import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Post from '../models/Post.js';
import SocialAccount from '../models/SocialAccount.js';
import Notification from '../models/Notification.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/socialai';

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('📦 Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    await SocialAccount.deleteMany({});
    await Notification.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create demo user
    const user = await User.create({
      name: 'Alex Morgan',
      email: 'demo@socialai.com',
      password: 'demo123',
      bio: 'Digital Marketing Strategist | Content Creator',
      company: 'SocialAI Inc.',
      avatar: '',
      theme: 'dark',
      preferences: {
        emailNotifications: true,
        pushNotifications: true,
        weeklyReport: true,
        language: 'en',
        timezone: 'America/New_York'
      }
    });
    console.log('👤 Created demo user (demo@socialai.com / demo123)');

    // Create social accounts
    const socialAccounts = await SocialAccount.insertMany([
      {
        user: user._id,
        platform: 'instagram',
        accountName: 'Alex Morgan',
        accountHandle: '@alexmorgan.ai',
        profileUrl: 'https://www.instagram.com/alexmorgan.ai',
        isConnected: true,
        followers: 24500,
        following: 1200,
        postsCount: 342,
        lastSynced: new Date()
      },
      {
        user: user._id,
        platform: 'facebook',
        accountName: 'Alex Morgan Official',
        accountHandle: 'alexmorgan.official',
        profileUrl: 'https://www.facebook.com/alexmorgan.official',
        isConnected: true,
        followers: 18300,
        following: 850,
        postsCount: 215,
        lastSynced: new Date()
      },
      {
        user: user._id,
        platform: 'linkedin',
        accountName: 'Alex Morgan',
        accountHandle: 'alexmorgan-marketing',
        profileUrl: 'http://www.linkedin.com/in/alexmorgan-marketing',
        isConnected: true,
        followers: 12800,
        following: 3200,
        postsCount: 128,
        lastSynced: new Date()
      },
      {
        user: user._id,
        platform: 'x',
        accountName: 'Alex Morgan',
        accountHandle: '@alex_morgan_ai',
        profileUrl: 'http://www.twitter.com/alex_morgan_ai',
        isConnected: true,
        followers: 31200,
        following: 2100,
        postsCount: 1567,
        lastSynced: new Date()
      }
    ]);
    console.log('🔗 Created social accounts');

    // Create demo posts
    const now = new Date();
    const posts = await Post.insertMany([
      {
        user: user._id,
        content: '🚀 Just launched our new AI-powered content strategy tool! After months of development, we\'re thrilled to share it with the world. What features would you love to see next?',
        caption: 'Launching something big today!',
        hashtags: ['#AI', '#ContentStrategy', '#Launch', '#MarTech', '#Innovation'],
        platforms: ['instagram', 'facebook', 'linkedin'],
        status: 'published',
        publishedAt: new Date(now - 2 * 24 * 60 * 60 * 1000),
        scheduledAt: new Date(now - 2 * 24 * 60 * 60 * 1000),
        aiGenerated: false,
        engagement: { likes: 847, comments: 93, shares: 156, reach: 12400, impressions: 18900, clicks: 523 }
      },
      {
        user: user._id,
        content: '📊 5 Social Media Trends Dominating 2026:\n\n1. AI-generated micro-content\n2. Short-form vertical video\n3. Community-driven campaigns\n4. Authenticity over polish\n5. Social commerce integration\n\nWhich trend are you most excited about?',
        caption: 'Social media trends 2026',
        hashtags: ['#SocialMediaTrends', '#2026Trends', '#DigitalMarketing', '#ContentCreation'],
        platforms: ['linkedin', 'x'],
        status: 'published',
        publishedAt: new Date(now - 5 * 24 * 60 * 60 * 1000),
        scheduledAt: new Date(now - 5 * 24 * 60 * 60 * 1000),
        aiGenerated: true,
        engagement: { likes: 1203, comments: 187, shares: 342, reach: 28500, impressions: 45200, clicks: 1890 }
      },
      {
        user: user._id,
        content: '💡 The secret to viral content? It\'s not luck—it\'s strategy.\n\nHere are 3 frameworks we use:\n→ The Hook-Story-Offer method\n→ Pattern interrupt technique\n→ Community co-creation\n\nSave this for your next content planning session!',
        caption: 'Content strategy tips',
        hashtags: ['#ContentTips', '#ViralContent', '#MarketingStrategy', '#GrowthHacking'],
        platforms: ['instagram', 'linkedin'],
        status: 'published',
        publishedAt: new Date(now - 8 * 24 * 60 * 60 * 1000),
        scheduledAt: new Date(now - 8 * 24 * 60 * 60 * 1000),
        aiGenerated: true,
        engagement: { likes: 2341, comments: 312, shares: 589, reach: 45000, impressions: 67800, clicks: 3200 }
      },
      {
        user: user._id,
        content: '🎯 Weekly content calendar drop!\n\nMonday: Industry insights\nTuesday: Behind-the-scenes\nWednesday: Tips & tutorials\nThursday: User spotlight\nFriday: Weekend vibes & fun\n\nConsistency is key. What\'s your posting schedule?',
        caption: 'Content calendar template',
        hashtags: ['#ContentCalendar', '#SocialMediaTips', '#ContentPlanning', '#MarketingTips'],
        platforms: ['instagram', 'facebook'],
        status: 'published',
        publishedAt: new Date(now - 12 * 24 * 60 * 60 * 1000),
        scheduledAt: new Date(now - 12 * 24 * 60 * 60 * 1000),
        aiGenerated: false,
        engagement: { likes: 1567, comments: 201, shares: 423, reach: 32100, impressions: 51400, clicks: 2100 }
      },
      {
        user: user._id,
        content: '🤖 AI x Creativity: The perfect combo for modern marketers.\n\nWe used AI to analyze 10,000 top-performing posts and here\'s what we found about engagement patterns...\n\nThread coming soon! 🧵',
        caption: 'AI and creativity insights',
        hashtags: ['#AIMarketing', '#Creativity', '#DataDriven', '#MarketingInsights'],
        platforms: ['x', 'linkedin'],
        status: 'published',
        publishedAt: new Date(now - 15 * 24 * 60 * 60 * 1000),
        scheduledAt: new Date(now - 15 * 24 * 60 * 60 * 1000),
        aiGenerated: true,
        engagement: { likes: 3102, comments: 445, shares: 812, reach: 62000, impressions: 89300, clicks: 5400 }
      },
      // Scheduled posts
      {
        user: user._id,
        content: '🌟 Exciting announcement coming next week! We\'ve been working on something game-changing for content creators. Stay tuned for the big reveal!',
        caption: 'Big announcement teaser',
        hashtags: ['#ComingSoon', '#Announcement', '#ContentCreators', '#StayTuned'],
        platforms: ['instagram', 'facebook', 'x'],
        status: 'scheduled',
        scheduledAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        aiGenerated: false,
        engagement: { likes: 0, comments: 0, shares: 0, reach: 0, impressions: 0, clicks: 0 }
      },
      {
        user: user._id,
        content: '📈 Q4 Marketing Report: How top brands are leveraging AI for social media success.\n\nKey findings:\n• 78% increase in engagement with AI-optimized posting times\n• 3x better ROI on AI-generated captions\n• 45% reduction in content creation time',
        caption: 'Q4 AI marketing report',
        hashtags: ['#MarketingReport', '#Q4', '#AIMarketing', '#ROI', '#SocialMediaMarketing'],
        platforms: ['linkedin'],
        status: 'scheduled',
        scheduledAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        aiGenerated: true,
        engagement: { likes: 0, comments: 0, shares: 0, reach: 0, impressions: 0, clicks: 0 }
      },
      {
        user: user._id,
        content: '✨ Behind the scenes: How our team creates 30 days of content in just one afternoon.\n\nSpoiler: AI + batch creation + templates = magic.\n\nFull breakdown in our latest blog post! Link in bio 👆',
        caption: 'BTS content creation',
        hashtags: ['#BehindTheScenes', '#ContentCreation', '#Productivity', '#BatchCreation'],
        platforms: ['instagram', 'facebook'],
        status: 'scheduled',
        scheduledAt: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
        aiGenerated: false,
        engagement: { likes: 0, comments: 0, shares: 0, reach: 0, impressions: 0, clicks: 0 }
      },
      // Draft posts
      {
        user: user._id,
        content: 'Working on a comprehensive guide about social media automation best practices. Draft version — needs review.',
        caption: 'Automation guide draft',
        hashtags: ['#Automation', '#SocialMedia', '#Guide'],
        platforms: ['linkedin', 'facebook'],
        status: 'draft',
        aiGenerated: false,
        engagement: { likes: 0, comments: 0, shares: 0, reach: 0, impressions: 0, clicks: 0 }
      },
      {
        user: user._id,
        content: 'New feature spotlight: Our AI content generator now supports multi-language captions! 🌍',
        caption: 'Multi-language feature',
        hashtags: ['#NewFeature', '#MultiLanguage', '#AI'],
        platforms: ['instagram', 'x'],
        status: 'draft',
        aiGenerated: true,
        engagement: { likes: 0, comments: 0, shares: 0, reach: 0, impressions: 0, clicks: 0 }
      },
      // More published posts for richer analytics
      {
        user: user._id,
        content: '🎨 Design tip: Use contrasting colors and bold typography to make your social posts stand out in a crowded feed.',
        hashtags: ['#DesignTips', '#SocialDesign', '#Branding'],
        platforms: ['instagram'],
        status: 'published',
        publishedAt: new Date(now - 18 * 24 * 60 * 60 * 1000),
        scheduledAt: new Date(now - 18 * 24 * 60 * 60 * 1000),
        aiGenerated: false,
        engagement: { likes: 956, comments: 78, shares: 201, reach: 15600, impressions: 23400, clicks: 890 }
      },
      {
        user: user._id,
        content: 'The future of social media management is here. Automate, optimize, and scale your content strategy with AI. 🤖',
        hashtags: ['#FutureOfSocial', '#AI', '#Automation'],
        platforms: ['x', 'facebook'],
        status: 'published',
        publishedAt: new Date(now - 22 * 24 * 60 * 60 * 1000),
        scheduledAt: new Date(now - 22 * 24 * 60 * 60 * 1000),
        aiGenerated: true,
        engagement: { likes: 1890, comments: 234, shares: 567, reach: 38900, impressions: 56700, clicks: 3400 }
      },
      {
        user: user._id,
        content: '📱 Instagram Reels vs TikTok: Which platform gives better organic reach in 2026? Here\'s our data-backed analysis.',
        hashtags: ['#InstagramReels', '#TikTok', '#OrganicReach', '#SocialComparison'],
        platforms: ['instagram', 'linkedin'],
        status: 'published',
        publishedAt: new Date(now - 25 * 24 * 60 * 60 * 1000),
        scheduledAt: new Date(now - 25 * 24 * 60 * 60 * 1000),
        aiGenerated: true,
        engagement: { likes: 2678, comments: 389, shares: 701, reach: 52300, impressions: 78100, clicks: 4200 }
      }
    ]);
    console.log(`📝 Created ${posts.length} demo posts`);

    // Create notifications
    await Notification.insertMany([
      {
        user: user._id,
        type: 'post_published',
        title: 'Post Published Successfully',
        message: 'Your post "AI x Creativity" has been published on X and LinkedIn.',
        icon: 'check-circle',
        isRead: false,
        relatedPost: posts[4]._id
      },
      {
        user: user._id,
        type: 'engagement',
        title: 'Trending Post! 🔥',
        message: 'Your post about social media trends is getting high engagement — 1,203 likes and counting!',
        icon: 'trending-up',
        isRead: false,
        relatedPost: posts[1]._id
      },
      {
        user: user._id,
        type: 'reminder',
        title: 'Scheduled Post Reminder',
        message: 'You have a post scheduled for tomorrow on Instagram, Facebook, and X.',
        icon: 'clock',
        isRead: false,
        relatedPost: posts[5]._id
      },
      {
        user: user._id,
        type: 'system',
        title: 'Welcome to SocialAI!',
        message: 'Your account has been set up. Start by connecting your social media accounts and creating your first AI-powered post.',
        icon: 'sparkles',
        isRead: true
      },
      {
        user: user._id,
        type: 'account',
        title: 'LinkedIn Account Synced',
        message: 'Your LinkedIn account has been successfully synced. All analytics are up to date.',
        icon: 'refresh',
        isRead: true
      },
      {
        user: user._id,
        type: 'engagement',
        title: 'New Milestone! 🎉',
        message: 'You\'ve reached 3,000+ likes on your "Content Strategy Tips" post. Great job!',
        icon: 'star',
        isRead: false,
        relatedPost: posts[2]._id
      },
      {
        user: user._id,
        type: 'post_scheduled',
        title: 'Post Scheduled',
        message: 'Your Q4 Marketing Report has been scheduled for LinkedIn.',
        icon: 'calendar',
        isRead: true,
        relatedPost: posts[6]._id
      }
    ]);
    console.log('🔔 Created demo notifications');

    console.log('\n✅ Seed completed successfully!');
    console.log('📧 Login: demo@socialai.com');
    console.log('🔑 Password: demo123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();
