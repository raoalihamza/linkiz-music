import { supabase } from './supabase';

export interface DownloadCheckResult {
  allowed: boolean;
  reason?: string;
  remainingDownloads?: number;
  planType?: string;
  needsUpgrade?: boolean;
}

export async function checkDownloadQuota(userId: string): Promise<DownloadCheckResult> {
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('plan_type, downloads_used, downloads_limit')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return {
      allowed: false,
      reason: 'Unable to verify your account. Please try again.'
    };
  }

  if (profile.plan_type === 'free') {
    return {
      allowed: false,
      reason: 'Downloads are not available on the free plan.',
      needsUpgrade: true,
      planType: 'free'
    };
  }

  if (profile.downloads_used >= profile.downloads_limit) {
    return {
      allowed: false,
      reason: `You've reached your download limit (${profile.downloads_limit} downloads per month).`,
      needsUpgrade: true,
      planType: profile.plan_type,
      remainingDownloads: 0
    };
  }

  return {
    allowed: true,
    remainingDownloads: profile.downloads_limit - profile.downloads_used,
    planType: profile.plan_type
  };
}

export async function recordDownload(
  userId: string,
  linkId: string,
  pageId: string,
  fileName: string,
  planType: string
): Promise<boolean> {
  try {
    const watermarked = planType === 'starter';

    await supabase.from('downloads').insert({
      user_id: userId,
      link_id: linkId,
      page_id: pageId,
      file_name: fileName,
      watermarked,
      plan_type_at_download: planType
    });

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('downloads_used')
      .eq('id', userId)
      .single();

    if (profile) {
      await supabase
        .from('user_profiles')
        .update({ downloads_used: profile.downloads_used + 1 })
        .eq('id', userId);
    }

    await supabase.rpc('increment', {
      row_id: linkId,
      table_name: 'links',
      column_name: 'download_count'
    });

    return true;
  } catch (error) {
    console.error('Error recording download:', error);
    return false;
  }
}

export function getWatermarkMessage(planType: string): string {
  switch (planType) {
    case 'creator':
      return 'Clean file without watermark';
    case 'starter':
      return 'File includes invisible metadata watermark';
    case 'free':
      return 'File includes audio and branding watermark';
    default:
      return '';
  }
}

export function getPlanLimits(planType: string): { downloads: number; price: number } {
  switch (planType) {
    case 'creator':
      return { downloads: 20, price: 7 };
    case 'starter':
      return { downloads: 3, price: 4 };
    default:
      return { downloads: 0, price: 0 };
  }
}
