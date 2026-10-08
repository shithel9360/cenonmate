'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import MediaCard, { MediaProject } from '@/components/ui/MediaCard';
import { parseMediaUrl } from '@/lib/utils/mediaParser';

export default function MediaGallery({ items }: { items: MediaProject[] }) {
  const [filter, setFilter] = useState<'all' | 'video' | 'short' | 'reel'>('all');
  const [selectedVideo, setSelectedVideo] = useState<MediaProject | null>(null);

  // Compute available filters to hide empty ones
  const availableTypes = Array.from(new Set(items.map(i => i.media_type)));
  
  const filters = [
    { id: 'all', label: 'All Work' },
    ...(availableTypes.includes('video') ? [{ id: 'video', label: 'Cinematic Videos' }] : []),
    ...(availableTypes.includes('short') ? [{ id: 'short', label: 'Shorts' }] : []),
    ...(availableTypes.includes('reel') ? [{ id: 'reel', label: 'Instagram Reels' }] : []),
  ];

  const filteredItems = items.filter(
    (item) => filter === 'all' || item.media_type === filter
  );

  return (
    <>
      <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-16">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as any)}
            className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
              filter === f.id
                ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/5'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <motion.div 
        layout 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
      >
        <AnimatePresence>
          {filteredItems.map((item) => (
            <MediaCard 
              key={item.id} 
              item={item} 
              onOpenModal={setSelectedVideo}
              autoPreviewEnabled={true} 
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Cinema Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
            onClick={() => setSelectedVideo(null)}
          >
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-8 right-8 p-3 rounded-full bg-white/10 text-white hover:bg-white hover:text-black transition-all z-50"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`relative w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 ${
                selectedVideo.media_type === 'short' || selectedVideo.media_type === 'reel'
                  ? 'max-w-md aspect-[9/16]'
                  : 'aspect-video'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const parsed = parseMediaUrl(selectedVideo.video_url);
                if (parsed.platform === 'youtube') {
                  return (
                    <iframe
                      src={`${parsed.embedUrl}&mute=0`}
                      className="w-full h-full"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  );
                }
                if (parsed.platform === 'instagram') {
                  return (
                    <iframe
                      src={parsed.embedUrl}
                      className="w-full h-full bg-black"
                      allow="autoplay"
                      allowFullScreen
                    />
                  );
                }
                return (
                  <video
                    src={parsed.embedUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-cover"
                  />
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
