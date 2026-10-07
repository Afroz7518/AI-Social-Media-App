import { useState, useEffect } from 'react';
import { 
  FiFolder, FiImage, FiVideo, FiUpload, FiTrash2, FiTag, 
  FiSearch, FiGrid, FiList, FiHardDrive, FiPlus, FiCheckCircle, FiX
} from 'react-icons/fi';
import api from '../services/api';

export default function MediaLibraryPage() {
  const [mediaItems, setMediaItems] = useState([]);
  const [stats, setStats] = useState({ totalItems: 0, totalSize: 0, formattedSize: '0 MB', byFolder: {} });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  
  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  
  // Upload Form State
  const [uploadForm, setUploadForm] = useState({
    filename: '',
    url: '',
    folder: 'General',
    tags: '',
    fileType: 'image'
  });

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedFolder !== 'all') params.folder = selectedFolder;
      if (selectedType !== 'all') params.fileType = selectedType;
      if (search) params.search = search;

      const res = await api.get('/media', { params });
      setMediaItems(res.data.items || []);
      const storage = res.data.storage || {};
      setStats({
        totalItems: storage.totalCount || 0,
        formattedSize: ((storage.totalSize || 0) / (1024 * 1024)).toFixed(2) + ' MB',
        byFolder: res.data.folders || []
      });
    } catch (err) {
      console.error('Error fetching media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [selectedFolder, selectedType, search]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    try {
      const tagsArray = uploadForm.tags.split(',').map(t => t.trim()).filter(Boolean);
      await api.post('/media', {
        url: uploadForm.url,
        originalName: uploadForm.filename,
        type: uploadForm.fileType,
        folder: uploadForm.folder,
        tags: tagsArray,
        mimeType: uploadForm.fileType === 'video' ? 'video/mp4' : 'image/jpeg',
        size: Math.floor(Math.random() * (3000000 - 500000) + 500000) // Mock size 0.5-3MB
      });
      setShowUploadModal(false);
      setUploadForm({ filename: '', url: '', folder: 'General', tags: '', fileType: 'image' });
      fetchMedia();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to upload media asset');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this media asset?')) return;
    try {
      await api.delete(`/media/${id}`);
      setMediaItems(prev => prev.filter(item => item._id !== id));
      if (selectedAsset?._id === id) setSelectedAsset(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete media asset');
    }
  };

  const sampleImages = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80'
  ];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FiImage className="text-primary-400" /> Media Library
          </h1>
          <p className="text-surface-400 text-sm">
            Manage images, graphics, and video assets for your social campaigns
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-primary-600/20 transition-all hover:scale-[1.02]"
          >
            <FiUpload size={18} /> Upload Media
          </button>
        </div>
      </div>

      {/* Storage & Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-900/60 border border-surface-800/80 p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-primary-500/10 text-primary-400 rounded-xl">
            <FiHardDrive size={24} />
          </div>
          <div>
            <div className="text-xs text-surface-400 uppercase font-semibold tracking-wider">Storage Used</div>
            <div className="text-lg font-bold text-white">{stats.formattedSize || '0 MB'} / 5.0 GB</div>
          </div>
        </div>

        <div className="bg-surface-900/60 border border-surface-800/80 p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <FiImage size={24} />
          </div>
          <div>
            <div className="text-xs text-surface-400 uppercase font-semibold tracking-wider">Total Assets</div>
            <div className="text-lg font-bold text-white">{stats.totalItems || 0} Files</div>
          </div>
        </div>

        <div className="bg-surface-900/60 border border-surface-800/80 p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl">
            <FiFolder size={24} />
          </div>
          <div>
            <div className="text-xs text-surface-400 uppercase font-semibold tracking-wider">Folders</div>
            <div className="text-lg font-bold text-white">{(stats.byFolder || []).length} Folders</div>
          </div>
        </div>

        <div className="bg-surface-900/60 border border-surface-800/80 p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <FiVideo size={24} />
          </div>
          <div>
            <div className="text-xs text-surface-400 uppercase font-semibold tracking-wider">Media Types</div>
            <div className="text-lg font-bold text-white">Images & Videos</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-surface-900/40 border border-surface-800/60 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={16} />
            <input
              type="text"
              placeholder="Search filename or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-950 border border-surface-800/80 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-surface-500 focus:outline-none focus:border-primary-500 transition"
            />
          </div>

          {/* Folder filter */}
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="bg-surface-950 border border-surface-800/80 rounded-xl px-3 py-2 text-sm text-surface-200 focus:outline-none focus:border-primary-500"
          >
            <option value="all">All Folders</option>
            <option value="General">General</option>
            <option value="Campaigns">Campaigns</option>
            <option value="Products">Products</option>
            <option value="Branding">Branding</option>
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-surface-950 border border-surface-800/80 rounded-xl px-3 py-2 text-sm text-surface-200 focus:outline-none focus:border-primary-500"
          >
            <option value="all">All File Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="gif">GIFs</option>
          </select>
        </div>

        {/* View toggle */}
        <div className="flex items-center bg-surface-950 p-1 border border-surface-800/80 rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-surface-800 text-white' : 'text-surface-400 hover:text-white'}`}
          >
            <FiGrid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-surface-800 text-white' : 'text-surface-400 hover:text-white'}`}
          >
            <FiList size={18} />
          </button>
        </div>
      </div>

      {/* Media Content Grid / List */}
      {loading ? (
        <div className="flex justify-center items-center py-20 text-surface-400">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mr-3" />
          Loading media library...
        </div>
      ) : mediaItems.length === 0 ? (
        <div className="text-center py-16 bg-surface-900/30 border border-surface-800/50 rounded-2xl">
          <FiImage className="mx-auto text-surface-600 mb-3" size={48} />
          <h3 className="text-lg font-medium text-white mb-1">No media assets found</h3>
          <p className="text-surface-400 text-sm mb-4">Upload images or videos to organize your content assets.</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm rounded-xl transition"
          >
            Add First Asset
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {mediaItems.map((item) => (
            <div
              key={item._id}
              onClick={() => setSelectedAsset(item)}
              className="group relative bg-surface-900/60 border border-surface-800/80 hover:border-primary-500/50 rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02]"
            >
              <div className="aspect-square relative bg-surface-950 overflow-hidden">
                <img
                  src={item.url}
                  alt={item.originalName}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80';
                  }}
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-md text-[10px] text-surface-200 font-medium capitalize">
                  {item.type}
                </div>
              </div>

              <div className="p-3">
                <h4 className="text-sm font-medium text-white truncate">{item.originalName}</h4>
                <div className="flex items-center justify-between text-xs text-surface-400 mt-1">
                  <span>{item.folder}</span>
                  <span>{(item.size / (1024 * 1024)).toFixed(1)} MB</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-surface-900/60 border border-surface-800/80 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm text-surface-300">
            <thead className="bg-surface-950 text-surface-400 text-xs uppercase border-b border-surface-800/80">
              <tr>
                <th className="px-4 py-3">Asset</th>
                <th className="px-4 py-3">Folder</th>
                <th className="px-4 py-3">Tags</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/50">
              {mediaItems.map((item) => (
                <tr key={item._id} className="hover:bg-surface-800/30 transition">
                  <td className="px-4 py-3 flex items-center gap-3">
                    <img src={item.url} alt={item.originalName} className="w-10 h-10 rounded-lg object-cover bg-surface-950" />
                    <div>
                      <div className="font-medium text-white">{item.originalName}</div>
                      <div className="text-xs text-surface-500 capitalize">{item.type}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-surface-800 rounded-md text-xs text-surface-300">
                      {item.folder}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {item.tags?.slice(0, 2).map((t, idx) => (
                        <span key={idx} className="text-[11px] px-1.5 py-0.5 bg-primary-500/10 text-primary-400 rounded">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-surface-400">
                    {(item.size / (1024 * 1024)).toFixed(2)} MB
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-1.5 text-surface-400 hover:text-rose-400 transition"
                      title="Delete asset"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-surface-800">
              <h3 className="font-bold text-white flex items-center gap-2">
                <FiUpload className="text-primary-400" /> Upload New Media Asset
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-surface-400 hover:text-white">
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-surface-300 uppercase mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer Campaign Banner"
                  value={uploadForm.filename}
                  onChange={(e) => setUploadForm({ ...uploadForm, filename: e.target.value })}
                  className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-300 uppercase mb-1">Media URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={uploadForm.url}
                  onChange={(e) => setUploadForm({ ...uploadForm, url: e.target.value })}
                  className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                />
                <div className="flex gap-2 mt-2">
                  <span className="text-xs text-surface-400">Quick Samples:</span>
                  {sampleImages.slice(0, 3).map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setUploadForm({ ...uploadForm, url })}
                      className="text-xs text-primary-400 underline"
                    >
                      Sample {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-surface-300 uppercase mb-1">Folder</label>
                  <select
                    value={uploadForm.folder}
                    onChange={(e) => setUploadForm({ ...uploadForm, folder: e.target.value })}
                    className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                  >
                    <option value="General">General</option>
                    <option value="Campaigns">Campaigns</option>
                    <option value="Products">Products</option>
                    <option value="Branding">Branding</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-300 uppercase mb-1">File Type</label>
                  <select
                    value={uploadForm.fileType}
                    onChange={(e) => setUploadForm({ ...uploadForm, fileType: e.target.value })}
                    className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="gif">GIF</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-300 uppercase mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="marketing, summer, promo"
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                  className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-surface-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-surface-400 hover:text-white text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-medium transition"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Asset Preview Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            <div className="md:w-1/2 bg-black flex items-center justify-center p-4">
              <img src={selectedAsset.url} alt={selectedAsset.filename} className="max-h-80 object-contain rounded-lg" />
            </div>

            <div className="md:w-1/2 p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-white text-lg">{selectedAsset.originalName}</h3>
                  <button onClick={() => setSelectedAsset(null)} className="text-surface-400 hover:text-white">
                    <FiX size={20} />
                  </button>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-surface-800 pb-2">
                    <span className="text-surface-400">Folder</span>
                    <span className="text-white font-medium">{selectedAsset.folder}</span>
                  </div>
                  <div className="flex justify-between border-b border-surface-800 pb-2">
                    <span className="text-surface-400">File Type</span>
                    <span className="text-white font-medium uppercase">{selectedAsset.type}</span>
                  </div>
                  <div className="flex justify-between border-b border-surface-800 pb-2">
                    <span className="text-surface-400">File Size</span>
                    <span className="text-white font-medium">{(selectedAsset.size / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                  <div>
                    <span className="text-surface-400 block mb-1">Tags</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedAsset.tags?.map((t, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 bg-primary-500/10 text-primary-400 rounded-md">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-surface-800">
                <button
                  onClick={() => handleDelete(selectedAsset._id)}
                  className="flex items-center gap-2 text-rose-400 hover:text-rose-300 text-sm font-medium"
                >
                  <FiTrash2 size={16} /> Delete Asset
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedAsset.url);
                    alert('Copied asset URL to clipboard!');
                  }}
                  className="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-white rounded-xl text-sm transition"
                >
                  Copy URL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
