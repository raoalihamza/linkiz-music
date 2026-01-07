import { useState } from 'react';
import { Download, Link as LinkIcon, Music, Video, Loader2, CheckCircle, AlertCircle, Youtube, Instagram, Facebook } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type ConversionFormat = 'mp3-320' | 'mp4-hd' | 'mp4-sd';
type ConversionStatus = 'idle' | 'validating' | 'converting' | 'ready' | 'error';

interface ConversionResult {
  downloadUrl: string;
  filename: string;
  fileSize: string;
  duration: string;
}

export function Converter() {
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState<ConversionFormat>('mp3-320');
  const [status, setStatus] = useState<ConversionStatus>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<ConversionResult | null>(null);

  const supportedPlatforms = [
    { name: 'YouTube', icon: Youtube, color: 'text-red-500' },
    { name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
    { name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
    { name: 'TikTok', icon: Music, color: 'text-gray-800' },
  ];

  const formats = [
    { value: 'mp3-320', label: 'MP3 320 kbps', icon: Music, description: 'Haute qualité audio' },
    { value: 'mp4-hd', label: 'MP4 HD 1080p', icon: Video, description: 'Vidéo haute définition' },
    { value: 'mp4-sd', label: 'MP4 SD 720p', icon: Video, description: 'Vidéo qualité standard' },
  ];

  const validateUrl = (urlString: string): boolean => {
    try {
      const urlObj = new URL(urlString);
      const validDomains = [
        'youtube.com', 'youtu.be', 'm.youtube.com',
        'instagram.com', 'facebook.com', 'fb.watch',
        'tiktok.com', 'vm.tiktok.com', 'vimeo.com',
        'dailymotion.com', 'soundcloud.com'
      ];
      return validDomains.some(domain => urlObj.hostname.includes(domain));
    } catch {
      return false;
    }
  };

  const handleConvert = async () => {
    setError('');
    setResult(null);

    if (!url.trim()) {
      setError('Veuillez entrer une URL valide');
      return;
    }

    if (!validateUrl(url)) {
      setError('URL non supportée. Utilisez YouTube, Instagram, Facebook, TikTok, etc.');
      return;
    }

    try {
      setStatus('validating');

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/converter`;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (user) {
        headers['Authorization'] = `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          url,
          format,
          userId: user?.id || 'anonymous'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la conversion');
      }

      setStatus('converting');

      setTimeout(() => {
        setResult({
          downloadUrl: data.downloadUrl,
          filename: data.filename,
          fileSize: data.fileSize,
          duration: data.duration
        });
        setStatus('ready');
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setStatus('error');
    }
  };

  const handleDownloadClick = () => {
    if (result) {
      const extension = result.filename.split('.').pop() || 'mp3';
      const mimeType = extension === 'mp3' ? 'audio/mpeg' : 'video/mp4';

      const demoContent = `Demo file: ${result.filename}

This is a demo download. In production, this would be your converted media file.
URL: ${url}
Format: ${format}
Size: ${result.fileSize}
Duration: ${result.duration}

For a real implementation, integrate with a conversion service like:
- youtube-dl / yt-dlp
- FFmpeg
- Cloud conversion APIs`;

      const blob = new Blob([demoContent], { type: 'text/plain' });
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl);
    }
  };

  const handleNewConversion = () => {
    setUrl('');
    setFormat('mp3-320');
    setStatus('idle');
    setError('');
    setResult(null);
  };

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto">

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8 mb-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <LinkIcon className="w-4 h-4 inline mr-2" />
                URL de la vidéo ou audio
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={status === 'validating' || status === 'converting'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Format de téléchargement
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {formats.map((fmt) => {
                  const Icon = fmt.icon;
                  return (
                    <button
                      key={fmt.value}
                      onClick={() => setFormat(fmt.value as ConversionFormat)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        format === fmt.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                      disabled={status === 'validating' || status === 'converting'}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`w-5 h-5 ${format === fmt.value ? 'text-blue-600' : 'text-gray-400'} mt-0.5`} />
                        <div className="flex-1">
                          <div className={`font-semibold ${format === fmt.value ? 'text-blue-900' : 'text-gray-900'}`}>
                            {fmt.label}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {fmt.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">{error}</p>
                    <p className="text-xs text-red-600 mt-1">
                      Vérifiez que l'URL est correcte et accessible
                    </p>
                  </div>
                </div>
              </div>
            )}

            {status === 'validating' && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  <p className="text-sm font-medium text-blue-900">Validation de l'URL...</p>
                </div>
              </div>
            )}

            {status === 'converting' && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Conversion en cours...</p>
                    <p className="text-xs text-blue-600 mt-1">Cela peut prendre quelques instants</p>
                  </div>
                </div>
              </div>
            )}

            {status === 'ready' && result && (
              <div className="p-6 bg-green-50 border-2 border-green-200 rounded-xl">
                <div className="flex items-start gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-900 mb-1">Conversion réussie!</p>
                    <p className="text-xs text-green-700">Votre fichier est prêt à être téléchargé</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Nom du fichier</p>
                      <p className="font-medium text-gray-900 truncate">{result.filename}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Taille</p>
                      <p className="font-medium text-gray-900">{result.fileSize}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={handleDownloadClick}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
                  >
                    <Download className="w-5 h-5" />
                    Télécharger maintenant
                  </button>
                  <button
                    onClick={handleNewConversion}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                  >
                    Nouvelle conversion
                  </button>
                </div>
              </div>
            )}

            {status !== 'ready' && (
              <button
                onClick={handleConvert}
                disabled={status === 'validating' || status === 'converting' || !url.trim()}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-purple-600"
              >
                {status === 'validating' || status === 'converting' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Convertir et télécharger
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
