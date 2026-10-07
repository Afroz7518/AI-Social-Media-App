import { useState, useEffect } from 'react';
import {
  Plus, Search, Filter, Edit3, Trash2, Eye, Clock,
  CheckCircle, AlertCircle, FileText, X, Copy, CheckSquare, Square
} from 'lucide-react';
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';
import api from '../services/api';
import PostPreviewModal from '../components/PostPreviewModal';

const platformIcons = {
  instagram: <FaInstagram />,
  facebook: <FaFacebook />,
  linkedin: <FaLinkedin />
};
const statusColors = {
  draft: 'bg-surface-200/20 text-surface-200/70',
  scheduled: 'bg-amber-500/15 text-amber-400',
  published: 'bg-green-500/15 text-green-400',
  failed: 'bg-red-500/15 text-red-400'
};

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editPost, setEditPost] = useState(null);
  const [previewPost, setPreviewPost] = useState(null);
  const [selectedPostIds, setSelectedPostIds] = useState([]);
  const [form, setForm] = useState({ content: '', caption: '', hashtags: '', platforms: [], status: 'draft', scheduledAt: '' });
  const [saving, setSaving] = useState(false);

  const fetchPosts = async () => {
    try {
      const params = {};
      if (filter) params.status = filter;
      const res = await api.get('/posts', { params });
      setPosts(res.data.posts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, [filter]);

  const openCreate = () => {
    setEditPost(null);
    setForm({ content: '', caption: '', hashtags: '', platforms: [], status: 'draft', scheduledAt: '' });
    setShowModal(true);
  };

  const openEdit = (post) => {
    setEditPost(post);
    setForm({
      content: post.content,
      caption: post.caption || '',
      hashtags: (post.hashtags || []).join(', '),
      platforms: post.platforms || [],
      status: post.status,
      scheduledAt: post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : ''
    });
    setShowModal(true);
  };

  const handleDuplicate = async (post) => {
    try {
      await api.post(`/posts/${post._id}/duplicate`);
      fetchPosts();
    } catch (err) {
      alert('Failed to duplicate post');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        ...form,
        hashtags: form.hashtags.split(',').map(t => t.trim()).filter(Boolean)
      };
      if (editPost) {
        await api.put(`/posts/${editPost._id}`, data);
      } else {
        await api.post('/posts', data);
      }
      setShowModal(false);
      fetchPosts();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${id}`);
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  // Bulk actions
  const toggleSelectPost = (id) => {
    setSelectedPostIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedPostIds.length} selected posts?`)) return;
    try {
      await api.post('/posts/bulk-delete', { ids: selectedPostIds });
      setSelectedPostIds([]);
      fetchPosts();
    } catch (err) {
      alert('Bulk delete failed');
    }
  };

  const handleBulkStatusChange = async (status) => {
    try {
      await api.post('/posts/bulk-status', { ids: selectedPostIds, status });
      setSelectedPostIds([]);
      fetchPosts();
    } catch (err) {
      alert('Bulk status update failed');
    }
  };

  const togglePlatform = (p) => {
    setForm(f => ({
      ...f,
      platforms: f.platforms.includes(p) ? f.platforms.filter(x => x !== p) : [...f.platforms, p]
    }));
  };

  const filtered = posts.filter(p => !search || p.content.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white dark:text-white light:text-surface-900">Posts</h1>
          <p className="text-surface-200/50 dark:text-surface-200/50 light:text-surface-700/50 text-sm mt-1">Manage all your social media content</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all">
          <Plus className="w-4 h-4" /> Create Post
        </button>
      </div>

      {/* Bulk Action Bar */}
      {selectedPostIds.length > 0 && (
        <div className="bg-primary-500/10 border border-primary-500/30 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 animate-fade-in">
          <span className="text-sm font-medium text-primary-300">
            {selectedPostIds.length} post(s) selected
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatusChange('scheduled')}
              className="px-3 py-1.5 bg-surface-800 hover:bg-surface-700 text-amber-400 rounded-xl text-xs font-semibold"
            >
              Mark Scheduled
            </button>
            <button
              onClick={() => handleBulkStatusChange('published')}
              className="px-3 py-1.5 bg-surface-800 hover:bg-surface-700 text-emerald-400 rounded-xl text-xs font-semibold"
            >
              Mark Published
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-xl text-xs font-semibold"
            >
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedPostIds([])}
              className="text-xs text-surface-400 hover:text-white ml-2"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 dark:bg-white/5 light:bg-white border border-white/5 dark:border-white/5 light:border-surface-200 flex-1 max-w-md">
          <Search className="w-4 h-4 text-surface-200/40" />
          <input type="text" placeholder="Search posts..." value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm text-white dark:text-white light:text-surface-900 placeholder-surface-200/30 outline-none w-full" />
        </div>
        <div className="flex gap-2">
          {['', 'draft', 'scheduled', 'published'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${filter === f
                ? 'bg-primary-500/15 text-primary-400 border border-primary-500/30'
                : 'bg-white/5 dark:bg-white/5 light:bg-white text-surface-200/60 dark:text-surface-200/60 light:text-surface-700/60 border border-white/5 dark:border-white/5 light:border-surface-200 hover:bg-white/10'
                }`}>
              {f ? f.charAt(0).toUpperCase() + f.slice(1) : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 rounded-2xl skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="w-16 h-16 text-surface-200/15 mb-4" />
          <h3 className="text-lg font-semibold text-white dark:text-white light:text-surface-900 mb-1">No posts found</h3>
          <p className="text-sm text-surface-200/40 mb-4">Create your first post or adjust your filters</p>
          <button onClick={openCreate} className="px-4 py-2 rounded-xl bg-primary-500/15 text-primary-400 text-sm font-medium hover:bg-primary-500/25 transition-colors">
            <Plus className="w-4 h-4 inline mr-1" /> Create Post
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((post, i) => (
            <div key={post._id} className="p-5 rounded-2xl bg-surface-800/50 dark:bg-surface-800/50 light:bg-white border border-white/5 dark:border-white/5 light:border-surface-200 hover:border-primary-500/20 transition-all group animate-slide-up relative" style={{ animationDelay: `${i * 30}ms` }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleSelectPost(post._id)} className="text-surface-400 hover:text-white">
                    {selectedPostIds.includes(post._id) ? <CheckSquare className="w-4 h-4 text-primary-400" /> : <Square className="w-4 h-4" />}
                  </button>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider ${statusColors[post.status]}`}>
                    {post.status}
                  </span>
                </div>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setPreviewPost(post)} className="p-1.5 rounded-lg hover:bg-white/10 text-surface-200/50 hover:text-primary-400 transition-colors" title="Preview on Social Cards">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDuplicate(post)} className="p-1.5 rounded-lg hover:bg-white/10 text-surface-200/50 hover:text-indigo-400 transition-colors" title="Duplicate post">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => openEdit(post)} className="p-1.5 rounded-lg hover:bg-white/10 text-surface-200/50 hover:text-white transition-colors" title="Edit post">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(post._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-surface-200/50 hover:text-red-400 transition-colors" title="Delete post">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-white dark:text-white light:text-surface-900 line-clamp-3 mb-3 leading-relaxed">{post.content}</p>
              
              <div className="flex flex-wrap gap-1.5 mb-3">
                {(post.hashtags || []).slice(0, 4).map(h => (
                  <span key={h} className="text-[10px] text-primary-400/70 bg-primary-500/10 px-2 py-0.5 rounded-md">{h}</span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/5 dark:border-white/5 light:border-surface-200">
                <div className="flex gap-1.5">
                  {(post.platforms || []).map(p => (
                    <span key={p} className="text-sm" title={p}>{platformIcons[p]}</span>
                  ))}
                </div>
                {post.scheduledAt && (
                  <span className="text-[10px] text-surface-200/40 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(post.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Preview Modal */}
      {previewPost && (
        <PostPreviewModal post={previewPost} onClose={() => setPreviewPost(null)} />
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-surface-800 dark:bg-surface-800 light:bg-white border border-white/10 dark:border-white/10 light:border-surface-200 shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-white/5 dark:border-white/5 light:border-surface-200">
              <h3 className="text-lg font-semibold text-white dark:text-white light:text-surface-900">{editPost ? 'Edit Post' : 'Create Post'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-surface-200/50">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-surface-200/70 dark:text-surface-200/70 light:text-surface-700 mb-1.5">Content *</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 dark:bg-white/5 light:bg-surface-50 border border-white/10 dark:border-white/10 light:border-surface-200 text-white dark:text-white light:text-surface-900 placeholder-surface-200/30 outline-none focus:border-primary-500/50 text-sm resize-none"
                  placeholder="Write your post content..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-200/70 dark:text-surface-200/70 light:text-surface-700 mb-1.5">Caption</label>
                <input type="text" value={form.caption} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 dark:bg-white/5 light:bg-surface-50 border border-white/10 dark:border-white/10 light:border-surface-200 text-white dark:text-white light:text-surface-900 placeholder-surface-200/30 outline-none focus:border-primary-500/50 text-sm"
                  placeholder="Short caption..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-200/70 dark:text-surface-200/70 light:text-surface-700 mb-1.5">Hashtags (comma-separated)</label>
                <input type="text" value={form.hashtags} onChange={e => setForm(f => ({ ...f, hashtags: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 dark:bg-white/5 light:bg-surface-50 border border-white/10 dark:border-white/10 light:border-surface-200 text-white dark:text-white light:text-surface-900 placeholder-surface-200/30 outline-none focus:border-primary-500/50 text-sm"
                  placeholder="#marketing, #ai, #social" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-200/70 dark:text-surface-200/70 light:text-surface-700 mb-1.5">Platforms *</label>
                <div className="flex gap-2">
                  {Object.entries(platformIcons).map(([p, icon]) => (
                    <button key={p} onClick={() => togglePlatform(p)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all ${form.platforms.includes(p)
                        ? 'bg-primary-500/15 text-primary-400 border border-primary-500/30'
                        : 'bg-white/5 text-surface-200/50 border border-white/5 hover:border-white/10'
                        }`}>
                      <span>{icon}</span> {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-200/70 dark:text-surface-200/70 light:text-surface-700 mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 dark:bg-white/5 light:bg-surface-50 border border-white/10 dark:border-white/10 light:border-surface-200 text-white dark:text-white light:text-surface-900 outline-none focus:border-primary-500/50 text-sm">
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-200/70 dark:text-surface-200/70 light:text-surface-700 mb-1.5">Schedule Date</label>
                  <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 dark:bg-white/5 light:bg-surface-50 border border-white/10 dark:border-white/10 light:border-surface-200 text-white dark:text-white light:text-surface-900 outline-none focus:border-primary-500/50 text-sm" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-white/5 dark:border-white/5 light:border-surface-200">
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl text-sm text-surface-200/60 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.content || form.platforms.length === 0}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold disabled:opacity-40 hover:shadow-lg hover:shadow-primary-500/25 transition-all">
                {saving ? 'Saving...' : editPost ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
