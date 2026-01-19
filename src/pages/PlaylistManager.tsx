import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import {
  Download,
  Trash2,
  Edit3,
  Save,
  Search,
  RefreshCw,
  ExternalLink,
  X,
  List,
  Loader2,
  Music,
  FolderOpen,
  AlertCircle,
  Youtube,
  Lock,
  Eye,
  EyeOff,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  analyzeTrackUrl,
  exportPlaylist,
  parseTrackInfo,
} from "../services/playlist.service";

// Simple Playlist interface (not using database types since table doesn't exist yet)
interface Playlist {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  tracks: Track[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface Track {
  id: string;
  url: string;
  platform: string;
  status: "pending" | "analyzing" | "success" | "error";
  artist: string;
  title: string;
  duration: string;
  thumbnail?: string;
  error?: string;
}

export default function PlaylistManager() {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Persistence State
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState("");
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // UX State
  const [activeTab, setActiveTab] = useState<"workspace" | "playlists">(
    "workspace",
  );

  // Export Password State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportPassword, setExportPassword] = useState("");
  const [exportFormat, setExportFormat] = useState<"txt" | "csv" | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: "delete" | "clear" | "load";
  }>({
    show: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "delete",
  });

  // State for tracking current editing session
  const [currentPlaylistId, setCurrentPlaylistId] = useState<string | null>(
    null,
  );

  // Fetch playlists on mount - DEPEND ON USER ID ONLY
  useEffect(() => {
    if (user?.id) fetchPlaylists();
  }, [user?.id]);

  const fetchPlaylists = async () => {
    if (!user) return;
    setIsLoadingPlaylists(true);
    const { data } = await supabase
      .from("playlists")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setPlaylists(data as Playlist[]);
    setIsLoadingPlaylists(false);
  };

  const savePlaylist = async () => {
    if (!user || !newPlaylistTitle.trim()) {
      toast.error("Please enter a playlist title");
      return;
    }

    if (tracks.length === 0) {
      toast.error("Cannot save empty playlist");
      return;
    }

    setIsSaving(true);

    try {
      // Get current session to ensure we have a valid token
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("No active session. Please log in again.");
      }

      let result;

      if (currentPlaylistId) {
        // UPDATE existing playlist
        console.log("📝 Updating playlist:", currentPlaylistId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result = await (supabase.from("playlists") as any)
          .update({
            title: newPlaylistTitle.trim(),
            tracks: JSON.parse(JSON.stringify(tracks)),
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentPlaylistId)
          .select()
          .single();
      } else {
        // INSERT new playlist
        console.log("Ei New playlist creation");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result = await (supabase.from("playlists") as any)
          .insert({
            user_id: user.id,
            title: newPlaylistTitle.trim(),
            tracks: JSON.parse(JSON.stringify(tracks)), // Deep clone to avoid reference issues
          })
          .select()
          .single();
      }

      const { data, error } = result;

      if (error) throw error;

      const savedPlaylist = data as Playlist;
      setNewPlaylistTitle("");
      setShowSaveModal(false);

      // Update local state IMMEDIATELY for speed
      if (currentPlaylistId) {
        setPlaylists((prev) =>
          prev.map((p) => (p.id === currentPlaylistId ? savedPlaylist : p)),
        );
      } else {
        setPlaylists((prev) => [savedPlaylist, ...prev]);
      }

      // Still fetch in background to stay perfectly in sync
      fetchPlaylists();

      setActiveTab("playlists");

      const savedTitle = savedPlaylist.title || "Playlist";
      toast.success(
        `Playlist "${savedTitle}" ${currentPlaylistId ? "updated" : "saved"} successfully!`,
      );

      // RESET Workspace after ANY save/update
      setTracks([]);
      setCurrentPlaylistId(null);
      setNewPlaylistTitle("");
    } catch (error: unknown) {
      console.error("❌ Save playlist failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save playlist",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const loadPlaylist = (playlist: Playlist) => {
    if (tracks.length > 0 && currentPlaylistId !== playlist.id) {
      setConfirmModal({
        show: true,
        title: "Load Playlist?",
        message:
          "Your current workspace tracks will be replaced. Any unsaved changes will be lost.",
        type: "load",
        onConfirm: () => {
          setTracks(playlist.tracks as unknown as Track[]);
          setCurrentPlaylistId(playlist.id);
          setNewPlaylistTitle(playlist.title);
          setActiveTab("workspace");
          setConfirmModal((prev) => ({ ...prev, show: false }));
          toast.success(`Loaded playlist: ${playlist.title}`);
        },
      });
      return;
    }
    setTracks(playlist.tracks as unknown as Track[]);
    setCurrentPlaylistId(playlist.id); // Set current ID for updates
    setNewPlaylistTitle(playlist.title); // Set title for updates
    setActiveTab("workspace");
    toast.success(`Loaded playlist: ${playlist.title}`);
  };

  const deletePlaylist = async (
    id: string,
    name: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setConfirmModal({
      show: true,
      title: "Delete Playlist?",
      message: `Are you sure you want to permanently delete "${name}"? This action cannot be undone.`,
      type: "delete",
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from("playlists")
            .delete()
            .eq("id", id);
          if (error) throw error;
          toast.success("Playlist deleted");
          fetchPlaylists();
          setConfirmModal((prev) => ({ ...prev, show: false }));
        } catch {
          toast.error("Failed to delete playlist");
        }
      },
    });
  };

  // Helper to guess platform from URL
  const getPlatform = (url: string) => {
    if (url.includes("youtube") || url.includes("youtu.be")) return "youtube";
    if (url.includes("spotify")) return "spotify";
    if (url.includes("soundcloud")) return "soundcloud";
    if (url.includes("bandcamp")) return "bandcamp";
    if (url.includes("beatport")) return "beatport";
    return "unknown";
  };

  // Helper to format duration cleanly (remove milliseconds)
  const formatDuration = (duration: string): string => {
    if (!duration || duration === "--:--") return duration;

    // If it's already in MM:SS format, just remove any decimals
    if (duration.includes(":")) {
      const [mins, secs] = duration.split(":");
      const cleanSecs = secs.split(".")[0]; // Remove milliseconds
      return `${mins}:${cleanSecs.padStart(2, "0")}`;
    }

    // If it's in seconds (number)
    const totalSeconds = parseInt(duration);
    if (isNaN(totalSeconds)) return duration;

    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setIsAnalyzing(true);

    const urls = input.split("\n").filter((u) => u.trim().length > 0);
    const newTracks: Track[] = urls.map((url, i) => ({
      id: `${Date.now()}-${i}`,
      url: url.trim(),
      platform: getPlatform(url),
      status: "pending",
      artist: "",
      title: "Analyze to fetch...",
      duration: "--:--",
    }));

    setTracks((prev) => [...newTracks, ...prev]);
    setInput(""); // Clear input

    // Process sequentially (could be parallelized)
    for (const track of newTracks) {
      await analyzeTrack(track);
    }

    setIsAnalyzing(false);
  };

  const analyzeTrack = async (track: Track) => {
    // update status to analyzing
    setTracks((prev) =>
      prev.map((t) => (t.id === track.id ? { ...t, status: "analyzing" } : t)),
    );

    try {
      const data = await analyzeTrackUrl(track.url);

      if (data.success && data.title) {
        // Intelligent Parsing using service helper
        const { artist, title } = parseTrackInfo(
          data.title,
          data.uploader,
          data.author,
          data.channel,
        );

        setTracks((prev) =>
          prev.map((t) =>
            t.id === track.id
              ? {
                  ...t,
                  status: "success",
                  artist,
                  title,
                  duration: data.duration || "",
                  thumbnail: data.thumbnail,
                }
              : t,
          ),
        );
      } else {
        setTracks((prev) =>
          prev.map((t) =>
            t.id === track.id
              ? {
                  ...t,
                  status: "error",
                  error: data.error || "Failed",
                }
              : t,
          ),
        );
      }
    } catch (err) {
      setTracks((prev) =>
        prev.map((t) =>
          t.id === track.id
            ? {
                ...t,
                status: "error",
                error: err instanceof Error ? err.message : "Network Error",
              }
            : t,
        ),
      );
    }
  };

  const updateTrack = (
    id: string,
    field: "artist" | "title",
    value: string,
  ) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
    );
  };

  const removeTrack = (id: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== id));
  };

  const clearAll = () => {
    setConfirmModal({
      show: true,
      title: "Clear Workspace?",
      message:
        "This will remove all tracks from your workspace. This action cannot be undone.",
      type: "clear",
      onConfirm: () => {
        resetWorkspace();
        setConfirmModal((prev) => ({ ...prev, show: false }));
        toast.success("Workspace cleared");
      },
    });
  };

  const resetWorkspace = () => {
    setTracks([]);
    setCurrentPlaylistId(null);
    setNewPlaylistTitle("");
    setInput("");
  };

  const triggerExport = (format: "txt" | "csv") => {
    if (tracks.length === 0) {
      toast.error("No tracks to export");
      return;
    }
    setExportFormat(format);
    setExportPassword("");
    setShowExportModal(true);
  };

  const confirmExport = async () => {
    if (!exportFormat) return;
    setShowExportModal(false);

    try {
      // Get session token for auth
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const blob = await exportPlaylist(
        tracks,
        exportFormat,
        exportPassword || undefined,
        token,
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // If password was used, backend sends a ZIP
      const extension = exportPassword ? "zip" : exportFormat;
      a.download = `linkiz_playlist_${Date.now()}.${extension}`;

      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success("Export started!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export failed due to network error.");
    }
  };

  // Smart Link Generators
  const getSearchLink = (
    platform: "beatport" | "spotify" | "soundcloud" | "youtube",
    artist: string,
    title: string,
  ) => {
    const query = encodeURIComponent(`${artist} ${title}`);
    switch (platform) {
      case "beatport":
        return `https://www.beatport.com/search?q=${query}`;
      case "spotify":
        return `https://open.spotify.com/search/${query}`;
      case "soundcloud":
        return `https://soundcloud.com/search?q=${query}`;
      case "youtube":
        return `https://www.youtube.com/results?search_query=${query}`;
    }
  };

  // Sorting State
  const [sortField, setSortField] = useState<keyof Track | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (field: keyof Track) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedTracks = [...tracks].sort((a, b) => {
    if (!sortField) return 0;

    const valA = a[sortField] || "";
    const valB = b[sortField] || "";

    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xl min-h-[800px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-8 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Playlist Manager
            </h1>
            <p className="text-gray-600">
              Create, analyze, and manage your music playlists.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 bg-white">
          <button
            onClick={() => setActiveTab("workspace")}
            className={`px-8 py-4 font-medium text-sm transition-colors relative ${activeTab === "workspace" ? "text-blue-600 bg-blue-50/50" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}
          >
            <span className="flex items-center gap-2">
              <Edit3 className="w-4 h-4" /> Workspace ({tracks.length})
            </span>
            {activeTab === "workspace" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>
            )}
          </button>
          <button
            onClick={() => {
              resetWorkspace();
              setActiveTab("playlists");
              fetchPlaylists();
            }}
            className={`px-8 py-4 font-medium text-sm transition-colors relative ${activeTab === "playlists" ? "text-blue-600 bg-blue-50/50" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}
          >
            <span className="flex items-center gap-2">
              <List className="w-4 h-4" /> My Playlists
            </span>
            {activeTab === "playlists" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 bg-white">
          {/* --- WORKSPACE TAB --- */}
          {activeTab === "workspace" && (
            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Input Panel */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl">
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    Scan Links
                  </label>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Paste links here (one per line)..."
                    className="w-full h-64 p-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-xs resize-none text-gray-900"
                  />
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !input.trim()}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 text-sm"
                  >
                    {isAnalyzing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    Analyze Tracks
                  </button>
                </div>
              </div>

              {/* Results Panel */}
              <div className="lg:col-span-2 flex flex-col h-[600px]">
                <div className="bg-white border border-gray-200 rounded-2xl flex-1 flex flex-col overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 sticky top-0 z-20">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">Tracks</span>
                      <span className="bg-white border border-gray-200 px-2.5 py-0.5 rounded-full text-xs text-gray-600 font-mono font-bold shadow-sm">
                        {tracks.length}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {currentPlaylistId ? (
                        <button
                          onClick={resetWorkspace}
                          className="px-4 py-2 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" /> Start New
                        </button>
                      ) : (
                        <button
                          onClick={clearAll}
                          disabled={tracks.length === 0}
                          className="px-4 py-2 text-red-600 hove:bg-red-50 rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 transition-all active:scale-95 border border-red-200 bg-white"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Clear
                        </button>
                      )}
                      <button
                        onClick={() => setShowSaveModal(true)}
                        disabled={tracks.length === 0}
                        className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50 transition-all active:scale-95"
                      >
                        <Save className="w-3.5 h-3.5" />{" "}
                        {currentPlaylistId ? "Update" : "Save"}
                      </button>
                      <div className="h-8 w-px bg-gray-200 mx-1"></div>
                      <button
                        onClick={() => triggerExport("txt")}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                      >
                        TXT
                      </button>
                      <button
                        onClick={() => triggerExport("csv")}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                      >
                        CSV
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-auto">
                    {tracks.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <Music className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-sm font-medium">
                          Workspace is empty
                        </p>
                        <p className="text-xs mt-1">
                          Paste links above to get started
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                          <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
                            <tr>
                              <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider w-8 text-center">
                                Status
                              </th>
                              <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider w-12 text-center">
                                Src
                              </th>
                              <th
                                className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider w-1/4 cursor-pointer hover:text-blue-600 transition-colors"
                                onClick={() => handleSort("artist")}
                              >
                                Artist
                              </th>
                              <th
                                className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider w-1/3 cursor-pointer hover:text-blue-600 transition-colors"
                                onClick={() => handleSort("title")}
                              >
                                Title
                              </th>
                              <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider w-16 text-center">
                                Time
                              </th>
                              <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">
                                Find More
                              </th>
                              <th className="p-4 w-8"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {sortedTracks.map((track) => (
                              <tr
                                key={track.id}
                                className="hover:bg-blue-50/30 transition-colors group"
                              >
                                <td className="p-4 text-center align-middle">
                                  {track.status === "analyzing" && (
                                    <Loader2 className="w-4 h-4 animate-spin text-blue-500 mx-auto" />
                                  )}
                                  {track.status === "error" && (
                                    <div title={track.error}>
                                      <AlertCircle className="w-4 h-4 text-red-500 mx-auto" />
                                    </div>
                                  )}
                                  {track.status === "success" && (
                                    <div className="w-2 h-2 rounded-full bg-green-500 mx-auto shadow-sm shadow-green-200"></div>
                                  )}
                                </td>
                                <td className="p-4 align-middle">
                                  <div className="flex justify-center">
                                    {track.platform === "youtube" ? (
                                      <div title="YouTube">
                                        <Youtube className="w-5 h-5 text-red-600" />
                                      </div>
                                    ) : track.platform === "spotify" ? (
                                      <div
                                        title="Spotify"
                                        className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
                                      >
                                        S
                                      </div>
                                    ) : track.platform === "soundcloud" ? (
                                      <div
                                        title="SoundCloud"
                                        className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
                                      >
                                        Sc
                                      </div>
                                    ) : (
                                      <div title="Unknown Source">
                                        <ExternalLink className="w-4 h-4 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="p-4 align-middle">
                                  <div
                                    className="relative group/input"
                                    title={track.artist}
                                  >
                                    <input
                                      type="text"
                                      value={track.artist}
                                      onChange={(e) =>
                                        updateTrack(
                                          track.id,
                                          "artist",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full bg-transparent border-none p-0 text-sm font-bold text-gray-900 placeholder-gray-300 focus:ring-0 truncate"
                                      placeholder="Unknown Artist"
                                    />
                                  </div>
                                </td>
                                <td className="p-4 align-middle">
                                  <div
                                    className="relative group/input"
                                    title={track.title}
                                  >
                                    <input
                                      type="text"
                                      value={track.title}
                                      onChange={(e) =>
                                        updateTrack(
                                          track.id,
                                          "title",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full bg-transparent border-none p-0 text-sm text-gray-600 focus:ring-0 truncate"
                                    />
                                  </div>
                                </td>
                                <td className="p-4 text-xs text-gray-400 font-mono text-center align-middle">
                                  {formatDuration(track.duration)}
                                </td>
                                <td className="p-4 align-middle">
                                  <div className="flex justify-center gap-2">
                                    <a
                                      href={getSearchLink(
                                        "beatport",
                                        track.artist,
                                        track.title,
                                      )}
                                      target="_blank"
                                      rel="noreferrer"
                                      title="Search Beatport"
                                      className="p-1 px-2 bg-gray-900 rounded text-[9px] font-bold text-white hover:bg-black transition-all"
                                    >
                                      BP
                                    </a>
                                    <a
                                      href={getSearchLink(
                                        "spotify",
                                        track.artist,
                                        track.title,
                                      )}
                                      target="_blank"
                                      rel="noreferrer"
                                      title="Search Spotify"
                                      className="p-1 px-2 bg-green-500 rounded text-[9px] font-bold text-white hover:bg-green-600 transition-all"
                                    >
                                      SP
                                    </a>
                                    <a
                                      href={getSearchLink(
                                        "soundcloud",
                                        track.artist,
                                        track.title,
                                      )}
                                      target="_blank"
                                      rel="noreferrer"
                                      title="Search Soundcloud"
                                      className="p-1 px-2 bg-orange-500 rounded text-[9px] font-bold text-white hover:bg-orange-600 transition-all"
                                    >
                                      SC
                                    </a>
                                    <a
                                      href={getSearchLink(
                                        "youtube",
                                        track.artist,
                                        track.title,
                                      )}
                                      target="_blank"
                                      rel="noreferrer"
                                      title="Search YouTube"
                                      className="p-1 px-2 bg-red-600 rounded text-[9px] font-bold text-white hover:bg-red-700 transition-all"
                                    >
                                      YT
                                    </a>
                                  </div>
                                </td>
                                <td className="p-4 text-right align-middle">
                                  <button
                                    onClick={() => removeTrack(track.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 shadow-sm border border-gray-100 bg-white"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- PLAYLISTS TAB --- */}
          {activeTab === "playlists" && (
            <div className="p-8">
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h2 className="text-lg font-bold text-gray-900">
                    Saved Playlists
                  </h2>
                  <button
                    onClick={fetchPlaylists}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-gray-100"
                  >
                    <RefreshCw
                      className={`w-5 h-5 ${isLoadingPlaylists ? "animate-spin" : ""}`}
                    />
                  </button>
                </div>

                {isLoadingPlaylists ? (
                  <div className="p-20 flex justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                  </div>
                ) : playlists.length === 0 ? (
                  <div className="p-20 text-center text-gray-500 flex flex-col items-center">
                    <FolderOpen className="w-16 h-16 text-gray-200 mb-4" />
                    <p className="text-lg font-medium">No playlists found</p>
                    <p className="text-sm mt-1 mb-6">
                      You haven't saved any playlists yet.
                    </p>
                    <button
                      onClick={() => setActiveTab("workspace")}
                      className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md"
                    >
                      Create your first playlist
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/3">
                            Title
                          </th>
                          <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Tracks
                          </th>
                          <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {playlists.map((pl) => (
                          <tr
                            key={pl.id}
                            className="hover:bg-blue-50/30 group transition-colors"
                          >
                            <td className="p-4 font-bold text-gray-900">
                              {pl.title}
                            </td>
                            <td className="p-4 text-sm text-gray-600">
                              <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs font-bold text-gray-700 border border-gray-200">
                                {(pl.tracks as Track[])?.length || 0} tracks
                              </span>
                            </td>
                            <td className="p-4 text-sm text-gray-500">
                              {new Date(pl.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => loadPlaylist(pl)}
                                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50 flex items-center gap-2 transition-all shadow-sm active:scale-95"
                                >
                                  <Edit3 className="w-4 h-4" /> Edit
                                </button>
                                <button
                                  onClick={(e) =>
                                    deletePlaylist(pl.id, pl.title, e)
                                  }
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Save Modal */}
          {showSaveModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-in fade-in zoom-in duration-300 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {currentPlaylistId
                      ? "Update Playlist"
                      : "Save New Playlist"}
                  </h3>
                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>
                <div className="mb-8">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Playlist Title
                  </label>
                  <input
                    type="text"
                    value={newPlaylistTitle}
                    onChange={(e) => setNewPlaylistTitle(e.target.value)}
                    placeholder="My Awesome Mix"
                    className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 outline-none text-xl font-bold transition-all"
                    autoFocus
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Saved playlists can be loaded back into the workspace
                    anytime.
                  </p>
                </div>
                <button
                  onClick={savePlaylist}
                  disabled={!newPlaylistTitle.trim() || isSaving}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all active:scale-95 text-lg"
                >
                  {isSaving ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Save className="w-6 h-6" />
                  )}
                  {isSaving
                    ? "Saving..."
                    : currentPlaylistId
                      ? "Update Existing"
                      : "Save Playlist"}
                </button>
              </div>
            </div>
          )}

          {/* Export Password Modal */}
          {showExportModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full animate-in fade-in zoom-in duration-300 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Lock className="w-6 h-6 text-blue-600" />
                    </div>
                    Secure Export
                  </h3>
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>

                <div className="mb-8">
                  <p className="text-sm text-gray-600 mb-4 font-medium">
                    Protect your <strong>.{exportFormat}</strong> file with a
                    password.
                  </p>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={exportPassword}
                      onChange={(e) => setExportPassword(e.target.value)}
                      placeholder="Enter password..."
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none pr-12 font-bold transition-all"
                      autoFocus
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 italic">
                    leave empty for no password
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmExport}
                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Download className="w-5 h-5 font-bold" /> Export
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Global Confirmation Modal */}
          {confirmModal.show && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full animate-in fade-in zoom-in duration-300 border border-gray-100 text-center">
                <div
                  className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${confirmModal.type === "delete" ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"}`}
                >
                  {confirmModal.type === "delete" ? (
                    <Trash2 className="w-10 h-10" />
                  ) : (
                    <AlertCircle className="w-10 h-10" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {confirmModal.title}
                </h3>
                <p className="text-gray-600 mb-8 px-2 text-sm leading-relaxed">
                  {confirmModal.message}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      setConfirmModal((prev) => ({ ...prev, show: false }))
                    }
                    className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmModal.onConfirm}
                    className={`flex-1 py-3 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95 ${confirmModal.type === "delete" ? "bg-red-500 hover:bg-red-600 shadow-red-200" : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"}`}
                  >
                    {confirmModal.type === "delete" ? "Delete" : "Confirm"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
