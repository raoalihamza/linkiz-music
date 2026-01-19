/**
 * Application Constants
 * Centralized configuration for plan limits, premium features, and platform settings
 */

/**
 * Plan Types
 */
export type PlanType = 'free' | 'starter' | 'creator';

/**
 * Platform Types
 */
export type Platform = 'youtube' | 'instagram' | 'facebook' | 'tiktok' | 'soundcloud' | 'spotify';

/**
 * Conversion Media Types
 */
export type MediaType = 'video' | 'audio';

/**
 * Plan Configuration
 */
export interface PlanConfig {
  downloads: number;
  price: number;
  watermark: 'none' | 'metadata' | 'full';
  watermarkMessage: string;
}

/**
 * Plan limits and pricing configuration
 */
export const PLAN_LIMITS: Record<PlanType, PlanConfig> = {
  creator: {
    downloads: 20,
    price: 7,
    watermark: 'none',
    watermarkMessage: 'Clean file without watermark',
  },
  starter: {
    downloads: 3,
    price: 4,
    watermark: 'metadata',
    watermarkMessage: 'File includes invisible metadata watermark',
  },
  free: {
    downloads: 0,
    price: 0,
    watermark: 'full',
    watermarkMessage: 'File includes audio and branding watermark',
  },
};

/**
 * Database table names
 */
export const DB_TABLES = {
  USER_PROFILES: 'user_profiles',
  LINKIZ_PAGES: 'linkiz_pages',
  LINKS: 'links',
  DOWNLOADS: 'downloads',
  PLAYLISTS: 'playlists',
  SECURE_SHARES: 'secure_shares',
} as const;

/**
 * Platform URL validation patterns
 */
export const PLATFORM_PATTERNS: Record<Platform, RegExp> = {
  youtube: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
  instagram: /^(https?:\/\/)?(www\.|dd)?instagram\.com\/(p|reels?|tv)\/.+$/,
  facebook: /^(https?:\/\/)?(www\.|web\.|m\.)?(facebook\.com|fb\.watch)\/.+$/,
  tiktok: /^(https?:\/\/)?(www\.)?(tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)\/.+$/,
  soundcloud: /^(https?:\/\/)?(www\.)?(soundcloud\.com|snd\.sc)\/.+$/,
  spotify: /^(https?:\/\/)?(open\.spotify\.com)\/.+$/,
};

/**
 * Platform configurations
 */
export interface PlatformInfo {
  id: Platform;
  name: string;
  color: string;
  description: string;
  placeholder: string;
}

/**
 * Premium Feature Rules
 * Defines which formats require authentication/subscription
 */
export const PREMIUM_RULES = {
  /**
   * Check if a specific format requires premium access
   */
  isPremium: (platform: Platform, type: MediaType, quality: string): boolean => {
    // Spotify & SoundCloud: All formats are Premium
    if (platform === 'spotify' || platform === 'soundcloud') {
      return true;
    }

    // Social Media (TikTok, Instagram, Facebook)
    if (platform === 'tiktok' || platform === 'instagram' || platform === 'facebook') {
      if (type === 'audio') return true; // All audio is Premium
      if (type === 'video' && quality === '1080p') return true; // HQ Video is Premium
      return false; // 720p Video is Free
    }

    // YouTube
    if (platform === 'youtube') {
      const height = parseInt(quality) || 0;
      const bitrate = parseInt(quality) || 0;

      if (type === 'video') {
        // > 720p is Premium (1080p, 1440p, 4k etc)
        if (
          quality.includes('4k') ||
          quality.includes('2k') ||
          quality.includes('1440p') ||
          quality.includes('2160p')
        ) {
          return true;
        }
        return height > 720;
      }

      if (type === 'audio') {
        // > 128kbps is Premium
        return bitrate > 128;
      }
    }

    return false;
  },

  /**
   * Get default quality for a platform and media type
   */
  getDefaultQuality: (platform: Platform, type: MediaType, availableQualities: string[]): string => {
    if (type === 'audio') {
      return availableQualities[0] || '320kbps';
    }

    // For social media platforms, default to Normal Quality (720p)
    if (platform === 'instagram' || platform === 'facebook' || platform === 'tiktok') {
      return '720p';
    }

    // For YouTube, default to 1080p if available
    if (platform === 'youtube') {
      const has1080 = availableQualities.find((q) => q === '1080p');
      return has1080 || availableQualities[0];
    }

    return availableQualities[0] || '720p';
  },
};

/**
 * Format conversion mapping
 * Maps quality settings to backend format parameters
 */
export const FORMAT_MAPPING = {
  /**
   * Convert quality settings to backend format parameter
   */
  getFormatParam: (type: MediaType, quality: string): string => {
    if (type === 'audio') {
      return `mp3-${quality.replace('kbps', '')}`;
    }

    // Video format mapping
    let height = 0;
    if (quality.toLowerCase().includes('4k')) height = 2160;
    else if (quality.toLowerCase().includes('2k')) height = 1440;
    else height = parseInt(quality);

    if (height >= 1440) return 'mp4-4k';
    if (height >= 1080) return 'mp4-hd';
    return 'mp4-sd';
  },
};

/**
 * API Endpoints (relative paths, used with base URL from env)
 */
export const API_ENDPOINTS = {
  // Converter endpoints
  INFO: '/api/info',
  CONVERT: '/api/convert',
  PROXY_IMAGE: '/api/proxy-image',

  // Share endpoints
  SHARE_INFO: '/api/share/info',
  SHARE_UNLOCK: '/api/share/unlock',

  // Playlist endpoints
  EXPORT: '/api/export',

  // Supabase Functions
  SUPABASE_CONVERTER: '/functions/v1/converter',
} as const;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  INVALID_URL: (platform: string) => `Veuillez entrer une URL valide pour ${platform}`,
  FETCH_INFO_FAILED: 'Failed to fetch video info',
  CONVERSION_FAILED: 'Conversion error',
  GENERIC_ERROR: 'Une erreur est survenue',
  QUOTA_CHECK_FAILED: 'Unable to verify your account. Please try again.',
  NO_DOWNLOADS_FREE: 'Downloads are not available on the free plan.',
  QUOTA_EXCEEDED: (limit: number) =>
    `You've reached your download limit (${limit} downloads per month).`,
} as const;
