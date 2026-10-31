'use client';

import { useState } from 'react';
import { Layout, Save } from 'lucide-react';

interface HeroTabProps {
  initialBadge: string;
  initialHeadline1: string;
  initialHeadline2: string;
  initialSubtitle: string;
  onNotify: (type: 'success' | 'error', text: string) => void;
}

export default function HeroTab({
  initialBadge,
  initialHeadline1,
  initialHeadline2,
  initialSubtitle,
  onNotify,
}: HeroTabProps) {
  const [heroBadge, setHeroBadge] = useState(initialBadge);
  const [headline1, setHeadline1] = useState(initialHeadline1);
  const [headline2, setHeadline2] = useState(initialHeadline2);
  const [heroSubtitle, setHeroSubtitle] = useState(initialSubtitle);
  const [submitting, setSubmitting] = useState(false);

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const heroData = {
        badge: heroBadge,
        headline_1: headline1,
        headline_2: headline2,
        subtitle: heroSubtitle,
      };

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'hero_settings', value: heroData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save hero');

      onNotify('success', 'Hero Section content saved! Refresh main site to see changes.');
    } catch (err: any) {
      onNotify('error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-10">
      <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
        <Layout className="w-5 h-5 text-cyan-400" /> Edit Hero Section Content
      </h2>
      <p className="text-gray-400 text-xs mb-6">Customize the main headlines and intro text seen when visitors open your website.</p>

      <form onSubmit={handleSaveHero} className="space-y-5">
        <div>
          <label className="text-xs text-gray-400 block mb-1 font-semibold">Hero Top Badge Text</label>
          <input
            type="text"
            value={heroBadge}
            onChange={(e) => setHeroBadge(e.target.value)}
            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1 font-semibold">Headline Word 1 (Outline Effect)</label>
            <input
              type="text"
              value={headline1}
              onChange={(e) => setHeadline1(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 font-bold"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1 font-semibold">Headline Word 2 (Solid Effect)</label>
            <input
              type="text"
              value={headline2}
              onChange={(e) => setHeadline2(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 font-bold"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1 font-semibold">Hero Subtitle & Agency Bio</label>
          <textarea
            rows={4}
            value={heroSubtitle}
            onChange={(e) => setHeroSubtitle(e.target.value)}
            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 resize-none leading-relaxed"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-cyan-400 text-black font-bold px-8 py-3.5 rounded-xl hover:bg-cyan-300 transition-all flex items-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> Save Hero Changes
        </button>
      </form>
    </div>
  );
}
