import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, Clock, TrendingUp, AlertCircle, Sparkles, RefreshCw, Calendar } from 'lucide-react';
import api from '../services/api';

const typeConfig = {
  post_published: { icon: Check, color: 'text-green-400', bg: 'bg-green-500/10' },
  post_scheduled: { icon: Calendar, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  post_failed: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
  engagement: { icon: TrendingUp, color: 'text-primary-400', bg: 'bg-primary-500/10' },
  reminder: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  system: { icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  account: { icon: RefreshCw, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');

  const fetchNotifications = async () => {
    try {
      const params = filter === 'unread' ? { unreadOnly: true } : {};
      const res = await api.get('/notifications', { params });
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, [filter]);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) { console.error(err); }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (err) { console.error(err); }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      fetchNotifications();
    } catch (err) { console.error(err); }
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white dark:text-white light:text-surface-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary-400" />
            Notifications
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-primary-500/15 text-primary-400 text-xs font-semibold">{unreadCount}</span>
            )}
          </h1>
          <p className="text-surface-200/50 dark:text-surface-200/50 light:text-surface-700/50 text-sm mt-1">Stay updated on your activity</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 dark:bg-white/5 light:bg-white text-surface-200/60 dark:text-surface-200/60 light:text-surface-700 text-sm font-medium hover:bg-white/10 border border-white/5 dark:border-white/5 light:border-surface-200 transition-colors">
            <CheckCheck className="w-4 h-4" /> Mark all as read
          </button>
        )}
      </div>

      <div className="flex gap-2">
        {['all', 'unread'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${filter === f
              ? 'bg-primary-500/15 text-primary-400 border border-primary-500/30'
              : 'bg-white/5 dark:bg-white/5 light:bg-white text-surface-200/60 dark:text-surface-200/60 light:text-surface-700/60 border border-white/5 dark:border-white/5 light:border-surface-200 hover:bg-white/10'
            }`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-2xl skeleton" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bell className="w-16 h-16 text-surface-200/15 mb-4" />
          <h3 className="text-lg font-semibold text-white dark:text-white light:text-surface-900 mb-1">
            {filter === 'unread' ? 'All caught up!' : 'No notifications'}
          </h3>
          <p className="text-sm text-surface-200/40">
            {filter === 'unread' ? 'You have no unread notifications' : 'Notifications will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n, i) => {
            const config = typeConfig[n.type] || typeConfig.system;
            const IconComp = config.icon;
            return (
              <div key={n._id} className={`flex items-start gap-4 p-4 rounded-2xl border transition-all group animate-slide-up ${!n.isRead
                ? 'bg-primary-500/5 dark:bg-primary-500/5 light:bg-primary-50/50 border-primary-500/10'
                : 'bg-surface-800/30 dark:bg-surface-800/30 light:bg-white border-white/5 dark:border-white/5 light:border-surface-200'
              }`} style={{ animationDelay: `${i * 30}ms` }}>
                <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                  <IconComp className={`w-5 h-5 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`text-sm font-semibold ${!n.isRead ? 'text-white dark:text-white light:text-surface-900' : 'text-surface-200/70 dark:text-surface-200/70 light:text-surface-700'}`}>{n.title}</h4>
                    <span className="text-[10px] text-surface-200/30 shrink-0">{timeAgo(n.createdAt)}</span>
                  </div>
                  <p className="text-xs text-surface-200/50 dark:text-surface-200/50 light:text-surface-700/60 mt-0.5 line-clamp-2">{n.message}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {!n.isRead && (
                    <button onClick={() => markRead(n._id)} className="p-1.5 rounded-lg hover:bg-primary-500/10 text-surface-200/40 hover:text-primary-400 transition-colors" title="Mark read">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => deleteNotification(n._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-surface-200/40 hover:text-red-400 transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
