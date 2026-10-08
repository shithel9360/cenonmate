export interface ParsedMedia {
  platform: 'youtube' | 'instagram' | 'direct' | 'unknown';
  videoId?: string;
  thumbnailUrl?: string;
  hqThumbnailUrl?: string;
  embedUrl?: string;
}

export function parseMediaUrl(url: string): ParsedMedia {
  if (!url) return { platform: 'unknown' };

  if (url.includes('youtube.com/shorts/')) {
    const videoId = url.split('shorts/')[1]?.split(/[?&]/)[0];
    return {
      platform: 'youtube',
      videoId,
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
      hqThumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0`,
    };
  }

  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split(/[?&]/)[0];
    return {
      platform: 'youtube',
      videoId,
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
      hqThumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0`,
    };
  }

  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('watch?v=')[1]?.split(/[?&]/)[0];
    return {
      platform: 'youtube',
      videoId,
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
      hqThumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0`,
    };
  }

  if (url.includes('instagram.com/reel/') || url.includes('instagram.com/p/')) {
    return {
      platform: 'instagram',
      embedUrl: url.split('?')[0] + 'embed/',
    };
  }

  if (url.endsWith('.mp4') || url.endsWith('.webm')) {
    return {
      platform: 'direct',
      embedUrl: url,
    };
  }

  return { platform: 'unknown' };
}
