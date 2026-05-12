import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Film, Upload, X, Plus } from "lucide-react";
import UploadClipModal from "./UploadClipModal.jsx";
import NetflixClipCard from "./NetflixClipCard.jsx";

export default function ClipsLibrary({ filters, artistId }) {
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);

  // Resolve effective artist id from prop or filters
  const effectiveArtistId = artistId || (filters?.artist !== "all" ? filters?.artist : null);

  const { data: clips = [], isLoading, refetch } = useQuery({
    queryKey: ['clips', effectiveArtistId, filters],
    queryFn: async () => {
      const allClips = await base44.entities.Clip.list('-created_date');
      return allClips.filter(clip => {
        // Filtrar por artista si hay id específico
        if (effectiveArtistId) {
          const isMain = clip.artist_id === effectiveArtistId;
          const isFeat = clip.featuring_artists?.includes(effectiveArtistId);
          if (!isMain && !isFeat) return false;
        }
        if (filters?.platform?.length > 0 && !filters.platform.some(p => clip.platforms?.includes(p))) return false;
        if (filters?.search) {
          const s = filters.search.toLowerCase();
          if (!clip.title?.toLowerCase().includes(s) && !clip.tags?.some(t => t.toLowerCase().includes(s))) return false;
        }
        return true;
      });
    },
  });

  const filtered = search
    ? clips.filter(c => c.title?.toLowerCase().includes(search.toLowerCase()))
    : clips;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-white/30" />
          <h3 className="text-sm font-bold text-white">Shorts</h3>
          {clips.length > 0 && <span className="text-[10px] text-white/25 px-1.5 py-0.5 bg-white/5 rounded-full">{clips.length}</span>}
        </div>
        <button
          onClick={() => setUploadOpen(true)}
          className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-3 h-3" />
          <span className="hidden lg:inline">Nuevo short</span>
        </button>
      </div>

      {/* Carousel — same style as tracks */}
      {isLoading ? (
        <div className="flex gap-3" style={{ overflowX: "hidden" }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-shrink-0 rounded-xl bg-white/[0.04] animate-pulse" style={{ width: 240, height: 150 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <button onClick={() => setUploadOpen(true)}
          className="w-full py-16 rounded-2xl border border-dashed border-white/[0.06] flex flex-col items-center gap-3 hover:border-white/15 transition-colors">
          <Film className="w-8 h-8 text-white/10" />
          <div className="text-center">
            <p className="text-xs text-white/25">Sin shorts</p>
            <p className="text-[10px] text-white/12 mt-0.5">Sube tu primer short</p>
          </div>
        </button>
      ) : (
        <div style={{ overflowX: "auto", overflowY: "visible", padding: "60px 16px 200px", margin: "-60px 0 -200px", scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <div className="flex gap-3" style={{ width: "max-content" }}>
            {filtered.map((clip, i) => (
              <NetflixClipCard key={clip.id} clip={clip} index={i} onUpdate={refetch} isFirst={i === 0} />
            ))}
          </div>
        </div>
      )}

      {uploadOpen && (
        <UploadClipModal
          onClose={() => { setUploadOpen(false); refetch(); }}
          artistId={effectiveArtistId || undefined}
        />
      )}
    </div>
  );
}