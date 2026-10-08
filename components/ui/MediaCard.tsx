'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Volume2, VolumeX, Maximize2, X } from 'lucide-react';
import Image from 'next/image';
import { parseMediaUrl } from '@/lib/utils/mediaParser';

const FALLBACK_THUMB = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23000000"/><stop offset="100%" stop-color="%23061c29"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g)"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%2300ffff" opacity="0.3" letter-spacing="4">MEDIA UNAVAILABLE</text></svg>';

export interface MediaProject {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url?: string;
  description?: string;
  media_type: 'video' | 'short' | 'reel';
  is_featured?: boolean;
}

interface MediaCardProps {
  item: MediaProject;
  onOpenModal: (item: MediaProject) => void;
  autoPreviewEnabled: boolean;
}

export default function MediaCard({ item, onOpenModal, autoPreviewEnabled }: MediaCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [thumbSrc, setThumbSrc] = useState<string>(FALLBACK_THUMB);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  const parsed = parseMediaUrl(item.video_url);
  const isVertical = item.media_type === 'short' || item.media_type === 'reel';

  useEffect(() => {
    if (item.thumbnail_url && item.thumbnail_url.trim()) {
      setThumbSrc(item.thumbnail_url);
    } else if (parsed.thumbnailUrl) {
      setThumbSrc(parsed.thumbnailUrl);
    } else if (parsed.platform === 'instagram') {
      fetch(`/api/fetch-thumbnail?url=${encodeURIComponent(item.video_url)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.thumbnailUrl) {
            setThumbSrc(data.thumbnailUrl);
          }
        })
        .catch(() => {});
    }
  }, [item, parsed]);

  const handleMouseEnter = () => {
    if (!autoPreviewEnabled) return;
    hoverTimer.current = setTimeout(() => {
      setIsPlaying(true);
      setIsMuted(true);
    }, 450);
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setIsPlaying(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className={`group relative overflow-hidden rounded-2xl cursor-pointer ${
        isVertical ? 'aspect-[9/16]' : 'aspect-video col-span-1 md:col-span-2'
      } border border-white/5 bg-white/5 hover:border-cyan-500/30 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transition-all shadow-xl shadow-black/50`}
      tabIndex={0}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onOpenModal(item)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenModal(item);
        }
      }}
    >
      <AnimatePresence>
        {isPlaying && parsed.embedUrl ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 bg-black"
          >
            {parsed.platform === 'youtube' ? (
              <iframe
                src={`${parsed.embedUrl}&mute=${isMuted ? '1' : '0'}`}
                className="w-full h-full object-cover scale-150 pointer-events-none"
                allow="autoplay; encrypted-media"
              />
            ) : parsed.platform === 'instagram' ? (
              <iframe
                src={parsed.embedUrl}
                className="w-full h-full object-cover scale-[1.02] pointer-events-none bg-black"
                allow="autoplay"
              />
            ) : (
              <video
                src={parsed.embedUrl}
                autoPlay
                muted={isMuted}
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            )}

            <div className="absolute top-4 right-4 z-20 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                }}
                className="p-2.5 rounded-full bg-black/60 hover:bg-black border border-white/10 text-white backdrop-blur-md transition-all"
                aria-label={isMuted ? "Unmute video" : "Mute video"}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="absolute inset-0 opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105">
              <Image
                src={thumbSrc}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-400/30 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-[0_0_30px_rgba(0,255,255,0.3)]">
                <Play className="w-6 h-6 text-cyan-300 ml-1" fill="currentColor" />
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 z-20 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 bg-black/40 backdrop-blur-md text-[10px] font-bold tracking-widest text-white/70 uppercase mb-3">
                {item.media_type}
              </div>
              <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                {item.title}
              </h3>
              {item.description && (
                <p className="text-sm text-white/50 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
