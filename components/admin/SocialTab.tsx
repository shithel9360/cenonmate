'use client';

import { useState } from 'react';
import { Share2, Save } from 'lucide-react';

interface SocialTabProps {
  initialEmail: string;
  initialYoutube: string;
  initialInstagram: string;
  initialFacebook: string;
  onNotify: (type: 'success' | 'error', text: string) => void;
}

export default function SocialTab({
  initialEmail,
  initialYoutube,
  initialInstagram,
  initialFacebook,
  onNotify,
}: SocialTabProps) {
  const [contactEmail, setContactEmail] = useState(initialEmail);
  const [youtubeUrl, setYoutubeUrl] = useState(initialYoutube);
  const [instaUrl, setInstaUrl] = useState(initialInstagram);
  const [facebookUrl, setFacebookUrl] = useState(initialFacebook);
  const [submitting, setSubmitting] = useState(false);

  const handleSaveSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const socialData = {
        email: contactEmail,
        youtube: youtubeUrl,
        instagram: instaUrl,
        facebook: facebookUrl,
      };

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'social_settings', value: socialData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save social links');

      onNotify('success', 'Contact & Social links updated successfully!');
    } catch (err: any) {
      onNotify('error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-10">
      <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
        <Share2 className="w-5 h-5 text-cyan-400" /> Edit Contact & Social Links
      </h2>
      <p className="text-gray-400 text-xs mb-6">Update your official contact email and social profile links across the site.</p>

      <form onSubmit={handleSaveSocial} className="space-y-4">
        <div>
          <label className="text-xs text-gray-400 block mb-1 font-semibold">Official Contact Email</label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1 font-semibold">YouTube Channel URL</label>
          <input
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1 font-semibold">Instagram Profile URL</label>
          <input
            type="url"
            value={instaUrl}
            onChange={(e) => setInstaUrl(e.target.value)}
            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1 font-semibold">Facebook Profile URL</label>
          <input
            type="url"
            value={facebookUrl}
            onChange={(e) => setFacebookUrl(e.target.value)}
            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-cyan-400 text-black font-bold px-8 py-3.5 rounded-xl hover:bg-cyan-300 transition-all flex items-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> Save Links
        </button>
      </form>
    </div>
  );
}
