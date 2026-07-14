import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Play, Pause, ArrowRight, Music2 } from "lucide-react";
import { useBeatPlayer } from "@/hooks/useBeatPlayer";
import { getCoverForBeat } from "@/lib/beatsUtils";

// Bloque BEATS para la página Explorar.
// Respeta el lenguaje visual existente (fondo #080808, tipografía, overlays).
// Muestra beats destacados en scroll horizontal + botón "Explorar Beats".
export default function BeatsExplorarBlock() {
  const { toggle, playingTrack, isPlaying } = useBeatPlayer();

  const { data: beats = [], isLoading } = useQuery({
    queryKey: ["explorar-beats-block"],
    queryFn: async () => {
      const all = await base44.entities.Beat.filter({ status: "Publicado" });
      const visible = all.filter((b) => !b.archived);
      // Priorizar destacados, luego más reproducidos
      const featured = visible.filter((b) => b.featured);
      const sorted = [...visible].sort((a, b) => (b.plays_count || 0) - (a.plays_count || 0));
      const merged = [...featured, ...sorted.filter((b) => !featured.includes(b))];
      return merged.slice(0, 10);
    },
  });

  if (!isLoading && beats.length === 0) return null;

  return (
    <section className="relative z-10 px-4 sm:px-12 pt-6 pb-2">
      {/* Header */}
      <div className="flex items-end justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(124,77,255,0.12)" }}>
            <Music2 className="w-3.5 h-3.5 text-[#a78bfa]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white" style={{ letterSpacing: "-0.02em" }}>Beats</h2>
            <p className="text-[10px] text-white/35">Instrumentales para tu próximo hit</p>
          </div>
        </div>
        <Link
          to="/beats"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold text-white transition-colors hover:bg-white/10"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          Explorar Beats
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Horizontal scroll de beats */}
      <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-36 sm:w-44">
                <div className="aspect-square rounded-xl animate-pulse" style={{ background: "#141416" }} />
              </div>
            ))
          : beats.map((beat, i) => {
              const active = playingTrack?.beat_id === beat.id;
              const cover = getCoverForBeat(beat);
              return (
                <motion.div
                  key={beat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex-shrink-0 w-36 sm:w-44 group"
                >
                  <div
                    className="relative aspect-square rounded-xl overflow-hidden cursor-pointer"
                    style={{ background: "#141416" }}
                    onClick={() => toggle(beat, beats)}
                  >
                    {cover ? (
                      <img
                        src={cover}
                        alt={beat.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music2 className="w-8 h-8 text-white/10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-11 h-11 rounded-full flex items-center justify-center shadow-2xl" style={{ background: "#8b5cf6" }}>
                        {active && isPlaying ? (
                          <Pause className="w-5 h-5 text-white" fill="white" />
                        ) : (
                          <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                        )}
                      </div>
                    </div>
                    {active && (
                      <div className="absolute inset-0 rounded-xl pointer-events-none" style={{ border: "2px solid #8b5cf6" }} />
                    )}
                  </div>
                  <p className="text-xs font-bold text-white truncate mt-2">{beat.title}</p>
                  <p className="text-[10px] text-white/40 truncate">{beat.producer || "Cabaña"}</p>
                </motion.div>
              );
            })}
      </div>
    </section>
  );
}