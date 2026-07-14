import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBeatPlayer } from "@/hooks/useBeatPlayer";
import { Play, Pause, Heart, Bookmark, Download, FolderOpen, ArrowLeft, Activity, ShoppingBag } from "lucide-react";
import { getCoverForBeat } from "@/lib/beatsUtils";
import { formatDuration } from "@/lib/musicConstants";
import BeatCard from "@/components/beats/BeatCard";
import BeatLicensesModal from "@/components/beats/BeatLicensesModal";

export default function BeatDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { toggle, playingTrack, isPlaying } = useBeatPlayer();
  const [user, setUser] = useState(null);
  const [licensesModal, setLicensesModal] = useState(false);
  const [likedIds, setLikedIds] = useState(new Set());
  const [savedIds, setSavedIds] = useState(new Set());

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) setUser(await base44.auth.me());
    });
  }, []);

  const { data: allBeats = [], isLoading: loadingAll } = useQuery({
    queryKey: ["beats-public"],
    queryFn: async () => {
      const all = await base44.entities.Beat.filter({ status: "Publicado" });
      return all.filter(b => !b.archived);
    },
  });

  // Resolver por slug (URL limpia) o por id (legacy)
  const isLikelyId = (id || "").length >= 20 && !/[^a-zA-Z0-9]/.test(id);
  const bySlug = allBeats.find(b => b.slug && b.slug === id);
  const { data: beat, isLoading } = useQuery({
    queryKey: ["beat", bySlug?.id || id],
    queryFn: async () => {
      if (bySlug) return bySlug;
      return base44.entities.Beat.get(id);
    },
    enabled: !!id && (!!bySlug || isLikelyId),
  });

  const { data: likes = [] } = useQuery({
    queryKey: ["beat-likes-me", user?.id],
    queryFn: async () => user?.id ? base44.entities.BeatLike.filter({ user_id: user.id }) : [],
    enabled: !!user?.id,
  });
  const { data: saves = [] } = useQuery({
    queryKey: ["beat-saves-me", user?.id],
    queryFn: async () => user?.id ? base44.entities.BeatSave.filter({ user_id: user.id }) : [],
    enabled: !!user?.id,
  });

  useEffect(() => { setLikedIds(new Set(likes.map(l => l.beat_id))); }, [likes]);
  useEffect(() => { setSavedIds(new Set(saves.map(s => s.beat_id))); }, [saves]);

  const likeMutation = useMutation({
    mutationFn: async (b) => {
      if (likedIds.has(b.id)) {
        const like = likes.find(l => l.beat_id === b.id);
        if (like) await base44.entities.BeatLike.delete(like.id);
      } else {
        await base44.entities.BeatLike.create({ beat_id: b.id, user_id: user.id });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["beat-likes-me", user?.id] }),
  });
  const saveMutation = useMutation({
    mutationFn: async (b) => {
      if (savedIds.has(b.id)) {
        const save = saves.find(s => s.beat_id === b.id);
        if (save) await base44.entities.BeatSave.delete(save.id);
      } else {
        await base44.entities.BeatSave.create({ beat_id: b.id, user_id: user.id });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["beat-saves-me", user?.id] });
      qc.invalidateQueries({ queryKey: ["saved-beats"] });
      qc.invalidateQueries({ queryKey: ["saved-beats", user?.id] });
    },
  });

  const handleDownload = useCallback(async (b) => {
    if (!b.free_mp3_url) return;
    try {
      if (user?.id) await base44.entities.BeatDownload.create({ beat_id: b.id, user_id: user.id, license_type: "mp3_free" });
      const res = await fetch(b.free_mp3_url);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const fn = new URL(b.free_mp3_url).pathname.split("/").pop() || `${b.title}.mp3`;
      a.download = decodeURIComponent(fn);
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch { window.open(b.free_mp3_url, "_blank"); }
  }, [user]);

  const handleBuy = useCallback((b) => {
    if (b.buy_link) window.open(b.buy_link, "_blank", "noopener,noreferrer");
    else setLicensesModal(true);
  }, []);

  const handlePlay = useCallback((b, list) => {
    toggle(b, list);
  }, [toggle]);

  const active = playingTrack?.beat_id === beat?.id;

  // Related: same genre or producer, exclude self
  const related = useMemo(() => {
    if (!beat) return [];
    return allBeats
      .filter(b => b.id !== beat.id && (
        (b.genres || []).some(g => (beat.genres || []).includes(g)) ||
        b.producer === beat.producer
      ))
      .slice(0, 10);
  }, [beat, allBeats]);

  const resolvingSlug = !isLikelyId && !bySlug;
  if (isLoading || (resolvingSlug && loadingAll)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0e0e0e" }}>
        <div className="w-8 h-8 rounded-full border-2 border-[#ff5833] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!beat) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#0e0e0e" }}>
        <p className="text-white/60">Beat no encontrado</p>
        <Link to="/beats" className="text-[#ff8866] text-sm font-semibold">Volver a Beats</Link>
      </div>
    );
  }

  const cover = getCoverForBeat(beat);

  return (
    <div className="min-h-screen pb-32" style={{ background: "#0e0e0e", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Back */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-5 sm:px-10 py-3.5" style={{ background: "rgba(14,14,14,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <Link to="/beats" className="flex items-center gap-2 text-xs font-semibold text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Beats
        </Link>
        {user ? (
          <Link to="/ArtistDashboard" className="text-xs font-semibold text-white/70 hover:text-white px-4 py-2 rounded-full bg-white/5 border border-white/10">Mi catálogo</Link>
        ) : (
          <Link to="/register" className="text-xs font-bold text-[#0e0e0e] px-4 py-2 rounded-full" style={{ background: "#a7f3d0" }}>Empezar gratis →</Link>
        )}
      </div>

      {/* Hero */}
      <div className="relative w-full overflow-hidden" style={{ height: "min(70vh, 560px)" }}>
        <img src={cover} alt={beat.title} className="absolute inset-0 w-full h-full object-cover" style={{ filter: "saturate(0.7) brightness(0.4)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #0e0e0e 5%, rgba(14,14,14,0.4) 50%, rgba(14,14,14,0.6) 100%)" }} />

        <div className="relative h-full flex flex-col justify-end px-5 sm:px-10 max-w-5xl mx-auto pb-8">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3" style={{ color: "#ff8866" }}>{beat.producer || "Cabaña Creative"}</p>
            <h1 className="text-4xl sm:text-7xl font-black text-white mb-4" style={{ letterSpacing: "-0.04em", lineHeight: 0.92 }}>{beat.title}</h1>

            {/* Meta row */}
            <div className="flex items-center gap-4 flex-wrap mb-6">
              {beat.bpm && <span className="text-xs text-white/60 font-semibold">{beat.bpm} BPM</span>}
              {(beat.scale || beat.key) && <span className="text-xs text-white/60 font-semibold">{beat.scale || beat.key}</span>}
              {beat.duration > 0 && <span className="text-xs text-white/60 font-semibold">{formatDuration(beat.duration)}</span>}
              <span className="text-xs text-white/40 font-semibold flex items-center gap-1"><Activity className="w-3 h-3" /> {beat.plays_count || 0}</span>
              <span className="text-xs text-white/40 font-semibold flex items-center gap-1"><Download className="w-3 h-3" /> {beat.downloads_count || 0}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => handlePlay(beat, [beat, ...related])}
                className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-105"
                style={{ background: "linear-gradient(135deg, #ff5833, #e0451f)" }}
              >
                {active && isPlaying ? <Pause className="w-7 h-7 text-white" fill="white" /> : <Play className="w-7 h-7 text-white ml-1" fill="white" />}
              </button>
              <button
                onClick={() => likeMutation.mutate(beat)}
                className="w-12 h-12 rounded-full flex items-center justify-center border border-white/15 hover:bg-white/10 transition-colors"
              >
                <Heart className={`w-5 h-5 ${likedIds.has(beat.id) ? "fill-[#ff3b3b] text-[#ff3b3b]" : "text-white"}`} />
              </button>
              <button
                onClick={() => saveMutation.mutate(beat)}
                className="w-12 h-12 rounded-full flex items-center justify-center border border-white/15 hover:bg-white/10 transition-colors"
              >
                <Bookmark className={`w-5 h-5 ${savedIds.has(beat.id) ? "fill-[#ffd23f] text-[#ffd23f]" : "text-white"}`} />
              </button>
              {beat.free_mp3_url && (
                <button
                  onClick={() => handleDownload(beat)}
                  className="w-12 h-12 rounded-full flex items-center justify-center border border-white/15 hover:bg-white/10 transition-colors"
                >
                  <Download className="w-5 h-5 text-white" />
                </button>
              )}
              {beat.drive_folder_url && (
                <a
                  href={beat.drive_folder_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-12 h-12 rounded-full flex items-center justify-center border border-white/15 hover:bg-white/10 transition-colors"
                >
                  <FolderOpen className="w-5 h-5 text-white" />
                </a>
              )}
              {(beat.buy_link || (beat.licenses && beat.licenses.length > 0)) && (
                <button
                  onClick={() => handleBuy(beat)}
                  className="flex items-center gap-2 px-5 h-12 rounded-full text-sm font-bold text-white transition-transform hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #ff5833, #e0451f)" }}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Comprar Beat
                </button>
              )}
              <button
                onClick={() => setLicensesModal(true)}
                className="px-5 h-12 rounded-full text-sm font-bold transition-all"
                style={{ background: "linear-gradient(135deg, rgba(255,88,51,0.22), rgba(255,88,51,0.08))", border: "1px solid rgba(255,88,51,0.35)", color: "#ff8866" }}
              >
                Licencias
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Details */}
      <div className="px-5 sm:px-10 max-w-5xl mx-auto pt-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Description */}
          <div className="sm:col-span-2">
            {beat.description && (
              <>
                <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Descripción</h2>
                <p className="text-sm text-white/70 leading-relaxed mb-8 whitespace-pre-wrap">{beat.description}</p>
              </>
            )}

            {/* Genres + Moods */}
            <div className="space-y-5">
              {beat.genres && beat.genres.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Géneros</h3>
                  <div className="flex flex-wrap gap-2">
                    {beat.genres.map(g => (
                      <span key={g} className="px-3 py-1.5 rounded-full text-xs font-semibold text-white/80" style={{ background: "#1a1a1a", border: "1px solid #262626" }}>{g}</span>
                    ))}
                  </div>
                </div>
              )}
              {beat.moods && beat.moods.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Moods</h3>
                  <div className="flex flex-wrap gap-2">
                    {beat.moods.map(m => (
                      <span key={m} className="px-3 py-1.5 rounded-full text-xs font-semibold text-white/80" style={{ background: "#1a1a1a", border: "1px solid #262626" }}>{m}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tech specs */}
          <div>
            <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Ficha técnica</h2>
            <div className="rounded-2xl p-4 space-y-3" style={{ background: "#1a1a1a", border: "1px solid #262626" }}>
              {[
                ["Productor", beat.producer],
                ["BPM", beat.bpm ? `${beat.bpm}` : "—"],
                ["Tonalidad", beat.key || "—"],
                ["Escala", beat.scale || "—"],
                ["Duración", beat.duration ? formatDuration(beat.duration) : "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-xs text-[#a0a0a0]">{k}</span>
                  <span className="text-xs font-semibold text-white">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="px-5 sm:px-10 max-w-7xl mx-auto pt-12">
          <h2 className="text-2xl font-black text-white mb-5" style={{ letterSpacing: "-0.03em" }}>Relacionados</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {related.map((b, i) => (
              <BeatCard
                key={b.id}
                beat={b}
                index={i}
                user={user}
                liked={likedIds.has(b.id)}
                saved={savedIds.has(b.id)}
                onLike={user ? (x) => likeMutation.mutate(x) : null}
                onSave={user ? (x) => saveMutation.mutate(x) : null}
                onDownload={user ? handleDownload : null}
                onBuy={handleBuy}
                listBeats={related}
              />
            ))}
          </div>
        </div>
      )}

      {/* Licenses modal */}
      {licensesModal && (
        <BeatLicensesModal beat={beat} onClose={() => setLicensesModal(false)} user={user} />
      )}
    </div>
  );
}