import { useState } from 'react';
import { FiX, FiTwitter, FiLinkedin, FiInstagram, FiFacebook, FiHeart, FiMessageSquare, FiRepeat, FiShare2, FiBookmark } from 'react-icons/fi';

export default function PostPreviewModal({ post, onClose }) {
  const [activeTab, setActiveTab] = useState(post?.platform || 'twitter');

  if (!post) return null;

  const content = post.content || '';
  const mediaUrl = post.mediaUrl || post.mediaUrls?.[0] || '';
  const authorName = 'Social Automation Demo';
  const authorHandle = '@social_auto_ai';
  const authorAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

  // Platform limits & character counts
  const limits = {
    twitter: 280,
    linkedin: 3000,
    instagram: 2200,
    facebook: 63206
  };

  const currentLimit = limits[activeTab] || 280;
  const isOverLimit = content.length > currentLimit;

  // Extract hashtags count
  const hashtags = (content.match(/#[a-zA-Z0-0_]+/g) || []).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-surface-900 border border-surface-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-800 bg-surface-950">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            Multi-Platform Post Preview
          </h3>

          <button onClick={onClose} className="text-surface-400 hover:text-white p-1 rounded-lg">
            <FiX size={20} />
          </button>
        </div>

        {/* Platform Selector Tabs */}
        <div className="flex items-center gap-2 p-3 bg-surface-900 border-b border-surface-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab('twitter')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'twitter' 
                ? 'bg-sky-500/20 border border-sky-500/40 text-sky-400' 
                : 'text-surface-400 hover:text-white bg-surface-950/60'
            }`}
          >
            <FiTwitter size={15} /> Twitter / X
          </button>

          <button
            onClick={() => setActiveTab('linkedin')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'linkedin' 
                ? 'bg-blue-600/20 border border-blue-500/40 text-blue-400' 
                : 'text-surface-400 hover:text-white bg-surface-950/60'
            }`}
          >
            <FiLinkedin size={15} /> LinkedIn
          </button>

          <button
            onClick={() => setActiveTab('instagram')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'instagram' 
                ? 'bg-pink-500/20 border border-pink-500/40 text-pink-400' 
                : 'text-surface-400 hover:text-white bg-surface-950/60'
            }`}
          >
            <FiInstagram size={15} /> Instagram
          </button>

          <button
            onClick={() => setActiveTab('facebook')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'facebook' 
                ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-400' 
                : 'text-surface-400 hover:text-white bg-surface-950/60'
            }`}
          >
            <FiFacebook size={15} /> Facebook
          </button>
        </div>

        {/* Content Body / Live Card Simulator */}
        <div className="p-6 overflow-y-auto bg-surface-950/50 flex-1 flex justify-center items-center">
          
          {/* TWITTER PREVIEW */}
          {activeTab === 'twitter' && (
            <div className="w-full max-w-md bg-black border border-surface-800 p-4 rounded-2xl text-white font-sans space-y-3">
              <div className="flex items-start gap-3">
                <img src={authorAvatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-white">{authorName}</span>
                      <span className="text-surface-500 text-xs ml-1.5">{authorHandle}</span>
                    </div>
                    <FiTwitter className="text-sky-400" size={16} />
                  </div>
                  <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
                </div>
              </div>

              {mediaUrl && (
                <div className="ml-13 rounded-2xl overflow-hidden border border-surface-800">
                  <img src={mediaUrl} alt="Media" className="w-full max-h-64 object-cover" />
                </div>
              )}

              <div className="ml-13 pt-2 flex items-center justify-between text-surface-500 text-xs">
                <span className="flex items-center gap-1.5"><FiMessageSquare size={14} /> 12</span>
                <span className="flex items-center gap-1.5"><FiRepeat size={14} /> 4</span>
                <span className="flex items-center gap-1.5"><FiHeart size={14} /> 89</span>
                <span className="flex items-center gap-1.5"><FiShare2 size={14} /></span>
              </div>
            </div>
          )}

          {/* LINKEDIN PREVIEW */}
          {activeTab === 'linkedin' && (
            <div className="w-full max-w-md bg-surface-900 border border-surface-800 p-4 rounded-2xl text-white font-sans space-y-3">
              <div className="flex items-center gap-3">
                <img src={authorAvatar} alt="Avatar" className="w-11 h-11 rounded-full object-cover" />
                <div>
                  <div className="font-bold text-sm text-white flex items-center gap-1">
                    {authorName} <FiLinkedin className="text-blue-500 inline" size={14} />
                  </div>
                  <div className="text-xs text-surface-400">AI Automation Platform • 1h</div>
                </div>
              </div>

              <p className="text-sm leading-relaxed whitespace-pre-wrap text-surface-200">{content}</p>

              {mediaUrl && (
                <div className="-mx-4 overflow-hidden border-y border-surface-800">
                  <img src={mediaUrl} alt="Media" className="w-full max-h-72 object-cover" />
                </div>
              )}

              <div className="pt-2 flex items-center justify-between text-surface-400 text-xs border-t border-surface-800/80">
                <span className="hover:bg-surface-800 p-2 rounded-lg cursor-pointer">Like</span>
                <span className="hover:bg-surface-800 p-2 rounded-lg cursor-pointer">Comment</span>
                <span className="hover:bg-surface-800 p-2 rounded-lg cursor-pointer">Repost</span>
                <span className="hover:bg-surface-800 p-2 rounded-lg cursor-pointer">Send</span>
              </div>
            </div>
          )}

          {/* INSTAGRAM PREVIEW */}
          {activeTab === 'instagram' && (
            <div className="w-full max-w-sm bg-black border border-surface-800 rounded-2xl text-white font-sans overflow-hidden">
              <div className="p-3 flex items-center justify-between border-b border-surface-800/80">
                <div className="flex items-center gap-2.5">
                  <img src={authorAvatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-pink-500" />
                  <span className="font-semibold text-xs text-white">{authorHandle.replace('@', '')}</span>
                </div>
                <FiInstagram className="text-pink-500" size={18} />
              </div>

              <div className="aspect-square bg-surface-950 flex items-center justify-center overflow-hidden">
                {mediaUrl ? (
                  <img src={mediaUrl} alt="Media" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-6 text-surface-500 text-xs">
                    (No media attached. Instagram recommended to have visual media)
                  </div>
                )}
              </div>

              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-3">
                    <FiHeart size={20} className="hover:text-pink-500 cursor-pointer" />
                    <FiMessageSquare size={20} className="cursor-pointer" />
                    <FiShare2 size={20} className="cursor-pointer" />
                  </div>
                  <FiBookmark size={20} className="cursor-pointer" />
                </div>

                <div className="text-xs text-surface-200">
                  <span className="font-bold text-white mr-1.5">{authorHandle.replace('@', '')}</span>
                  {content}
                </div>
              </div>
            </div>
          )}

          {/* FACEBOOK PREVIEW */}
          {activeTab === 'facebook' && (
            <div className="w-full max-w-md bg-surface-900 border border-surface-800 p-4 rounded-2xl text-white font-sans space-y-3">
              <div className="flex items-center gap-3">
                <img src={authorAvatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <div className="font-bold text-sm text-white flex items-center gap-1.5">
                    {authorName} <FiFacebook className="text-indigo-500" size={15} />
                  </div>
                  <div className="text-xs text-surface-400">Just now • 🌎</div>
                </div>
              </div>

              <p className="text-sm text-surface-200 leading-relaxed whitespace-pre-wrap">{content}</p>

              {mediaUrl && (
                <div className="-mx-4 overflow-hidden border-y border-surface-800">
                  <img src={mediaUrl} alt="Media" className="w-full max-h-72 object-cover" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Analytics & Compliance Bar */}
        <div className="p-4 bg-surface-950 border-t border-surface-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className={`font-semibold ${isOverLimit ? 'text-rose-400' : 'text-surface-400'}`}>
              Characters: {content.length} / {currentLimit}
            </span>
            <span className="text-surface-400">Hashtags: {hashtags}</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition"
          >
            Done Previewing
          </button>
        </div>
      </div>
    </div>
  );
}
