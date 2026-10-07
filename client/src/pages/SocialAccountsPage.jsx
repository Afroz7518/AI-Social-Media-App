import { useState, useEffect } from 'react';
import { Share2, Plus, Unlink, Link2, Trash2, RefreshCw, Users, FileText, X } from 'lucide-react';
import api from '../services/api';

const platformConfig = {
  instagram: { name: 'Instagram', emoji: '📸', color: 'from-pink-500 to-purple-600', bg: 'bg-pink-500/10', text: 'text-pink-400', url: 'https://www.instagram.com/' },
  facebook: { name: 'Facebook', emoji: '👤', color: 'from-blue-500 to-blue-700', bg: 'bg-blue-500/10', text: 'text-blue-400', url: 'https://www.facebook.com/' },
  linkedin: { name: 'LinkedIn', emoji: '💼', color: 'from-blue-600 to-cyan-600', bg: 'bg-cyan-500/10', text: 'text-cyan-400', url: 'http://www.linkedin.com/in/' },
  x: { name: 'X (Twitter)', emoji: '𝕏', color: 'from-gray-700 to-gray-900', bg: 'bg-gray-500/10', text: 'text-gray-400', url: 'http://www.twitter.com/' },
};

export default function SocialAccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ platform: 'instagram', accountName: '', accountHandle: '' });
  const [saving, setSaving] = useState(false);

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/social/accounts');
      setAccounts(res.data.accounts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccounts(); }, []);

  const fmt = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  const handleConnect = async () => {
    setSaving(true);
    try {
      await api.post('/social/connect', form);
      setShowModal(false);
      setForm({ platform: 'instagram', accountName: '', accountHandle: '' });
      fetchAccounts();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to connect');
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async (id) => {
    try {
      await api.put(`/social/disconnect/${id}`);
      fetchAccounts();
    } catch (err) { console.error(err); }
  };

  const handleReconnect = async (id) => {
    try {
      await api.put(`/social/reconnect/${id}`);
      fetchAccounts();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this account?')) return;
    try {
      await api.delete(`/social/accounts/${id}`);
      fetchAccounts();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white dark:text-white light:text-surface-900 flex items-center gap-2">
            <Share2 className="w-6 h-6 text-primary-400" /> Social Accounts
          </h1>
          <p className="text-surface-200/50 dark:text-surface-200/50 light:text-surface-700/50 text-sm mt-1">Connect and manage your social media platforms</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all">
          <Plus className="w-4 h-4" /> Connect Account
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-48 rounded-2xl skeleton" />)}
        </div>
      ) : accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Share2 className="w-16 h-16 text-surface-200/15 mb-4" />
          <h3 className="text-lg font-semibold text-white dark:text-white light:text-surface-900 mb-1">No accounts connected</h3>
          <p className="text-sm text-surface-200/40 mb-4">Connect your social media accounts to get started</p>
          <button onClick={() => setShowModal(true)} className="px-4 py-2 rounded-xl bg-primary-500/15 text-primary-400 text-sm font-medium hover:bg-primary-500/25 transition-colors">
            <Plus className="w-4 h-4 inline mr-1" /> Connect Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((acc, i) => {
            const config = platformConfig[acc.platform];
            return (
              <div key={acc._id} className="p-6 rounded-2xl bg-surface-800/50 dark:bg-surface-800/50 light:bg-white border border-white/5 dark:border-white/5 light:border-surface-200 hover:border-primary-500/15 transition-all animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-xl shadow-lg`}>
                      {config.emoji}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white dark:text-white light:text-surface-900">{acc.accountName}</h3>
                      <a 
                        href={`${config.url}${acc.accountHandle.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-surface-200/50 hover:text-primary-400 transition-colors"
                      >
                        @{acc.accountHandle.replace('@', '')}
                      </a>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase ${acc.isConnected ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                    {acc.isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-2.5 rounded-xl bg-white/5 dark:bg-white/5 light:bg-surface-50">
                    <p className="text-base font-bold text-white dark:text-white light:text-surface-900">{fmt(acc.followers)}</p>
                    <p className="text-[10px] text-surface-200/40">Followers</p>
                  </div>
                  <div className="text-center p-2.5 rounded-xl bg-white/5 dark:bg-white/5 light:bg-surface-50">
                    <p className="text-base font-bold text-white dark:text-white light:text-surface-900">{fmt(acc.following)}</p>
                    <p className="text-[10px] text-surface-200/40">Following</p>
                  </div>
                  <div className="text-center p-2.5 rounded-xl bg-white/5 dark:bg-white/5 light:bg-surface-50">
                    <p className="text-base font-bold text-white dark:text-white light:text-surface-900">{fmt(acc.postsCount)}</p>
                    <p className="text-[10px] text-surface-200/40">Posts</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5 dark:border-white/5 light:border-surface-200">
                  <p className="text-[10px] text-surface-200/30">Last synced: {new Date(acc.lastSynced).toLocaleDateString()}</p>
                  <div className="flex gap-1">
                    {acc.isConnected ? (
                      <button onClick={() => handleDisconnect(acc._id)} className="p-1.5 rounded-lg hover:bg-amber-500/10 text-surface-200/40 hover:text-amber-400 transition-colors" title="Disconnect">
                        <Unlink className="w-4 h-4" />
                      </button>
                    ) : (
                      <button onClick={() => handleReconnect(acc._id)} className="p-1.5 rounded-lg hover:bg-green-500/10 text-surface-200/40 hover:text-green-400 transition-colors" title="Reconnect">
                        <Link2 className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(acc._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-surface-200/40 hover:text-red-400 transition-colors" title="Remove">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Connect Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-2xl bg-surface-800 dark:bg-surface-800 light:bg-white border border-white/10 dark:border-white/10 light:border-surface-200 shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-white/5 dark:border-white/5 light:border-surface-200">
              <h3 className="text-lg font-semibold text-white dark:text-white light:text-surface-900">Connect Account</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-surface-200/50">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-200/70 dark:text-surface-200/70 light:text-surface-700 mb-2">Platform</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(platformConfig).map(([key, cfg]) => (
                    <button key={key} onClick={() => setForm(f => ({ ...f, platform: key }))}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all ${form.platform === key
                        ? 'bg-primary-500/15 text-primary-400 border border-primary-500/30'
                        : 'bg-white/5 text-surface-200/50 border border-white/5 hover:border-white/10'
                      }`}>
                      <span>{cfg.emoji}</span> {cfg.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-200/70 dark:text-surface-200/70 light:text-surface-700 mb-1.5">Account Name</label>
                <input type="text" value={form.accountName} onChange={e => setForm(f => ({ ...f, accountName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 dark:bg-white/5 light:bg-surface-50 border border-white/10 dark:border-white/10 light:border-surface-200 text-white dark:text-white light:text-surface-900 placeholder-surface-200/30 outline-none focus:border-primary-500/50 text-sm"
                  placeholder="Display name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-200/70 dark:text-surface-200/70 light:text-surface-700 mb-1.5">Handle / Username</label>
                <input type="text" value={form.accountHandle} onChange={e => setForm(f => ({ ...f, accountHandle: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 dark:bg-white/5 light:bg-surface-50 border border-white/10 dark:border-white/10 light:border-surface-200 text-white dark:text-white light:text-surface-900 placeholder-surface-200/30 outline-none focus:border-primary-500/50 text-sm"
                  placeholder="@username" />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-white/5 dark:border-white/5 light:border-surface-200">
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl text-sm text-surface-200/60 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={handleConnect} disabled={saving || !form.accountName || !form.accountHandle}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold disabled:opacity-40 hover:shadow-lg transition-all">
                {saving ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
