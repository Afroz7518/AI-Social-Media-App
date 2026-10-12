import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Mail, Lock, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const location = useLocation();
  const infoMessage = location.state?.message;
  const [email, setEmail] = useState('demo@socialai.com');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.58_0.22_260/0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,oklch(0.65_0.20_160/0.1),transparent_50%)]" />

      {/* Left panel - branding */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative">
        <div className="max-w-lg animate-fade-in">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-2xl glow-primary">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Social<span className="gradient-text">AI</span></h1>
              <p className="text-sm text-surface-200/50">AI-Powered Dashboard</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Automate your social media with{' '}
            <span className="gradient-text">artificial intelligence</span>
          </h2>
          <p className="text-lg text-surface-200/60 leading-relaxed">
            Generate content, schedule posts, track analytics, and grow your audience — all from one powerful dashboard.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { n: '10K+', l: 'Posts Generated' },
              { n: '50+', l: 'AI Models' },
              { n: '99.9%', l: 'Uptime' }
            ].map((s) => (
              <div key={s.l} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-2xl font-bold gradient-text">{s.n}</p>
                <p className="text-xs text-surface-200/50 mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center glow-primary">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Social<span className="gradient-text">AI</span></h1>
          </div>

          <div className="p-8 rounded-3xl bg-surface-800/50 border border-white/5 glass-card">
            <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-surface-200/50 text-sm mb-6">Sign in to your account</p>

            {infoMessage && (
              <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm animate-scale-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{infoMessage}</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-scale-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-200/70 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-200/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-surface-200/30 outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-200/70 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-200/30" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-surface-200/30 outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm"
                    placeholder="••••••••"
                    required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-200/30 hover:text-surface-200/60">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-surface-200/50 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                Sign up
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-surface-200/30 mt-4">
            Demo: demo@socialai.com / demo123
          </p>
        </div>
      </div>
    </div>
  );
}
