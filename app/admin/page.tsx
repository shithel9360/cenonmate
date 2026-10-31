'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Mail, Video, CheckCircle, 
  AlertCircle, Layout, Layers, Share2, Key 
} from 'lucide-react';
import Link from 'next/link';
import { VideoItem, InquiryItem, ServiceItem, AdminTab } from '@/components/admin/types';
import AdminLogin from '@/components/admin/AdminLogin';
import MediaTab from '@/components/admin/MediaTab';
import HeroTab from '@/components/admin/HeroTab';
import ServicesTab from '@/components/admin/ServicesTab';
import SocialTab from '@/components/admin/SocialTab';
import InquiriesTab from '@/components/admin/InquiriesTab';
import SecurityTab from '@/components/admin/SecurityTab';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('media');
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

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/auth/check');
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error(err);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
    setIsAuthenticated(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAllSettings();
    }
  }, [isAuthenticated, activeTab]);

  const loadAllSettings = async () => {
    setLoading(true);

    try {
      const [vRes, iRes, sRes] = await Promise.all([
        fetch('/api/admin/videos'),
        fetch('/api/admin/inquiries'),
        fetch('/api/admin/settings'),
      ]);

      const [vData, iData, sData] = await Promise.all([
        vRes.json(),
        iRes.json(),
        sRes.json(),
      ]);

      if (vData.videos) setVideos(vData.videos);
      if (iData.inquiries) setInquiries(iData.inquiries);

      if (sData.settings) {
        sData.settings.forEach((item: any) => {
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

  const handleNotify = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
  };

  if (!isAuthenticated) {
    return <AdminLogin onSuccess={() => setIsAuthenticated(true)} />;
  }

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

        {/* Active Tab Views */}
        {activeTab === 'media' && (
          <MediaTab
            videos={videos}
            loading={loading}
            onRefresh={loadAllSettings}
            onNotify={handleNotify}
          />
        )}

        {activeTab === 'hero' && (
          <HeroTab
            key={`${heroBadge}-${headline1}-${headline2}`}
            initialBadge={heroBadge}
            initialHeadline1={headline1}
            initialHeadline2={headline2}
            initialSubtitle={heroSubtitle}
            onNotify={handleNotify}
          />
        )}

        {activeTab === 'services' && (
          <ServicesTab
            key={JSON.stringify(services)}
            initialServices={services}
            onNotify={handleNotify}
          />
        )}

        {activeTab === 'social' && (
          <SocialTab
            key={`${contactEmail}-${youtubeUrl}-${instaUrl}-${facebookUrl}`}
            initialEmail={contactEmail}
            initialYoutube={youtubeUrl}
            initialInstagram={instaUrl}
            initialFacebook={facebookUrl}
            onNotify={handleNotify}
          />
        )}

        {activeTab === 'inquiries' && (
          <InquiriesTab
            inquiries={inquiries}
            onRefresh={loadAllSettings}
            onNotify={handleNotify}
          />
        )}

        {activeTab === 'security' && (
          <SecurityTab onNotify={handleNotify} />
        )}

      </div>
    </div>
  );
}
