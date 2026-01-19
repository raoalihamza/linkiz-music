import { useEffect, useState } from 'react';
import { Download, ExternalLink, Music, Link as LinkIcon, Youtube, Instagram, Twitter, Facebook } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/database.types';

type LinkizPage = Database['public']['Tables']['linkiz_pages']['Row'];
type Link = Database['public']['Tables']['links']['Row'];

interface PublicPageProps {
  slug: string;
  onDownload: (linkId: string, fileName: string) => void;
  onAuthRequired: () => void;
}

const iconMap: Record<string, any> = {
  link: LinkIcon,
  music: Music,
  youtube: Youtube,
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook
};

export function PublicPage({ slug, onDownload, onAuthRequired }: PublicPageProps) {
  const { user, profile } = useAuth();
  const [page, setPage] = useState<LinkizPage | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadPage();
    incrementViewCount();
  }, [slug]);

  const loadPage = async () => {
    setLoading(true);

    const { data: pageData, error: pageError } = await supabase
      .from('linkiz_pages')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle();

    if (pageError || !pageData) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const { data: linksData } = await supabase
      .from('links')
      .select('*')
      .eq('page_id', pageData.id)
      .eq('is_active', true)
      .order('position');

    setPage(pageData);
    setLinks(linksData || []);
    setLoading(false);
  };

  const incrementViewCount = async () => {
    const { data: pageData } = await supabase
      .from('linkiz_pages')
      .select('id, view_count')
      .eq('slug', slug)
      .maybeSingle();

    if (pageData) {
      await supabase
        .from('linkiz_pages')
        .update({ view_count: pageData.view_count + 1 })
        .eq('id', pageData.id);
    }
  };

  const handleLinkClick = (link: Link) => {
    if (link.is_downloadable && link.file_url) {
      if (!user) {
        onAuthRequired();
        return;
      }
      onDownload(link.id, link.title);
    } else {
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
  };

  const showAds = profile?.plan_type === 'free' || !profile;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-8">Page not found</p>
          <a
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-12 px-4"
      style={{
        background: `linear-gradient(to bottom right, ${page.theme_color}15, white)`
      }}
    >
      <div className="max-w-2xl mx-auto">
        {showAds && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
            <p className="text-sm text-yellow-800">
              Advertisement - Upgrade to remove ads
            </p>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
          <div className="text-center mb-10">
            {page.avatar_url && (
              <div className="w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden border-4 border-gray-100 shadow-lg">
                <img
                  src={page.avatar_url}
                  alt={page.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {page.title}
            </h1>
            {page.description && (
              <p className="text-lg text-gray-600 leading-relaxed max-w-xl mx-auto">
                {page.description}
              </p>
            )}
          </div>

          <div className="space-y-4">
            {links.map((link) => {
              const Icon = iconMap[link.icon] || LinkIcon;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link)}
                  className="w-full flex items-center justify-between gap-4 p-5 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-2xl hover:border-gray-300 hover:shadow-lg transition-all group"
                  style={{
                    borderColor: `${page.theme_color}40`
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md"
                      style={{ backgroundColor: page.theme_color }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-semibold text-gray-900 text-lg group-hover:text-gray-700 transition-colors">
                      {link.title}
                    </span>
                  </div>
                  {link.is_downloadable ? (
                    <Download className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  ) : (
                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  )}
                </button>
              );
            })}
          </div>

          {links.length === 0 && (
            <div className="text-center py-12">
              <LinkIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No links available yet</p>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-500 text-sm mb-4">
              Create your own music link hub
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-600 transition-all shadow-md hover:shadow-lg"
            >
              <Music className="w-5 h-5" />
              Get Started with Linkiz
            </a>
          </div>
        </div>

        {showAds && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl text-center">
            <p className="text-sm text-gray-600">
              Advertisement Space
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
