import { useNavigate } from 'react-router-dom';
import { Youtube, Instagram, Facebook, Music as TikTokIcon, Cloud, Disc } from 'lucide-react';

export default function DownloaderPage() {
    const navigate = useNavigate();

    const platforms = [
        {
            name: 'YouTube',
            icon: Youtube,
            color: 'border-red-500',
            bgColor: 'bg-red-50',
            iconColor: 'text-red-600',
            description: 'Télécharger vidéos et musiques',
            path: '/converters/youtube'
        },
        {
            name: 'Instagram',
            icon: Instagram,
            color: 'border-pink-500',
            bgColor: 'bg-pink-50',
            iconColor: 'text-pink-600',
            description: 'Télécharger Reels et IGTV',
            path: '/converters/instagram'
        },
        {
            name: 'Facebook',
            icon: Facebook,
            color: 'border-blue-500',
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600',
            description: 'Télécharger vidéos Facebook',
            path: '/converters/facebook'
        },
        {
            name: 'TikTok',
            icon: TikTokIcon,
            color: 'border-gray-800',
            bgColor: 'bg-gray-50',
            iconColor: 'text-gray-800',
            description: 'Télécharger vidéos TikTok',
            path: '/converters/tiktok'
        },
        {
            name: 'SoundCloud',
            icon: Cloud,
            color: 'border-orange-500',
            bgColor: 'bg-orange-50',
            iconColor: 'text-orange-600',
            description: 'Télécharger musiques MP3',
            path: '/converters/soundcloud'
        },
        {
            name: 'Spotify',
            icon: Disc,
            color: 'border-green-500',
            bgColor: 'bg-green-50',
            iconColor: 'text-green-600',
            description: 'Télécharger musiques Spotify',
            path: '/converters/spotify'
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 md:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                        Choisissez votre plateforme
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Sélectionnez la plateforme depuis laquelle vous souhaitez télécharger
                    </p>
                </div>

                {/* Platform Cards Grid - Matching the design from image */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {platforms.map((platform) => {
                        const Icon = platform.icon;
                        return (
                            <button
                                key={platform.name}
                                onClick={() => navigate(platform.path)}
                                className={`group relative p-8 bg-white rounded-2xl border-t-4 ${platform.color} shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className={`w-16 h-16 ${platform.bgColor} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className={`w-8 h-8 ${platform.iconColor}`} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {platform.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {platform.description}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
