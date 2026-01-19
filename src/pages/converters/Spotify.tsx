import { DownloaderCore } from '../../components/DownloaderCore';

interface PageProps {
    onAuthRequired?: () => void;
}

export default function SpotifyPage({ onAuthRequired }: PageProps) {
    return <DownloaderCore initialPlatform="spotify" onAuthRequired={onAuthRequired} />;
}
