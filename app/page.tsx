'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Play, Maximize2, MoveRight, Send, CheckCircle2, Lock, X, Film, Smartphone, Flame, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface MediaProject {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url?: string;
  description?: string;
  media_type: 'video' | 'short' | 'reel';
  is_featured?: boolean;
}

// Initial Curated Media for Cenonmate
const defaultMediaItems: MediaProject[] = [
  {
    id: 'default-yt-1',
    title: 'Cenonmate Official Services & Visual Reel',
    video_url: 'https://www.youtube.com/watch?v=5438rqudvek',
    thumbnail_url: 'https://i.ytimg.com/vi/5438rqudvek/maxresdefault.jpg',
    description: 'Official agency services breakdown: AI Video Editing, 3D Product Design, and Cinematic Visuals.',
    media_type: 'video',
    is_featured: true,
  },
  {
    id: 'default-yt-2',
    title: 'Cenonmate 2026 AI Video Showreel',
    video_url: 'https://www.youtube.com/@Cenonmate-z6j',
    thumbnail_url: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=1600&auto=format&fit=crop',
    description: 'Commercial grade AI video editing, pacing, and sound design for global brands.',
    media_type: 'video',
    is_featured: false,
  },
  {
    id: 'default-short-1',
    title: 'Speed Edit: AI Visual Hook in 5 Seconds',
    video_url: 'https://www.youtube.com/@Cenonmate-z6j',
    thumbnail_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=1000&auto=format&fit=crop',
    description: 'How to retain 85% audience attention with pacing.',
    media_type: 'short',
  },
  {
    id: 'default-short-2',
    title: '3D Hyper-Realistic Product Simulation',
    video_url: 'https://www.youtube.com/@Cenonmate-z6j',
    thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
    description: 'From 2D concept to rotating 3D cinematic rendering.',
    media_type: 'short',
  },
  {
    id: 'default-reel-1',
    title: 'Cenonmate Instagram Reel: Neon Cyber Aesthetics',
    video_url: 'https://www.instagram.com/cenon_mate/',
    thumbnail_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop',
    description: 'Exclusive behind-the-scenes editing workflow.',
    media_type: 'reel',
  },
  {
    id: 'default-reel-2',
    title: 'AI Color Grading Before vs After',
    video_url: 'https://www.instagram.com/cenon_mate/',
    thumbnail_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop',
    description: 'Cinematic color profile matching using AI tools.',
    media_type: 'reel',
  },
];

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  let videoId = '';
  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
  } else if (url.includes('watch?v=')) {
    videoId = url.split('watch?v=')[1]?.split('&')[0] || '';
  } else if (url.includes('shorts/')) {
    videoId = url.split('shorts/')[1]?.split('?')[0] || '';
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : null;
}

// --- CUSTOM CURSOR ---
function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName.toLowerCase() === 'a' || target.tagName.toLowerCase() === 'button' || target.closest('a') || target.closest('button')) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-3 h-3 bg-white rounded-full pointer-events-none z-[100] mix-blend-difference hidden md:block"
      animate={{
        x: mousePosition.x - 6,
        y: mousePosition.y - 6,
        scale: isHovered ? 5 : 1,
        opacity: isHovered ? 0.4 : 1
      }}
      transition={{ type: "tween", ease: "backOut", duration: 0.1 }}
    />
  );
}

