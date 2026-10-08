'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.from('inquiries').insert([
        {
          name: formData.name,
          email: formData.email,
          message: formData.message,
        },
      ]);

      if (error) throw error;
      
      setIsSuccess(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err: any) {
      setErrorMsg('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-2xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold tracking-widest text-white/50 uppercase ml-1">
            Name
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-900/10 transition-all backdrop-blur-md"
            placeholder="John Doe"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold tracking-widest text-white/50 uppercase ml-1">
            Email
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-900/10 transition-all backdrop-blur-md"
            placeholder="john@example.com"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-bold tracking-widest text-white/50 uppercase ml-1">
          Project Brief
        </label>
        <textarea
          required
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-900/10 transition-all backdrop-blur-md resize-none"
          placeholder="Tell us about your vision..."
        />
      </div>

      {errorMsg && (
        <p className="text-red-400 text-sm font-medium">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || isSuccess}
        className="group relative w-full overflow-hidden rounded-xl bg-white text-black font-bold text-sm tracking-widest uppercase py-4 transition-all hover:bg-cyan-50 disabled:opacity-70"
      >
        <span className="relative z-10 flex items-center justify-center gap-3">
          {isSubmitting ? (
            'Sending...'
          ) : isSuccess ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Message Sent
            </>
          ) : (
            <>
              Initialize Project
              <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </>
          )}
        </span>
      </button>
    </form>
  );
}
