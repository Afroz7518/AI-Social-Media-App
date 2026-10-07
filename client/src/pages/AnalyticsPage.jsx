import { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, Heart, MessageCircle, Share2, Eye, MousePointer
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import api from '../services/api';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="p-3 rounded-xl bg-surface-800 border border-white/10 shadow-xl text-xs">
      <p className="font-medium text-surface-200/70 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value?.toLocaleString()}</p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [engagement, setEngagement] = useState([]);
  const [platforms, setPlatforms] = useState({});
  const [period, setPeriod] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [oRes, eRes, pRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get(`/analytics/engagement?days=${period}`),
          api.get('/analytics/platforms')
        ]);
        setOverview(oRes.data.overview);
        setEngagement(eRes.data.engagement);
        setPlatforms(pRes.data.platforms);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [period]);

  const fmt = (n) => {
    if (!n) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-24 rounded-2xl skeleton" />)}
        </div>
        <div className="h-80 rounded-2xl skeleton" />
      </div>
    );
  }

  const eng = overview?.engagement || {};

  const radarData = Object.entries(platforms).map(([name, data]) => ({
    platform: name.charAt(0).toUpperCase() + name.slice(1),
    likes: data.likes,
    comments: data.comments,
    shares: data.shares,
    posts: data.posts * 100 // scale for visibility
  }));

  const platformBarData = Object.entries(platforms).map(([name, data]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    likes: data.likes,
    comments: data.comments,
    shares: data.shares,
    reach: data.reach
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white dark:text-white light:text-surface-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary-400" /> Analytics
          </h1>
          <p className="text-surface-200/50 dark:text-surface-200/50 light:text-surface-700/50 text-sm mt-1">Track your social media performance</p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30].map(d => (
            <button key={d} onClick={() => setPeriod(d)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${period === d
                ? 'bg-primary-500/15 text-primary-400 border border-primary-500/30'
                : 'bg-white/5 dark:bg-white/5 light:bg-white text-surface-200/60 dark:text-surface-200/60 light:text-surface-700/60 border border-white/5 dark:border-white/5 light:border-surface-200 hover:bg-white/10'
              }`}>
              {d}D
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { icon: Heart, label: 'Likes', value: eng.likes, color: 'text-red-400', bg: 'bg-red-500/10' },
          { icon: MessageCircle, label: 'Comments', value: eng.comments, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { icon: Share2, label: 'Shares', value: eng.shares, color: 'text-green-400', bg: 'bg-green-500/10' },
          { icon: Eye, label: 'Reach', value: eng.reach, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { icon: TrendingUp, label: 'Impressions', value: eng.impressions, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { icon: MousePointer, label: 'Clicks', value: eng.clicks, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
        ].map(m => (
          <div key={m.label} className="p-4 rounded-2xl bg-surface-800/50 dark:bg-surface-800/50 light:bg-white border border-white/5 dark:border-white/5 light:border-surface-200">
            <div className={`w-8 h-8 rounded-lg ${m.bg} flex items-center justify-center mb-2`}>
              <m.icon className={`w-4 h-4 ${m.color}`} />
            </div>
            <p className="text-xl font-bold text-white dark:text-white light:text-surface-900">{fmt(m.value)}</p>
            <p className="text-[10px] text-surface-200/40 dark:text-surface-200/40 light:text-surface-700/50 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Engagement Over Time */}
      <div className="p-6 rounded-2xl bg-surface-800/50 dark:bg-surface-800/50 light:bg-white border border-white/5 dark:border-white/5 light:border-surface-200">
        <h3 className="text-base font-semibold text-white dark:text-white light:text-surface-900 mb-1">Engagement Over Time</h3>
        <p className="text-xs text-surface-200/50 mb-4">Last {period} days</p>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={engagement}>
            <defs>
              <linearGradient id="aLikes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="aComments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="aShares" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.01 260 / 0.3)" />
            <XAxis dataKey="date" tick={{ fill: 'oklch(0.6 0.02 260)', fontSize: 10 }} tickFormatter={v => v.split('-').slice(1).join('/')} />
            <YAxis tick={{ fill: 'oklch(0.6 0.02 260)', fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="likes" stroke="#f87171" fill="url(#aLikes)" strokeWidth={2} name="Likes" />
            <Area type="monotone" dataKey="comments" stroke="#60a5fa" fill="url(#aComments)" strokeWidth={2} name="Comments" />
            <Area type="monotone" dataKey="shares" stroke="#4ade80" fill="url(#aShares)" strokeWidth={2} name="Shares" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Platform Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-surface-800/50 dark:bg-surface-800/50 light:bg-white border border-white/5 dark:border-white/5 light:border-surface-200">
          <h3 className="text-base font-semibold text-white dark:text-white light:text-surface-900 mb-4">Platform Engagement</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={platformBarData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.01 260 / 0.3)" />
              <XAxis dataKey="name" tick={{ fill: 'oklch(0.6 0.02 260)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'oklch(0.6 0.02 260)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="likes" fill="#f87171" radius={[4, 4, 0, 0]} name="Likes" />
              <Bar dataKey="comments" fill="#60a5fa" radius={[4, 4, 0, 0]} name="Comments" />
              <Bar dataKey="shares" fill="#4ade80" radius={[4, 4, 0, 0]} name="Shares" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 rounded-2xl bg-surface-800/50 dark:bg-surface-800/50 light:bg-white border border-white/5 dark:border-white/5 light:border-surface-200">
          <h3 className="text-base font-semibold text-white dark:text-white light:text-surface-900 mb-4">Performance Radar</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="oklch(0.3 0.01 260 / 0.3)" />
              <PolarAngleAxis dataKey="platform" tick={{ fill: 'oklch(0.6 0.02 260)', fontSize: 11 }} />
              <PolarRadiusAxis tick={{ fill: 'oklch(0.5 0.02 260)', fontSize: 9 }} />
              <Radar name="Likes" dataKey="likes" stroke="#f87171" fill="#f87171" fillOpacity={0.15} />
              <Radar name="Shares" dataKey="shares" stroke="#4ade80" fill="#4ade80" fillOpacity={0.15} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
