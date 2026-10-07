import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Sparkles, CalendarDays,
  BarChart3, Share2, Bell, Settings, X, Zap, Image, Layers, Users
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/posts', icon: FileText, label: 'Posts' },
  { to: '/ai-generator', icon: Sparkles, label: 'AI Generator' },
  { to: '/templates', icon: Layers, label: 'AI Templates' },
  { to: '/media', icon: Image, label: 'Media Library' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/team', icon: Users, label: 'Team Workspace' },
  { to: '/social-accounts', icon: Share2, label: 'Social Accounts' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ open, onClose }) {
  return (
    <aside className={`
      fixed lg:static inset-y-0 left-0 z-50
      w-72 flex flex-col
      bg-surface-900/95 dark:bg-surface-900/95 light:bg-white/95
      border-r border-white/5 dark:border-white/5 light:border-surface-200
      glass
      transform transition-transform duration-300 ease-out
      ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
    `}>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-white/5 dark:border-white/5 light:border-surface-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg glow-primary">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white dark:text-white light:text-surface-900 tracking-tight">Social<span className="gradient-text">AI</span></h1>
            <p className="text-[10px] text-surface-200/60 dark:text-surface-200/60 light:text-surface-700/60 uppercase tracking-widest font-medium">Dashboard</p>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 text-surface-200">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-200 group relative
              ${isActive
                ? 'bg-primary-500/15 text-primary-400 dark:text-primary-400 light:text-primary-600 shadow-sm'
                : 'text-surface-200/70 dark:text-surface-200/70 light:text-surface-700/70 hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-surface-100 hover:text-white dark:hover:text-white light:hover:text-surface-900'
              }
            `}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full" />
                )}
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary-400 dark:text-primary-400 light:text-primary-600' : ''}`} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom card */}
      <div className="p-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/10 border border-primary-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="text-xs font-semibold text-primary-300">AI Powered</span>
          </div>
          <p className="text-xs text-surface-200/70 dark:text-surface-200/70 light:text-surface-700/70 leading-relaxed">
            Generate optimized content, schedule posts, and track analytics with AI.
          </p>
        </div>
      </div>
    </aside>
  );
}
