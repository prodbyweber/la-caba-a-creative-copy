import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useGlobalAudio } from "@/context/GlobalAudioContext";
import {
  Music2,
  Play,
  Pause,
  Plus,
  Link2,
  Pencil,
  Trash2,
  X,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Lock,
} from "lucide-react";
import { collectArtistGenres, rankBeatsByGenre } from "@/lib/artistBeats";
import ArtistBeatFormModal from "./ArtistBeatFormModal";
import AssignPublicBeatModal from "./AssignPublicBeatModal";

// Gestor de beats del artista — independiente del marketplace público.
//   • Beats exclusivos: privados subidos específicamente para este artista.
//   • Beats recomendados: beats públicos del catálogo general asignados (manual)
//     o sugeridos automáticamente por coincidencia de géneros.
// Solo el administrador puede subir, editar, eliminar, asignar y reordenar.
// El artista solo puede escuchar.
export default function ArtistBeatsSection({ artistId, isAdmin, artist, assignedById }) {
  const qc = useQueryClient();
  const { playingTrack, isPlaying, playQueue, pauseTrack, resumeTrack } = useGlobalAudio();
  const [showForm, setShowForm] = useState(false);
  const [editingBeat, setEditingBeat] = useState(null);
  const [showAssign, setShowAssign] = useState(false);

  const { data: privateBeats = [] } = useQuery({
    queryKey: ["artist-beats", artistId],
    queryFn: () => base44.entities.ArtistBeat.filter({ artist_id: artistId }),
    enabled: !!artistId,
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ["artist-beat-assignments", artistId],
    queryFn: () => base44.entities.ArtistBeatAssignment.filter({ artist_id: artistId }),
    enabled: !!artistId,
  });

  const { data: publicBeats = [] } = useQuery({
    queryKey: ["beats-public"],
    queryFn: async () => {
      const beats = await base44.entities.Beat.filter({ status: "Publicado" });
      return beats.filter((b) => !b.archived);
    },
  });

  const { data: artistTracks = [] } = useQuery({
    queryKey: ["artist-tracks-genres", artistId],
    queryFn: () => base44.entities.Track.filter({ artist_id: artistId }),
    enabled: !!artistId,
  });

  const { data: artistProjects = [] } = useQuery({
    queryKey: ["artist-projects-genres", artistId],
    queryFn: () => base44.entities.Project.filter({ artist_id: artistId }),
    enabled: !!artistId,
  });

  const artistGenres = useMemo(
    () => collectArtistGenres(artist, artistTracks, artistProjects),
    [artist, artistTracks, artistProjects]
  );

  const beatMap = useMemo(() => {
    const m = new Map();
    publicBeats.forEach((b) => m.set(b.id, b));
    return m;
  }, [publicBeats]);

  // Recomendados manuales (ordenados por `order`)
  const manualRecommended = useMemo(() => {
    return assignments
      .filter((a) => a.type === "manual")
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((a) => ({ assignment: a, beat: beatMap.get(a.beat_id) }))
      .filter((x) => x.beat);
  }, [assignments, beatMap]);

  const assignedIds = useMemo(
    () => new Set(assignments.map((a) => a.beat_id)),
    [assignments]
  );

  // Recomendados automáticos por géneros (excluyendo los ya asignados manualmente)
  const autoRecommended = useMemo(() => {
    return rankBeatsByGenre(publicBeats, artistGenres)
      .filter(({ beat, score }) => score > 0 && !assignedIds.has(beat.id))
      .slice(0, 8)
      .map(({ beat }) => beat);
  }, [publicBeats, artistGenres, assignedIds]);

  const deleteBeat = useMutation({
    mutationFn: (id) => base44.entities.ArtistBeat.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["artist-beats", artistId] }),
  });

  const unassign = useMutation({
    mutationFn: (id) => base44.entities.ArtistBeatAssignment.delete(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["artist-beat-assignments", artistId] }),
  });

  const reorder = useMutation({
    mutationFn: async ({ assignment, dir }) => {
      const sorted = manualRecommended.map((x) => x.assignment);
      const idx = sorted.findIndex((a) => a.id === assignment.id);
      const swap = dir === "up" ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= sorted.length) return;
      const a = sorted[idx];
      const b = sorted[swap];
      await base44.entities.ArtistBeatAssignment.bulkUpdate([
        { id: a.id, order: b.order || 0 },
        { id: b.id, order: a.order || 0 },
      ]);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["artist-beat-assignments", artistId] }),
  });

  const playPrivate = (beat) => {
    const active = playingTrack?.beat_id === beat.id;
    if (active && isPlaying) return pauseTrack();
    if (active) return resumeTrack();
    const queue = privateBeats.map((b) => ({
      ...b,
      beat_id: b.id,
      preview_mp3_url: b.audio_url,
      producer: artist?.stageName || "Cabaña Creative",
    }));
    const idx = queue.findIndex((b) => b.beat_id === beat.id);
    playQueue(queue, Math.max(0, idx));
  };

  const playPublic = (beat, list) => {
    const active = playingTrack?.beat_id === beat.id;
    if (active && isPlaying) return pauseTrack();
    if (active) return resumeTrack();
    const queue = list.map((b) => ({ ...b, beat_id: b.id }));
    const idx = queue.findIndex((b) => b.beat_id === beat.id);
    playQueue(queue, Math.max(0, idx));
  };

  if (!artistId) return null;

  const cardStyle = { background: "#161616", border: "1px solid rgba(255,255,255,0.05)" };

  const renderPrivateCard = (beat) => {
    const active = playingTrack?.beat_id === beat.id;
    return (
      <div key={beat.id} className="group relative rounded-xl overflow-hidden" style={cardStyle}>
        <div
          className="relative aspect-square overflow-hidden cursor-pointer"
          style={{ background: "#1a1a1c" }}
          onClick={() => beat.audio_url && playPrivate(beat)}
        >
          {beat.cover_url ? (
            <img
              src={beat.cover_url}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music2 className="w-8 h-8 text-white/15" />
            </div>
          )}
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.6)" }}>
            <Lock className="w-2.5 h-2.5 text-[#ff8866]" />
            <span className="text-[8px] font-bold uppercase tracking-wider text-[#ff8866]">Privado</span>
          </div>
          {beat.audio_url && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #ff5833, #e0451f)" }}>
                {active && isPlaying ? <Pause className="w-4 h-4 text-white" fill="white" /> : <Play className="w-4 h-4 text-white ml-0.5" fill="white" />}
              </div>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-xs font-bold text-white truncate">{beat.title}</h3>
          <p className="text-[10px] text-white/40 truncate">
            {beat.bpm ? `${beat.bpm} BPM` : "—"}
            {beat.key ? ` · ${beat.key}` : ""}
          </p>
          {isAdmin && (
            <div className="flex items-center gap-1 mt-2">
              <button
                onClick={() => { setEditingBeat(beat); setShowForm(true); }}
                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Pencil className="w-3 h-3 text-white/40" />
              </button>
              <button
                onClick={() => {
                  if (confirm(`¿Eliminar el beat "${beat.title}"?`)) deleteBeat.mutate(beat.id);
                }}
                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-3 h-3 text-white/40 hover:text-red-400" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRecommendedCard = (beat, assignment, index, total) => {
    const active = playingTrack?.beat_id === beat.id;
    const list = manualRecommended.map((x) => x.beat);
    return (
      <div key={assignment?.id || beat.id} className="group relative rounded-xl overflow-hidden" style={cardStyle}>
        <div
          className="relative aspect-square overflow-hidden cursor-pointer"
          style={{ background: "#1a1a1c" }}
          onClick={() => playPublic(beat, assignment ? list : autoRecommended)}
        >
          {beat.cover_url ? (
            <img src={beat.cover_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music2 className="w-8 h-8 text-white/15" />
            </div>
          )}
          {!assignment && (
            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.6)" }}>
              <Sparkles className="w-2.5 h-2.5 text-[#a78bfa]" />
              <span className="text-[8px] font-bold uppercase tracking-wider text-[#a78bfa]">Auto</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7c4dff, #a78bfa)" }}>
              {active && isPlaying ? <Pause className="w-4 h-4 text-white" fill="white" /> : <Play className="w-4 h-4 text-white ml-0.5" fill="white" />}
            </div>
          </div>
        </div>
        <div className="p-3">
          <h3 className="text-xs font-bold text-white truncate">{beat.title}</h3>
          <p className="text-[10px] text-white/40 truncate">{beat.producer || "—"}</p>
          {isAdmin && assignment && (
            <div className="flex items-center gap-1 mt-2">
              <button
                onClick={() => reorder.mutate({ assignment, dir: "up" })}
                disabled={index === 0}
                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-20"
              >
                <ChevronUp className="w-3 h-3 text-white/40" />
              </button>
              <button
                onClick={() => reorder.mutate({ assignment, dir: "down" })}
                disabled={index === total - 1}
                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-20"
              >
                <ChevronDown className="w-3 h-3 text-white/40" />
              </button>
              <button
                onClick={() => {
                  if (confirm("¿Quitar este beat de las recomendaciones del artista?")) unassign.mutate(assignment.id);
                }}
                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-500/10 transition-colors ml-auto"
              >
                <X className="w-3 h-3 text-white/40 hover:text-red-400" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const gridCls = "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3";
  const emptyCls = "rounded-2xl p-6 text-center text-xs text-white/30";

  return (
    <div className="space-y-6">
      {/* ── BEATS EXCLUSIVOS ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-[#ff8866]" />
            <h3 className="text-sm font-bold text-white" style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
              Beats exclusivos
            </h3>
            <span className="text-[10px] text-white/30">{privateBeats.length}</span>
          </div>
          {isAdmin && (
            <button
              onClick={() => { setEditingBeat(null); setShowForm(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-white transition-colors"
              style={{ background: "linear-gradient(135deg, #ff5833, #e0451f)" }}
            >
              <Plus className="w-3 h-3" /> Añadir beat
            </button>
          )}
        </div>

        {privateBeats.length === 0 ? (
          <div className={emptyCls} style={{ background: "#111113", border: "1px solid rgba(255,255,255,0.05)" }}>
            {isAdmin ? "Aún no hay beats exclusivos para este artista." : "Tu gestor aún no tiene beats exclusivos."}
          </div>
        ) : (
          <div className={gridCls}>
            {privateBeats.map(renderPrivateCard)}
          </div>
        )}
      </div>

      {/* ── BEATS RECOMENDADOS ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#a78bfa]" />
            <h3 className="text-sm font-bold text-white" style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
              Beats recomendados
            </h3>
            <span className="text-[10px] text-white/30">{manualRecommended.length + autoRecommended.length}</span>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAssign(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-white transition-colors"
              style={{ background: "rgba(124,77,255,0.15)", border: "1px solid rgba(124,77,255,0.3)" }}
            >
              <Link2 className="w-3 h-3" /> Asignar beat público
            </button>
          )}
        </div>

        {manualRecommended.length === 0 && autoRecommended.length === 0 ? (
          <div className={emptyCls} style={{ background: "#111113", border: "1px solid rgba(255,255,255,0.05)" }}>
            {isAdmin
              ? artistGenres.size > 0
                ? "No hay beats públicos que coincidan con los géneros del artista. Asigna manualmente."
                : "Configura géneros en el perfil del artista para activar las recomendaciones automáticas."
              : "Aún no hay beats recomendados para ti."}
          </div>
        ) : (
          <div className="space-y-4">
            {manualRecommended.length > 0 && (
              <div className={gridCls}>
                {manualRecommended.map(({ assignment, beat }, i) =>
                  renderRecommendedCard(beat, assignment, i, manualRecommended.length)
                )}
              </div>
            )}
            {autoRecommended.length > 0 && (
              <>
                {manualRecommended.length > 0 && (
                  <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest px-1">
                    Sugerencias automáticas
                  </p>
                )}
                <div className={gridCls}>
                  {autoRecommended.map((beat) => renderRecommendedCard(beat, null, 0, 0))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Modales */}
      {showForm && (
        <ArtistBeatFormModal
          artistId={artistId}
          beat={editingBeat}
          onClose={() => { setShowForm(false); setEditingBeat(null); }}
        />
      )}
      {showAssign && (
        <AssignPublicBeatModal
          artistId={artistId}
          artistGenres={artistGenres}
          excludeBeatIds={assignedIds}
          assignedById={assignedById}
          onClose={() => setShowAssign(false)}
        />
      )}
    </div>
  );
}