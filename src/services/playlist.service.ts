/**
 * Playlist Service
 * Handles playlist operations including track analysis and export
 */

import { api, getApiBaseUrl } from './api';
import { API_ENDPOINTS } from '../config/constants';

/**
 * Track Information Response
 */
export interface TrackInfoResponse {
  success: boolean;
  title?: string;
  uploader?: string;
  author?: string;
  channel?: string;
  duration?: string;
  thumbnail?: string;
  error?: string;
}

/**
 * Track Export Data
 */
export interface TrackExportData {
  id: string;
  url: string;
  artist: string;
  title: string;
  duration?: string;
  thumbnail?: string;
  status?: string;
}

/**
 * Export Request
 */
export interface ExportRequest {
  tracks: TrackExportData[];
  format: 'txt' | 'csv';
  password?: string;
}

/**
 * Analyze a track URL to get its information
 */
export async function analyzeTrackUrl(url: string): Promise<TrackInfoResponse> {
  const data = await api.post<TrackInfoResponse>(API_ENDPOINTS.INFO, { url });

  if (!data.success) {
    throw new Error(data.error || 'Failed to analyze track');
  }

  return data;
}

/**
 * Export playlist tracks to a file
 * Returns a Blob for download
 */
export async function exportPlaylist(
  tracks: TrackExportData[],
  format: 'txt' | 'csv',
  password?: string,
  authToken?: string
): Promise<Blob> {
  const url = `${getApiBaseUrl()}${API_ENDPOINTS.EXPORT}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      tracks,
      format,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error('Export failed');
  }

  return await response.blob();
}

/**
 * Helper to parse track title and artist intelligently
 */
export function parseTrackInfo(
  title: string,
  uploader?: string,
  author?: string,
  channel?: string
): { artist: string; title: string } {
  let artist = uploader || author || channel || '';
  let cleanedTitle = title || '';

  // Heuristic for YouTube titles often being "Artist - Track Name"
  if (cleanedTitle.includes(' - ') && !artist) {
    const parts = cleanedTitle.split(' - ');
    if (parts.length >= 2) {
      artist = parts[0].trim();
      // Join the rest back in case of multiple dashes "Artist - Track - Remix"
      cleanedTitle = parts.slice(1).join(' - ').trim();
    }
  } else if (cleanedTitle.includes(' - ') && artist) {
    // If artist exists but title has " - ", just clean the title
    const parts = cleanedTitle.split(' - ');
    if (parts.length >= 2) {
      cleanedTitle = parts.slice(1).join(' - ').trim();
    }
  }

  // Final fallback if artist is still empty
  if (!artist || artist.trim() === '') {
    artist = 'Unknown Artist';
  }

  // Clean up common garbage
  cleanedTitle = cleanedTitle.replace(/\[.*?\]|\(.*?\)|\{.*?\}/g, '').trim(); // Remove brackets text like [Official Video]
  cleanedTitle = cleanedTitle
    .replace(/official video|lyrics|audio|visualizer/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return { artist, title: cleanedTitle };
}
