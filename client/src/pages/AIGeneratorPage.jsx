import { useState } from 'react';
import { Sparkles, Copy, Check, RefreshCw, Send, Hash, Lightbulb, Zap } from 'lucide-react';
import api from '../services/api';

const platforms = [
  { value: 'instagram', label: 'Instagram', emoji: '📸' },
  { value: 'facebook', label: 'Facebook', emoji: '👤' },
  { value: 'linkedin', label: 'LinkedIn', emoji: '💼' },
  { value: 'x', label: 'X (Twitter)', emoji: '𝕏' },
];

const tones = [
  { value: 'professional', label: 'Professional', emoji: '💼' },
  { value: 'casual', label: 'Casual', emoji: '😊' },
  { value: 'humorous', label: 'Humorous', emoji: '😂' },
  { value: 'inspirational', label: 'Inspirational', emoji: '✨' },
  { value: 'educational', label: 'Educational', emoji: '📚' },
  { value: 'promotional', label: 'Promotional', emoji: '🚀' },
];

const contentTypes = [
  { value: 'post', label: 'Post' },
  { value: 'story', label: 'Story' },
  { value: 'reel', label: 'Reel' },
  { value: 'thread', label: 'Thread' },
  { value: 'article', label: 'Article' },
  { value: 'ad', label: 'Ad' },
];