// --- MAIN PAGE ---
export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Parallax Values
  const yHero1 = useTransform(scrollYProgress, [0, 0.2], ["0%", "50%"]);
  const yHero2 = useTransform(scrollYProgress, [0, 0.2], ["0%", "-50%"]);
  const scaleVideo = useTransform(scrollYProgress, [0.05, 0.2], [0.8, 1]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  // Media State
  const [mediaItems, setMediaItems] = useState<MediaProject[]>(defaultMediaItems);
  const [activeFilter, setActiveFilter] = useState<'all' | 'video' | 'short' | 'reel'>('all');
  const [activeModalVideo, setActiveModalVideo] = useState<MediaProject | null>(null);

  // Contact Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function loadProjects() {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          // Merge Supabase items with defaults
          setMediaItems(data);
        }
      } catch (e) {
        console.error('Error loading Supabase media:', e);
      }
    }
    loadProjects();
  }, []);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (supabase) {
        await supabase.from('inquiries').insert([{ name, email, details }]);
      }
      setSubmitted(true);
      setName('');
      setEmail('');
      setDetails('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMedia = mediaItems.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.media_type === activeFilter;
  });

  const featuredVideo = mediaItems.find((v) => v.is_featured) || mediaItems[0];

  return (
    <div ref={containerRef} className="spotlight-wrapper min-h-[300vh] bg-black text-white selection:bg-white selection:text-black cursor-none">
      
      {/* --- CINEMATIC BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=3000&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/80 to-black" />
      </div>

      <div className="bg-noise" />
      <CustomCursor />
      
      {/* Floating Navbar */}
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-8 left-1/2 -translate-x-1/2 w-full max-w-[90vw] z-50 px-8 flex justify-between items-center mix-blend-difference"
      >
        <div className="text-xl font-medium tracking-tight">
          CENONMATE
        </div>
        <div className="hidden md:flex gap-12 text-[0.65rem] uppercase tracking-[0.2em] font-bold text-white/50">
          <a href="#showcase" className="hover:text-white transition-colors">Videos & Reels</a>
          <a href="#expertise" className="hover:text-white transition-colors">Expertise</a>
          <a href="#contact" className="hover:text-white transition-colors">Contact</a>
        </div>
        <a href="#contact" className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.2em] font-bold border border-white/20 px-6 py-3 rounded-full hover:bg-white hover:text-black transition-all duration-500">
          Available for Hire <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </a>
      </motion.nav>

      {/* Hero Section (Kinetic Typography) */}
      <section className="sticky top-0 h-screen flex flex-col justify-center items-center overflow-hidden z-10">
        <motion.div style={{ opacity: opacityHero }} className="w-full relative flex flex-col items-center">
          
          <motion.div style={{ y: yHero2 }} className="absolute z-0 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-900/20 to-purple-900/20 rounded-full blur-[100px] mix-blend-screen" />
          
          <motion.h1 
            style={{ x: useTransform(scrollYProgress, [0, 0.2], ["0%", "-30%"]) }}
            className="text-[12vw] font-medium leading-[0.8] tracking-tighter whitespace-nowrap z-10 text-outline mix-blend-difference cursor-default"
          >
            ARTIFICIAL
          </motion.h1>
          
          <motion.div 
            style={{ x: useTransform(scrollYProgress, [0, 0.2], ["0%", "30%"]) }}
            className="flex items-center gap-8 z-10"
          >
            <div className="hidden md:block w-32 h-[2px] bg-white/20" />
            <h1 className="text-[12vw] font-medium leading-[0.8] tracking-tighter whitespace-nowrap cursor-default">
              INTELLIGENCE
            </h1>
          </motion.div>

          <motion.p 
            style={{ y: yHero1 }}
            className="mt-16 text-lg md:text-xl text-white/40 max-w-xl mx-auto font-light text-center z-10"
          >
            Architecting high-end digital experiences. <br/>Video Editing • 3D Design • YouTube & Reels
          </motion.p>

        </motion.div>
      </section>

      {/* Expanding Main Featured Showreel */}
      <section id="work" className="relative z-20 w-full min-h-screen flex items-center justify-center bg-black">
        <motion.div 
          style={{ scale: scaleVideo }}
          className="relative w-[95vw] h-[80vh] md:h-[90vh] bg-[#0a0a0a] rounded-[2rem] overflow-hidden group border border-white/5"
        >
          <div 
            style={{ backgroundImage: `url(${featuredVideo?.thumbnail_url || 'https://i.ytimg.com/vi/5438rqudvek/maxresdefault.jpg'})` }}
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity group-hover:scale-105 transition-transform duration-[2s] ease-out" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          
          <button 
            onClick={() => setActiveModalVideo(featuredVideo)}
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
          >
            <div className="w-24 h-24 rounded-full border-[1px] border-white/20 flex items-center justify-center backdrop-blur-xl group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all duration-700">
              <Play className="w-8 h-8 text-white fill-white group-hover:text-black group-hover:fill-black ml-1 transition-colors" />
            </div>
          </button>

          <div className="absolute bottom-12 left-12 right-12 flex flex-col md:flex-row justify-between md:items-end gap-6 pointer-events-none">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/50 mb-3">Featured Showreel</p>
              <h2 className="text-4xl md:text-6xl font-medium tracking-tight">
                {featuredVideo?.title}
              </h2>
            </div>
            <div className="flex gap-4">
              <span className="glass-card px-6 py-2 rounded-full text-xs uppercase tracking-widest font-bold">YouTube</span>
              <span className="glass-card px-6 py-2 rounded-full text-xs uppercase tracking-widest font-bold">AI Video</span>
              <span className="glass-card px-6 py-2 rounded-full text-xs uppercase tracking-widest font-bold">Shorts</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ======================================================== */}
      {/* --- MASSIVE MEDIA SHOWCASE: VIDEOS, SHORTS & REELS --- */}
      {/* ======================================================== */}
      <section id="showcase" className="relative z-20 w-full bg-black py-36 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div>
              <div className="inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.3em] text-cyan-400 font-bold mb-3">
                <Flame className="w-4 h-4 text-cyan-400" /> Cenonmate Media Vault
              </div>
              <h2 className="text-4xl md:text-7xl font-light tracking-tight">
                VIDEOS, SHORTS <br /><span className="text-white/40">& INSTAGRAM REELS.</span>
              </h2>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2 bg-white/[0.03] p-1.5 rounded-full border border-white/10 backdrop-blur-xl">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-6 py-2.5 rounded-full text-xs uppercase tracking-widest font-bold transition-all ${
                  activeFilter === 'all' ? 'bg-white text-black shadow-lg' : 'text-white/50 hover:text-white'
                }`}
              >
                All ({mediaItems.length})
              </button>
              <button
                onClick={() => setActiveFilter('video')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs uppercase tracking-widest font-bold transition-all ${
                  activeFilter === 'video' ? 'bg-red-500 text-white shadow-lg' : 'text-white/50 hover:text-white'
                }`}
              >
                <Film className="w-3.5 h-3.5" /> Videos (16:9)
              </button>
              <button
                onClick={() => setActiveFilter('short')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs uppercase tracking-widest font-bold transition-all ${
                  activeFilter === 'short' ? 'bg-red-600 text-white shadow-lg' : 'text-white/50 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> Shorts (9:16)
              </button>
              <button
                onClick={() => setActiveFilter('reel')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs uppercase tracking-widest font-bold transition-all ${
                  activeFilter === 'reel' ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg' : 'text-white/50 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> Reels (9:16)
              </button>
            </div>
          </div>

          {/* Dynamic Grid: Landscape Videos & Vertical Phone Frames */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMedia.map((item, index) => {
              const isVertical = item.media_type === 'short' || item.media_type === 'reel';

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`group relative rounded-3xl overflow-hidden glass-card border border-white/10 flex flex-col justify-between ${
                    isVertical ? 'aspect-[9/16] md:max-w-[340px] mx-auto w-full' : 'aspect-video col-span-1 md:col-span-2 lg:col-span-2'
                  }`}
                >
                  {/* Poster / Thumbnail Image */}
                  <div
                    style={{ backgroundImage: `url(${item.thumbnail_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000'})` }}
                    className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-85 group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                  {/* Badge on Top */}
                  <div className="relative z-10 p-6 flex justify-between items-center">
                    <span
                      className={`text-[0.65rem] uppercase tracking-widest font-black px-3 py-1 rounded-full border ${
                        item.media_type === 'video'
                          ? 'bg-red-500/20 text-red-400 border-red-500/40'
                          : item.media_type === 'short'
                          ? 'bg-red-600/30 text-red-300 border-red-500/40'
                          : 'bg-pink-600/30 text-pink-300 border-pink-500/40'
                      }`}
                    >
                      {item.media_type === 'video' ? 'YouTube 16:9' : item.media_type === 'short' ? 'YouTube Short' : 'Instagram Reel'}
                    </span>

                    <a
                      href={item.video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-9 h-9 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:scale-110 transition-all"
                      title="Open in platform"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Center Play Button Overlay */}
                  <div className="relative z-10 flex items-center justify-center my-auto">
                    <button
                      onClick={() => {
                        if (getYouTubeEmbedUrl(item.video_url)) {
                          setActiveModalVideo(item);
                        } else {
                          window.open(item.video_url, '_blank');
                        }
                      }}
                      className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:scale-125 group-hover:bg-white group-hover:text-black transition-all duration-500 shadow-2xl"
                    >
                      <Play className="w-6 h-6 fill-current ml-1" />
                    </button>
                  </div>

                  {/* Content & Details at Bottom */}
                  <div className="relative z-10 p-6 space-y-2">
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-white/60 font-light line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Social Channel Links Banner */}
          <div className="mt-20 p-8 md:p-12 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h4 className="text-2xl font-bold mb-1">Want to see more live daily edits?</h4>
              <p className="text-sm text-white/40">Subscribe to our official YouTube channel and follow us on Instagram.</p>
            </div>
            <div className="flex gap-4">
              <a
                href="https://www.youtube.com/@Cenonmate-z6j"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-full bg-red-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-red-500 transition-all flex items-center gap-2"
              >
                <Film className="w-4 h-4" /> YouTube @Cenonmate
              </a>
              <a
                href="https://www.instagram.com/cenon_mate/"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-2"
              >
                <Smartphone className="w-4 h-4" /> Instagram @cenon_mate
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* --- VIDEO PLAYER MODAL --- */}
      {/* ======================================================== */}
      <AnimatePresence>
        {activeModalVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12"
            onClick={() => setActiveModalVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`relative bg-black rounded-3xl overflow-hidden border border-white/20 shadow-2xl ${
                activeModalVideo.media_type === 'short' || activeModalVideo.media_type === 'reel'
                  ? 'w-full max-w-[420px] aspect-[9/16]'
                  : 'w-full max-w-5xl aspect-video'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveModalVideo(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              {getYouTubeEmbedUrl(activeModalVideo.video_url) ? (
                <iframe
                  src={getYouTubeEmbedUrl(activeModalVideo.video_url)!}
                  title={activeModalVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                  <Film className="w-16 h-16 text-cyan-400 mb-4 animate-bounce" />
                  <h3 className="text-2xl font-bold mb-2">{activeModalVideo.title}</h3>
                  <p className="text-sm text-white/50 mb-6">{activeModalVideo.description}</p>
                  <a
                    href={activeModalVideo.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-8 py-3.5 bg-white text-black font-bold rounded-full text-xs uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center gap-2"
                  >
                    Watch Directly on Platform <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Scroll Expertise Section */}
      <section id="expertise" className="relative z-20 w-full bg-black py-48">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-12 md:gap-32">
            
            {/* Sticky Sidebar */}
            <div className="md:w-1/3">
              <div className="sticky top-48">
                <h2 className="text-[0.7rem] uppercase tracking-[0.3em] text-white/40 mb-6">Our Arsenal</h2>
                <h3 className="text-4xl md:text-5xl font-light tracking-tight leading-tight">
                  Crafting the impossible.
                </h3>
                <p className="mt-8 text-white/40 font-light leading-relaxed">
                  We don&apos;t use templates. We build bespoke visual architectures using advanced AI frameworks and raw creativity.
                </p>
              </div>
            </div>

            {/* Scrollable Cards */}
            <div className="md:w-2/3 space-y-8">
              {[
                { num: '01', title: 'AI Cinematic Editing', desc: 'Transforming raw footage into high-retention, cinematic masterpieces. We use AI to enhance color, pacing, and visual effects.' },
                { num: '02', title: 'Hyper-Realistic 3D', desc: 'Product designs and visualizations that look indistinguishable from reality. Elevate your brand perception instantly.' },
                { num: '03', title: 'Generative Assets', desc: 'Custom AI-generated graphics, environments, and concept art tailored exclusively for your project.' },
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="glass-card p-12 md:p-16 rounded-[2rem] group"
                >
                  <div className="text-[0.8rem] uppercase tracking-[0.2em] text-white/30 mb-8 font-bold">{item.num}</div>
                  <h4 className="text-3xl md:text-4xl font-medium tracking-tight mb-6">{item.title}</h4>
                  <p className="text-lg text-white/40 font-light leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Contact & Lead Section (Synced to Supabase) */}
      <section className="relative z-20 w-full bg-black py-24 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <div className="glass-card p-8 md:p-16 rounded-[2.5rem]">
            <h3 className="text-3xl md:text-5xl font-light tracking-tight mb-4">Start a Collaboration</h3>
            <p className="text-white/40 font-light mb-10">Send your project brief. We respond within 24 hours.</p>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center gap-4">
                <CheckCircle2 className="w-8 h-8 text-cyan-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-lg">Inquiry Received</h4>
                  <p className="text-sm text-cyan-300/80 mt-1">Thank you. Shoayibul will review your project and get back to you shortly.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-white/40 font-bold block mb-2">Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-white transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-white/40 font-bold block mb-2">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-white transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-white/40 font-bold block mb-2">Project Vision</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your video editing or 3D product design goals..."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-white transition-all text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-xl bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-gray-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" /> {submitting ? 'Submitting...' : 'Send Inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Massive Typography Footer */}
      <footer id="contact" className="relative z-20 w-full min-h-[80vh] bg-black flex flex-col justify-end overflow-hidden pb-12">
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/10 to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 w-full flex flex-col md:flex-row justify-between items-end gap-16 mb-24 relative z-10">
          <div className="space-y-8 w-full md:w-auto">
            <h2 className="text-4xl md:text-6xl font-light tracking-tighter">
              Let&apos;s craft <br/><i className="text-white/50">greatness.</i>
            </h2>
            <div className="space-y-2">
              <a href="mailto:hello@cenonmate.com" className="inline-flex items-center gap-4 text-sm uppercase tracking-[0.2em] font-bold border-b border-white/20 pb-2 hover:border-white transition-all group">
                hello@cenonmate.com <MoveRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </a>
              <div className="pt-2">
                <Link href="/admin" className="inline-flex items-center gap-2 text-xs text-white/20 hover:text-white/60 transition-colors">
                  <Lock className="w-3 h-3" /> Admin Dashboard
                </Link>
              </div>
            </div>
          </div>

          {/* Unique Social Links */}
          <div className="flex gap-4 w-full md:w-auto">
            <a href="https://www.youtube.com/@Cenonmate-z6j" target="_blank" rel="noreferrer" className="glass-card w-24 h-24 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all duration-500">
              <span className="text-[0.6rem] uppercase tracking-widest font-bold">YouTube</span>
            </a>
            <a href="https://www.instagram.com/cenon_mate/" target="_blank" rel="noreferrer" className="glass-card w-24 h-24 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all duration-500">
              <span className="text-[0.6rem] uppercase tracking-widest font-bold">Insta</span>
            </a>
            <a href="https://www.facebook.com/profile.php?id=61594673284423" target="_blank" rel="noreferrer" className="glass-card w-24 h-24 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all duration-500">
              <span className="text-[0.6rem] uppercase tracking-widest font-bold">FB</span>
            </a>
          </div>
        </div>

        {/* Giant Footer Marquee */}
        <div className="w-full overflow-hidden whitespace-nowrap relative z-10 mix-blend-difference opacity-50">
          <motion.div 
            className="flex text-[15vw] font-black tracking-tighter leading-none"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          >
            <span className="pr-12">CENONMATE</span>
            <span className="pr-12">CENONMATE</span>
            <span className="pr-12">CENONMATE</span>
            <span className="pr-12">CENONMATE</span>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
