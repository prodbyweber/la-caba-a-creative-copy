import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Eye, EyeOff, Trash2, Search, Play, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function getYtShortId(url) {
  if (!url) return null;
  const m = url.match(/(?:shorts\/|youtu\.be\/|watch\?v=)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function ShortCard({ item, onToggle, toggling }) {
  const ytId = getYtShortId(item.url || item.youtube_url || item.youtube_music_url || "");
  const thumb = item.thumbnail_url || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null);
  const [showPreview, setShowPreview] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl overflow-hidden group"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        opacity: item.is_active ? 1 : 0.45,
      }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[9/16] overflow-hidden bg-black/40">
        {thumb ? (
          <img src={thumb} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-8 h-8 text-white/10" />
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          {ytId && (
            <a
              href={`https://youtube.com/shorts/${ytId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
              onClick={e => e.stopPropagation()}
            >
              <ExternalLink className="w-4 h-4 text-white" />
            </a>
          )}
          <button
            onClick={() => onToggle(item)}
            disabled={toggling}
            className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
          >
            {item.is_active
              ? <EyeOff className="w-4 h-4 text-white" />
              : <Eye className="w-4 h-4 text-white" />
            }
          </button>
        </div>

        {/* Status badge */}
        <div
          className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold"
          style={{
            background: item.is_active ? "rgba(16,185,129,0.9)" : "rgba(255,255,255,0.15)",
            color: "white",
          }}
        >
          {item.is_active ? "Visible" : "Oculto"}
        </div>
      </div>

      {/* Info */}
      <div className="px-3 py-2.5">
        <p className="text-xs font-bold text-white truncate leading-tight">{item.title || "Sin título"}</p>
        <p className="text-[10px] text-white/30 mt-0.5 truncate">{item.description || item.caption || ""}</p>

        {/* Toggle button */}
        <button
          onClick={() => onToggle(item)}
          disabled={toggling}
          className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
          style={{
            background: item.is_active ? "rgba(255,255,255,0.06)" : "rgba(16,185,129,0.15)",
            color: item.is_active ? "rgba(255,255,255,0.4)" : "rgb(16,185,129)",
            border: `1px solid ${item.is_active ? "rgba(255,255,255,0.08)" : "rgba(16,185,129,0.25)"}`,
          }}
        >
          {item.is_active ? <><EyeOff className="w-3 h-3" /> Ocultar</> : <><Eye className="w-3 h-3" /> Mostrar</>}
        </button>
      </div>
    </motion.div>
  );
}

export default function ParaTiAdmin() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | visible | hidden

  // Fetch all shorts (content_type: "short")
  const { data: shorts = [], isLoading } = useQuery({
    queryKey: ["admin-para-ti-shorts"],
    queryFn: () => base44.entities.ExplorarItem.filter({ content_type: "short" }),
    staleTime: 10000,
  });

  // Also fetch gallery shorts from non-short ExplorarItems
  const { data: galleryItems = [] } = useQuery({
    queryKey: ["admin-explorar-items-gallery"],
    queryFn: () => base44.entities.ExplorarItem.filter({ is_active: true }),
    staleTime: 10000,
  });

  const toggleMutation = useMutation({
    mutationFn: (item) => base44.entities.ExplorarItem.update(item.id, { is_active: !item.is_active }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-para-ti-shorts"] });
      qc.invalidateQueries({ queryKey: ["admin-explorar-items-gallery"] });
      qc.invalidateQueries({ queryKey: ["para-ti-explorar-items"] });
      qc.invalidateQueries({ queryKey: ["para-ti-dashboard-shorts"] });
    },
  });

  // Combine: direct shorts + gallery youtube_shorts (as pseudo-items referencing their parent)
  const allItems = React.useMemo(() => {
    const result = [...shorts];

    galleryItems.forEach(item => {
      if (item.content_type === "short") return;
      const gallery = item.gallery || [];
      gallery.forEach(g => {
        if (g.type === "youtube_short" && g.url) {
          result.push({
            id: `gallery-${item.id}-${g.id || g.url}`,
            title: g.caption || item.title || "Gallery Short",
            description: `En: ${item.title}`,
            url: g.url,
            thumbnail_url: null,
            is_active: item.is_active,
            _is_gallery: true,
            _parent_id: item.id,
            _parent_item: item,
          });
        }
      });
    });

    return result;
  }, [shorts, galleryItems]);

  const filtered = allItems.filter(item => {
    const matchSearch = !search || (item.title || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || (filter === "visible" ? item.is_active : !item.is_active);
    return matchSearch && matchFilter;
  });

  const handleToggle = (item) => {
    if (item._is_gallery) {
      // Toggle the parent ExplorarItem
      toggleMutation.mutate(item._parent_item);
    } else {
      toggleMutation.mutate(item);
    }
  };

  const visibleCount = allItems.filter(i => i.is_active).length;
  const hiddenCount = allItems.filter(i => !i.is_active).length;

  return (
    <div className="px-4 sm:px-8 py-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total", value: allItems.length, color: "rgba(255,255,255,0.08)" },
          { label: "Visibles", value: visibleCount, color: "rgba(16,185,129,0.12)" },
          { label: "Ocultos", value: hiddenCount, color: "rgba(255,255,255,0.05)" },
        ].map(s => (
          <div
            key={s.label}
            className="rounded-xl px-4 py-3 text-center"
            style={{ background: s.color, border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p className="text-2xl font-black text-white">{s.value}</p>
            <p className="text-[10px] text-white/30 mt-0.5 uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search & filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por título..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-white/[0.05] border border-white/[0.08] text-white placeholder-white/20 focus:outline-none focus:border-white/20"
          />
        </div>
        <div className="flex gap-1.5 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {[
            { key: "all", label: "Todos" },
            { key: "visible", label: "Visibles" },
            { key: "hidden", label: "Ocultos" },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={filter === f.key
                ? { background: "#fff", color: "#000" }
                : { color: "rgba(255,255,255,0.35)" }
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[9/16] rounded-2xl animate-pulse bg-white/[0.04]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Play className="w-12 h-12 text-white/10 mb-4" />
          <p className="text-sm text-white/30 font-semibold">No hay shorts</p>
          <p className="text-xs text-white/15 mt-1">Los shorts aparecen cuando los artistas suben contenido tipo Short</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          <AnimatePresence>
            {filtered.map(item => (
              <ShortCard
                key={item.id}
                item={item}
                onToggle={handleToggle}
                toggling={toggleMutation.isPending}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}