'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MoveRight, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-900/20 via-purple-900/20 to-transparent rounded-full blur-[120px] pointer-events-none" />

      {/* Noise texture */}
      <div className="bg-noise absolute inset-0 pointer-events-none" />

      <motion.div
        className="relative z-10 text-center max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-[0.65rem] uppercase tracking-[0.2em] font-bold mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Error 404
        </motion.div>

        {/* Giant 404 */}
        <motion.h1
          className="text-[8rem] sm:text-[12rem] md:text-[16rem] font-black leading-none tracking-tighter text-outline select-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.8, ease: 'easeOut' }}
        >
          404
        </motion.h1>

        <motion.h2
          className="text-2xl sm:text-4xl font-bold tracking-tight mt-2 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Page Not Found
        </motion.h2>

        <motion.p
          className="text-sm sm:text-base text-white/40 font-light max-w-md mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Head back to the homepage to explore our work.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold text-xs uppercase tracking-[0.2em] rounded-full hover:bg-gray-200 transition-all group"
          >
            Back to Homepage
            <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Logo */}
        <motion.div
          className="mt-16 text-base font-black tracking-tight text-white/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          CENON<span className="text-cyan-400/40">MATE</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
