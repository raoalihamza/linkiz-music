import { DownloaderCore } from '../../components/DownloaderCore';

interface PageProps {
    onAuthRequired?: () => void;
}

export default function TikTokPage({ onAuthRequired }: PageProps) {
    return <DownloaderCore initialPlatform="tiktok" onAuthRequired={onAuthRequired} />;
}
