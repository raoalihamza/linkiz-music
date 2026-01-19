import { DownloaderCore } from '../../components/DownloaderCore';

interface PageProps {
    onAuthRequired?: () => void;
}

export default function SoundCloudPage({ onAuthRequired }: PageProps) {
    return <DownloaderCore initialPlatform="soundcloud" onAuthRequired={onAuthRequired} />;
}
