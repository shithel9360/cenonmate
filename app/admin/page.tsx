'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Play, Trash2, Plus, ArrowLeft, Mail, Video, CheckCircle, 
  AlertCircle, Lock, Film, Smartphone, Save, Key, Layout, 
  Layers, Share2, Eye, EyeOff 
} from 'lucide-react';
import Link from 'next/link';

interface VideoItem {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url?: string;
  description?: string;
  media_type?: 'video' | 'short' | 'reel';
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

interface ServiceItem {
  num: string;
  title: string;
  desc: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pinError, setPinError] = useState('');

  const [activeTab, setActiveTab] = useState<'media' | 'hero' | 'services' | 'social' | 'inquiries' | 'security'>('media');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // --- DATA STATES ---
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);

  // Hero CMS State
  const [heroBadge, setHeroBadge] = useState('AI Video Agency & 3D Design');
  const [headline1, setHeadline1] = useState('ARTIFICIAL');
  const [headline2, setHeadline2] = useState('INTELLIGENCE');
  const [heroSubtitle, setHeroSubtitle] = useState('Architecting high-converting visual assets. Specialized in next-gen AI video editing, 3D product simulation, and viral storytelling.');

  // Services CMS State
  const [services, setServices] = useState<ServiceItem[]>([
    { num: '01', title: 'AI Cinematic Editing', desc: 'Transforming raw footage into high-retention, cinematic masterpieces. Advanced audio design, pacing, and visual effects.' },
    { num: '02', title: 'Hyper-Realistic 3D Products', desc: 'Photorealistic mockups and dynamic rotating simulations that skyrocket your brand perception.' },
    { num: '03', title: 'Custom Generative Assets', desc: 'Bespoke AI-generated graphics, futuristic environments, and concept imagery tailored exclusively for your project.' },
  ]);

  // Social & Contact State
  const [contactEmail, setContactEmail] = useState('hello@cenonmate.com');
  const [youtubeUrl, setYoutubeUrl] = useState('https://www.youtube.com/@Cenonmate-z6j');
  const [instaUrl, setInstaUrl] = useState('https://www.instagram.com/cenon_mate/');
  const [facebookUrl, setFacebookUrl] = useState('https://www.facebook.com/profile.php?id=61594673284423');

  // Media Form State
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [description, setDescription] = useState('');
  const [mediaType, setMediaType] = useState<'video' | 'short' | 'reel'>('video');
  const [isFeatured, setIsFeatured] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Security State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Check sessionStorage on mount
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('cenonmate_admin_auth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    // Check against Supabase or default master password
    let validPass = 'Shithel02082005';

    if (supabase) {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'admin_password')
          .single();

        if (data && data.value) {
          validPass = typeof data.value === 'string' ? data.value : JSON.parse(data.value);
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (pin === validPass || pin === 'Shithel02082005') {
      setIsAuthenticated(true);
      sessionStorage.setItem('cenonmate_admin_auth', 'true');
      setPinError('');
    } else {
      setPinError('Incorrect Password. Please try again.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('cenonmate_admin_auth');
    setIsAuthenticated(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAllSettings();
    }
  }, [isAuthenticated, activeTab]);

  const loadAllSettings = async () => {
    if (!supabase) return;
    setLoading(true);

    try {
      // 1. Fetch Media
      const { data: vData } = await supabase.from('videos').select('*').order('created_at', { ascending: false });
      if (vData) setVideos(vData);

      // 2. Fetch Inquiries
      const { data: iData } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
      if (iData) setInquiries(iData);

      // 3. Fetch CMS Settings
      const { data: sData } = await supabase.from('site_settings').select('*');
      if (sData) {
        sData.forEach((item) => {
          if (item.key === 'hero_settings' && item.value) {
            const val = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
            setHeroBadge(val.badge || 'AI Video Agency & 3D Design');
            setHeadline1(val.headline_1 || 'ARTIFICIAL');
            setHeadline2(val.headline_2 || 'INTELLIGENCE');
            setHeroSubtitle(val.subtitle || '');
          }
          if (item.key === 'social_settings' && item.value) {
            const val = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
            setContactEmail(val.email || 'hello@cenonmate.com');
            setYoutubeUrl(val.youtube || 'https://www.youtube.com/@Cenonmate-z6j');
            setInstaUrl(val.instagram || 'https://www.instagram.com/cenon_mate/');
            setFacebookUrl(val.facebook || 'https://www.facebook.com/profile.php?id=61594673284423');
          }
          if (item.key === 'services_settings' && item.value) {
            const val = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
            if (Array.isArray(val)) setServices(val);
          }
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Add Media
  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setSubmitting(true);
    setStatusMsg(null);

    try {
      if (isFeatured) {
        await supabase.from('videos').update({ is_featured: false }).neq('id', '00000000-0000-0000-0000-000000000000');
      }

      const { error } = await supabase.from('videos').insert([
        {
          title,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl || null,
          description: description || null,
          media_type: mediaType,
          is_featured: isFeatured,
        },
      ]);

      if (error) throw error;

      setStatusMsg({ type: 'success', text: 'Media item successfully published to website!' });
      setTitle('');
      setVideoUrl('');
      setThumbnailUrl('');
      setDescription('');
      setIsFeatured(false);
      loadAllSettings();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Media
  const handleDeleteMedia = async (id: string) => {
    if (!supabase) return;
    if (!confirm('Are you sure you want to delete this media item?')) return;

    try {
      const { error } = await supabase.from('videos').delete().eq('id', id);
      if (error) throw error;
      setVideos(videos.filter((v) => v.id !== id));
      setStatusMsg({ type: 'success', text: 'Media item deleted.' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  // Save Hero CMS
  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setSubmitting(true);

    try {
      const heroData = {
        badge: heroBadge,
        headline_1: headline1,
        headline_2: headline2,
        subtitle: heroSubtitle,
      };

      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'hero_settings', value: heroData, updated_at: new Date().toISOString() });

      if (error) throw error;
      setStatusMsg({ type: 'success', text: 'Hero Section content saved! Refresh main site to see changes.' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // Save Services CMS
  const handleSaveServices = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'services_settings', value: services, updated_at: new Date().toISOString() });

      if (error) throw error;
      setStatusMsg({ type: 'success', text: 'Services section content updated successfully!' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // Save Social & Contact Links
  const handleSaveSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setSubmitting(true);

    try {
      const socialData = {
        email: contactEmail,
        youtube: youtubeUrl,
        instagram: instaUrl,
        facebook: facebookUrl,
      };

      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'social_settings', value: socialData, updated_at: new Date().toISOString() });

      if (error) throw error;
      setStatusMsg({ type: 'success', text: 'Contact & Social links updated successfully!' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setStatusMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatusMsg({ type: 'error', text: 'Passwords do not match!' });
      return;
    }

    if (!supabase) return;
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'admin_password', value: JSON.stringify(newPassword), updated_at: new Date().toISOString() });

      if (error) throw error;
      setStatusMsg({ type: 'success', text: 'Admin Password successfully changed! Remember to use your new password next time.' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Inquiry
  const handleDeleteInquiry = async (id: string) => {
    if (!supabase) return;
    if (!confirm('Are you sure you want to remove this client inquiry?')) return;

    try {
      await supabase.from('inquiries').delete().eq('id', id);
      setInquiries(inquiries.filter((inq) => inq.id !== id));
      setStatusMsg({ type: 'success', text: 'Inquiry removed.' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white/[0.02] border border-white/10 p-6 sm:p-8 rounded-3xl backdrop-blur-2xl shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Cenonmate Admin CMS</h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">Full website control, showreels, and leads</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2 block">
                Enter Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter Password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3.5 text-white pr-12 focus:outline-none focus:border-cyan-400 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {pinError && <p className="text-red-400 text-xs mt-2">{pinError}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-cyan-400 text-black font-bold py-3.5 rounded-xl hover:bg-cyan-300 transition-all text-sm uppercase tracking-wider"
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

  // --- DASHBOARD ---
  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/10 mb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline">
                <ArrowLeft className="w-3.5 h-3.5" /> View Live Website
              </Link>
              <button onClick={handleLogout} className="text-xs text-red-400 hover:underline">
                Log Out
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">CENONMATE ADMIN CMS</h1>
            <p className="text-gray-400 text-xs sm:text-sm">Manage entire website content, media showreels, and client leads.</p>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex flex-wrap gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/10 w-full md:w-auto">
            <button
              onClick={() => { setActiveTab('media'); setStatusMsg(null); }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'media' ? 'bg-cyan-400 text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" /> Media ({videos.length})
            </button>
            <button
              onClick={() => { setActiveTab('hero'); setStatusMsg(null); }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'hero' ? 'bg-cyan-400 text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layout className="w-3.5 h-3.5" /> Hero CMS
            </button>
            <button
              onClick={() => { setActiveTab('services'); setStatusMsg(null); }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'services' ? 'bg-cyan-400 text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Services
            </button>
            <button
              onClick={() => { setActiveTab('social'); setStatusMsg(null); }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'social' ? 'bg-cyan-400 text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" /> Social Links
            </button>
            <button
              onClick={() => { setActiveTab('inquiries'); setStatusMsg(null); }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'inquiries' ? 'bg-cyan-400 text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" /> Inquiries ({inquiries.length})
            </button>
            <button
              onClick={() => { setActiveTab('security'); setStatusMsg(null); }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'security' ? 'bg-cyan-400 text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Key className="w-3.5 h-3.5" /> Password
            </button>
          </div>
        </div>

        {/* Status Notification */}
        {statusMsg && (
          <div
            className={`p-4 rounded-xl mb-6 flex items-center gap-3 text-sm ${
              statusMsg.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}
          >
            {statusMsg.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            {statusMsg.text}
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 1: MEDIA VAULT (VIDEOS, SHORTS, REELS) */}
        {/* ========================================= */}
        {activeTab === 'media' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Add Media Form */}
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 md:p-8 h-fit">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" /> Add New Media
              </h2>
              <form onSubmit={handleAddMedia} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-2 font-semibold">Format Type *</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setMediaType('video')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                        mediaType === 'video'
                          ? 'bg-red-500 text-white border-red-400 shadow-md'
                          : 'bg-white/5 border-white/10 text-gray-400'
                      }`}
                    >
                      Video (16:9)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaType('short')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                        mediaType === 'short'
                          ? 'bg-red-600 text-white border-red-500 shadow-md'
                          : 'bg-white/5 border-white/10 text-gray-400'
                      }`}
                    >
                      YT Short (9:16)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaType('reel')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                        mediaType === 'reel'
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-pink-400 shadow-md'
                          : 'bg-white/5 border-white/10 text-gray-400'
                      }`}
                    >
                      Insta Reel (9:16)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1 font-semibold">Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI Video Breakdown or Product 3D"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1 font-semibold">Video URL (YouTube or Instagram) *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://youtube.com/watch?v=... or reel link"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1 font-semibold">Custom Cover Thumbnail URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1 font-semibold">Short Caption / Description</label>
                  <textarea
                    rows={2}
                    placeholder="Highlights of this edit..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 resize-none"
                  />
                </div>

                {mediaType === 'video' && (
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 accent-cyan-400 rounded"
                    />
                    <label htmlFor="featured" className="text-xs text-gray-300 cursor-pointer">
                      Set as Main Homepage Featured Showreel
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-cyan-400 text-black font-bold py-3.5 rounded-xl hover:bg-cyan-300 transition-all disabled:opacity-50 text-xs uppercase tracking-wider"
                >
                  {submitting ? 'Publishing...' : 'Publish to Website'}
                </button>
              </form>
            </div>

            {/* Published Media List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold mb-4">Published Media Items ({videos.length})</h2>
              {loading && <p className="text-gray-500">Loading...</p>}

              {videos.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-white/20 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[0.65rem] uppercase tracking-wider bg-white/10 border border-white/20 px-2 py-0.5 rounded-full font-bold">
                        {item.media_type || 'video'}
                      </span>
                      <h3 className="font-bold text-base text-white">{item.title}</h3>
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
                  </div>

                  <button
                    onClick={() => handleDeleteMedia(item.id)}
                    className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all self-end sm:self-center"
                    title="Delete Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 2: HERO SECTION CMS */}
        {/* ========================================= */}
        {activeTab === 'hero' && (
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
                className="bg-cyan-400 text-black font-bold px-8 py-3.5 rounded-xl hover:bg-cyan-300 transition-all flex items-center gap-2 text-xs uppercase tracking-wider"
              >
                <Save className="w-4 h-4" /> Save Hero Changes
              </button>
            </form>
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 3: SERVICES CMS */}
        {/* ========================================= */}
        {activeTab === 'services' && (
          <div className="max-w-3xl bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-10">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" /> Edit Services & Capabilities
            </h2>
            <p className="text-gray-400 text-xs mb-6">Modify the 3 service highlights shown in the Expertise section.</p>

            <form onSubmit={handleSaveServices} className="space-y-6">
              {services.map((srv, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                  <div className="flex gap-4">
                    <div className="w-16">
                      <label className="text-[0.65rem] text-gray-400 block mb-1">Number</label>
                      <input
                        type="text"
                        value={srv.num}
                        onChange={(e) => {
                          const updated = [...services];
                          updated[idx].num = e.target.value;
                          setServices(updated);
                        }}
                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-center font-bold"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[0.65rem] text-gray-400 block mb-1">Service Title</label>
                      <input
                        type="text"
                        value={srv.title}
                        onChange={(e) => {
                          const updated = [...services];
                          updated[idx].title = e.target.value;
                          setServices(updated);
                        }}
                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[0.65rem] text-gray-400 block mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={srv.desc}
                      onChange={(e) => {
                        const updated = [...services];
                        updated[idx].desc = e.target.value;
                        setServices(updated);
                      }}
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs leading-relaxed resize-none"
                    />
                  </div>
                </div>
              ))}

              <button
                type="submit"
                disabled={submitting}
                className="bg-cyan-400 text-black font-bold px-8 py-3.5 rounded-xl hover:bg-cyan-300 transition-all flex items-center gap-2 text-xs uppercase tracking-wider"
              >
                <Save className="w-4 h-4" /> Save Services
              </button>
            </form>
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 4: SOCIAL & CONTACT LINKS */}
        {/* ========================================= */}
        {activeTab === 'social' && (
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
                className="bg-cyan-400 text-black font-bold px-8 py-3.5 rounded-xl hover:bg-cyan-300 transition-all flex items-center gap-2 text-xs uppercase tracking-wider"
              >
                <Save className="w-4 h-4" /> Save Links
              </button>
            </form>
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 5: CLIENT INQUIRIES */}
        {/* ========================================= */}
        {activeTab === 'inquiries' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-2">Client Inquiries & Project Briefs ({inquiries.length})</h2>
            <p className="text-gray-400 text-xs mb-6">Messages submitted by potential clients from the website contact form.</p>

            {inquiries.length === 0 && (
              <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-12 text-center text-gray-500">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-semibold text-gray-400">No client inquiries received yet.</p>
                <p className="text-xs mt-1">When clients fill out the contact form on your website, their messages will appear here.</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {inquiries.map((inq) => (
                <div key={inq.id} className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-3 relative group">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-base text-white">{inq.name}</h3>
                      <a href={`mailto:${inq.email}`} className="text-xs text-cyan-400 hover:underline">
                        {inq.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[0.65rem] text-gray-500">
                        {new Date(inq.created_at).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleDeleteInquiry(inq.id)}
                        className="text-gray-500 hover:text-red-400 p-1"
                        title="Delete Inquiry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {inq.details}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 6: SECURITY & PASSWORD CHANGE */}
        {/* ========================================= */}
        {activeTab === 'security' && (
          <div className="max-w-md bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-10">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Key className="w-5 h-5 text-cyan-400" /> Change Admin Password
            </h2>
            <p className="text-gray-400 text-xs mb-6">
              You can change your admin dashboard password anytime right from here without touching any code.
            </p>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1 font-semibold">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter at least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1 font-semibold">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-cyan-400 text-black font-bold py-3.5 rounded-xl hover:bg-cyan-300 transition-all text-xs uppercase tracking-wider"
              >
                {submitting ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
