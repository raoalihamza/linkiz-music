import { DownloaderCore } from '../../components/DownloaderCore';

interface PageProps {
    onAuthRequired?: () => void;
}

export default function YouTubePage({ onAuthRequired }: PageProps) {
    return <DownloaderCore initialPlatform="youtube" onAuthRequired={onAuthRequired} />;
}
