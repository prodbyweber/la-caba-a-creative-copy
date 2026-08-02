import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { X, Check, Music2, Play, Pause, Search, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGlobalAudio } from "@/context/GlobalAudioContext";
import { rankBeatsByGenre } from "@/lib/artistBeats";

// Selector de beats públicos para asignar como recomendados a un artista.
// Prioriza automáticamente los beats cuyos géneros coinciden con los del artista.
// No duplica beats: crea una relación ArtistBeatAssignment (artista ↔ beat).
export default function AssignPublicBeatModal({
  artistId,
  artistGenres,
  excludeBeatIds,
  assignedById,
  onClose,
}) {
  const qc = useQueryClient();
  const { playQueue, playingTrack, isPlaying, pauseTrack, resumeTrack } =
    useGlobalAudio();
  const [selected, setSelected] = useState(new Set());
  const [search, setSearch] = useState("");

  const { data: publicBeats = [], isLoading } = useQuery({
    queryKey: ["beats-public"],
    queryFn: async () => {
      const beats = await base44.entities.Beat.filter({ status: "Publicado" });
      return beats.filter((b) => !b.archived);
    },
  });

  const ranked = useMemo(() => {
    const ranked = rankBeatsByGenre(publicBeats, artistGenres);
    return ranked.filter(({ beat }) => !excludeBeatIds.has(beat.id));
  }, [publicBeats, artistGenres, excludeBeatIds]);

  const filtered = useMemo(() => {
    if (!search.trim()) return ranked;
    const q = search.toLowerCase();
    return ranked.filter(
      ({ beat }) =>
        (beat.title || "").toLowerCase().includes(q) ||
        (beat.producer || "").toLowerCase().includes(q)
    );
  }, [ranked, search]);

  const assignMutation = useMutation({
    mutationFn: async () => {
      const ids = Array.from(selected);
      const existing = await base44.entities.ArtistBeatAssignment.filter({
        artist_id: artistId,
      });
      const existingIds = new Set(existing.map((a) => a.beat_id));
      const maxOrder = existing.reduce((m, a) => Math.max(m, a.order || 0), 0);
      const toCreate = ids
        .filter((id) => !existingIds.has(id))
        .map((id, i) => ({
          artist_id: artistId,
          beat_id: id,
          type: "manual",
          order: maxOrder + i + 1,
          assigned_by_id: assignedById,
        }));
      if (toCreate.length)
        await base44.entities.ArtistBeatAssignment.bulkCreate(toCreate);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["artist-beat-assignments", artistId] });
      onClose();
    },
  });

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const handlePreview = (beat) => {
    const active = playingTrack?.beat_id === beat.id;
    if (active && isPlaying) pauseTrack();
    else if (active) resumeTrack();
    else playQueue([{ ...beat, beat_id: beat.id }], 0);
  };

  const iCls =
    "w-full px-3 py-2.5 rounded-xl text-sm text-white bg-white/[0.05] border border-white/[0.08] focus:outline-none focus:border-white/20 transition-colors placeholder-white/20";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[160] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-2xl rounded-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
        style={{ background: "#141416", border: "1px solid rgba(255,255,255,0.08)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-white/5"
          style={{ background: "#141416" }}
        >
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">
              Asignar beat público
            </h2>
            <p className="text-[11px] text-white/35 mt-0.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#ff5833]" />
              Priorizados por géneros del artista
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white/50" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={iCls + " pl-9"}
              placeholder="Buscar por título o productor..."
            />
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-white/30 text-sm">Cargando beats...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-white/30 text-sm">
              No hay beats disponibles para asignar.
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(({ beat, score }) => {
                const isSel = selected.has(beat.id);
                const active = playingTrack?.beat_id === beat.id;
                return (
                  <div
                    key={beat.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl transition-colors cursor-pointer"
                    style={{
                      background: isSel ? "rgba(255,88,51,0.08)" : "rgba(255,255,255,0.03)",
                      border: isSel
                        ? "1px solid rgba(255,88,51,0.3)"
                        : "1px solid rgba(255,255,255,0.06)",
                    }}
                    onClick={() => toggleSelect(beat.id)}
                  >
                    <div
                      className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
                      style={{ background: "#1a1a1c" }}
                    >
                      {beat.cover_url ? (
                        <img
                          src={beat.cover_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Music2 className="w-4 h-4 text-white/20" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{beat.title}</p>
                      <p className="text-[11px] text-white/40 truncate">
                        {beat.producer || "—"}
                        {score > 0 && (
                          <span className="text-[#ff8866] ml-1.5">· {score} coincidencia(s)</span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(beat);
                      }}
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                      {active && isPlaying ? (
                        <Pause className="w-3.5 h-3.5 text-white" fill="white" />
                      ) : (
                        <Play className="w-3.5 h-3.5 text-white ml-0.5" fill="white" />
                      )}
                    </button>
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                      style={{
                        background: isSel ? "#ff5833" : "rgba(255,255,255,0.08)",
                      }}
                    >
                      {isSel && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div
          className="flex gap-3 px-5 py-4 border-t border-white/5 sticky bottom-0"
          style={{ background: "#141416" }}
        >
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 text-sm font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => assignMutation.mutate()}
            disabled={assignMutation.isPending || selected.size === 0}
            className="flex-1 py-3 rounded-xl text-white text-sm font-bold transition-colors disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #ff5833, #e0451f)" }}
          >
            {assignMutation.isPending
              ? "Asignando..."
              : `Asignar ${selected.size > 0 ? `(${selected.size})` : ""}`}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}