export default function AIGeneratorPage() {
  const [form, setForm] = useState({ platform: 'instagram', topic: '', tone: 'professional', contentType: 'post' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState('');
  const [saving, setSaving] = useState(false);

  const generate = async () => {
    if (!form.topic.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/ai/generate', form);
      setResult(res.data.content);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const saveAsPost = async () => {
    if (!result) return;
    setSaving(true);
    try {
      await api.post('/posts', {
        content: result.caption,
        hashtags: result.hashtags,
        platforms: [form.platform],
        status: 'draft',
        aiGenerated: true
      });
      alert('Post saved as draft!');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white dark:text-white light:text-surface-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary-400" /> AI Content Generator
        </h1>
        <p className="text-surface-200/50 dark:text-surface-200/50 light:text-surface-700/50 text-sm mt-1">Generate optimized content powered by artificial intelligence</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="p-6 rounded-2xl bg-surface-800/50 dark:bg-surface-800/50 light:bg-white border border-white/5 dark:border-white/5 light:border-surface-200 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-primary-400" />
            <h3 className="text-base font-semibold text-white dark:text-white light:text-surface-900">Configure Generation</h3>
          </div>

          {/* Platform */}
          <div>
            <label className="block text-sm font-medium text-surface-200/70 dark:text-surface-200/70 light:text-surface-700 mb-2">Platform</label>
            <div className="grid grid-cols-2 gap-2">
              {platforms.map(p => (
                <button key={p.value} onClick={() => setForm(f => ({ ...f, platform: p.value }))}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm transition-all ${form.platform === p.value
                    ? 'bg-primary-500/15 text-primary-400 border border-primary-500/30 shadow-sm'
                    : 'bg-white/5 dark:bg-white/5 light:bg-surface-50 text-surface-200/60 dark:text-surface-200/60 light:text-surface-700/60 border border-white/5 dark:border-white/5 light:border-surface-200 hover:border-white/10'
                  }`}>
                  <span className="text-lg">{p.emoji}</span> {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-medium text-surface-200/70 dark:text-surface-200/70 light:text-surface-700 mb-1.5">Topic *</label>
            <input type="text" value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-white/5 dark:bg-white/5 light:bg-surface-50 border border-white/10 dark:border-white/10 light:border-surface-200 text-white dark:text-white light:text-surface-900 placeholder-surface-200/30 outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm"
              placeholder="e.g., AI in digital marketing, startup tips..." />
          </div>

          {/* Tone */}
          <div>
            <label className="block text-sm font-medium text-surface-200/70 dark:text-surface-200/70 light:text-surface-700 mb-2">Tone</label>
            <div className="grid grid-cols-3 gap-2">
              {tones.map(t => (
                <button key={t.value} onClick={() => setForm(f => ({ ...f, tone: t.value }))}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${form.tone === t.value
                    ? 'bg-primary-500/15 text-primary-400 border border-primary-500/30'
                    : 'bg-white/5 dark:bg-white/5 light:bg-surface-50 text-surface-200/50 dark:text-surface-200/50 light:text-surface-700/60 border border-white/5 dark:border-white/5 light:border-surface-200 hover:border-white/10'
                  }`}>
                  <span>{t.emoji}</span> {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Type */}
          <div>
            <label className="block text-sm font-medium text-surface-200/70 dark:text-surface-200/70 light:text-surface-700 mb-2">Content Type</label>
            <div className="flex flex-wrap gap-2">
              {contentTypes.map(c => (
                <button key={c.value} onClick={() => setForm(f => ({ ...f, contentType: c.value }))}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${form.contentType === c.value
                    ? 'bg-accent-500/15 text-accent-400 border border-accent-500/30'
                    : 'bg-white/5 dark:bg-white/5 light:bg-surface-50 text-surface-200/50 dark:text-surface-200/50 light:text-surface-700/60 border border-white/5 dark:border-white/5 light:border-surface-200 hover:border-white/10'
                  }`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={generate} disabled={loading || !form.topic.trim()}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold text-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Generate Content
              </>
            )}
          </button>
        </div>

        {/* Output Panel */}
        <div className="space-y-4">
          {loading && (
            <div className="p-6 rounded-2xl bg-surface-800/50 dark:bg-surface-800/50 light:bg-white border border-white/5 dark:border-white/5 light:border-surface-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-primary-500/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary-400 animate-pulse-subtle" />
                </div>
                <div>
                  <div className="h-4 w-32 rounded skeleton mb-1" />
                  <div className="h-3 w-48 rounded skeleton" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 rounded skeleton w-full" />
                <div className="h-4 rounded skeleton w-5/6" />
                <div className="h-4 rounded skeleton w-4/6" />
                <div className="h-4 rounded skeleton w-3/4" />
              </div>
            </div>
          )}

          {result && !loading && (
            <>
              {/* Caption */}
              <div className="p-6 rounded-2xl bg-surface-800/50 dark:bg-surface-800/50 light:bg-white border border-white/5 dark:border-white/5 light:border-surface-200 animate-slide-up">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{platforms.find(p => p.value === result.platform)?.emoji}</span>
                    <h3 className="text-sm font-semibold text-white dark:text-white light:text-surface-900">Generated Caption</h3>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => copyText(result.caption, 'caption')} className="p-1.5 rounded-lg hover:bg-white/5 text-surface-200/50 hover:text-white transition-colors" title="Copy">
                      {copied === 'caption' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button onClick={generate} className="p-1.5 rounded-lg hover:bg-white/5 text-surface-200/50 hover:text-white transition-colors" title="Regenerate">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-surface-200/80 dark:text-surface-200/80 light:text-surface-700 leading-relaxed whitespace-pre-line">{result.caption}</p>
                <div className="flex items-center gap-2 mt-3 text-xs text-surface-200/40">
                  <span>{result.characterCount} / {result.characterLimit} characters</span>
                  <span>•</span>
                  <span className="capitalize">{result.tone} tone</span>
                </div>
              </div>

              {/* Hashtags */}
              <div className="p-6 rounded-2xl bg-surface-800/50 dark:bg-surface-800/50 light:bg-white border border-white/5 dark:border-white/5 light:border-surface-200 animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-primary-400" />
                    <h3 className="text-sm font-semibold text-white dark:text-white light:text-surface-900">Hashtags</h3>
                  </div>
                  <button onClick={() => copyText(result.hashtags.join(' '), 'hashtags')} className="p-1.5 rounded-lg hover:bg-white/5 text-surface-200/50 hover:text-white transition-colors">
                    {copied === 'hashtags' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.hashtags.map(h => (
                    <span key={h} className="px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-400 text-xs font-medium cursor-pointer hover:bg-primary-500/20 transition-colors" onClick={() => copyText(h, h)}>
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              <div className="p-6 rounded-2xl bg-surface-800/50 dark:bg-surface-800/50 light:bg-white border border-white/5 dark:border-white/5 light:border-surface-200 animate-slide-up" style={{ animationDelay: '200ms' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-semibold text-white dark:text-white light:text-surface-900">Content Suggestions</h3>
                </div>
                <ul className="space-y-2">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-surface-200/70 dark:text-surface-200/70 light:text-surface-700">
                      <span className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Save as draft */}
              <button onClick={saveAsPost} disabled={saving}
                className="w-full py-3 rounded-xl bg-white/5 dark:bg-white/5 light:bg-surface-50 border border-white/10 dark:border-white/10 light:border-surface-200 text-white dark:text-white light:text-surface-900 text-sm font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> {saving ? 'Saving...' : 'Save as Draft Post'}
              </button>
            </>
          )}

          {!result && !loading && (
            <div className="p-12 rounded-2xl bg-surface-800/50 dark:bg-surface-800/50 light:bg-white border border-white/5 dark:border-white/5 light:border-surface-200 border-dashed flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-primary-400/40" />
              </div>
              <h3 className="text-lg font-semibold text-white dark:text-white light:text-surface-900 mb-1">Ready to create</h3>
              <p className="text-sm text-surface-200/40 dark:text-surface-200/40 light:text-surface-700/50 max-w-xs">
                Configure your preferences and click Generate to create AI-powered content
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
