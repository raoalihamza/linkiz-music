import { useEffect, useState } from 'react';
import { Download, Link as LinkIcon, Eye, TrendingUp, Plus, Crown, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Stats {
  totalPages: number;
  totalLinks: number;
  totalViews: number;
  totalDownloads: number;
}

interface DashboardProps {
  onCreatePage: () => void;
  onUpgrade: () => void;
}

export function Dashboard({ onCreatePage, onUpgrade }: DashboardProps) {
  const { profile } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalPages: 0,
    totalLinks: 0,
    totalViews: 0,
    totalDownloads: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    if (!profile) return;

    const [pagesResult, linksResult, downloadsResult] = await Promise.all([
      supabase
        .from('linkiz_pages')
        .select('view_count')
        .eq('user_id', profile.id),
      supabase
        .from('links')
        .select('id, page_id')
        .in('page_id',
          supabase
            .from('linkiz_pages')
            .select('id')
            .eq('user_id', profile.id)
        ),
      supabase
        .from('downloads')
        .select('id')
        .eq('user_id', profile.id)
    ]);

    const totalViews = pagesResult.data?.reduce((sum, page) => sum + page.view_count, 0) || 0;
    const totalPages = pagesResult.data?.length || 0;
    const totalLinks = linksResult.data?.length || 0;
    const totalDownloads = downloadsResult.data?.length || 0;

    setStats({
      totalPages,
      totalLinks,
      totalViews,
      totalDownloads
    });
    setLoading(false);
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'creator':
        return 'from-purple-500 to-purple-600';
      case 'starter':
        return 'from-blue-500 to-blue-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getPlanLimits = (plan: string) => {
    switch (plan) {
      case 'creator':
        return { downloads: 20, features: 'Clean files, no ads' };
      case 'starter':
        return { downloads: 3, features: 'Metadata watermark, no ads' };
      default:
        return { downloads: 0, features: 'Watermarked files, ads enabled' };
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const limits = getPlanLimits(profile.plan_type);
  const downloadPercentage = limits.downloads > 0
    ? (profile.downloads_used / limits.downloads) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {profile.full_name || 'Creator'}
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your pages, track downloads, and grow your audience
          </p>
        </div>

        <div className={`bg-gradient-to-r ${getPlanColor(profile.plan_type)} rounded-2xl shadow-xl p-8 mb-8 text-white`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Crown className="w-8 h-8" />
                <h2 className="text-3xl font-bold capitalize">{profile.plan_type} Plan</h2>
              </div>
              <p className="text-white/90 text-lg mb-4">{limits.features}</p>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/90">Downloads this month</span>
                    <span className="font-bold">
                      {profile.downloads_used} / {limits.downloads === 0 ? 'N/A' : limits.downloads}
                    </span>
                  </div>
                  {limits.downloads > 0 && (
                    <div className="w-full bg-white/20 rounded-full h-3">
                      <div
                        className="bg-white rounded-full h-3 transition-all duration-300"
                        style={{ width: `${Math.min(downloadPercentage, 100)}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {profile.plan_type === 'free' && (
              <button
                onClick={onUpgrade}
                className="px-8 py-4 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl whitespace-nowrap flex items-center gap-2"
              >
                Upgrade Now
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <LinkIcon className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalPages}</h3>
            <p className="text-gray-600">Active Pages</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <LinkIcon className="w-6 h-6 text-green-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalLinks}</h3>
            <p className="text-gray-600">Total Links</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalViews}</h3>
            <p className="text-gray-600">Page Views</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Download className="w-6 h-6 text-orange-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalDownloads}</h3>
            <p className="text-gray-600">Total Downloads</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Actions</h2>
              <p className="text-gray-600">Get started with creating your first page</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={onCreatePage}
              className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <Plus className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Create New Page</h3>
                  <p className="text-gray-600 text-sm">Build your multi-link hub</p>
                </div>
              </div>
            </button>

            <a
              href="/pages"
              className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-600 transition-colors">
                  <LinkIcon className="w-7 h-7 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Manage Pages</h3>
                  <p className="text-gray-600 text-sm">View and edit your pages</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
