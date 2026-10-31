'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { VideoItem } from './types';

interface MediaTabProps {
  videos: VideoItem[];
  loading: boolean;
  onRefresh: () => void;
  onNotify: (type: 'success' | 'error', text: string) => void;
}

export default function MediaTab({ videos, loading, onRefresh, onNotify }: MediaTabProps) {
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [description, setDescription] = useState('');
  const [mediaType, setMediaType] = useState<'video' | 'short' | 'reel'>('video');
  const [isFeatured, setIsFeatured] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fetchingThumb, setFetchingThumb] = useState(false);

  const handleAutoFetchThumb = async (urlToFetch?: string) => {
    const target = urlToFetch || videoUrl;
    if (!target) return;
    setFetchingThumb(true);
    try {
      const res = await fetch(`/api/fetch-thumbnail?url=${encodeURIComponent(target)}`);
      const data = await res.json();
      if (data.success && data.thumbnailUrl) {
        setThumbnailUrl(data.thumbnailUrl);
        onNotify('success', 'Real video cover image successfully detected!');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFetchingThumb(false);
    }
  };

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let finalThumb = thumbnailUrl;
      if (!finalThumb && videoUrl) {
        try {
          const res = await fetch(`/api/fetch-thumbnail?url=${encodeURIComponent(videoUrl)}`);
          const data = await res.json();
          if (data.success && data.thumbnailUrl) {
            finalThumb = data.thumbnailUrl;
          }
        } catch {}
      }

      const res = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          videoUrl,
          thumbnailUrl: finalThumb || null,
          description: description || null,
          mediaType,
          isFeatured,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add media');

      onNotify('success', 'Media item successfully published to website!');
      setTitle('');
      setVideoUrl('');
      setThumbnailUrl('');
      setDescription('');
      setIsFeatured(false);
      onRefresh();
    } catch (err: any) {
      onNotify('error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media item?')) return;

    try {
      const res = await fetch(`/api/admin/videos?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete media');

      onNotify('success', 'Media item deleted.');
      onRefresh();
    } catch (err: any) {
      onNotify('error', err.message);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Add Media Form */}
      <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 md:p-8 h-fit">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-cyan-400" /> Add New Media
        </h2>
        <form onSubmit={handleAddMedia} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 block mb-2 font-semibold">Format Type *</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMediaType('video')}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                  mediaType === 'video'
                    ? 'bg-red-500 text-white border-red-400 shadow-md'
                    : 'bg-white/5 border-white/10 text-gray-400'
                }`}
              >
                Video (16:9)
              </button>
              <button
                type="button"
                onClick={() => setMediaType('short')}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                  mediaType === 'short'
                    ? 'bg-red-600 text-white border-red-500 shadow-md'
                    : 'bg-white/5 border-white/10 text-gray-400'
                }`}
              >
                YT Short (9:16)
              </button>
              <button
                type="button"
                onClick={() => setMediaType('reel')}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                  mediaType === 'reel'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-pink-400 shadow-md'
                    : 'bg-white/5 border-white/10 text-gray-400'
                }`}
              >
                Insta Reel (9:16)
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1 font-semibold">Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. AI Video Breakdown or Product 3D"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1 font-semibold">Video URL (YouTube or Instagram Reel) *</label>
            <input
              type="url"
              required
              placeholder="https://youtube.com/watch?v=... or https://instagram.com/reel/..."
              value={videoUrl}
              onBlur={() => {
                if (videoUrl && !thumbnailUrl) handleAutoFetchThumb();
              }}
              onChange={(e) => {
                const val = e.target.value;
                setVideoUrl(val);
                if (val.includes('instagram.com/reel') || val.includes('instagram.com/p') || val.includes('instagr.am')) {
                  setMediaType('reel');
                } else if (val.includes('youtube.com/shorts') || val.includes('shorts/')) {
                  setMediaType('short');
                } else if (val.includes('youtube.com/watch') || val.includes('youtu.be/')) {
                  setMediaType('video');
                }
              }}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400"
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-[0.65rem] text-gray-400">
                ✨ Auto-detects YouTube, Shorts, and Instagram Reels
              </p>
              <button
                type="button"
                onClick={() => handleAutoFetchThumb()}
                disabled={fetchingThumb || !videoUrl}
                className="text-[0.65rem] font-bold text-cyan-400 hover:underline disabled:opacity-40"
              >
                {fetchingThumb ? 'Detecting Cover...' : 'Auto-Get Video Cover'}
              </button>
            </div>
          </div>

          {thumbnailUrl && (
            <div className="space-y-1">
              <span className="text-[0.65rem] text-gray-400 font-semibold block">Detected Video Cover Picture:</span>
              <div 
                className="relative rounded-xl overflow-hidden border border-white/20 h-32 bg-cover bg-center"
                style={{ backgroundImage: `url(${thumbnailUrl})` }}
              >
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider bg-black/80 px-3 py-1 rounded-full text-green-400 border border-green-500/30">
                    ✓ Real Video Picture Applied
                  </span>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs text-gray-400 block mb-1 font-semibold">Custom Cover Thumbnail URL (Optional)</label>
            <input
              type="url"
              placeholder="Auto-filled or custom image link..."
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1 font-semibold">Short Caption / Description</label>
            <textarea
              rows={2}
              placeholder="Highlights of this edit..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          {mediaType === 'video' && (
            <div className="flex items-center gap-3 pt-1">
              <input
                type="checkbox"
                id="featured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 rounded"
              />
              <label htmlFor="featured" className="text-xs text-gray-300 cursor-pointer">
                Set as Main Homepage Featured Showreel
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-cyan-400 text-black font-bold py-3.5 rounded-xl hover:bg-cyan-300 transition-all disabled:opacity-50 text-xs uppercase tracking-wider"
          >
            {submitting ? 'Publishing...' : 'Publish to Website'}
          </button>
        </form>
      </div>

      {/* Published Media List */}
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-xl font-bold mb-4">Published Media Items ({videos.length})</h2>
        {loading && <p className="text-gray-500">Loading...</p>}

        {videos.map((item) => (
          <div
            key={item.id}
            className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-white/20 transition-all"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[0.65rem] uppercase tracking-wider bg-white/10 border border-white/20 px-2 py-0.5 rounded-full font-bold">
                  {item.media_type || 'video'}
                </span>
                <h3 className="font-bold text-base text-white">{item.title}</h3>
                {item.is_featured && (
                  <span className="text-[0.65rem] uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-bold">
                    Featured
                  </span>
                )}
              </div>
              <a
                href={item.video_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-gray-400 hover:text-cyan-400 truncate block max-w-md"
              >
                {item.video_url}
              </a>
            </div>

            <button
              onClick={() => handleDeleteMedia(item.id)}
              className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all self-end sm:self-center"
              title="Delete Item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
