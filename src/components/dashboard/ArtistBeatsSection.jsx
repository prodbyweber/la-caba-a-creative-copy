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
  Sparkles,
  Lock,
  Bookmark,
  GripVertical,
} from "lucide-react";
import { collectArtistGenres, rankBeatsByGenre } from "@/lib/artistBeats";
import ArtistBeatFormModal from "./ArtistBeatFormModal";
import AssignPublicBeatModal from "./AssignPublicBeatModal";

// Sección BEATS — colección unificada de los tres tipos de beats del artista:
//   • Privado   → subidos exclusivamente para el artista (ArtistBeat)
//   • Recomendado → beats públicos asignados manualmente o sugeridos por géneros
//   • Guardado  → beats públicos que el artista guardó del marketplace (BeatSave)
// Todo convive en una única colección, diferenciado solo por una etiqueta discreta.
// El administrador puede subir, asignar, quitar y reordenar (drag & drop persistente).
// El artista solo escucha y puede quitar sus propios guardados.
export default function ArtistBeatsSection({
  artistId,
  isAdmin,
  artist,
  assignedById,
  artistUserId,
  userProfile,
  profileUserId,
}) {
  const qc = useQueryClient();
  const { playingTrack, isPlaying, playQueue, pauseTrack, resumeTrack } =
    useGlobalAudio();
  const [showForm, setShowForm] = useState(false);
  const [editingBeat, setEditingBeat] = useState(null);
  const [showAssign, setShowAssign] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(null); // override local tras drag
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const { data: privateBeats = [] } = useQuery({
    queryKey: ["artist-beats", artistId],
    queryFn: () => base44.entities.ArtistBeat.filter({ artist_id: artistId }),
    enabled: !!artistId,
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ["artist-beat-assignments", artistId],
    queryFn: () =>
      base44.entities.ArtistBeatAssignment.filter({ artist_id: artistId }),
    enabled: !!artistId,
  });

  const { data: publicBeats = [] } = useQuery({
    queryKey: ["beats-public"],
    queryFn: async () => {
      const beats = await base44.entities.Beat.filter({ status: "Publicado" });
      return beats.filter((b) => !b.archived);
    },
  });

  const { data: savedSaves = [] } = useQuery({
    queryKey: ["artist-saved-beats", artistUserId],
    queryFn: async () => {
      if (!artistUserId) return [];
      return base44.entities.BeatSave.filter({ user_id: artistUserId });
    },
    enabled: !!artistUserId,
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

  // ── Construcción de la colección unificada ──
  const allItems = useMemo(() => {
    const items = [];

    // Privados
    privateBeats.forEach((b) => {
      items.push({
        key: `priv:${b.id}`,
        type: "privado",
        beat: {
          ...b,
          beat_id: b.id,
          preview_mp3_url: b.audio_url,
          producer: artist?.stageName || "Cabaña Creative",
        },
        privateBeat: b,
      });
    });

    // Recomendados manuales (asignados por el admin)
    const manualAssignments = assignments
      .filter((a) => a.type === "manual")
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    const recommendedBeatIds = new Set();
    manualAssignments.forEach((a) => {
      const beat = beatMap.get(a.beat_id);
      if (beat) {
        recommendedBeatIds.add(beat.id);
        items.push({
          key: `rec:${beat.id}`,
          type: "recomendado",
          beat: { ...beat, beat_id: beat.id },
          assignment: a,
        });
      }
    });

    // Guardados (excluyendo los ya recomendados para no duplicar)
    const savedBeatIds = new Set();
    savedSaves.forEach((s) => {
      if (recommendedBeatIds.has(s.beat_id)) return;
      const beat = beatMap.get(s.beat_id);
      if (beat) {
        savedBeatIds.add(beat.id);
        items.push({
          key: `sav:${beat.id}`,
          type: "guardado",
          beat: { ...beat, beat_id: beat.id },
          save: s,
        });
      }
    });

    // Recomendados automáticos por géneros (excluyendo asignados y guardados)
    rankBeatsByGenre(publicBeats, artistGenres)
      .filter(
        ({ beat, score }) =>
          score > 0 &&
          !recommendedBeatIds.has(beat.id) &&
          !savedBeatIds.has(beat.id)
      )
      .slice(0, 8)
      .forEach(({ beat }) => {
        items.push({
          key: `rec:${beat.id}`,
          type: "recomendado",
          beat: { ...beat, beat_id: beat.id },
          auto: true,
        });
      });

    return items;
  }, [privateBeats, assignments, savedSaves, publicBeats, beatMap, artistGenres, artist]);

  // ── Aplicar orden persistido ──
  const persistedOrder = userProfile?.beats_order || [];
  const effectiveOrder = displayOrder || persistedOrder;
  const ordered = useMemo(() => {
    const seen = new Set();
    const out = [];
    effectiveOrder.forEach((k) => {
      const item = allItems.find((it) => it.key === k);
      if (item && !seen.has(item.key)) {
        out.push(item);
        seen.add(item.key);
      }
    });
    allItems.forEach((it) => {
      if (!seen.has(it.key)) {
        out.push(it);
        seen.add(it.key);
      }
    });
    return out;
  }, [allItems, effectiveOrder]);

  // ── Mutaciones ──
  const deleteBeat = useMutation({
    mutationFn: (id) => base44.entities.ArtistBeat.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["artist-beats", artistId] }),
  });

  const unassign = useMutation({
    mutationFn: (id) => base44.entities.ArtistBeatAssignment.delete(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["artist-beat-assignments", artistId] }),
  });

  const unsave = useMutation({
    mutationFn: async (saveId) => {
      await base44.entities.BeatSave.delete(saveId);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["artist-saved-beats", artistUserId] }),
  });

  const persistOrder = async (newKeys) => {
    setDisplayOrder(newKeys);
    if (userProfile?.id) {
      try {
        await base44.entities.UserProfile.update(userProfile.id, {
          beats_order: newKeys,
        });
        qc.invalidateQueries({ queryKey: ["userProfile", profileUserId] });
      } catch (e) {
        console.error("[ArtistBeatsSection] persist order failed", e?.message);
      }
    }
  };

  const handleDrop = () => {
    if (
      dragging == null ||
      dragOver == null ||
      dragging === dragOver
    ) {
      setDragging(null);
      setDragOver(null);
      return;
    }
    const next = [...ordered];
    const [moved] = next.splice(dragging, 1);
    next.splice(dragOver, 0, moved);
    persistOrder(next.map((it) => it.key));
    setDragging(null);
    setDragOver(null);
  };

  const playItem = (item) => {
    const active = playingTrack?.beat_id === item.beat.beat_id;
    if (active && isPlaying) return pauseTrack();
    if (active) return resumeTrack();
    const queue = ordered.map((it) => it.beat);
    const idx = ordered.findIndex((it) => it.key === item.key);
    playQueue(queue, Math.max(0, idx));
  };

  if (!artistId) return null;

  const LABELS = {
    privado: { text: "Privado", Icon: Lock, color: "#ff5833" },
    recomendado: { text: "Recomendado", Icon: Sparkles, color: "#a78bfa" },
    guardado: { text: "Guardado", Icon: Bookmark, color: "#7c4dff" },
  };

  const cardStyle = { background: "#161616", border: "1px solid rgba(255,255,255,0.05)" };

  return (
    <div>
      {/* Header con acciones de admin */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3
            className="text-sm font-bold text-white"
            style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
          >
            Beats
          </h3>
          <span className="text-[10px] text-white/30">{ordered.length}</span>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingBeat(null);
                setShowForm(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-white transition-colors"
              style={{ background: "linear-gradient(135deg, #ff5833, #e0451f)" }}
            >
              <Plus className="w-3 h-3" /> Añadir beat
            </button>
            <button
              onClick={() => setShowAssign(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-white transition-colors"
              style={{
                background: "rgba(124,77,255,0.15)",
                border: "1px solid rgba(124,77,255,0.3)",
              }}
            >
              <Link2 className="w-3 h-3" /> Asignar beat
            </button>
          </div>
        )}
      </div>

      {/* Colección unificada */}
      {ordered.length === 0 ? (
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: "#111113",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(124,77,255,0.08)" }}
          >
            <Music2 className="w-6 h-6 text-[#a78bfa]" />
          </div>
          <p className="text-sm font-semibold text-white/50 mb-1">
            {isAdmin ? "Sin beats en este catálogo" : "Aún no tienes beats"}
          </p>
          <p className="text-xs text-white/25">
            {isAdmin
              ? "Añade un beat privado o asigna beats del catálogo público."
              : "Tu gestor mostrará aquí tus beats privados, recomendados y guardados."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {ordered.map((item, idx) => {
            const { text, Icon, color } = LABELS[item.type];
            const active = playingTrack?.beat_id === item.beat.beat_id;
            const isDragTarget = dragOver === idx;
            const isDraggingThis = dragging === idx;
            return (
              <div
                key={item.key}
                draggable={isAdmin}
                onDragStart={() => setDragging(idx)}
                onDragEnter={() => setDragOver(idx)}
                onDragEnd={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="group relative rounded-xl overflow-hidden transition-all"
                style={{
                  ...cardStyle,
                  opacity: isDraggingThis ? 0.5 : 1,
                  border: isDragTarget
                    ? "1px solid rgba(255,88,51,0.4)"
                    : "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <div
                  className="relative aspect-square overflow-hidden cursor-pointer"
                  style={{ background: "#1a1a1c" }}
                  onClick={() => item.beat.preview_mp3_url && playItem(item)}
                >
                  {item.beat.cover_url ? (
                    <img
                      src={item.beat.cover_url}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music2 className="w-8 h-8 text-white/15" />
                    </div>
                  )}

                  {/* Etiqueta discreta de origen */}
                  <div
                    className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full"
                    style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
                  >
                    <Icon className="w-2.5 h-2.5" style={{ color }} />
                    <span
                      className="text-[8px] font-bold uppercase tracking-wider"
                      style={{ color }}
                    >
                      {text}
                    </span>
                  </div>

                  {/* Drag handle (admin) */}
                  {isAdmin && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: "rgba(0,0,0,0.5)" }}
                    >
                      <GripVertical className="w-3 h-3 text-white/40" />
                    </div>
                  )}

                  {item.beat.preview_mp3_url && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{
                          background:
                            item.type === "privado"
                              ? "linear-gradient(135deg, #ff5833, #e0451f)"
                              : "linear-gradient(135deg, #7c4dff, #a78bfa)",
                        }}
                      >
                        {active && isPlaying ? (
                          <Pause className="w-4 h-4 text-white" fill="white" />
                        ) : (
                          <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <h3 className="text-xs font-bold text-white truncate">
                    {item.beat.title}
                  </h3>
                  <p className="text-[10px] text-white/40 truncate">
                    {item.type === "privado"
                      ? item.beat.bpm
                        ? `${item.beat.bpm} BPM`
                        : "—"
                      : item.beat.producer || "—"}
                  </p>

                  {/* Acciones por tipo */}
                  {isAdmin && item.type === "privado" && (
                    <div className="flex items-center gap-1 mt-2">
                      <button
                        onClick={() => {
                          setEditingBeat(item.privateBeat);
                          setShowForm(true);
                        }}
                        className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                      >
                        <Pencil className="w-3 h-3 text-white/40" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar el beat "${item.beat.title}"?`))
                            deleteBeat.mutate(item.privateBeat.id);
                        }}
                        className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-3 h-3 text-white/40 hover:text-red-400" />
                      </button>
                    </div>
                  )}
                  {isAdmin && item.type === "recomendado" && item.assignment && (
                    <div className="flex items-center gap-1 mt-2">
                      <button
                        onClick={() => {
                          if (confirm("¿Quitar este beat de las recomendaciones?"))
                            unassign.mutate(item.assignment.id);
                        }}
                        className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-500/10 transition-colors"
                      >
                        <X className="w-3 h-3 text-white/40 hover:text-red-400" />
                      </button>
                    </div>
                  )}
                  {!isAdmin && item.type === "guardado" && item.save && (
                    <div className="flex items-center gap-1 mt-2">
                      <button
                        onClick={() => {
                          if (confirm("¿Quitar este beat de tus guardados?"))
                            unsave.mutate(item.save.id);
                        }}
                        className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                      >
                        <Bookmark className="w-3 h-3 text-[#a78bfa] fill-[#a78bfa]" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modales */}
      {showForm && (
        <ArtistBeatFormModal
          artistId={artistId}
          beat={editingBeat}
          onClose={() => {
            setShowForm(false);
            setEditingBeat(null);
          }}
        />
      )}
      {showAssign && (
        <AssignPublicBeatModal
          artistId={artistId}
          artistGenres={artistGenres}
          excludeBeatIds={
            new Set(assignments.map((a) => a.beat_id))
          }
          assignedById={assignedById}
          onClose={() => setShowAssign(false)}
        />
      )}
    </div>
  );
}