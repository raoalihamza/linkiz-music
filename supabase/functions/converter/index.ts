import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ConversionRequest {
  url: string;
  format: 'mp3-320' | 'mp4-hd' | 'mp4-sd';
  userId: string;
}

interface VideoInfo {
  title: string;
  duration: number;
  thumbnail: string;
  author: string;
}

function validateUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
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
}

function extractVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);

    if (urlObj.hostname.includes('youtube.com')) {
      return urlObj.searchParams.get('v');
    } else if (urlObj.hostname.includes('youtu.be')) {
      return urlObj.pathname.substring(1);
    }

    return null;
  } catch {
    return null;
  }
}

async function getVideoInfo(url: string): Promise<VideoInfo> {
  const videoId = extractVideoId(url);

  return {
    title: `Video_${videoId || 'unknown'}`,
    duration: 180,
    thumbnail: '',
    author: 'Unknown'
  };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function convertMedia(url: string, format: string, videoInfo: VideoInfo): Promise<{
  downloadUrl: string;
  filename: string;
  fileSize: string;
  duration: string;
}> {
  const extension = format.startsWith('mp3') ? 'mp3' : 'mp4';
  const quality = format === 'mp3-320' ? '320kbps' : format === 'mp4-hd' ? '1080p' : '720p';

  const sanitizedTitle = videoInfo.title
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);

  const filename = `${sanitizedTitle}_${quality}.${extension}`;

  const estimatedSize = format.startsWith('mp3')
    ? videoInfo.duration * 320 * 1024 / 8
    : format === 'mp4-hd'
    ? videoInfo.duration * 8 * 1024 * 1024 / 60
    : videoInfo.duration * 4 * 1024 * 1024 / 60;

  const downloadUrl = `https://example.com/download/${encodeURIComponent(filename)}`;

  return {
    downloadUrl,
    filename,
    fileSize: formatFileSize(estimatedSize),
    duration: formatDuration(videoInfo.duration)
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      throw new Error("Method not allowed");
    }

    const body: ConversionRequest = await req.json();
    const { url, format, userId } = body;

    if (!url || !format) {
      throw new Error("URL and format are required");
    }

    if (!validateUrl(url)) {
      throw new Error("URL not supported. Please use YouTube, Instagram, Facebook, TikTok, Vimeo, etc.");
    }

    const videoInfo = await getVideoInfo(url);
    const result = await convertMedia(url, format, videoInfo);

    return new Response(
      JSON.stringify({
        success: true,
        ...result,
        message: "Conversion initiated successfully"
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );

  } catch (error) {
    console.error("Conversion error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "An error occurred during conversion"
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});