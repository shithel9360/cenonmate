'use client';

import { motion } from 'framer-motion';
import { Play, Sparkles, Box, Wand2, Youtube, Instagram, Facebook, Mail } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const services = [
    {
      title: 'AI Video Editing',
      description: 'Transform raw footage into captivating stories using state-of-the-art AI technology. We edit, enhance, and bring your vision to life.',
      icon: <Play className="w-8 h-8 text-cyan-400" />
    },
    {
      title: 'AI Image Generation',
      description: 'Stunning, high-quality images generated from text and concepts. Perfect for marketing, social media, and concept art.',
      icon: <Sparkles className="w-8 h-8 text-purple-400" />
    },
    {
      title: 'Product Design',
      description: 'Modern and intuitive product designs. From 3D mockups to UI/UX, we create designs that convert and look breathtaking.',
      icon: <Box className="w-8 h-8 text-cyan-400" />
    },
    {
      title: 'Visual Impact',
      description: 'Turning ideas into visual stories. We combine all our skills to produce end-to-end impact for your brand.',
      icon: <Wand2 className="w-8 h-8 text-purple-400" />
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-cyan-500 selection:text-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold tracking-tighter flex items-center gap-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              CENONMATE
            </span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-300">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#services" className="hover:text-white transition-colors">Services</a>
            <a href="#work" className="hover:text-white transition-colors">Our Work</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px] -z-10" />
        
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-extrabold tracking-tight"
          >
            IDEAS <span className="text-gray-600">→</span> VISUALS <span className="text-gray-600">→</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 glow-text">IMPACT</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto"
          >
            AI x IMAGES x PRODUCTS x VIDEOS
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center gap-4 pt-8"
          >
            <a href="#services" className="px-8 py-4 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-colors">
              Explore Services
            </a>
            <a href="#contact" className="px-8 py-4 bg-transparent border border-white/20 rounded-full font-semibold hover:bg-white/10 transition-colors">
              Get in Touch
            </a>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 px-6 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">Currently Available Services</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Leveraging AI to bring you the best in visual content creation.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group cursor-pointer"
              >
                <div className="mb-4 p-3 bg-black/50 rounded-xl inline-block group-hover:scale-110 transition-transform">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6 relative">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-purple-900/20 to-transparent -z-10" />
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="aspect-square rounded-3xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center overflow-hidden relative"
          >
            {/* Placeholder for Profile Image */}
            <div className="text-center">
              <div className="w-32 h-32 mx-auto bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full mb-6 blur-md opacity-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
              <h2 className="text-4xl font-bold relative z-10">Cenonmate</h2>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-4xl md:text-5xl font-bold">About Me</h2>
            <p className="text-xl text-gray-300">
              Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-bold">Shoayibul Islam Shithel</span>.
            </p>
            <p className="text-gray-400 leading-relaxed">
              I specialize in creating next-generation visual experiences through AI video editing and cutting-edge product design. My goal is to transform your concepts into breathtaking visuals that drive impact. Under the banner of CENONMATE, I offer professional, high-end services designed to elevate your brand.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-12 px-6 border-t border-white/10 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-bold tracking-tighter">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              CENONMATE
            </span>
          </div>
          
          <div className="flex gap-6">
            <a href="https://www.youtube.com/@Cenonmate-z6j" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-red-500 transition-colors">
              <Youtube className="w-6 h-6" />
            </a>
            <a href="https://www.instagram.com/cenon_mate/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors">
              <Instagram className="w-6 h-6" />
            </a>
            <a href="https://www.facebook.com/profile.php?id=61594673284423" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors">
              <Facebook className="w-6 h-6" />
            </a>
          </div>
          
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Cenonmate. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
