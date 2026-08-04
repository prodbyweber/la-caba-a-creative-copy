import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useGlobalAudio } from "@/context/GlobalAudioContext";
import {
  Music2, Play, Pause, Plus, Pencil, Trash2, Unlink, Lock, Bookmark, Sparkles, Download,
} from "lucide-react";
import { collectArtistGenres } from "@/lib/artistBeats";
import ArtistBeatFormModal from "./ArtistBeatFormModal";
import AddBeatModal from "./AddBeatModal";
import BeatDetailModal from "./BeatDetailModal";

// Sección BEATS — colección unificada de los beats del artista dentro de su catálogo.
//   • Privado    → subidos exclusivamente para el artista (ArtistBeat)
//   • Recomendado → beats públicos asignados manualmente por el admin
//   • Guardado   → beats públicos que el artista guardó del marketplace (BeatSave)
// Sin recomendaciones automáticas: solo lo que el admin asigna o sube.
// El administrador puede subir, asignar, quitar y reordenar (drag & drop persistente).
// El artista solo escucha y puede quitar sus propios guardados.
// La reproducción usa el reproductor global (GlobalAudioPlayer).
export default function ArtistBeatsSection({
  artistId,
  isAdmin,
  isReadOnly,
  artist,
  assignedById,
  artistUserId,
  userProfile,
  profileUserId,
}) {
  const qc = useQueryClient();
  const { playingTrack, isPlaying, playQueue, pauseTrack, resumeTrack } = useGlobalAudio();
  const [showAdd, setShowAdd] = useState(false);
  const [editingBeat, setEditingBeat] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [displayOrder, setDisplayOrder] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [downloadingKey, setDownloadingKey] = useState(null);

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

  const { data: allBeats = [] } = useQuery({
    queryKey: ["beats-all"],
    queryFn: async () => base44.entities.Beat.list("-updated_date", 200),
  });
  const publicBeats = useMemo(
    () => allBeats.filter((b) => b.status === "Publicado" && !b.archived),
    [allBeats]
  );

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

  const allBeatMap = useMemo(() => {
    const m = new Map();
    allBeats.forEach((b) => m.set(b.id, b));
    return m;
  }, [allBeats]);

  // ── Construcción de la colección unificada (sin recomendaciones automáticas) ──
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
    savedSaves.forEach((s) => {
      if (recommendedBeatIds.has(s.beat_id)) return;
      const beat = allBeatMap.get(s.beat_id);
      if (beat) {
        items.push({
          key: `sav:${beat.id}`,
          type: "guardado",
          beat: { ...beat, beat_id: beat.id },
          save: s,
        });
      }
    });

    return items;
  }, [privateBeats, assignments, savedSaves, publicBeats, beatMap, allBeatMap, artist]);

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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["artist-beat-assignments", artistId] }),
  });

  const unsave = useMutation({
    mutationFn: async (saveId) => {
      await base44.entities.BeatSave.delete(saveId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["artist-saved-beats", artistUserId] }),
  });

  const persistOrder = async (newKeys) => {
    setDisplayOrder(newKeys);
    if (userProfile?.id) {
      try {
        await base44.entities.UserProfile.update(userProfile.id, { beats_order: newKeys });
        qc.invalidateQueries({ queryKey: ["userProfile", profileUserId] });
      } catch (e) {
        console.error("[ArtistBeatsSection] persist order failed", e?.message);
      }
    }
  };

  const handleDrop = () => {
    if (dragging == null || dragOver == null || dragging === dragOver) {
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
    recomendado: { text: "Recomendado", Icon: Sparkles, color: "#ff5833" },
    guardado: { text: "Guardado", Icon: Bookmark, color: "#7c4dff" },
  };

  return (
    <div>
      {/* Acciones de admin (sin título duplicado — el label de sección lo aporta el dashboard) */}
      {isAdmin && !isReadOnly && (
        <div className="flex justify-end mb-3">
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-white transition-colors"
            style={{ background: "linear-gradient(135deg, #ff5833, #e0451f)" }}
          >
            <Plus className="w-3 h-3" /> Añadir beat
          </button>
        </div>
      )}

      {/* Colección unificada */}
      {ordered.length === 0 ? (
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: "#111113", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(255,88,51,0.08)" }}
          >
            <Music2 className="w-6 h-6 text-[#ff8866]" />
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
            const hasAudio = !!item.beat.preview_mp3_url;
            return (
              <div
                key={item.key}
                draggable={isAdmin && !isReadOnly}
                onDragStart={() => setDragging(idx)}
                onDragEnter={() => setDragOver(idx)}
                onDragEnd={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="group relative rounded-xl p-2 transition-all duration-300"
                style={{
                  background: "#0d0d0e",
                  border: isDragTarget
                    ? "1px solid rgba(255,88,51,0.45)"
                    : "1px solid rgba(255,255,255,0.06)",
                  opacity: isDraggingThis ? 0.5 : 1,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
                }}
              >
                {/* Cover */}
                <div
                  className="relative aspect-square rounded-lg overflow-hidden cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #1a1a1c 0%, #0d0d0e 100%)" }}
                  onClick={() => setDetailItem(item)}
                >
                  {item.beat.cover_url ? (
                    <img
                      src={item.beat.cover_url}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music2 className="w-8 h-8 text-white/15" />
                    </div>
                  )}

                  {/* Gradiente cinematográfico */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%)" }}
                  />

                  {/* Etiqueta de origen (discreta) */}
                  <div
                    className="absolute top-2 left-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full"
                    style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
                  >
                    <Icon className="w-2 h-2" style={{ color }} />
                    <span className="text-[7px] font-bold uppercase tracking-wider" style={{ color }}>
                      {text}
                    </span>
                  </div>

                  {/* Acciones admin/artist (hover) */}
                  {isAdmin && item.type === "privado" && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingBeat(item.privateBeat);
                        }}
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
                      >
                        <Pencil className="w-2.5 h-2.5 text-white/70" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`¿Eliminar el beat "${item.beat.title}"?`))
                            deleteBeat.mutate(item.privateBeat.id);
                        }}
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
                      >
                        <Trash2 className="w-2.5 h-2.5 text-white/70 hover:text-red-400" />
                      </button>
                    </div>
                  )}
                  {isAdmin && item.type === "recomendado" && item.assignment && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("¿Quitar este beat de las recomendaciones?"))
                            unassign.mutate(item.assignment.id);
                        }}
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
                      >
                        <Unlink className="w-2.5 h-2.5 text-white/70 hover:text-red-400" />
                      </button>
                    </div>
                  )}
                  {!isAdmin && !isReadOnly && item.type === "guardado" && item.save && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("¿Quitar este beat de tus guardados?"))
                            unsave.mutate(item.save.id);
                        }}
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
                      >
                        <Bookmark className="w-2.5 h-2.5 text-white/80" fill="white" />
                      </button>
                    </div>
                  )}

                  {/* Play cinematográfico */}
                  {hasAudio && (
                    <div
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      onClick={(e) => { e.stopPropagation(); playItem(item); }}
                    >
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center"
                        style={{
                          background: "rgba(255,255,255,0.16)",
                          backdropFilter: "blur(14px)",
                          border: "1px solid rgba(255,255,255,0.28)",
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

                  {/* Descarga rápida (hover) */}
                  {hasAudio && !isReadOnly && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const dlUrl = item.beat.free_mp3_url || item.beat.preview_mp3_url || item.beat.audio_url;
                        if (!dlUrl || downloadingKey === item.key) return;
                        setDownloadingKey(item.key);
                        fetch(dlUrl)
                          .then((r) => r.blob())
                          .then((blob) => {
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `${item.beat.title || "beat"}.mp3`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);
                          })
                          .catch(() => window.open(dlUrl, "_blank"))
                          .finally(() => setDownloadingKey(null));
                      }}
                      className="absolute bottom-2 right-2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.15)" }}
                      title="Descargar"
                    >
                      {downloadingKey === item.key
                        ? <div className="w-2.5 h-2.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        : <Download className="w-3 h-3 text-white/80" />}
                    </button>
                  )}

                  {/* Equalizer si está sonando */}
                  {active && isPlaying && (
                    <div className="absolute bottom-2 left-2 flex items-end gap-[2px] h-3">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-[2.5px] rounded-full"
                          style={{
                            background: "#ff5833",
                            animation: `beateq 0.9s ${i * 0.18}s ease-in-out infinite alternate`,
                            height: "100%",
                            transformOrigin: "bottom",
                          }}
                        />
                      ))}
                      <style>{`@keyframes beateq { 0% { transform: scaleY(0.25); } 100% { transform: scaleY(1); } }`}</style>
                    </div>
                  )}
                </div>

                {/* Título + subtítulo (debajo de la portada, estilo proyectos) */}
                <div className="px-0.5 pt-2 pb-0.5 space-y-0.5">
                  <h3
                    className="text-xs font-semibold truncate"
                    style={{ color: active ? "#ff5833" : "#fff" }}
                  >
                    {item.beat.title}
                  </h3>
                  <p className="text-[10px] text-white/40 truncate">
                    {item.type === "privado"
                      ? item.beat.bpm
                        ? `${item.beat.bpm} BPM`
                        : "Exclusive"
                      : item.beat.producer || "—"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modales */}
      {showAdd && (
        <AddBeatModal
          artistId={artistId}
          artistGenres={artistGenres}
          excludeBeatIds={new Set(assignments.map((a) => a.beat_id))}
          assignedById={assignedById}
          onClose={() => setShowAdd(false)}
        />
      )}
      {editingBeat && (
        <ArtistBeatFormModal
          artistId={artistId}
          beat={editingBeat}
          onClose={() => setEditingBeat(null)}
        />
      )}
      {detailItem && (
        <BeatDetailModal
          item={detailItem}
          queue={ordered.map((it) => it.beat)}
          isAdmin={isAdmin}
          isReadOnly={isReadOnly}
          onClose={() => setDetailItem(null)}
          onEdit={() => { setEditingBeat(detailItem.privateBeat); setDetailItem(null); }}
          onDelete={() => {
            if (confirm(`¿Eliminar el beat "${detailItem.beat.title}"?`)) {
              deleteBeat.mutate(detailItem.privateBeat.id);
              setDetailItem(null);
            }
          }}
          onUnassign={() => {
            if (confirm("¿Quitar este beat de las recomendaciones?")) {
              unassign.mutate(detailItem.assignment.id);
              setDetailItem(null);
            }
          }}
          onUnsave={() => {
            if (confirm("¿Quitar este beat de tus guardados?")) {
              unsave.mutate(detailItem.save.id);
              setDetailItem(null);
            }
          }}
        />
      )}
    </div>
  );
}