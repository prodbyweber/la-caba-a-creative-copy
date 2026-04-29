import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Film, Search, Upload, X, Plus } from "lucide-react";
import UploadClipModal from "./UploadClipModal.jsx";
import NetflixClipCard from "./NetflixClipCard.jsx";

export default function ClipsLibrary({ filters }) {
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);

  const { data: clips = [], isLoading, refetch } = useQuery({
    queryKey: ['clips', filters],
    queryFn: async () => {
      let query = {};
      if (filters.status !== "all") query.status = filters.status;
      if (filters.artist !== "all") query.artist_id = filters.artist;
      const allClips = await base44.entities.Clip.filter(query, '-created_date');
      return allClips.filter(clip => {
        // Filtrar por estado published
        if (clip.status !== "published") return false;
        if (filters.platform?.length > 0 && !filters.platform.some(p => clip.platforms?.includes(p))) return false;
        if (filters.search) {
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
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar clips..."
            className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="ml-auto text-xs text-white/20">
          {filtered.length} clip{filtered.length !== 1 ? "s" : ""}
        </div>

        <button
          onClick={() => setUploadOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white text-xs font-medium transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Nuevo clip
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-16 h-16 rounded-2xl border border-white/10 flex items-center justify-center mb-4">
            <Film className="w-7 h-7 text-white/20" />
          </div>
          <p className="text-white/30 text-sm mb-1">Sin clips todavía</p>
          <p className="text-white/15 text-xs mb-6">Sube tu primer clip para empezar</p>
          <button
            onClick={() => setUploadOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white text-xs font-medium transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            Subir clip
          </button>
        </motion.div>
      ) : (
        <div style={{ overflowX: "auto", overflowY: "visible", padding: "60px 16px 200px", margin: "-60px -16px -200px", scrollbarWidth: "none", msOverflowStyle: "none" }}>
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
          artistId={filters.artist !== "all" ? filters.artist : undefined}
        />
      )}
    </div>
  );
}