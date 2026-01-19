import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Lock, Unlock, Download, FileText, Clock, AlertCircle } from 'lucide-react';
import { fetchShareMetadata, unlockShare } from '../services/share.service';

export default function SecureDownload() {
    const { id } = useParams();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [metadata, setMetadata] = useState<any>(null);
    const [downloadUrl, setDownloadUrl] = useState('');

    useEffect(() => {
        fetchMetadata();
    }, [id]);

    const fetchMetadata = async () => {
        if (!id) return;

        try {
            const data = await fetchShareMetadata(id);
            if (data.success && data.data) {
                setMetadata(data.data);
            } else {
                setError(data.error || 'Failed to load file information');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load file information');
        }
    };

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        setLoading(true);
        setError('');

        try {
            const data = await unlockShare(id, password);
            if (data.success && data.downloadUrl) {
                setDownloadUrl(data.downloadUrl);
            } else {
                setError(data.error || 'Failed to unlock file');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Network error');
        }
        setLoading(false);
    };

    if (!metadata && !error) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center">
                    <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        {downloadUrl ? <Unlock className="w-8 h-8 text-white" /> : <Lock className="w-8 h-8 text-white" />}
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">
                        {downloadUrl ? 'File Unlocked' : 'Protected File'}
                    </h1>
                    <p className="text-blue-100 text-sm">
                        {downloadUrl ? 'Your download is ready' : 'Enter password to access'}
                    </p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {metadata && (
                        <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                            <div className="flex items-center gap-3 mb-2">
                                <FileText className="w-5 h-5 text-gray-400" />
                                <span className="font-medium text-gray-700 truncate">{metadata.file_name}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-400 ml-8">
                                {metadata.file_size && <span>{metadata.file_size}</span>}
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Expires: {new Date(metadata.expires_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    )}

                    {downloadUrl ? (
                        <div className="space-y-4">
                            <a
                                href={downloadUrl}
                                className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold transition-all transform hover:scale-[1.02] shadow-lg shadow-green-200"
                            >
                                <Download className="w-5 h-5" />
                                Download Now
                            </a>
                            <button
                                onClick={() => { setDownloadUrl(''); setPassword(''); }}
                                className="w-full text-center text-gray-400 text-sm hover:text-gray-600"
                            >
                                Lock File Again
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleUnlock}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="••••••••"
                                    autoFocus
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !password}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                            >
                                {loading ? 'Verifying...' : 'Unlock File'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
