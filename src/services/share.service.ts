/**
 * Share Service
 * Handles secure file sharing and password-protected downloads
 */

import { api } from './api';
import { API_ENDPOINTS } from '../config/constants';

/**
 * Share Metadata Response
 */
export interface ShareMetadata {
  success: boolean;
  data?: {
    file_name: string;
    file_size?: string;
    expires_at: string;
    created_at: string;
  };
  error?: string;
}

/**
 * Share Unlock Request
 */
export interface ShareUnlockRequest {
  shareId: string;
  password: string;
}

/**
 * Share Unlock Response
 */
export interface ShareUnlockResponse {
  success: boolean;
  downloadUrl?: string;
  error?: string;
}

/**
 * Fetch metadata for a secure share
 */
export async function fetchShareMetadata(shareId: string): Promise<ShareMetadata> {
  const endpoint = `${API_ENDPOINTS.SHARE_INFO}/${shareId}`;
  const data = await api.get<ShareMetadata>(endpoint);

  if (!data.success) {
    throw new Error(data.error || 'Failed to load file information');
  }

  return data;
}

/**
 * Unlock a password-protected share
 */
export async function unlockShare(
  shareId: string,
  password: string
): Promise<ShareUnlockResponse> {
  const data = await api.post<ShareUnlockResponse>(API_ENDPOINTS.SHARE_UNLOCK, {
    shareId,
    password,
  });

  if (!data.success) {
    throw new Error(data.error || 'Failed to unlock file');
  }

  return data;
}
