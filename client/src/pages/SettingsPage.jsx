import { useState, useEffect } from 'react';
import {
  User, Shield, Bell, Moon, Sun, Monitor, Lock, CheckCircle2,
  AlertCircle, Save, Loader2, Sparkles, Building, Mail,
  FileText, Globe, Clock, KeyRound, ExternalLink, RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  // Active section tab
  const [activeTab, setActiveTab] = useState('profile');

  // Profile state
  const [profileForm, setProfileForm] = useState({
    name: '',
    bio: '',
    company: '',
    avatar: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Preferences state
  const [prefForm, setPrefForm] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReport: false,
    language: 'en',
    timezone: 'UTC',
  });
  const [prefSaving, setPrefSaving] = useState(false);
  const [prefSuccess, setPrefSuccess] = useState('');
  const [prefError, setPrefError] = useState('');

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Populate data from user
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        bio: user.bio || '',
        company: user.company || '',
        avatar: user.avatar || '',
      });
      if (user.preferences) {
        setPrefForm({
          emailNotifications: user.preferences.emailNotifications ?? true,
          pushNotifications: user.preferences.pushNotifications ?? true,
          weeklyReport: user.preferences.weeklyReport ?? false,
          language: user.preferences.language || 'en',
          timezone: user.preferences.timezone || 'UTC',
        });
      }
    }
  }, [user]);

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      const res = await api.put('/users/profile', profileForm);
      if (res.data?.user) {
        updateUser(res.data.user);
        setProfileSuccess('Profile updated successfully!');
        setTimeout(() => setProfileSuccess(''), 4000);
      }
    } catch (err) {
      setProfileError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  // Handle Preferences Update
  const handlePrefSubmit = async (e) => {
    if (e) e.preventDefault();
    setPrefSaving(true);
    setPrefSuccess('');
    setPrefError('');

    try {
      const res = await api.put('/users/preferences', {
        theme,
        preferences: prefForm,
      });
      if (res.data?.user) {
        updateUser(res.data.user);
        setPrefSuccess('Preferences saved successfully!');
        setTimeout(() => setPrefSuccess(''), 4000);
      }
    } catch (err) {
      setPrefError(err.response?.data?.error || 'Failed to save preferences');
    } finally {
      setPrefSaving(false);
    }
  };

  // Handle Theme Change
  const handleThemeChange = async (newTheme) => {
    setTheme(newTheme);
    try {
      const res = await api.put('/users/preferences', { theme: newTheme, preferences: prefForm });
      if (res.data?.user) {
        updateUser(res.data.user);
      }
    } catch {
      // theme context already applied locally
    }
  };

  // Handle Password Update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSaving(false);
    setPasswordSuccess('');
    setPasswordError('');

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setPasswordSaving(true);
    try {
      await api.put('/users/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordSuccess('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Failed to update password');
    } finally {
      setPasswordSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Sparkles },
    { id: 'notifications', label: 'Preferences', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white dark:text-white light:text-surface-900 tracking-tight">
          Account Settings
        </h1>
        <p className="text-sm text-surface-200/70 dark:text-surface-200/70 light:text-surface-700/70 mt-1">
          Manage your personal profile, notification preferences, appearance and security credentials.
        </p>
      </div>

      {/* Tabs navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-surface-900/60 dark:bg-surface-900/60 light:bg-surface-100 border border-white/5 dark:border-white/5 light:border-surface-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-primary-500 text-white shadow-lg glow-primary font-semibold'
                  : 'text-surface-200/70 dark:text-surface-200/70 light:text-surface-700 hover:text-white dark:hover:text-white hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-surface-200/50'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* User Card */}
          <div className="lg:col-span-1 rounded-2xl p-6 bg-surface-900/50 dark:bg-surface-900/50 light:bg-white border border-white/5 dark:border-white/5 light:border-surface-200 glass flex flex-col items-center text-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl overflow-hidden ring-4 ring-primary-500/20">
                {profileForm.avatar ? (
                  <img
                    src={profileForm.avatar}
                    alt={profileForm.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>
            </div>

            <h3 className="mt-4 text-lg font-bold text-white dark:text-white light:text-surface-900">
              {user?.name || 'SocialAI User'}
            </h3>
            <p className="text-xs text-surface-200/60 dark:text-surface-200/60 light:text-surface-700/60 truncate max-w-[220px]">
              {user?.email}
            </p>

            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary-500/10 text-primary-400 border border-primary-500/20">
              <Sparkles className="w-3 h-3" />
              <span className="capitalize">{user?.role || 'Creator'} Plan</span>
            </div>

            <div className="mt-6 w-full border-t border-white/5 dark:border-white/5 light:border-surface-200 pt-5 space-y-3 text-left">
              <div className="flex items-center justify-between text-xs">
                <span className="text-surface-200/60 dark:text-surface-200/60 light:text-surface-700/60">Company:</span>
                <span className="font-medium text-white dark:text-white light:text-surface-900">{profileForm.company || 'Not set'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-surface-200/60 dark:text-surface-200/60 light:text-surface-700/60">Timezone:</span>
                <span className="font-medium text-white dark:text-white light:text-surface-900">{prefForm.timezone}</span>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2 rounded-2xl p-6 bg-surface-900/50 dark:bg-surface-900/50 light:bg-white border border-white/5 dark:border-white/5 light:border-surface-200 glass">
            <h2 className="text-lg font-semibold text-white dark:text-white light:text-surface-900 mb-1">
              Personal Information
            </h2>
            <p className="text-xs text-surface-200/60 dark:text-surface-200/60 light:text-surface-700/60 mb-6">
              Update your public display name, organization and biography.
            </p>

            {profileSuccess && (
              <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}
            {profileError && (
              <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-surface-200/70 dark:text-surface-200/70 light:text-surface-700 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-200/40" />
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      required
                      placeholder="Jane Doe"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-950/60 dark:bg-surface-950/60 light:bg-surface-50 border border-white/10 dark:border-white/10 light:border-surface-200 text-sm text-white dark:text-white light:text-surface-900 focus:border-primary-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-surface-200/70 dark:text-surface-200/70 light:text-surface-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-200/40" />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-950/30 dark:bg-surface-950/30 light:bg-surface-100 border border-white/5 dark:border-white/5 light:border-surface-200 text-sm text-surface-200/50 dark:text-surface-200/50 light:text-surface-700/50 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-surface-200/70 dark:text-surface-200/70 light:text-surface-700 mb-1.5">
                    Company / Brand
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-200/40" />
                    <input
                      type="text"
                      value={profileForm.company}
                      onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                      placeholder="Acme Studio"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-950/60 dark:bg-surface-950/60 light:bg-surface-50 border border-white/10 dark:border-white/10 light:border-surface-200 text-sm text-white dark:text-white light:text-surface-900 focus:border-primary-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-surface-200/70 dark:text-surface-200/70 light:text-surface-700 mb-1.5">
                    Avatar Image URL
                  </label>
                  <input
                    type="url"
                    value={profileForm.avatar}
                    onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-950/60 dark:bg-surface-950/60 light:bg-surface-50 border border-white/10 dark:border-white/10 light:border-surface-200 text-sm text-white dark:text-white light:text-surface-900 focus:border-primary-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-surface-200/70 dark:text-surface-200/70 light:text-surface-700 mb-1.5">
                  Bio
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 absolute left-3.5 top-3 text-surface-200/40" />
                  <textarea
                    rows={3}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Briefly describe your creative niche and social strategy..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-950/60 dark:bg-surface-950/60 light:bg-surface-50 border border-white/10 dark:border-white/10 light:border-surface-200 text-sm text-white dark:text-white light:text-surface-900 focus:border-primary-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white text-sm font-semibold shadow-lg glow-primary transition-all duration-200"
                >
                  {profileSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Appearance */}
      {activeTab === 'appearance' && (
        <div className="space-y-6 animate-fade-in">
          <div className="rounded-2xl p-6 bg-surface-900/50 dark:bg-surface-900/50 light:bg-white border border-white/5 dark:border-white/5 light:border-surface-200 glass">
            <h2 className="text-lg font-semibold text-white dark:text-white light:text-surface-900 mb-1">
              Theme & Interface
            </h2>
            <p className="text-xs text-surface-200/60 dark:text-surface-200/60 light:text-surface-700/60 mb-6">
              Choose your preferred visual presentation mode.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dark mode card */}
              <button
                type="button"
                onClick={() => handleThemeChange('dark')}
                className={`p-5 rounded-2xl border text-left transition-all duration-200 flex items-start gap-4 ${
                  theme === 'dark'
                    ? 'border-primary-500/60 bg-primary-500/10 ring-2 ring-primary-500/30'
                    : 'border-white/10 hover:border-white/20 bg-surface-950/40'
                }`}
              >
                <div className="p-3 rounded-xl bg-surface-850 text-primary-400">
                  <Moon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white text-sm">Dark Theme</h3>
                    {theme === 'dark' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-500 text-white">Active</span>
                    )}
                  </div>
                  <p className="text-xs text-surface-200/60 mt-1">
                    Sleek obsidian palette with high contrast and glowing accent colors.
                  </p>
                </div>
              </button>

              {/* Light mode card */}
              <button
                type="button"
                onClick={() => handleThemeChange('light')}
                className={`p-5 rounded-2xl border text-left transition-all duration-200 flex items-start gap-4 ${
                  theme === 'light'
                    ? 'border-primary-500/60 bg-primary-500/10 ring-2 ring-primary-500/30'
                    : 'border-white/10 hover:border-white/20 bg-surface-950/40'
                }`}
              >
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
                  <Sun className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white dark:text-white light:text-surface-900 text-sm">Light Theme</h3>
                    {theme === 'light' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-500 text-white">Active</span>
                    )}
                  </div>
                  <p className="text-xs text-surface-200/60 dark:text-surface-200/60 light:text-surface-700/60 mt-1">
                    Bright, clean interface optimized for daytime productivity.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Preferences & Notifications */}
      {activeTab === 'notifications' && (
        <div className="rounded-2xl p-6 bg-surface-900/50 dark:bg-surface-900/50 light:bg-white border border-white/5 dark:border-white/5 light:border-surface-200 glass animate-fade-in space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-white dark:text-white light:text-surface-900 mb-1">
              Notification & Regional Preferences
            </h2>
            <p className="text-xs text-surface-200/60 dark:text-surface-200/60 light:text-surface-700/60">
              Customize how and when you receive automated updates and digests.
            </p>
          </div>

          {prefSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{prefSuccess}</span>
            </div>
          )}
          {prefError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{prefError}</span>
            </div>
          )}

          <div className="divide-y divide-white/5 dark:divide-white/5 light:divide-surface-200 space-y-4">
            {/* Email Notifications */}
            <div className="flex items-center justify-between pt-4">
              <div>
                <p className="text-sm font-medium text-white dark:text-white light:text-surface-900">Email Notifications</p>
                <p className="text-xs text-surface-200/60 dark:text-surface-200/60 light:text-surface-700/60">
                  Receive post schedule alerts and account activity emails.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefForm.emailNotifications}
                  onChange={(e) => setPrefForm({ ...prefForm, emailNotifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            {/* Push Notifications */}
            <div className="flex items-center justify-between pt-4">
              <div>
                <p className="text-sm font-medium text-white dark:text-white light:text-surface-900">In-App Push Alerts</p>
                <p className="text-xs text-surface-200/60 dark:text-surface-200/60 light:text-surface-700/60">
                  Get real-time browser popups when AI generation completes or a post is published.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefForm.pushNotifications}
                  onChange={(e) => setPrefForm({ ...prefForm, pushNotifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            {/* Weekly Report */}
            <div className="flex items-center justify-between pt-4">
              <div>
                <p className="text-sm font-medium text-white dark:text-white light:text-surface-900">Weekly Performance Report</p>
                <p className="text-xs text-surface-200/60 dark:text-surface-200/60 light:text-surface-700/60">
                  Get an aggregated summary of reach, likes, impressions and top performing tags every Monday.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefForm.weeklyReport}
                  onChange={(e) => setPrefForm({ ...prefForm, weeklyReport: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          </div>

          {/* Regional Settings */}
          <div className="pt-4 border-t border-white/5 dark:border-white/5 light:border-surface-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-surface-200/70 dark:text-surface-200/70 light:text-surface-700 mb-1.5">
                Dashboard Language
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-200/40" />
                <select
                  value={prefForm.language}
                  onChange={(e) => setPrefForm({ ...prefForm, language: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-950/60 dark:bg-surface-950/60 light:bg-surface-50 border border-white/10 dark:border-white/10 light:border-surface-200 text-sm text-white dark:text-white light:text-surface-900 focus:border-primary-500 focus:outline-none"
                >
                  <option value="en">English (US)</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="ja">日本語</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-surface-200/70 dark:text-surface-200/70 light:text-surface-700 mb-1.5">
                Timezone
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-200/40" />
                <select
                  value={prefForm.timezone}
                  onChange={(e) => setPrefForm({ ...prefForm, timezone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-950/60 dark:bg-surface-950/60 light:bg-surface-50 border border-white/10 dark:border-white/10 light:border-surface-200 text-sm text-white dark:text-white light:text-surface-900 focus:border-primary-500 focus:outline-none"
                >
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="America/New_York">Eastern Time (US & Canada)</option>
                  <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Asia/Kolkata">India Standard Time (IST)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handlePrefSubmit}
              disabled={prefSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white text-sm font-semibold shadow-lg glow-primary transition-all duration-200"
            >
              {prefSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Security */}
      {activeTab === 'security' && (
        <div className="space-y-6 animate-fade-in">
          {/* Password Form */}
          <div className="rounded-2xl p-6 bg-surface-900/50 dark:bg-surface-900/50 light:bg-white border border-white/5 dark:border-white/5 light:border-surface-200 glass">
            <h2 className="text-lg font-semibold text-white dark:text-white light:text-surface-900 mb-1">
              Change Password
            </h2>
            <p className="text-xs text-surface-200/60 dark:text-surface-200/60 light:text-surface-700/60 mb-6">
              Ensure your account uses a strong, unique password with at least 6 characters.
            </p>

            {passwordSuccess && (
              <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}
            {passwordError && (
              <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-medium text-surface-200/70 dark:text-surface-200/70 light:text-surface-700 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-200/40" />
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-950/60 dark:bg-surface-950/60 light:bg-surface-50 border border-white/10 dark:border-white/10 light:border-surface-200 text-sm text-white dark:text-white light:text-surface-900 focus:border-primary-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-surface-200/70 dark:text-surface-200/70 light:text-surface-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-200/40" />
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-950/60 dark:bg-surface-950/60 light:bg-surface-50 border border-white/10 dark:border-white/10 light:border-surface-200 text-sm text-white dark:text-white light:text-surface-900 focus:border-primary-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-surface-200/70 dark:text-surface-200/70 light:text-surface-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-200/40" />
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-950/60 dark:bg-surface-950/60 light:bg-surface-50 border border-white/10 dark:border-white/10 light:border-surface-200 text-sm text-white dark:text-white light:text-surface-900 focus:border-primary-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white text-sm font-semibold shadow-lg glow-primary transition-all duration-200"
                >
                  {passwordSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Connected Integrations Quick Shortcut */}
          <div className="rounded-2xl p-6 bg-surface-900/50 dark:bg-surface-900/50 light:bg-white border border-white/5 dark:border-white/5 light:border-surface-200 glass flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white dark:text-white light:text-surface-900 text-sm">
                Social Accounts & OAuth Tokens
              </h3>
              <p className="text-xs text-surface-200/60 dark:text-surface-200/60 light:text-surface-700/60 mt-0.5">
                Manage connected channels (Instagram, Facebook, LinkedIn, X)
              </p>
            </div>
            <button
              onClick={() => navigate('/social-accounts')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
            >
              <span>Manage Channels</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Danger Zone */}
          <div className="rounded-2xl p-6 border border-rose-500/20 bg-rose-500/5 glass flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-rose-400 text-sm">
                Sign Out from All Devices
              </h3>
              <p className="text-xs text-surface-200/60 dark:text-surface-200/60 light:text-surface-700/60 mt-0.5">
                Revoke current authentication token and terminate dashboard session.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsPage;
