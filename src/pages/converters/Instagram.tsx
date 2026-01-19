import { DownloaderCore } from '../../components/DownloaderCore';

interface PageProps {
    onAuthRequired?: () => void;
}

export default function InstagramPage({ onAuthRequired }: PageProps) {
    return <DownloaderCore initialPlatform="instagram" onAuthRequired={onAuthRequired} />;
}
