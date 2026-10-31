export interface VideoItem {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url?: string;
  description?: string;
  media_type?: 'video' | 'short' | 'reel';
  is_featured?: boolean;
  created_at: string;
}

export interface InquiryItem {
  id: string;
  name: string;
  email: string;
  details: string;
  created_at: string;
}

export interface ServiceItem {
  num: string;
  title: string;
  desc: string;
}

export type AdminTab = 'media' | 'hero' | 'services' | 'social' | 'inquiries' | 'security';
