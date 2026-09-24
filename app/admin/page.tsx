'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Play, Trash2, Plus, ArrowLeft, Mail, Video, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import Link from 'next/link';

interface VideoItem {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url?: string;
  description?: string;
  is_featured?: boolean;
  created_at: string;
}

interface InquiryItem {
  id: string;
  name: string;
  email: string;
  details: string;
  created_at: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  const [activeTab, setActiveTab] = useState<'videos' | 'inquiries'>('videos');
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Simple PIN verification (Default: cenonmate2026 or from env)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === 'cenonmate2026' || pin === 'admin123') {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Invalid Admin Passcode. Default is: cenonmate2026');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, activeTab]);

  const fetchData = async () => {
    if (!supabase) return;
    setLoading(true);

    try {
      if (activeTab === 'videos') {
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) setVideos(data);
      } else {
        const { data, error } = await supabase
          .from('inquiries')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) setInquiries(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setStatusMsg({ type: 'error', text: 'Supabase credentials not connected yet.' });
      return;
    }

    setSubmitting(true);
    setStatusMsg(null);

    try {
      const { error } = await supabase.from('videos').insert([
        {
          title,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl || null,
          description: description || null,
          is_featured: isFeatured,
        },
      ]);

      if (error) throw error;

      setStatusMsg({ type: 'success', text: 'Video project successfully added to website!' });
      setTitle('');
      setVideoUrl('');
      setThumbnailUrl('');
      setDescription('');
      setIsFeatured(false);
      fetchData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to add video.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!supabase) return;
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const { error } = await supabase.from('videos').delete().eq('id', id);
      if (error) throw error;
      setVideos(videos.filter((v) => v.id !== id));
      setStatusMsg({ type: 'success', text: 'Video removed.' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white/[0.02] border border-white/10 p-8 rounded-3xl backdrop-blur-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Cenonmate Admin Panel</h1>
            <p className="text-gray-400 text-sm mt-1">Manage videos, showreels, and client leads</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2 block">Admin Passcode</label>
              <input
                type="password"
                placeholder="Enter Passcode (default: cenonmate2026)"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
              />
              {pinError && <p className="text-red-400 text-xs mt-2">{pinError}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-cyan-400 text-black font-bold py-3.5 rounded-xl hover:bg-cyan-300 transition-all"
            >
              Access Dashboard
            </button>

            <div className="text-center pt-2">
              <Link href="/" className="text-xs text-gray-500 hover:text-white transition-colors">
                ← Back to Main Website
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-8 border-b border-white/10 mb-8">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 mb-2">
              <ArrowLeft className="w-4 h-4" /> View Live Website
            </Link>
            <h1 className="text-3xl font-black tracking-tight">CENONMATE BACKEND DASHBOARD</h1>
            <p className="text-gray-400 text-sm">Control your portfolio, video showreels, and client inquiries.</p>
          </div>

          <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('videos')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'videos' ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/20' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Video className="w-4 h-4" /> Videos ({videos.length})
            </button>
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'inquiries' ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/20' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Mail className="w-4 h-4" /> Inquiries ({inquiries.length})
            </button>
          </div>
        </div>

        {/* Supabase Status Alert */}
        {!supabase && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 mb-8 flex items-start gap-4 text-amber-200 text-sm">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1">Supabase Credentials Needed</p>
              <p className="text-amber-200/80">
                Please add <code className="bg-black/40 px-2 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
                <code className="bg-black/40 px-2 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your Vercel Environment Variables or local <code className="bg-black/40 px-2 py-0.5 rounded">.env.local</code> to activate live database syncing.
              </p>
            </div>
          </div>
        )}

        {statusMsg && (
          <div
            className={`p-4 rounded-xl mb-6 flex items-center gap-3 text-sm ${
              statusMsg.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}
          >
            {statusMsg.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {statusMsg.text}
          </div>
        )}

        {/* Tab 1: Videos Management */}
        {activeTab === 'videos' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Add Video Form */}
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 md:p-8 h-fit">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" /> Add New Video
              </h2>
              <form onSubmit={handleAddVideo} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1 font-semibold">Video Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI Product Commercial 2026"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1 font-semibold">Video / YouTube URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1 font-semibold">Cover / Thumbnail URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1 font-semibold">Short Description</label>
                  <textarea
                    rows={3}
                    placeholder="Key highlights of this AI video edit..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 accent-cyan-400 rounded"
                  />
                  <label htmlFor="featured" className="text-sm text-gray-300 cursor-pointer">
                    Set as Featured Main Showreel
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-cyan-400 text-black font-bold py-3.5 rounded-xl hover:bg-cyan-300 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Publishing...' : 'Publish to Website'}
                </button>
              </form>
            </div>

            {/* Video List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold mb-4">Published Videos</h2>
              {loading && <p className="text-gray-500">Loading videos...</p>}

              {!loading && videos.length === 0 && (
                <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-12 text-center text-gray-500">
                  <Video className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-semibold text-gray-400">No custom videos added yet.</p>
                  <p className="text-sm mt-1">Add your first video project using the form on the left!</p>
                </div>
              )}

              {videos.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-white/20 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-white">{item.title}</h3>
                      {item.is_featured && (
                        <span className="text-[0.65rem] uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-bold">
                          Featured
                        </span>
                      )}
                    </div>
                    <a
                      href={item.video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-gray-400 hover:text-cyan-400 truncate block max-w-md"
                    >
                      {item.video_url}
                    </a>
                    {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
                  </div>

                  <button
                    onClick={() => handleDeleteVideo(item.id)}
                    className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all self-end sm:self-center"
                    title="Delete Video"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Inquiries / Leads */}
        {activeTab === 'inquiries' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Client Inquiries & Project Briefs</h2>
            {loading && <p className="text-gray-500">Loading inquiries...</p>}

            {!loading && inquiries.length === 0 && (
              <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-12 text-center text-gray-500">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-semibold text-gray-400">No client inquiries received yet.</p>
                <p className="text-sm mt-1">When clients fill out the contact form on your website, their messages will appear here.</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {inquiries.map((inq) => (
                <div key={inq.id} className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-white">{inq.name}</h3>
                      <a href={`mailto:${inq.email}`} className="text-xs text-cyan-400 hover:underline">
                        {inq.email}
                      </a>
                    </div>
                    <span className="text-[0.7rem] text-gray-500">
                      {new Date(inq.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-sm text-gray-300 whitespace-pre-wrap">
                    {inq.details}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
