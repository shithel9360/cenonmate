import { supabase } from '@/lib/supabase';
import VisualEngine from '@/components/3d/VisualEngine';
import MediaGallery from '@/components/sections/MediaGallery';
import ContactForm from '@/components/ui/ContactForm';
import { MoveRight, Sparkles, Code, PlaySquare, Video, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 60; // ISR cache every 60 seconds

async function getSiteData() {
  const [videosRes, settingsRes] = await Promise.all([
    supabase.from('videos').select('*').order('created_at', { ascending: false }),
    supabase.from('site_settings').select('key, value')
  ]);

  const settingsMap: Record<string, any> = {};
  settingsRes.data?.forEach(s => {
    settingsMap[s.key] = s.value;
  });

  return {
    videos: videosRes.data || [],
    settings: settingsMap
  };
}

export default async function Home() {
  const { videos, settings } = await getSiteData();
  
  const heroSettings = settings.hero_settings || {
    headline_1: "VISUALS BUILT",
    headline_2: "TO STOP THE SCROLL.",
    subtitle: "Turn ideas into cinematic visuals. We architect high-converting visual assets, AI video editing, and 3D product simulation.",
    badge: "AI Video & 3D Design Studio"
  };

  const services = settings.services_settings || [
    { num: "01", title: "AI Cinematic Editing", desc: "Transform raw footage into high-retention masterpieces." },
    { num: "02", title: "3D Product Visualization", desc: "Photorealistic simulations that skyrocket brand perception." },
    { num: "03", title: "Custom Generative Assets", desc: "Bespoke AI-generated graphics and futuristic environments." }
  ];

  return (
    <main className="min-h-screen bg-black text-white selection:bg-cyan-500/30 font-sans overflow-x-hidden">
      
      {/* NAVIGATION */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-6 mix-blend-difference pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-xl font-black tracking-tighter uppercase pointer-events-auto">
            CENON<span className="text-cyan-400">MATE</span>
          </div>
          <Link 
            href="#contact" 
            className="pointer-events-auto group hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white border border-white/20 px-6 py-2.5 rounded-full hover:bg-white hover:text-black transition-all"
          >
            Start a Project <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </nav>

      {/* 01 HERO SECTION */}
      <section className="relative w-full h-screen flex flex-col items-center justify-center pt-20">
        <VisualEngine />
        
        <div className="relative z-10 text-center max-w-5xl mx-auto px-4 mt-16 pointer-events-none">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-[0.65rem] uppercase tracking-[0.2em] font-bold mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            {heroSettings.badge}
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-[7rem] font-black leading-[0.9] tracking-tighter text-outline mb-6">
            {heroSettings.headline_1}
            <br />
            <span className="text-white text-shadow-glow">{heroSettings.headline_2}</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-white/50 font-light max-w-2xl mx-auto mb-10 leading-relaxed">
            {heroSettings.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto">
            <Link
              href="#showcase"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold text-xs uppercase tracking-[0.2em] rounded-full hover:bg-cyan-50 transition-all"
            >
              Watch The Work
              <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Scroll to explore</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent" />
        </div>
      </section>

      {/* 02 SELECTED WORK */}
      <section id="showcase" className="py-32 px-4 relative z-20 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-4">Selected Work</h2>
            <p className="text-white/40 text-sm tracking-widest uppercase">Cinematic Edits, Shorts & 3D Visuals</p>
          </div>
          
          <MediaGallery items={videos} />
        </div>
      </section>

      {/* 03 SERVICES */}
      <section id="services" className="py-32 px-4 relative bg-black overflow-hidden border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-4">Core Capabilities</h2>
            <p className="text-white/40 text-sm tracking-widest uppercase">What We Do Best</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((s: any, idx: number) => (
              <div key={idx} className="group relative p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 transition-all">
                <div className="text-6xl font-black text-white/5 mb-8 group-hover:text-cyan-500/10 transition-colors">{s.num}</div>
                <h3 className="text-xl font-bold mb-4">{s.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-8">{s.desc}</p>
                <div className="h-1 w-0 bg-cyan-500 group-hover:w-12 transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 04 PROCESS */}
      <section className="py-32 px-4 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-4">The Process</h2>
            <p className="text-white/40 text-sm tracking-widest uppercase">How We Architect Visuals</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Discover', icon: PlaySquare, desc: 'Analyzing brand DNA and objectives.' },
              { title: 'Direct', icon: Video, desc: 'Storyboarding and creative direction.' },
              { title: 'Produce', icon: Code, desc: 'AI generation, editing, and 3D simulation.' },
              { title: 'Deliver', icon: Sparkles, desc: 'Final cinematic export & revisions.' }
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                  <step.icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h4 className="font-bold uppercase tracking-widest text-sm mb-2">0{idx+1} {'//'} {step.title}</h4>
                <p className="text-white/40 text-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 05 CONTACT */}
      <section id="contact" className="py-32 px-4 relative bg-black overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,255,255,0.05),transparent_50%)]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-6">Initialize</h2>
            <p className="text-white/40 text-sm tracking-widest uppercase max-w-md mx-auto">
              Ready to elevate your visual presence? Drop your project details below.
            </p>
          </div>
          
          <ContactForm />
        </div>
      </section>

      {/* 06 FOOTER */}
      <footer className="py-12 px-4 border-t border-white/10 bg-black text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-black tracking-tighter uppercase">
            CENON<span className="text-cyan-400">MATE</span>
          </div>
          <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest text-white/50">
            <a href="https://www.youtube.com/@Cenonmate-z6j" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">YouTube</a>
            <a href="https://www.instagram.com/cenon_mate/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Instagram</a>
          </div>
          <div className="text-white/30 text-[10px] uppercase tracking-widest">
            © {new Date().getFullYear()} Cenonmate. All Rights Reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
