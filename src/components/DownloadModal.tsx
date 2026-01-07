import { useState, useEffect } from 'react';
import { Download, X, AlertCircle, CheckCircle, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { checkDownloadQuota, recordDownload, getWatermarkMessage } from '../lib/downloadService';
import { supabase } from '../lib/supabase';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkId: string;
  fileName: string;
  onUpgrade: () => void;
}

export function DownloadModal({ isOpen, onClose, linkId, fileName, onUpgrade }: DownloadModalProps) {
  const { user, profile, refreshProfile } = useAuth();
  const [checking, setChecking] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [quotaCheck, setQuotaCheck] = useState<any>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [pageId, setPageId] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      checkQuota();
      loadFileInfo();
    }
  }, [isOpen, linkId, user]);

  const loadFileInfo = async () => {
    const { data: link } = await supabase
      .from('links')
      .select('file_url, page_id')
      .eq('id', linkId)
      .single();

    if (link) {
      setFileUrl(link.file_url);
      setPageId(link.page_id);
    }
  };

  const checkQuota = async () => {
    if (!user) return;
    setChecking(true);
    const result = await checkDownloadQuota(user.id);
    setQuotaCheck(result);
    setChecking(false);
  };

  const handleDownload = async () => {
    if (!user || !profile || !fileUrl || !pageId) return;

    setDownloading(true);

    const recorded = await recordDownload(
      user.id,
      linkId,
      pageId,
      fileName,
      profile.plan_type
    );

    if (recorded) {
      window.open(fileUrl, '_blank');
      setDownloaded(true);
      await refreshProfile();

      setTimeout(() => {
        onClose();
        setDownloaded(false);
      }, 2000);
    } else {
      alert('Failed to process download. Please try again.');
    }

    setDownloading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Download File</h2>
          <p className="text-gray-600">{fileName}</p>
        </div>

        {checking ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : downloaded ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Download Started!</h3>
            <p className="text-gray-600">Your file is downloading now.</p>
          </div>
        ) : quotaCheck?.allowed ? (
          <div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-800 font-medium mb-1">You can download this file</p>
                  <p className="text-green-700 text-sm">
                    {quotaCheck.remainingDownloads} download{quotaCheck.remainingDownloads !== 1 ? 's' : ''} remaining this month
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> {getWatermarkMessage(profile?.plan_type || 'free')}
              </p>
            </div>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Start Download
                </>
              )}
            </button>
          </div>
        ) : (
          <div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium mb-1">Download not available</p>
                  <p className="text-red-700 text-sm">{quotaCheck?.reason}</p>
                </div>
              </div>
            </div>

            {quotaCheck?.needsUpgrade && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-3 mb-4">
                  <Crown className="w-6 h-6 text-purple-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Upgrade to download</h3>
                    <p className="text-gray-700 text-sm">
                      Get access to downloads, remove ads, and support creators
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-1">Starter</h4>
                    <p className="text-2xl font-bold text-blue-600 mb-2">4/mo</p>
                    <p className="text-sm text-gray-600">3 downloads/month</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-purple-300">
                    <h4 className="font-bold text-gray-900 mb-1">Creator</h4>
                    <p className="text-2xl font-bold text-purple-600 mb-2">7/mo</p>
                    <p className="text-sm text-gray-600">20 downloads/month</p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={quotaCheck?.needsUpgrade ? onUpgrade : onClose}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              {quotaCheck?.needsUpgrade ? 'Upgrade Now' : 'Close'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
