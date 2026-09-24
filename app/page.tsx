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

// --- CUSTOM CURSOR (DESKTOP ONLY) ---
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
      if (target && (target.tagName.toLowerCase() === 'a' || target.tagName.toLowerCase() === 'button' || target.closest('a') || target.closest('button'))) {
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Parallax Values for desktop
  const xHeroLeft = useTransform(scrollYProgress, [0, 0.15], ["0%", "-15%"]);
  const xHeroRight = useTransform(scrollYProgress, [0, 0.15], ["0%", "15%"]);
  const scaleVideo = useTransform(scrollYProgress, [0.05, 0.2], [0.92, 1]);

  // Media State
  const [mediaItems, setMediaItems] = useState<MediaProject[]>(defaultMediaItems);
  const [activeFilter, setActiveFilter] = useState<'all' | 'video' | 'short' | 'reel'>('all');
  const [activeModalVideo, setActiveModalVideo] = useState<MediaProject | null>(null);

  // Dynamic CMS States from Supabase
  const [heroBadge, setHeroBadge] = useState('AI Video Agency & 3D Design');
  const [headline1, setHeadline1] = useState('ARTIFICIAL');
  const [headline2, setHeadline2] = useState('INTELLIGENCE');
  const [heroSubtitle, setHeroSubtitle] = useState('Architecting high-converting visual assets. Specialized in next-gen AI video editing, 3D product simulation, and viral storytelling.');
  
  const [services, setServices] = useState([
    { num: '01', title: 'AI Cinematic Editing', desc: 'Transforming raw footage into high-retention, cinematic masterpieces. Advanced audio design, pacing, and visual effects.' },
    { num: '02', title: 'Hyper-Realistic 3D Products', desc: 'Photorealistic mockups and dynamic rotating simulations that skyrocket your brand perception.' },
    { num: '03', title: 'Custom Generative Assets', desc: 'Bespoke AI-generated graphics, futuristic environments, and concept imagery tailored exclusively for your project.' },
  ]);

  const [contactEmail, setContactEmail] = useState('hello@cenonmate.com');
  const [youtubeUrl, setYoutubeUrl] = useState('https://www.youtube.com/@Cenonmate-z6j');
  const [instaUrl, setInstaUrl] = useState('https://www.instagram.com/cenon_mate/');
  const [facebookUrl, setFacebookUrl] = useState('https://www.facebook.com/profile.php?id=61594673284423');

  // Contact Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!supabase) return;
      try {
        // Load Videos
        const { data: vData } = await supabase
          .from('videos')
          .select('*')
          .order('created_at', { ascending: false });

        if (vData && vData.length > 0) {
          setMediaItems(vData);
        }

        // Load CMS Site Settings
        const { data: sData } = await supabase.from('site_settings').select('*');
        if (sData) {
          sData.forEach((item) => {
            if (item.key === 'hero_settings' && item.value) {
              const val = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
              if (val.badge) setHeroBadge(val.badge);
              if (val.headline_1) setHeadline1(val.headline_1);
              if (val.headline_2) setHeadline2(val.headline_2);
              if (val.subtitle) setHeroSubtitle(val.subtitle);
            }
            if (item.key === 'services_settings' && item.value) {
              const val = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
              if (Array.isArray(val)) setServices(val);
            }
            if (item.key === 'social_settings' && item.value) {
              const val = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
              if (val.email) setContactEmail(val.email);
              if (val.youtube) setYoutubeUrl(val.youtube);
              if (val.instagram) setInstaUrl(val.instagram);
              if (val.facebook) setFacebookUrl(val.facebook);
            }
          });
        }
      } catch (e) {
        console.error('Error loading Supabase data:', e);
      }
    }
    loadData();
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
    <div ref={containerRef} className="spotlight-wrapper min-h-screen bg-black text-white selection:bg-white selection:text-black md:cursor-none w-full overflow-x-hidden">
      
      {/* --- CINEMATIC BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=3000&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/80 to-black" />
      </div>

      <div className="bg-noise" />
      <CustomCursor />
      
      {/* Responsive Floating Navbar */}
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 md:top-8 left-1/2 -translate-x-1/2 w-[92%] max-w-6xl z-50 px-4 md:px-8 py-3 md:py-4 glass-card rounded-full flex justify-between items-center"
      >
        <Link href="/" className="text-lg md:text-xl font-black tracking-tight flex items-center gap-1">
          CENON<span className="text-cyan-400">MATE</span>
        </Link>
        
        <div className="hidden md:flex gap-8 text-[0.65rem] uppercase tracking-[0.2em] font-bold text-white/50">
          <a href="#showcase" className="hover:text-white transition-colors">Videos & Reels</a>
          <a href="#expertise" className="hover:text-white transition-colors">Expertise</a>
          <a href="#contact" className="hover:text-white transition-colors">Contact</a>
        </div>

        <a 
          href="#contact" 
          className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.15em] font-bold bg-white/10 hover:bg-white hover:text-black border border-white/20 px-4 md:px-6 py-2 md:py-2.5 rounded-full transition-all"
        >
          <span>Hire Me</span> 
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        </a>
      </motion.nav>

      {/* Hero Section (Fully Responsive for Mobile/Tablet/Desktop) */}
      <section className="relative min-h-[92dvh] md:min-h-screen flex flex-col justify-center items-center text-center px-4 sm:px-6 pt-28 md:pt-32 pb-16 overflow-hidden z-10">
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center relative">
          
          {/* Subtle Ambient Orb */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[450px] md:w-[600px] h-[280px] sm:h-[450px] md:h-[600px] bg-gradient-to-tr from-cyan-900/20 via-purple-900/20 to-transparent rounded-full blur-[80px] md:blur-[120px] mix-blend-screen -z-10 pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-[0.65rem] sm:text-xs uppercase tracking-[0.2em] text-cyan-300 font-bold mb-6 border border-cyan-500/30">
            <Flame className="w-3.5 h-3.5 text-cyan-400" /> {heroBadge}
          </div>

          {/* Heading with responsive font sizes */}
          <div className="w-full flex flex-col items-center">
            <motion.h1 
              style={{ x: isDesktop ? xHeroLeft : 0 }}
              className="text-4xl sm:text-6xl md:text-7xl lg:text-[7.5vw] font-black leading-[0.95] tracking-tight md:tracking-tighter text-outline"
            >
              {headline1}
            </motion.h1>
            
            <motion.h1 
              style={{ x: isDesktop ? xHeroRight : 0 }}
              className="text-4xl sm:text-6xl md:text-7xl lg:text-[7.5vw] font-black leading-[0.95] tracking-tight md:tracking-tighter text-white mt-1 sm:mt-2"
            >
              {headline2}
            </motion.h1>
          </div>

          <p className="mt-6 md:mt-10 text-sm sm:text-base md:text-xl text-white/50 max-w-xl mx-auto font-light leading-relaxed px-2">
            {heroSubtitle}
          </p>

          <div className="mt-8 md:mt-12 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-4">
            <a 
              href="#showcase" 
              className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold text-xs uppercase tracking-[0.2em] rounded-full hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              <Film className="w-4 h-4" /> Watch My Videos
            </a>
            <a 
              href="#contact" 
              className="w-full sm:w-auto px-8 py-4 glass-card text-white font-bold text-xs uppercase tracking-[0.2em] rounded-full hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              Start Project <MoveRight className="w-4 h-4" />
            </a>
          </div>

        </div>
      </section>

      {/* Main Featured Showreel (Fully Responsive) */}
      <section id="work" className="relative z-20 w-full py-12 md:py-24 px-4 sm:px-6 flex items-center justify-center">
        <motion.div 
          style={{ scale: isDesktop ? scaleVideo : 1 }}
          className="relative w-full max-w-6xl aspect-[16/9] bg-[#0a0a0a] rounded-2xl md:rounded-3xl overflow-hidden group border border-white/10 shadow-2xl"
        >
          <div 
            style={{ backgroundImage: `url(${featuredVideo?.thumbnail_url || 'https://i.ytimg.com/vi/5438rqudvek/maxresdefault.jpg'})` }}
            className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:opacity-75 transition-all duration-700" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          
          {/* Centered Play Button */}
          <button 
            onClick={() => setActiveModalVideo(featuredVideo)}
            className="absolute inset-0 flex items-center justify-center cursor-pointer group"
            aria-label="Play Featured Video"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border border-white/30 flex items-center justify-center backdrop-blur-xl group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all duration-500 shadow-2xl">
              <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-white group-hover:text-black group-hover:fill-black ml-1 transition-colors" />
            </div>
          </button>

          {/* Bottom Video Info */}
          <div className="absolute bottom-4 sm:bottom-6 md:bottom-10 left-4 sm:left-6 md:left-10 right-4 sm:right-6 md:right-10 flex flex-col sm:flex-row justify-between sm:items-end gap-3 pointer-events-none">
            <div>
              <p className="text-[0.6rem] uppercase tracking-[0.25em] text-cyan-400 font-bold mb-1">Featured Video</p>
              <h2 className="text-lg sm:text-2xl md:text-4xl font-bold tracking-tight text-white line-clamp-1">
                {featuredVideo?.title}
              </h2>
            </div>
            <div className="flex gap-2 shrink-0">
              <span className="glass-card px-3 sm:px-4 py-1 rounded-full text-[0.65rem] uppercase tracking-wider font-bold">YouTube</span>
              <span className="glass-card px-3 sm:px-4 py-1 rounded-full text-[0.65rem] uppercase tracking-wider font-bold">Services</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ======================================================== */}
      {/* --- RESPONSIVE MEDIA VAULT: VIDEOS, SHORTS & REELS --- */}
      {/* ======================================================== */}
      <section id="showcase" className="relative z-20 w-full py-16 md:py-32 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-16">
            <div>
              <div className="inline-flex items-center gap-2 text-[0.65rem] sm:text-xs uppercase tracking-[0.25em] text-cyan-400 font-bold mb-2">
                <Flame className="w-3.5 h-3.5 text-cyan-400" /> Cenonmate Media Vault
              </div>
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-tight">
                VIDEOS, SHORTS <br /><span className="text-white/40">& INSTAGRAM REELS.</span>
              </h2>
            </div>

            {/* Scrollable Filter Tabs (Mobile Horizontal Swipe) */}
            <div className="w-full md:w-auto overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex gap-2 bg-white/[0.03] p-1.5 rounded-full border border-white/10 backdrop-blur-xl w-max">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-4 sm:px-5 py-2 rounded-full text-[0.65rem] sm:text-xs uppercase tracking-wider font-bold transition-all ${
                    activeFilter === 'all' ? 'bg-white text-black shadow-md' : 'text-white/50 hover:text-white'
                  }`}
                >
                  All ({mediaItems.length})
                </button>
                <button
                  onClick={() => setActiveFilter('video')}
                  className={`flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full text-[0.65rem] sm:text-xs uppercase tracking-wider font-bold transition-all ${
                    activeFilter === 'video' ? 'bg-red-500 text-white shadow-md' : 'text-white/50 hover:text-white'
                  }`}
                >
                  <Film className="w-3 h-3" /> Videos
                </button>
                <button
                  onClick={() => setActiveFilter('short')}
                  className={`flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full text-[0.65rem] sm:text-xs uppercase tracking-wider font-bold transition-all ${
                    activeFilter === 'short' ? 'bg-red-600 text-white shadow-md' : 'text-white/50 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3 h-3" /> Shorts
                </button>
                <button
                  onClick={() => setActiveFilter('reel')}
                  className={`flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full text-[0.65rem] sm:text-xs uppercase tracking-wider font-bold transition-all ${
                    activeFilter === 'reel' ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md' : 'text-white/50 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3 h-3" /> Reels
                </button>
              </div>
            </div>
          </div>

          {/* Fully Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredMedia.map((item, index) => {
              const isVertical = item.media_type === 'short' || item.media_type === 'reel';

              return (
                <div
                  key={item.id}
                  className={`group relative rounded-2xl md:rounded-3xl overflow-hidden glass-card border border-white/10 flex flex-col justify-between ${
                    isVertical 
                      ? 'aspect-[9/16] w-full max-w-[320px] mx-auto' 
                      : 'aspect-[16/9] col-span-1 sm:col-span-2 lg:col-span-2 w-full'
                  }`}
                >
                  {/* Poster / Thumbnail Image */}
                  <div
                    style={{ backgroundImage: `url(${item.thumbnail_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000'})` }}
                    className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-80 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                  {/* Badge on Top */}
                  <div className="relative z-10 p-4 sm:p-5 flex justify-between items-center">
                    <span
                      className={`text-[0.6rem] uppercase tracking-wider font-black px-2.5 py-1 rounded-full border ${
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
                      className="w-8 h-8 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all"
                      title="Open link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
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
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all duration-300 shadow-xl"
                    >
                      <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
                    </button>
                  </div>

                  {/* Content & Details at Bottom */}
                  <div className="relative z-10 p-4 sm:p-6 space-y-1 sm:space-y-2">
                    <h3 className="text-base sm:text-xl font-bold tracking-tight text-white line-clamp-1">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-white/60 font-light line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Social Channel Links Banner */}
          <div className="mt-12 md:mt-20 p-6 sm:p-10 rounded-2xl md:rounded-3xl glass-card flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
            <div>
              <h4 className="text-xl sm:text-2xl font-bold mb-1">Want to see daily video creations?</h4>
              <p className="text-xs sm:text-sm text-white/40">Subscribe to our official YouTube channel and follow us on Instagram.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-full bg-red-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-red-500 transition-all flex items-center justify-center gap-2"
              >
                <Film className="w-4 h-4" /> YouTube @Cenonmate
              </a>
              <a
                href={instaUrl}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" /> Instagram @cenon_mate
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* --- RESPONSIVE VIDEO PLAYER MODAL --- */}
      {/* ======================================================== */}
      <AnimatePresence>
        {activeModalVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 md:p-10"
            onClick={() => setActiveModalVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`relative bg-black rounded-2xl md:rounded-3xl overflow-hidden border border-white/20 shadow-2xl ${
                activeModalVideo.media_type === 'short' || activeModalVideo.media_type === 'reel'
                  ? 'w-full max-w-[360px] aspect-[9/16]'
                  : 'w-full max-w-4xl aspect-[16/9]'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveModalVideo(null)}
                className="absolute top-3 right-3 z-30 w-9 h-9 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
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
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                  <Film className="w-12 h-12 text-cyan-400 mb-4 animate-bounce" />
                  <h3 className="text-xl font-bold mb-2">{activeModalVideo.title}</h3>
                  <p className="text-xs text-white/50 mb-6">{activeModalVideo.description}</p>
                  <a
                    href={activeModalVideo.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-3 bg-white text-black font-bold rounded-full text-xs uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center gap-2"
                  >
                    Watch Directly on Platform <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expertise Section (Fully Responsive) */}
      <section id="expertise" className="relative z-20 w-full py-20 md:py-36 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 md:gap-20">
            
            {/* Sidebar info */}
            <div className="md:w-1/3">
              <div className="md:sticky md:top-32 space-y-4">
                <div className="text-[0.65rem] uppercase tracking-[0.25em] text-white/40 font-bold">Our Capabilities</div>
                <h3 className="text-3xl sm:text-4xl font-light tracking-tight leading-tight">
                  Crafting the impossible.
                </h3>
                <p className="text-sm text-white/40 font-light leading-relaxed">
                  We don&apos;t use generic templates. We build bespoke visual systems using industry-leading AI models and tailored editing workflows.
                </p>
              </div>
            </div>

            {/* Service Cards */}
            <div className="md:w-2/3 space-y-6">
              {services.map((item, index) => (
                <div 
                  key={index}
                  className="glass-card p-6 sm:p-10 rounded-2xl md:rounded-3xl"
                >
                  <div className="text-xs uppercase tracking-widest text-white/30 mb-4 font-bold">{item.num}</div>
                  <h4 className="text-xl sm:text-2xl font-bold tracking-tight mb-3">{item.title}</h4>
                  <p className="text-xs sm:text-sm text-white/50 font-light leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Contact & Lead Section (Synced to Supabase) */}
      <section id="contact" className="relative z-20 w-full py-20 md:py-32 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-6 sm:p-12 md:p-16 rounded-2xl md:rounded-3xl">
            <h3 className="text-2xl sm:text-4xl md:text-5xl font-light tracking-tight mb-3">Start a Collaboration</h3>
            <p className="text-xs sm:text-sm text-white/40 font-light mb-8">Send your project brief. We respond within 24 hours.</p>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center gap-4">
                <CheckCircle2 className="w-6 h-6 text-cyan-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-base">Inquiry Received</h4>
                  <p className="text-xs text-cyan-300/80 mt-1">Thank you. Shoayibul will review your project and get back to you shortly.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-white/40 font-bold block mb-2">Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 sm:py-3.5 text-white focus:outline-none focus:border-white transition-all text-sm"
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
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 sm:py-3.5 text-white focus:outline-none focus:border-white transition-all text-sm"
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
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 sm:py-3.5 text-white focus:outline-none focus:border-white transition-all text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-xl bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-gray-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" /> {submitting ? 'Submitting...' : 'Send Inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Responsive Footer */}
      <footer className="relative z-20 w-full bg-black border-t border-white/10 py-12 md:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          
          <div className="space-y-2 text-center md:text-left">
            <div className="text-xl font-black tracking-tight">
              CENON<span className="text-cyan-400">MATE</span>
            </div>
            <p className="text-xs text-white/40">Shoayibul Islam Shithel — Visual Creator & Editor</p>
            <div className="pt-1">
              <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-white transition-colors">
                <Lock className="w-3 h-3" /> Admin Dashboard
              </Link>
            </div>
          </div>

          {/* Social Links Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            <a 
              href={youtubeUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="px-5 py-2.5 rounded-full glass-card hover:bg-white hover:text-black transition-all text-xs font-bold uppercase tracking-wider"
            >
              YouTube
            </a>
            <a 
              href={instaUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="px-5 py-2.5 rounded-full glass-card hover:bg-white hover:text-black transition-all text-xs font-bold uppercase tracking-wider"
            >
              Instagram
            </a>
            <a 
              href={facebookUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="px-5 py-2.5 rounded-full glass-card hover:bg-white hover:text-black transition-all text-xs font-bold uppercase tracking-wider"
            >
              Facebook
            </a>
          </div>

        </div>

        <div className="max-w-6xl mx-auto text-center mt-8 pt-8 border-t border-white/5 text-[0.65rem] text-white/30 uppercase tracking-widest">
          © {new Date().getFullYear()} Cenonmate. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
