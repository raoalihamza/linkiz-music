import { DownloaderCore } from '../../components/DownloaderCore';

interface PageProps {
    onAuthRequired?: () => void;
}

export default function FacebookPage({ onAuthRequired }: PageProps) {
    return <DownloaderCore initialPlatform="facebook" onAuthRequired={onAuthRequired} />;
}
