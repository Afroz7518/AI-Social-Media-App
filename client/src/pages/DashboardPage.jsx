import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, CalendarDays, TrendingUp, Users, Heart, MessageCircle,
  Share2, Eye, Sparkles, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const StatCard = ({ icon: Icon, label, value, change, color, delay }) => (
  <div className={`p-5 rounded-2xl bg-surface-800/50 dark:bg-surface-800/50 light:bg-white border border-white/5 dark:border-white/5 light:border-surface-200 hover:border-primary-500/20 transition-all duration-300 group animate-slide-up`} style={{ animationDelay: `${delay}ms` }}>
    <div className="flex items-start justify-between mb-3">
      <div className={`p-2.5 rounded-xl ${color} bg-opacity-15`}>
        <Icon className="w-5 h-5" style={{ color: color.includes('primary') ? 'oklch(0.68 0.17 260)' : color.includes('green') ? 'oklch(0.72 0.19 150)' : color.includes('amber') ? 'oklch(0.80 0.16 85)' : 'oklch(0.70 0.18 25)' }} />
      </div>
      {change && (
        <span className={`flex items-center gap-0.5 text-xs font-semibold ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {change > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(change)}%
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-white dark:text-white light:text-surface-900">{value}</p>
    <p className="text-xs text-surface-200/50 dark:text-surface-200/50 light:text-surface-700/50 mt-1">{label}</p>
  </div>
);

const COLORS = ['oklch(0.68 0.17 260)', 'oklch(0.72 0.19 150)', 'oklch(0.80 0.16 85)', 'oklch(0.70 0.18 25)'];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [engagement, setEngagement] = useState([]);
  const [platforms, setPlatforms] = useState({});
  const [topPosts, setTopPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, engagementRes, platformsRes, topPostsRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/engagement?days=14'),
          api.get('/analytics/platforms'),
          api.get('/analytics/top-posts')
        ]);
        setOverview(overviewRes.data.overview);
        setEngagement(engagementRes.data.engagement);
        setPlatforms(platformsRes.data.platforms);
        setTopPosts(topPostsRes.data.posts);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl skeleton" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 rounded-2xl skeleton" />
          <div className="h-80 rounded-2xl skeleton" />
        </div>
      </div>
    );
  }

  const formatNumber = (n) => {
    if (!n) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  const platformData = Object.entries(platforms).map(([name, data]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: data.posts,
    engagement: data.likes + data.comments + data.shares
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="p-3 rounded-xl bg-surface-800 border border-white/10 shadow-xl text-xs">
        <p className="font-medium text-surface-200/70 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-white" style={{ color: p.color }}>
            {p.name}: {formatNumber(p.value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white dark:text-white light:text-surface-900">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-surface-200/50 dark:text-surface-200/50 light:text-surface-700/50 text-sm mt-1">Here's what's happening with your social media</p>
        </div>
        <button
          onClick={() => navigate('/ai-generator')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-200"
        >
          <Sparkles className="w-4 h-4" /> Generate Content
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Total Posts" value={overview?.totalPosts || 0} change={12} color="bg-primary-500/15" delay={0} />
        <StatCard icon={CalendarDays} label="Scheduled" value={overview?.scheduledPosts || 0} change={8} color="bg-amber-500/15" delay={50} />
        <StatCard icon={Users} label="Total Followers" value={formatNumber(overview?.totalFollowers)} change={5.2} color="bg-green-500/15" delay={100} />
        <StatCard icon={TrendingUp} label="Engagement Rate" value={`${overview?.engagement ? ((overview.engagement.likes + overview.engagement.comments + overview.engagement.shares) / Math.max(overview.engagement.reach, 1) * 100).toFixed(1) : 0}%`} change={3.1} color="bg-orange-500/15" delay={150} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Engagement Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-surface-800/50 dark:bg-surface-800/50 light:bg-white border border-white/5 dark:border-white/5 light:border-surface-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-white dark:text-white light:text-surface-900">Engagement Overview</h3>
              <p className="text-xs text-surface-200/50 dark:text-surface-200/50 light:text-surface-700/50 mt-0.5">Last 14 days</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: 'oklch(0.68 0.17 260)' }} /> Likes</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: 'oklch(0.72 0.19 150)' }} /> Comments</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: 'oklch(0.80 0.16 85)' }} /> Shares</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={engagement}>
              <defs>
                <linearGradient id="gradLikes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.68 0.17 260)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.68 0.17 260)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradComments" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.72 0.19 150)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.72 0.19 150)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.01 260 / 0.3)" />
              <XAxis dataKey="date" tick={{ fill: 'oklch(0.6 0.02 260)', fontSize: 11 }} tickFormatter={v => v.split('-').slice(1).join('/')} />
              <YAxis tick={{ fill: 'oklch(0.6 0.02 260)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="likes" stroke="oklch(0.68 0.17 260)" fill="url(#gradLikes)" strokeWidth={2} />
              <Area type="monotone" dataKey="comments" stroke="oklch(0.72 0.19 150)" fill="url(#gradComments)" strokeWidth={2} />
              <Area type="monotone" dataKey="shares" stroke="oklch(0.80 0.16 85)" fill="transparent" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Distribution */}
        <div className="p-6 rounded-2xl bg-surface-800/50 dark:bg-surface-800/50 light:bg-white border border-white/5 dark:border-white/5 light:border-surface-200">
          <h3 className="text-base font-semibold text-white dark:text-white light:text-surface-900 mb-1">Platform Distribution</h3>
          <p className="text-xs text-surface-200/50 dark:text-surface-200/50 light:text-surface-700/50 mb-4">Posts by platform</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={platformData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                {platformData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {platformData.map((p, i) => (
              <div key={p.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                <span className="text-surface-200/70 dark:text-surface-200/70 light:text-surface-700/70">{p.name}</span>
                <span className="ml-auto font-medium text-white dark:text-white light:text-surface-900">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Breakdown */}
        <div className="p-6 rounded-2xl bg-surface-800/50 dark:bg-surface-800/50 light:bg-white border border-white/5 dark:border-white/5 light:border-surface-200">
          <h3 className="text-base font-semibold text-white dark:text-white light:text-surface-900 mb-4">Engagement Breakdown</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Heart, label: 'Likes', value: overview?.engagement?.likes, color: 'text-red-400' },
              { icon: MessageCircle, label: 'Comments', value: overview?.engagement?.comments, color: 'text-blue-400' },
              { icon: Share2, label: 'Shares', value: overview?.engagement?.shares, color: 'text-green-400' },
              { icon: Eye, label: 'Reach', value: overview?.engagement?.reach, color: 'text-purple-400' },
              { icon: TrendingUp, label: 'Impressions', value: overview?.engagement?.impressions, color: 'text-amber-400' },
              { icon: ArrowUpRight, label: 'Clicks', value: overview?.engagement?.clicks, color: 'text-cyan-400' },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-xl bg-white/5 dark:bg-white/5 light:bg-surface-50 text-center">
                <item.icon className={`w-5 h-5 mx-auto mb-1.5 ${item.color}`} />
                <p className="text-lg font-bold text-white dark:text-white light:text-surface-900">{formatNumber(item.value)}</p>
                <p className="text-[10px] text-surface-200/50 dark:text-surface-200/50 light:text-surface-700/50 mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Posts */}
        <div className="p-6 rounded-2xl bg-surface-800/50 dark:bg-surface-800/50 light:bg-white border border-white/5 dark:border-white/5 light:border-surface-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white dark:text-white light:text-surface-900">Top Performing Posts</h3>
            <button onClick={() => navigate('/posts')} className="text-xs text-primary-400 hover:text-primary-300 transition-colors">View all →</button>
          </div>
          <div className="space-y-3">
            {topPosts.length > 0 ? topPosts.slice(0, 4).map((post, i) => (
              <div key={post._id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-surface-50 transition-colors">
                <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-primary-500/15 text-primary-400 text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white dark:text-white light:text-surface-900 line-clamp-1">{post.content}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-surface-200/50 dark:text-surface-200/50 light:text-surface-700/50">
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {formatNumber(post.engagement?.likes)}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {formatNumber(post.engagement?.comments)}</span>
                    <span className="flex items-center gap-1"><Share2 className="w-3 h-3" /> {formatNumber(post.engagement?.shares)}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <FileText className="w-10 h-10 text-surface-200/20 mx-auto mb-2" />
                <p className="text-sm text-surface-200/40">No published posts yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
