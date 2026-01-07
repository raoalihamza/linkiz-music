import { useState, useEffect } from 'react';
import { Plus, Save, Trash2, GripVertical, Eye, Music, Link as LinkIcon, Youtube, Instagram, Twitter, Facebook } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type LinkizPage = Database['public']['Tables']['linkiz_pages']['Row'];
type Link = Database['public']['Tables']['links']['Row'];

interface PageEditorProps {
  pageId?: string;
  onSave: () => void;
  onCancel: () => void;
}

const iconOptions = [
  { value: 'link', label: 'Link', icon: LinkIcon },
  { value: 'music', label: 'Music', icon: Music },
  { value: 'youtube', label: 'YouTube', icon: Youtube },
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'twitter', label: 'Twitter', icon: Twitter },
  { value: 'facebook', label: 'Facebook', icon: Facebook }
];

export function PageEditor({ pageId, onSave, onCancel }: PageEditorProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState<Partial<LinkizPage>>({
    title: '',
    description: '',
    slug: '',
    theme_color: '#3b82f6',
    is_published: true
  });
  const [links, setLinks] = useState<Partial<Link>[]>([]);

  useEffect(() => {
    if (pageId) {
      loadPage();
    }
  }, [pageId]);

  const loadPage = async () => {
    if (!pageId) return;
    setLoading(true);

    const [pageResult, linksResult] = await Promise.all([
      supabase
        .from('linkiz_pages')
        .select('*')
        .eq('id', pageId)
        .single(),
      supabase
        .from('links')
        .select('*')
        .eq('page_id', pageId)
        .order('position')
    ]);

    if (pageResult.data) setPage(pageResult.data);
    if (linksResult.data) setLinks(linksResult.data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);

    try {
      let savedPageId = pageId;

      if (pageId) {
        await supabase
          .from('linkiz_pages')
          .update({
            title: page.title,
            description: page.description,
            slug: page.slug,
            theme_color: page.theme_color,
            is_published: page.is_published
          })
          .eq('id', pageId);
      } else {
        const { data, error } = await supabase
          .from('linkiz_pages')
          .insert({
            user_id: profile.id,
            title: page.title || 'My Page',
            description: page.description || '',
            slug: page.slug || `page-${Date.now()}`,
            theme_color: page.theme_color || '#3b82f6',
            is_published: page.is_published ?? true
          })
          .select()
          .single();

        if (error) throw error;
        savedPageId = data.id;
      }

      if (savedPageId) {
        const { data: existingLinks } = await supabase
          .from('links')
          .select('id')
          .eq('page_id', savedPageId);

        if (existingLinks) {
          await supabase
            .from('links')
            .delete()
            .eq('page_id', savedPageId);
        }

        const linksToInsert = links.map((link, index) => ({
          page_id: savedPageId,
          title: link.title || '',
          url: link.url || '',
          icon: link.icon || 'link',
          file_url: link.file_url || null,
          is_downloadable: link.is_downloadable || false,
          position: index,
          is_active: link.is_active ?? true
        }));

        if (linksToInsert.length > 0) {
          await supabase.from('links').insert(linksToInsert);
        }
      }

      onSave();
    } catch (error) {
      console.error('Error saving page:', error);
      alert('Failed to save page. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addLink = () => {
    setLinks([
      ...links,
      {
        title: '',
        url: '',
        icon: 'link',
        is_downloadable: false,
        is_active: true,
        position: links.length
      }
    ]);
  };

  const updateLink = (index: number, field: string, value: any) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const moveLink = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === links.length - 1)
    ) {
      return;
    }

    const newLinks = [...links];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]];
    setLinks(newLinks);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {pageId ? 'Edit Page' : 'Create New Page'}
          </h1>
          <p className="text-gray-600">Build your personalized music link hub</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Page Settings</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Page Title
              </label>
              <input
                type="text"
                value={page.title || ''}
                onChange={(e) => setPage({ ...page, title: e.target.value })}
                placeholder="My Music Page"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={page.description || ''}
                onChange={(e) => setPage({ ...page, description: e.target.value })}
                placeholder="Tell your audience about your music..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Page URL Slug
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">linkiz.app/</span>
                <input
                  type="text"
                  value={page.slug || ''}
                  onChange={(e) => setPage({ ...page, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                  placeholder="my-page"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme Color
              </label>
              <input
                type="color"
                value={page.theme_color || '#3b82f6'}
                onChange={(e) => setPage({ ...page, theme_color: e.target.value })}
                className="h-12 w-24 border border-gray-300 rounded-xl cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="published"
                checked={page.is_published ?? true}
                onChange={(e) => setPage({ ...page, is_published: e.target.checked })}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="published" className="text-sm font-medium text-gray-700">
                Publish this page (make it publicly accessible)
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Links</h2>
            <button
              onClick={addLink}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Link
            </button>
          </div>

          <div className="space-y-4">
            {links.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No links yet. Add your first link!</p>
                <button
                  onClick={addLink}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Add Link
                </button>
              </div>
            ) : (
              links.map((link, index) => (
                <div
                  key={index}
                  className="p-6 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col gap-2 pt-3">
                      <button
                        onClick={() => moveLink(index, 'up')}
                        disabled={index === 0}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <GripVertical className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={link.title || ''}
                          onChange={(e) => updateLink(index, 'title', e.target.value)}
                          placeholder="Link Title"
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <select
                          value={link.icon || 'link'}
                          onChange={(e) => updateLink(index, 'icon', e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {iconOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <input
                        type="url"
                        value={link.url || ''}
                        onChange={(e) => updateLink(index, 'url', e.target.value)}
                        placeholder="https://..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />

                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={link.is_downloadable || false}
                            onChange={(e) => updateLink(index, 'is_downloadable', e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Downloadable</span>
                        </label>

                        {link.is_downloadable && (
                          <input
                            type="url"
                            value={link.file_url || ''}
                            onChange={(e) => updateLink(index, 'file_url', e.target.value)}
                            placeholder="File URL"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => removeLink(index)}
                      className="text-red-500 hover:text-red-700 transition-colors p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={onCancel}
            className="px-6 py-3 text-gray-700 font-medium hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-4">
            {pageId && (
              <a
                href={`/${page.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                <Eye className="w-5 h-5" />
                Preview
              </a>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Page
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
