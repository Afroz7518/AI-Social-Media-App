import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiFileText, FiStar, FiZap, FiPlus, FiTag, 
  FiSearch, FiCopy, FiCheckCircle, FiEdit2, FiTrash2, FiX, FiArrowRight 
} from 'react-icons/fi';
import api from '../services/api';

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  
  // Create / Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Product Launch',
    promptTemplate: '',
    variables: '',
    platform: 'twitter'
  });

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (search) params.search = search;

      const res = await api.get('/templates', { params });
      setTemplates(res.data.templates);
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [selectedCategory, search]);

  const handleFavoriteToggle = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await api.patch(`/templates/${id}/favorite`);
      setTemplates(prev => prev.map(t => t._id === id ? { ...t, isFavorite: res.data.isFavorite } : t));
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleUseTemplate = (template) => {
    // Navigate to AI Generator with this template preloaded
    navigate('/ai-generator', { state: { template } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const varsArray = typeof formData.variables === 'string'
        ? formData.variables.split(',').map(v => v.trim()).filter(Boolean)
        : formData.variables;

      if (editingTemplate) {
        await api.put(`/templates/${editingTemplate._id}`, { ...formData, variables: varsArray });
      } else {
        await api.post('/templates', { ...formData, variables: varsArray });
      }

      setShowModal(false);
      setEditingTemplate(null);
      setFormData({ name: '', description: '', category: 'Product Launch', promptTemplate: '', variables: '', platform: 'twitter' });
      fetchTemplates();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save template');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this template?')) return;
    try {
      await api.delete(`/templates/${id}`);
      setTemplates(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete template');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FiZap className="text-primary-400" /> AI Content Templates
          </h1>
          <p className="text-surface-400 text-sm">
            Reusable prompt blueprints for instant high-converting social copy
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTemplate(null);
            setFormData({ name: '', description: '', category: 'Product Launch', promptTemplate: '', variables: '', platform: 'twitter' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-primary-600/20 transition-all hover:scale-[1.02]"
        >
          <FiPlus size={18} /> Create Custom Template
        </button>
      </div>

      {/* Filter and Category Pills */}
      <div className="bg-surface-900/40 border border-surface-800/60 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={16} />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-950 border border-surface-800/80 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-surface-500 focus:outline-none focus:border-primary-500 transition"
          />
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                : 'bg-surface-950 border border-surface-800 text-surface-400 hover:text-white'
            }`}
          >
            All Templates
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat._id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat._id
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                  : 'bg-surface-950 border border-surface-800 text-surface-400 hover:text-white'
              }`}
            >
              {cat._id} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* Template Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20 text-surface-400">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mr-3" />
          Loading AI templates...
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16 bg-surface-900/30 border border-surface-800/50 rounded-2xl">
          <FiFileText className="mx-auto text-surface-600 mb-3" size={48} />
          <h3 className="text-lg font-medium text-white mb-1">No templates found</h3>
          <p className="text-surface-400 text-sm mb-4">Try selecting another category or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((tpl) => (
            <div
              key={tpl._id}
              className="bg-surface-900/60 border border-surface-800/80 hover:border-primary-500/40 p-5 rounded-2xl flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-primary-500/5 group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-primary-500/10 border border-primary-500/20 text-primary-400 rounded-lg text-xs font-semibold uppercase tracking-wider">
                      {tpl.category}
                    </span>
                    {tpl.user === null && (
                      <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded text-[10px] font-medium">
                        System
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => handleFavoriteToggle(tpl._id, e)}
                    className={`p-1.5 rounded-lg transition ${
                      tpl.isFavorite ? 'text-amber-400 bg-amber-400/10' : 'text-surface-500 hover:text-amber-400'
                    }`}
                  >
                    <FiStar size={18} fill={tpl.isFavorite ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary-300 transition">
                  {tpl.name}
                </h3>
                <p className="text-surface-400 text-sm mb-4 line-clamp-2">{tpl.description}</p>

                {/* Prompt Template Box */}
                <div className="bg-surface-950/80 border border-surface-800/80 p-3 rounded-xl mb-4 font-mono text-xs text-surface-300 relative overflow-hidden">
                  <p className="line-clamp-3">{tpl.promptTemplate}</p>
                </div>

                {/* Variables Pills */}
                {tpl.variables && tpl.variables.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className="text-[11px] text-surface-500 self-center mr-1">Variables:</span>
                    {tpl.variables.map((v, i) => (
                      <span key={i} className="px-2 py-0.5 bg-surface-800 text-surface-300 text-[11px] rounded-md border border-surface-700/60">
                        {'{' + v + '}'}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-surface-800/60 flex items-center justify-between">
                <span className="text-xs text-surface-500 font-medium">
                  Used {tpl.usageCount || 0} times
                </span>

                <div className="flex items-center gap-2">
                  {tpl.user && (
                    <button
                      onClick={(e) => handleDelete(tpl._id, e)}
                      className="p-2 text-surface-400 hover:text-rose-400 transition rounded-lg"
                      title="Delete template"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  )}

                  <button
                    onClick={() => handleUseTemplate(tpl)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600/20 hover:bg-primary-600 text-primary-300 hover:text-white border border-primary-500/30 rounded-xl text-xs font-semibold transition-all"
                  >
                    Use Template <FiArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Custom Template */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-surface-800">
              <h3 className="font-bold text-white flex items-center gap-2">
                <FiZap className="text-primary-400" /> {editingTemplate ? 'Edit Template' : 'Create Content Template'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-surface-400 hover:text-white">
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-surface-300 uppercase mb-1">Template Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekly Tech Roundup"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-surface-300 uppercase mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                  >
                    <option value="Product Launch">Product Launch</option>
                    <option value="Educational Thread">Educational Thread</option>
                    <option value="Promotions">Promotions</option>
                    <option value="Engagement">Engagement</option>
                    <option value="Case Study">Case Study</option>
                    <option value="Newsletter">Newsletter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-300 uppercase mb-1">Target Platform</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                  >
                    <option value="all">All Platforms</option>
                    <option value="twitter">Twitter / X</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-300 uppercase mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Briefly describe what this template generates..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-300 uppercase mb-1">
                  Prompt Structure (Use {'{variable}'} placeholders)
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write a high-converting announcement post for {product_name} highlighting {key_benefit} with 3 call-to-actions..."
                  value={formData.promptTemplate}
                  onChange={(e) => setFormData({ ...formData, promptTemplate: e.target.value })}
                  className="w-full bg-surface-950 border border-surface-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-primary-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-300 uppercase mb-1">Variables (comma separated)</label>
                <input
                  type="text"
                  placeholder="product_name, key_benefit"
                  value={formData.variables}
                  onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
                  className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-surface-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-surface-400 hover:text-white text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-medium transition"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
