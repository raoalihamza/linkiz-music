import { supabase } from './supabase';
import { PLAN_LIMITS, DB_TABLES, ERROR_MESSAGES, PlanType } from '../config/constants';

export interface DownloadCheckResult {
  allowed: boolean;
  reason?: string;
  remainingDownloads?: number;
  planType?: string;
  needsUpgrade?: boolean;
}

export async function checkDownloadQuota(userId: string): Promise<DownloadCheckResult> {
  const { data: profile, error } = await supabase
    .from(DB_TABLES.USER_PROFILES)
    .select('plan_type, downloads_used, downloads_limit')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return {
      allowed: false,
      reason: ERROR_MESSAGES.QUOTA_CHECK_FAILED
    };
  }

  if (profile.plan_type === 'free') {
    return {
      allowed: false,
      reason: ERROR_MESSAGES.NO_DOWNLOADS_FREE,
      needsUpgrade: true,
      planType: 'free'
    };
  }

  if (profile.downloads_used >= profile.downloads_limit) {
    return {
      allowed: false,
      reason: ERROR_MESSAGES.QUOTA_EXCEEDED(profile.downloads_limit),
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

    await supabase.from(DB_TABLES.DOWNLOADS).insert({
      user_id: userId,
      link_id: linkId,
      page_id: pageId,
      file_name: fileName,
      watermarked,
      plan_type_at_download: planType
    });

    const { data: profile } = await supabase
      .from(DB_TABLES.USER_PROFILES)
      .select('downloads_used')
      .eq('id', userId)
      .single();

    if (profile) {
      await supabase
        .from(DB_TABLES.USER_PROFILES)
        .update({ downloads_used: profile.downloads_used + 1 })
        .eq('id', userId);
    }

    await supabase.rpc('increment', {
      row_id: linkId,
      table_name: DB_TABLES.LINKS,
      column_name: 'download_count'
    });

    return true;
  } catch (error) {
    console.error('Error recording download:', error);
    return false;
  }
}

export function getWatermarkMessage(planType: string): string {
  const plan = PLAN_LIMITS[planType as PlanType];
  return plan ? plan.watermarkMessage : '';
}

export function getPlanLimits(planType: string): { downloads: number; price: number } {
  const plan = PLAN_LIMITS[planType as PlanType];
  return plan
    ? { downloads: plan.downloads, price: plan.price }
    : { downloads: 0, price: 0 };
}
