import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import DashboardNav from "@/components/dashboard/DashboardNav";
import {
  ArrowLeft, Plus, Music2, Film, Image as ImageIcon,
  Play, Pause, Trash2, X, Check
} from "lucide-react";
import ProjectAssetPicker from "@/components/project/ProjectAssetPicker";

const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

function getYoutubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

const TYPE_LABELS = {
  Single: "Single", EP: "EP", Album: "Álbum",
  Film: "Film", MiniFilm: "Mini Film", Serie: "Serie",
};

// ── Mini audio player ────────────────────────────────────────────────────────
function TrackRow({ track, index, playing, onPlay, onRemove }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [playing]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
      style={{ background: playing ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      {track.audio_file_url && (
        <audio ref={audioRef} src={track.audio_file_url} preload="metadata" onEnded={() => onPlay(null)} />
      )}

      {/* Cover / play */}
      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.06)" }}>
        {track.cover_url
          ? <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
          : <Music2 className="w-4 h-4 text-white/20" />}
        {track.audio_file_url && (
          <button
            onClick={() => onPlay(playing ? null : track.id)}
            className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {playing
              ? <Pause className="w-3.5 h-3.5 text-white" fill="white" />
              : <Play className="w-3.5 h-3.5 text-white ml-0.5" fill="white" />}
          </button>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate font-semibold" style={{ fontFamily: FONT, letterSpacing: "-0.01em" }}>
          {track.title}
        </p>
        {track.duration && (
          <p className="text-[10px] text-white/30">
            {Math.floor(track.duration / 60)}:{String(Math.floor(track.duration % 60)).padStart(2, "0")}
          </p>
        )}
      </div>

      <button
        onClick={() => onRemove(track.id)}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-all"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

// ── Video card ────────────────────────────────────────────────────────────────
function VideoCard({ item, index, onRemove }) {
  const ytId = getYoutubeId(item.youtube_url);
  const thumb = item.thumbnail_url || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="group relative rounded-xl overflow-hidden"
      style={{ aspectRatio: "16/9", background: "rgba(255,255,255,0.05)" }}
    >
      {thumb
        ? <img src={thumb} alt={item.title} className="w-full h-full object-cover" />
        : <div className="w-full h-full flex items-center justify-center"><Film className="w-8 h-8 text-white/15" /></div>}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-xs font-bold text-white truncate" style={{ fontFamily: FONT }}>{item.title}</p>
        {item.content_type && (
          <p className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5">{TYPE_LABELS[item.content_type] || item.content_type}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(item.id)}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/70"
      >
        <X className="w-3 h-3 text-white" />
      </button>
    </motion.div>
  );
}

// ── Photo card ────────────────────────────────────────────────────────────────
function PhotoCard({ item, index, onRemove }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04 }}
      className="group relative rounded-xl overflow-hidden aspect-square"
      style={{ background: "rgba(255,255,255,0.05)" }}
    >
      {item.url
        ? <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
        : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-white/15" /></div>}
      <button
        onClick={() => onRemove(item.id)}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/70"
      >
        <X className="w-3 h-3 text-white" />
      </button>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProjectDetail() {
  const [activeTab, setActiveTab] = useState("tracks");
  const [playingId, setPlayingId] = useState(null);
  const [picker, setPicker] = useState(null); // "tracks" | "videos" | "photos" | null

  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get("id");
  const queryClient = useQueryClient();

  // Current user
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  // Project
  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const r = await base44.entities.Project.filter({ id: projectId });
      return r[0];
    },
    enabled: !!projectId,
  });

  // Artist linked to user
  const { data: selfArtist } = useQuery({
    queryKey: ["self-artist", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      const r = await base44.entities.Artist.filter({ user_id: currentUser.id });
      return r[0] || null;
    },
    enabled: !!currentUser?.id,
  });

  // UserProfile for this user
  const { data: userProfile } = useQuery({
    queryKey: ["user-profile-me", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      const r = await base44.entities.UserProfile.filter({ user_id: currentUser.id });
      return r[0] || null;
    },
    enabled: !!currentUser?.id,
  });

  // All tracks of the artist/user
  const { data: allUserTracks = [] } = useQuery({
    queryKey: ["user-tracks", selfArtist?.id],
    queryFn: () => selfArtist?.id
      ? base44.entities.Track.filter({ artist_id: selfArtist.id })
      : base44.entities.Track.list("-created_date", 200),
    enabled: !!currentUser,
  });

  // All videos (ExplorarItems) of the artist/user
  const { data: allUserVideos = [] } = useQuery({
    queryKey: ["user-videos", selfArtist?.id, currentUser?.email],
    queryFn: async () => {
      let items = [];
      if (selfArtist?.id) {
        items = await base44.entities.ExplorarItem.filter({ artist_id: selfArtist.id });
      } else {
        const all = await base44.entities.ExplorarItem.list("-created_date", 100);
        items = all.filter((i) => i.created_by === currentUser?.email);
      }
      return items.filter((i) => ["film", "minifilm", "series", "Film", "MiniFilm", "Serie"].includes(i.content_type));
    },
    enabled: !!currentUser,
  });

  // User photos from profile media_items
  const userPhotos = (userProfile?.media_items || []).filter((m) => m.type === "image");

  // Project linked asset IDs (stored in project.assets_links as JSON)
  const [linkedAssets, setLinkedAssets] = useState({ tracks: [], videos: [], photos: [] });

  useEffect(() => {
    if (!project) return;
    try {
      const parsed = JSON.parse(project.assets_links?.[0] || "{}");
      setLinkedAssets({
        tracks: parsed.tracks || [],
        videos: parsed.videos || [],
        photos: parsed.photos || [],
      });
    } catch {
      setLinkedAssets({ tracks: [], videos: [], photos: [] });
    }
  }, [project]);

  const updateProjectMutation = useMutation({
    mutationFn: (data) => base44.entities.Project.update(projectId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project", projectId] }),
  });

  const saveAssets = (next) => {
    setLinkedAssets(next);
    updateProjectMutation.mutate({ assets_links: [JSON.stringify(next)] });
  };

  const handlePickerConfirm = (mode, ids) => {
    const next = { ...linkedAssets, [mode]: ids };
    saveAssets(next);
    setPicker(null);
  };

  const removeAsset = (mode, id) => {
    const next = { ...linkedAssets, [mode]: linkedAssets[mode].filter((x) => x !== id) };
    saveAssets(next);
  };

  // Resolve linked items
  const linkedTracks = allUserTracks.filter((t) => linkedAssets.tracks.includes(t.id));
  const linkedVideos = allUserVideos.filter((v) => linkedAssets.videos.includes(v.id));
  const linkedPhotos = userPhotos.filter((p) => linkedAssets.photos.includes(p.id));

  const TABS = [
    { id: "tracks", label: "Tracks", icon: Music2, count: linkedTracks.length },
    { id: "videos", label: "Videos", icon: Film, count: linkedVideos.length },
    { id: "photos", label: "Fotos", icon: ImageIcon, count: linkedPhotos.length },
  ];

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <DashboardNav />

      <main className="pt-14">
        {/* ── HERO ── */}
        <div className="relative overflow-hidden" style={{ minHeight: 280 }}>
          {/* Blurred cover bg */}
          {project.cover_url && (
            <div className="absolute inset-0">
              <img src={project.cover_url} alt="" className="w-full h-full object-cover scale-110 blur-2xl opacity-25" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(10,10,11,0.3), #0a0a0b)" }} />
            </div>
          )}
          {!project.cover_url && (
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 100%)" }} />
          )}

          <div className="relative z-10 px-5 sm:px-8 lg:px-12 pt-8 pb-10 max-w-5xl mx-auto">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 mb-6 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Volver
            </button>

            <div className="flex items-end gap-5 sm:gap-8">
              {/* Cover */}
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                {project.cover_url
                  ? <img src={project.cover_url} alt={project.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><Music2 className="w-10 h-10 text-white/15" /></div>}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 pb-1">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2">
                  {TYPE_LABELS[project.type] || project.type}
                </p>
                <h1
                  className="text-3xl sm:text-5xl font-black text-white leading-[0.95] mb-3 truncate"
                  style={{ fontFamily: FONT, letterSpacing: "-0.04em" }}
                >
                  {project.title}
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  {project.year && (
                    <span className="text-sm text-white/40" style={{ fontFamily: FONT }}>{project.year}</span>
                  )}
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="text-sm text-white/30">{linkedTracks.length} tracks · {linkedVideos.length} videos · {linkedPhotos.length} fotos</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="px-5 sm:px-8 lg:px-12 max-w-5xl mx-auto">
          <div className="flex gap-0 border-b border-white/[0.07] mb-6">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex items-center gap-1.5 px-4 pb-3 pt-1 text-xs font-semibold transition-colors mr-1"
                style={{
                  fontFamily: FONT,
                  color: activeTab === tab.id ? "white" : "rgba(255,255,255,0.3)",
                }}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.count > 0 && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/40">{tab.count}</span>
                )}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="projectTabLine"
                    className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* ── CONTENT ── */}
          <AnimatePresence mode="wait">

            {/* TRACKS */}
            {activeTab === "tracks" && (
              <motion.div key="tracks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-bold text-white/25 uppercase tracking-[0.18em]">Tracks del proyecto</p>
                  <button
                    onClick={() => setPicker("tracks")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/50 hover:text-white transition-all"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <Plus className="w-3 h-3" /> Añadir track
                  </button>
                </div>

                {linkedTracks.length === 0 ? (
                  <button
                    onClick={() => setPicker("tracks")}
                    className="w-full py-16 rounded-2xl border border-dashed border-white/[0.07] flex flex-col items-center gap-3 hover:border-white/15 transition-colors"
                  >
                    <Music2 className="w-8 h-8 text-white/10" />
                    <p className="text-xs text-white/20">Añade tracks de tu catálogo a este proyecto</p>
                  </button>
                ) : (
                  <div className="space-y-2 pb-8">
                    {linkedTracks.map((t, i) => (
                      <TrackRow
                        key={t.id}
                        track={t}
                        index={i}
                        playing={playingId === t.id}
                        onPlay={setPlayingId}
                        onRemove={(id) => removeAsset("tracks", id)}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* VIDEOS */}
            {activeTab === "videos" && (
              <motion.div key="videos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-bold text-white/25 uppercase tracking-[0.18em]">Videos del proyecto</p>
                  <button
                    onClick={() => setPicker("videos")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/50 hover:text-white transition-all"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <Plus className="w-3 h-3" /> Añadir video
                  </button>
                </div>

                {linkedVideos.length === 0 ? (
                  <button
                    onClick={() => setPicker("videos")}
                    className="w-full py-16 rounded-2xl border border-dashed border-white/[0.07] flex flex-col items-center gap-3 hover:border-white/15 transition-colors"
                  >
                    <Film className="w-8 h-8 text-white/10" />
                    <p className="text-xs text-white/20">Añade videos de tu catálogo a este proyecto</p>
                  </button>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-8">
                    {linkedVideos.map((v, i) => (
                      <VideoCard key={v.id} item={v} index={i} onRemove={(id) => removeAsset("videos", id)} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* PHOTOS */}
            {activeTab === "photos" && (
              <motion.div key="photos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-bold text-white/25 uppercase tracking-[0.18em]">Fotos del proyecto</p>
                  <button
                    onClick={() => setPicker("photos")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/50 hover:text-white transition-all"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <Plus className="w-3 h-3" /> Añadir foto
                  </button>
                </div>

                {linkedPhotos.length === 0 ? (
                  <button
                    onClick={() => setPicker("photos")}
                    className="w-full py-16 rounded-2xl border border-dashed border-white/[0.07] flex flex-col items-center gap-3 hover:border-white/15 transition-colors"
                  >
                    <ImageIcon className="w-8 h-8 text-white/10" />
                    <p className="text-xs text-white/20">Añade fotos de tu galería a este proyecto</p>
                  </button>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 pb-8">
                    {linkedPhotos.map((p, i) => (
                      <PhotoCard key={p.id} item={p} index={i} onRemove={(id) => removeAsset("photos", id)} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Asset Picker */}
      <AnimatePresence>
        {picker === "tracks" && (
          <ProjectAssetPicker
            mode="tracks"
            items={allUserTracks}
            selectedIds={linkedAssets.tracks}
            onConfirm={(ids) => handlePickerConfirm("tracks", ids)}
            onClose={() => setPicker(null)}
          />
        )}
        {picker === "videos" && (
          <ProjectAssetPicker
            mode="videos"
            items={allUserVideos}
            selectedIds={linkedAssets.videos}
            onConfirm={(ids) => handlePickerConfirm("videos", ids)}
            onClose={() => setPicker(null)}
          />
        )}
        {picker === "photos" && (
          <ProjectAssetPicker
            mode="photos"
            items={userPhotos}
            selectedIds={linkedAssets.photos}
            onConfirm={(ids) => handlePickerConfirm("photos", ids)}
            onClose={() => setPicker(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}