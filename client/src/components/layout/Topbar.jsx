import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, Sun, Moon, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../services/api';

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    api.get('/notifications?unreadOnly=true&limit=1')
      .then(res => setUnreadCount(res.data.unreadCount || 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(res.data.posts || []);
        setShowSearchResults(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-white/5 dark:border-white/5 light:border-surface-200 bg-surface-900/50 dark:bg-surface-900/50 light:bg-white/80 glass">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-surface-100 text-surface-200 dark:text-surface-200 light:text-surface-700 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Live Search Input & Dropdown */}
        <div className="relative hidden md:block" ref={searchRef}>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 dark:bg-white/5 light:bg-surface-100 border border-white/5 dark:border-white/5 light:border-surface-200 focus-within:border-primary-500/40 transition-colors w-72">
            <Search className="w-4 h-4 text-surface-200/50 dark:text-surface-200/50 light:text-surface-700/50" />
            <input
              type="text"
              placeholder="Search posts, captions, hashtags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowSearchResults(true)}
              className="bg-transparent text-sm text-white dark:text-white light:text-surface-900 placeholder-surface-200/40 dark:placeholder-surface-200/40 light:placeholder-surface-700/40 outline-none w-full"
            />
          </div>

          {/* Search Dropdown Results */}
          {showSearchResults && (
            <div className="absolute left-0 top-full mt-2 w-96 max-h-96 overflow-y-auto py-2 rounded-2xl bg-surface-900 border border-surface-800 shadow-2xl z-50">
              <div className="px-4 py-2 text-xs font-semibold uppercase text-surface-400 border-b border-surface-800 flex justify-between">
                <span>Search Results</span>
                {searching && <span>Searching...</span>}
              </div>

              {searchResults.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-surface-400">
                  No matching posts found.
                </div>
              ) : (
                <div className="divide-y divide-surface-800/60">
                  {searchResults.map((p) => (
                    <div
                      key={p._id}
                      onClick={() => {
                        setShowSearchResults(false);
                        navigate('/posts');
                      }}
                      className="p-3 hover:bg-surface-800/50 transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs text-primary-400 font-medium mb-1">
                        <span className="capitalize">{p.platform}</span>
                        <span className="text-surface-500 uppercase">{p.status}</span>
                      </div>
                      <p className="text-xs text-surface-200 line-clamp-2">{p.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-surface-100 text-surface-200 dark:text-surface-200 light:text-surface-700 transition-all duration-200"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-xl hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-surface-100 text-surface-200 dark:text-surface-200 light:text-surface-700 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-pulse-subtle">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 pl-2 rounded-xl hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-surface-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-semibold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="hidden md:block text-sm font-medium text-white dark:text-white light:text-surface-900 max-w-[100px] truncate">
              {user?.name || 'User'}
            </span>
            <ChevronDown className="w-4 h-4 text-surface-200/50 hidden md:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 py-2 rounded-xl bg-surface-800 dark:bg-surface-800 light:bg-white border border-white/10 dark:border-white/10 light:border-surface-200 shadow-2xl z-50 animate-scale-in">
              <div className="px-4 py-3 border-b border-white/5 dark:border-white/5 light:border-surface-200">
                <p className="text-sm font-semibold text-white dark:text-white light:text-surface-900">{user?.name}</p>
                <p className="text-xs text-surface-200/60 dark:text-surface-200/60 light:text-surface-700/60 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => { setShowUserMenu(false); navigate('/settings'); }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-surface-200/80 dark:text-surface-200/80 light:text-surface-700 hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-surface-50 transition-colors"
              >
                <User className="w-4 h-4" /> Profile & Settings
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
