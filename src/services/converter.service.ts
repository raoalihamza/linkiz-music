/**
 * Converter Service
 * Handles video/audio conversion and information fetching
 */

import { api, getApiBaseUrl } from './api';
import { API_ENDPOINTS, Platform } from '../config/constants';

/**
 * Video Information Response
 */
export interface VideoInfo {
  success: boolean;
  platform: Platform;
  title: string;
  thumbnail: string;
  duration: string;
  qualities: {
    video: string[];
    audio: string[];
  };
  error?: string;
}

/**
 * Conversion Request
 */
export interface ConversionRequest {
  url: string;
  format: string;
  userId?: string;
}

/**
 * Conversion Response
 */
export interface ConversionResult {
  success: boolean;
  downloadUrl: string;
  filename: string;
  fileSize: string;
  duration: string;
  error?: string;
}

/**
 * Fetch video/audio information from URL
 */
export async function fetchMediaInfo(url: string): Promise<VideoInfo> {
  const data = await api.post<VideoInfo>(API_ENDPOINTS.INFO, { url });

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch media info');
  }

  // Proxy thumbnail URL to avoid CORS issues
  const proxiedData = {
    ...data,
    thumbnail: data.thumbnail
      ? `${getApiBaseUrl()}${API_ENDPOINTS.PROXY_IMAGE}?url=${encodeURIComponent(data.thumbnail)}`
      : data.thumbnail,
  };

  return proxiedData;
}

/**
 * Convert media to specified format
 */
export async function convertMedia(
  url: string,
  format: string,
  userId?: string
): Promise<ConversionResult> {
  const data = await api.post<ConversionResult>(API_ENDPOINTS.CONVERT, {
    url,
    format,
    userId: userId || 'anonymous',
  });

  if (!data.success) {
    throw new Error(data.error || 'Conversion failed');
  }

  return data;
}

/**
 * Get proxied image URL (for avoiding CORS)
 */
export function getProxiedImageUrl(imageUrl: string): string {
  return `${getApiBaseUrl()}${API_ENDPOINTS.PROXY_IMAGE}?url=${encodeURIComponent(imageUrl)}`;
}
