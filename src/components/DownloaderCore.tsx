import { useState, useEffect } from 'react';
import { Download, Link as LinkIcon, Music, Video, Loader2, CheckCircle, AlertCircle, Youtube, Instagram, Facebook, Smartphone, CloudFog, ArrowLeft, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchMediaInfo, convertMedia } from '../services/converter.service';
import { PLATFORM_PATTERNS, PREMIUM_RULES, FORMAT_MAPPING, ERROR_MESSAGES, Platform, MediaType } from '../config/constants';

type ConversionStatus = 'idle' | 'fetching_info' | 'converting' | 'ready' | 'error';

interface VideoInfo {
  platform: Platform;
  title: string;
  thumbnail: string;
  duration: string;
  qualities: {
    video: string[];
    audio: string[];
  };
}

interface ConversionResult {
  downloadUrl: string;
  filename: string;
  fileSize: string;
  duration: string;
}

interface ConverterProps {
  initialPlatform?: string | null;
  onNavigate?: (view: any, slug?: string) => void;
  onAuthRequired?: () => void;
}

export function DownloaderCore({ initialPlatform, onNavigate, onAuthRequired }: ConverterProps) {
  const { user } = useAuth();

  // Platform selection - derived from prop if available
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(
    initialPlatform as Platform || null
  );

  // Sync prop changes to state (e.g. browser back button)
  useEffect(() => {
    if (initialPlatform) {
      setSelectedPlatform(initialPlatform as Platform);
    } else {
      setSelectedPlatform(null);
    }
  }, [initialPlatform]);

  // Converter state
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<ConversionStatus>('idle');
  const [error, setError] = useState('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);

  // Format selection
  const [selectedType, setSelectedType] = useState<MediaType>('video');
  const [selectedQuality, setSelectedQuality] = useState<string>('');

  const [result, setResult] = useState<ConversionResult | null>(null);

  const platforms = [
    {
      id: 'youtube',
      name: 'YouTube',
      icon: Youtube,
      color: 'bg-red-600',
      description: 'Télécharger vidéos et musiques',
      placeholder: 'https://youtube.com/watch?v=...'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      color: 'bg-pink-600',
      description: 'Télécharger Reels et IGTV',
      placeholder: 'https://instagram.com/reel/...'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600',
      description: 'Télécharger vidéos Facebook',
      placeholder: 'https://facebook.com/watch/...'
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: Smartphone,
      color: 'bg-black',
      description: 'Télécharger vidéos TikTok',
      placeholder: 'https://tiktok.com/@user/video/...'
    },
    {
      id: 'soundcloud',
      name: 'SoundCloud',
      icon: CloudFog,
      color: 'bg-orange-500',
      description: 'Télécharger musiques MP3',
      placeholder: 'https://soundcloud.com/artist/track'
    },
    {
      id: 'spotify',
      name: 'Spotify',
      icon: Music,
      color: 'bg-green-600',
      description: 'Télécharger musiques Spotify',
      placeholder: 'https://open.spotify.com/track/...'
    },
  ];

  const currentPlatformInfo = platforms.find(p => p.id === selectedPlatform);

  const resetAll = () => {
    setUrl('');
    setVideoInfo(null);
    setResult(null);
    setStatus('idle');
    setError('');
    setSelectedType('video');
    setSelectedQuality('');
    setSelectedPlatform(null);
  };

  const requiresAuth = videoInfo && selectedQuality && PREMIUM_RULES.isPremium(videoInfo.platform, selectedType, selectedQuality);

  // Handle platform selection via navigation
  const handlePlatformSelect = (platformId: Platform) => {
    if (onNavigate) {
      onNavigate('/converters', platformId);
    } else {
      setSelectedPlatform(platformId);
    }
  };

  // Handle back to grid
  const handleBack = () => {
    resetAll();
    if (onNavigate) {
      onNavigate('/converters'); // Go back to grid
    } else {
      setSelectedPlatform(null);
    }
  };



  const resetConverter = () => {
    setUrl('');
    setVideoInfo(null);
    setResult(null);
    setStatus('idle');
    setError('');
    setSelectedType('video');
    setSelectedQuality('');
  };

  const handleFetchInfo = async () => {
    if (!url) return;

    // Validate URL against selected platform
    if (selectedPlatform && PLATFORM_PATTERNS[selectedPlatform]) {
      const isValid = PLATFORM_PATTERNS[selectedPlatform].test(url);
      if (!isValid) {
        setError(ERROR_MESSAGES.INVALID_URL(currentPlatformInfo?.name || selectedPlatform));
        return;
      }
    }

    setVideoInfo(null);
    setResult(null);
    setStatus('fetching_info');
    setError('');

    let isCancelled = false;

    try {
      const data = await fetchMediaInfo(url);

      if (isCancelled) return;

      setVideoInfo(data);

      // Smart defaults
      if (data.qualities.video.length > 0) {
        setSelectedType('video');
        setSelectedQuality(PREMIUM_RULES.getDefaultQuality(data.platform, 'video', data.qualities.video));
      } else {
        setSelectedType('audio');
        setSelectedQuality(PREMIUM_RULES.getDefaultQuality(data.platform, 'audio', data.qualities.audio));
      }

      setStatus('idle');
    } catch (err) {
      if (isCancelled) return;

      console.error(err);
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.GENERIC_ERROR);
      setStatus('error');
    }

    return () => {
      isCancelled = true;
    };
  };

  const handleConvert = async () => {
    if (!videoInfo || !selectedQuality) return;

    // Check for auth requirement
    if (requiresAuth && !user) {
      if (onAuthRequired) onAuthRequired();
      return;
    }

    setStatus('converting');
    setError('');

    let isCancelled = false;

    try {
      const formatParam = FORMAT_MAPPING.getFormatParam(selectedType, selectedQuality);
      const data = await convertMedia(url, formatParam, user?.id);

      if (isCancelled) return;

      setResult({
        downloadUrl: data.downloadUrl,
        filename: data.filename,
        fileSize: data.fileSize,
        duration: data.duration
      });

      setStatus('ready');
    } catch (err) {
      if (isCancelled) return;

      console.error(err);
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.GENERIC_ERROR);
      setStatus('error');
    }

    return () => {
      isCancelled = true;
    };
  };

  const handleDownloadClick = () => {
    if (result && result.downloadUrl) {
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = result.filename || 'download';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="w-full py-20">
      <div className="max-w-4xl mx-auto px-4">

        {!selectedPlatform ? (
          /* PLATFORM SELECTION GRID */
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
              Choisissez votre plateforme
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {platforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <button
                    key={platform.id}
                    onClick={() => handlePlatformSelect(platform.id as Platform)}
                    className="group relative flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-100 hover:-translate-y-1 overflow-hidden"
                  >
                    <div className={`absolute top-0 left-0 w-full h-1 ${platform.color}`} />
                    <div className={`p-4 rounded-full ${platform.color} bg-opacity-10 mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-8 h-8 text-gray-700`} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{platform.name}</h3>
                    <p className="text-sm text-gray-500 text-center">{platform.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* CONVERTER UI */
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8 mb-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${currentPlatformInfo?.color}`}>
                  {currentPlatformInfo && <currentPlatformInfo.icon className="w-5 h-5 text-white" />}
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  Convertisseur {currentPlatformInfo?.name}
                </h2>
              </div>
            </div>

            <div className="space-y-6">
              {/* URL Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <LinkIcon className="w-4 h-4 inline mr-2" />
                  Lien {currentPlatformInfo?.name}
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !videoInfo && handleFetchInfo()}
                    placeholder={currentPlatformInfo?.placeholder}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={status === 'fetching_info' || status === 'converting'}
                  />
                  {!videoInfo && (
                    <button
                      onClick={handleFetchInfo}
                      disabled={!url || status === 'fetching_info'}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {status === 'fetching_info' ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Chargement...
                        </>
                      ) : (
                        'Analyser'
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-red-900">{error}</p>
                  </div>
                </div>
              )}

              {/* Video Info + Format Selection */}
              {videoInfo && !result && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Video Preview */}
                  <div className="flex gap-4 bg-gray-50 p-4 rounded-xl">
                    {videoInfo.thumbnail ? (
                      <img
                        src={videoInfo.thumbnail}
                        alt="Thumbnail"
                        className="w-32 aspect-video object-cover rounded-lg"
                        onError={(e) => {
                          // Fallback if image fails to load (CORS issues)
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-32 aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                        <Video className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 line-clamp-2 mb-1">{videoInfo.title}</h3>
                      <p className="text-sm text-gray-500">{videoInfo.duration}</p>
                    </div>
                  </div>

                  {/* Type Tabs */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Type</label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setSelectedType('video');
                          if (videoInfo.qualities.video.length) setSelectedQuality(videoInfo.qualities.video[0]);
                        }}
                        disabled={videoInfo.qualities.video.length === 0}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${selectedType === 'video'
                          ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                          : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <Video className="w-4 h-4" /> Vidéo
                      </button>
                      <button
                        onClick={() => {
                          setSelectedType('audio');
                          if (videoInfo.qualities.audio.length) setSelectedQuality(videoInfo.qualities.audio[0]);
                        }}
                        disabled={videoInfo.qualities.audio.length === 0}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${selectedType === 'audio'
                          ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                          : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <Music className="w-4 h-4" /> Audio
                      </button>
                    </div>
                  </div>

                  {/* Quality Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Qualité</label>

                    {/* Simplified UI for Social Media Video Downloads */}
                    {selectedType === 'video' && (videoInfo.platform === 'instagram' || videoInfo.platform === 'facebook' || videoInfo.platform === 'tiktok') ? (
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setSelectedQuality('720p')}
                          className={`p-6 rounded-xl border-2 transition-all ${selectedQuality === '720p'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                        >
                          <div className="text-center">
                            <div className={`text-lg font-bold mb-1 ${selectedQuality === '720p' ? 'text-blue-900' : 'text-gray-900'}`}>
                              Normal Quality
                            </div>
                            <div className="text-xs text-gray-500">Rapide & Gratuit</div>
                            <div className="mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold inline-block">
                              FREE
                            </div>
                          </div>
                        </button>
                        <button
                          onClick={() => setSelectedQuality('1080p')}
                          className={`p-6 rounded-xl border-2 transition-all ${selectedQuality === '1080p'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                        >
                          <div className="text-center">
                            <div className={`text-lg font-bold mb-1 ${selectedQuality === '1080p' ? 'text-blue-900' : 'text-gray-900'}`}>
                              High Quality
                            </div>
                            <div className="text-xs text-gray-500">Meilleure qualité disponible</div>
                            <div className="mt-2 px-3 py-1 bg-gradient-to-r from-yellow-200 to-yellow-400 text-yellow-900 rounded-full text-xs font-bold inline-flex items-center gap-1">
                              <Crown className="w-3 h-3" /> PREMIUM
                            </div>
                          </div>
                        </button>
                      </div>
                    ) : (
                      /* Detailed Quality Grid for YouTube and Audio */
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {(selectedType === 'video' ? videoInfo.qualities.video : videoInfo.qualities.audio).map((q) => {
                          const isPrem = PREMIUM_RULES.isPremium(videoInfo.platform, selectedType, q);
                          return (
                            <button
                              key={q}
                              onClick={() => setSelectedQuality(q)}
                              className={`p-4 rounded-xl border-2 transition-all text-left ${selectedQuality === q
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                            >
                              <div className="flex flex-col gap-2">
                                <span className={`font-semibold ${selectedQuality === q ? 'text-blue-900' : 'text-gray-900'}`}>
                                  {q}
                                </span>
                                {isPrem ? (
                                  <span className="w-fit px-2 py-0.5 text-[10px] bg-gradient-to-r from-yellow-200 to-yellow-400 text-yellow-900 rounded font-bold flex items-center gap-1">
                                    <Crown className="w-3 h-3" /> PREMIUM
                                  </span>
                                ) : (
                                  <span className="w-fit px-2 py-0.5 text-[10px] bg-green-100 text-green-700 rounded font-bold">
                                    FREE
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Convert Button */}
                  <button
                    onClick={handleConvert}
                    disabled={status === 'converting'}
                    className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${requiresAuth && !user
                      ? 'bg-gradient-to-r from-gray-800 to-black text-white hover:from-gray-900 hover:to-black'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                      }`}
                  >
                    {status === 'converting' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Conversion en cours...
                      </>
                    ) : requiresAuth && !user ? (
                      <>
                        <Crown className="w-5 h-5 text-yellow-500" />
                        Se connecter pour télécharger
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Convertir et télécharger
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Result */}
              {result && (
                <div className="p-6 bg-green-50 border-2 border-green-200 rounded-xl animate-in fade-in duration-300">
                  <div className="flex items-start gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-green-900 mb-1">Conversion réussie!</p>
                      <p className="text-xs text-green-700">Votre fichier est prêt</p>
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
                      onClick={resetConverter}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                    >
                      Nouvelle conversion
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
