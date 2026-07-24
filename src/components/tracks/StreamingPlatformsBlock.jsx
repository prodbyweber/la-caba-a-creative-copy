import React, { useState } from "react";
import { GripVertical, Loader2, Sparkles } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { base44 } from "@/api/base44Client";
import { PLATFORMS, effectivePlatformOrder, platformMeta } from "@/lib/releaseUtils";

const inp = "w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors";

/**
 * Bloque "Streaming Platforms" para el editor de Soundtracks.
 * Props:
 *  - value: objeto { spotify, apple_music, ... } (Track.streaming_links)
 *  - order: array de keys (Track.platform_order)
 *  - onChange: ({ links, order }) => void
 *  - onMetadata: (meta) => void  — aplica metadatos obtenidos de Spotify (título, artista, portada)
 */
export default function StreamingPlatformsBlock({ value, order, onChange, onMetadata }) {
  const links = value || {};
  const ordered = effectivePlatformOrder(order);
  const [fetching, setFetching] = useState(false);

  const setLink = (key, url) => {
    onChange({ links: { ...links, [key]: url }, order });
  };

  const onDragEnd = (res) => {
    if (!res.destination || res.destination.index === res.source.index) return;
    const next = [...ordered];
    const [moved] = next.splice(res.source.index, 1);
    next.splice(res.destination.index, 0, moved);
    onChange({ links, order: next });
  };

  const fetchFromSpotify = async () => {
    const spotify = links.spotify;
    if (!spotify) { alert("Introduce primero el enlace de Spotify"); return; }
    setFetching(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `A partir de este enlace de Spotify: ${spotify}\nDevuelve los metadatos del lanzamiento: título exacto, artista, URL de la portada (imagen cuadrada), y si los encuentras los enlaces oficiales en Apple Music, YouTube Music y YouTube (video). Solo devuelve JSON, sin texto adicional.`,
        add_context_from_internet: true,
        model: "gemini_3_flash",
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            artist: { type: "string" },
            cover_url: { type: "string" },
            apple_music: { type: "string" },
            youtube_music: { type: "string" },
          },
        },
      });
      const meta = res?.data || res || {};
      const newLinks = { ...links };
      if (meta.apple_music) newLinks.apple_music = meta.apple_music;
      if (meta.youtube_music) newLinks.youtube_music = meta.youtube_music;
      onChange({ links: newLinks, order });
      if (onMetadata) onMetadata(meta);
    } catch (e) {
      alert("No se pudieron obtener los metadatos automáticamente. Puedes añadir los enlaces manualmente.");
    } finally {
      setFetching(false);
    }
  };

  const hasAny = ordered.some((k) => links[k]);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-0">
          Release
        </label>
        <button
          type="button"
          onClick={fetchFromSpotify}
          disabled={fetching}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors disabled:opacity-50"
          style={{ background: "rgba(29,185,84,0.1)", border: "1px solid rgba(29,185,84,0.25)", color: "#1DB954" }}
        >
          {fetching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          {fetching ? "Obteniendo…" : "Obtener desde Spotify"}
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="platforms">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-1.5">
              {ordered.map((key, index) => {
                const meta = platformMeta(key);
                return (
                  <Draggable key={key} draggableId={key} index={index}>
                    {(p, snapshot) => (
                      <div
                        ref={p.innerRef}
                        {...p.draggableProps}
                        className="flex items-center gap-2 rounded-xl p-1 transition-colors"
                        style={{
                          background: snapshot.isDragging ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          ...p.draggableProps.style,
                        }}
                      >
                        <div {...p.dragHandleProps} className="flex-shrink-0 pl-1 cursor-grab active:cursor-grabbing">
                          <GripVertical className="w-3.5 h-3.5 text-white/25" />
                        </div>
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: meta.color }} />
                        <input
                          type="url"
                          value={links[key] || ""}
                          onChange={(e) => setLink(key, e.target.value)}
                          placeholder={meta.label}
                          className={inp + " flex-1 border-transparent bg-transparent focus:border-white/15"}
                        />
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {!hasAny && (
        <p className="text-[10px] text-white/25 mt-1.5">
          Añade al menos un enlace para que aparezca en la Landing Page del lanzamiento.
        </p>
      )}
    </div>
  );
}