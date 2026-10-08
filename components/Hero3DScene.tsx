'use client';

import { useRef, type ReactNode, type MouseEvent as ReactMouseEvent } from 'react';
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { Clapperboard, Box, Zap } from 'lucide-react';

/**
 * Hero3DScene — drop-in 3D wrapper for the Cenonmate hero.
 *
 * Wraps the existing hero content and adds:
 *  1. Mouse-tracked 3D tilt (rotateX/rotateY with spring smoothing)
 *  2. Floating glass chips at different translateZ depths
 *  3. A faint perspective grid floor for spatial depth
 *
 * No new dependencies — uses framer-motion already in the project.
 * Touch devices: tilt stays neutral, chips hidden on small screens.
 *
 * Usage in app/page.tsx:
 *   import Hero3DScene from '@/components/Hero3DScene';
 *   ...
 *   <section className="relative min-h-[92dvh] ...">
 *     <Hero3DScene>
 *       <div className="w-full max-w-6xl mx-auto flex flex-col items-center relative">
 *         ...existing hero content...
 *       </div>
 *     </Hero3DScene>
 *   </section>
 */

function FloatChip({
  icon,
  label,
  sub,
  className = '',
  x,
  y,
  z,
  delay = 0,
}: {
  icon: ReactNode;
  label: string;
  sub: string;
  className?: string;
  x: MotionValue<number>;
  y: MotionValue<number>;
  z: number;
  delay?: number;
}) {
  return (
    <motion.div
      style={{ x, y, z, transformStyle: 'preserve-3d' }}
      className={`absolute hidden lg:flex items-center gap-3 px-4 py-3 rounded-2xl glass-card border border-white/15 backdrop-blur-xl shadow-2xl pointer-events-none ${className}`}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay }}
        className="flex items-center gap-3"
      >
        <span className="w-9 h-9 rounded-xl bg-cyan-400/15 border border-cyan-300/30 flex items-center justify-center text-cyan-300">
          {icon}
        </span>
        <span>
          <span className="block text-xs font-bold tracking-wide text-white">{label}</span>
          <span className="block text-[0.65rem] text-white/50 tracking-wider uppercase">{sub}</span>
        </span>
      </motion.div>
    </motion.div>
  );
}

export default function Hero3DScene({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 55, damping: 18 });
  const sy = useSpring(my, { stiffness: 55, damping: 18 });

  const rotateX = useTransform(sy, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-8, 8]);

  // Decorations drift at different depths for parallax
  const chip1x = useTransform(sx, (v) => v * 42);
  const chip1y = useTransform(sy, (v) => v * 30);
  const chip2x = useTransform(sx, (v) => v * 68);
  const chip2y = useTransform(sy, (v) => v * 48);
  const chip3x = useTransform(sx, (v) => v * 26);
  const chip3y = useTransform(sy, (v) => v * 18);
  const gridX = useTransform(sx, (v) => v * 14);

  const handleMove = (e: ReactMouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const handleLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="relative w-full"
      style={{ perspective: 1400 }}
    >
      {/* Faint perspective grid floor — spatial anchor */}
      <motion.div
        aria-hidden
        style={{ x: gridX }}
        className="absolute left-1/2 -translate-x-1/2 bottom-[-8%] w-[160%] h-[46%] pointer-events-none opacity-40"
      >
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              'linear-gradient(rgba(34,211,238,0.13) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.13) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            transform: 'rotateX(64deg)',
            transformOrigin: 'top center',
            maskImage: 'linear-gradient(to bottom, black 25%, transparent 92%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 25%, transparent 92%)',
          }}
        />
      </motion.div>

      {/* Tilt stage — everything inside gets real 3D depth */}
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative w-full"
      >
        {/* Floating chips at staggered depths */}
        <FloatChip
          icon={<Clapperboard className="w-4 h-4" />}
          label="AI Cinematic"
          sub="Editing"
          x={chip1x}
          y={chip1y}
          z={110}
          className="left-[2%] top-[16%]"
        />
        <FloatChip
          icon={<Box className="w-4 h-4" />}
          label="Hyper-Real 3D"
          sub="Product sims"
          x={chip2x}
          y={chip2y}
          z={170}
          delay={1.4}
          className="right-[1%] top-[38%]"
        />
        <FloatChip
          icon={<Zap className="w-4 h-4" />}
          label="Viral Reels"
          sub="Storytelling"
          x={chip3x}
          y={chip3y}
          z={70}
          delay={2.6}
          className="left-[5%] bottom-[14%]"
        />

        {/* Existing hero content rides on the tilt stage */}
        <div style={{ transform: 'translateZ(30px)' }} className="relative">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
