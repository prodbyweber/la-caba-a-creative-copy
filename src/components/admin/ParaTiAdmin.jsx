import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Eye, EyeOff, Trash2, Search, Play, ExternalLink, User, Mail, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function getYtShortId(url) {
  if (!url) return null;
  const m = url.match(/(?:shorts\/|youtu\.be\/|watch\?v=)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function ShortCard({ item, onToggle, toggling, creatorProfile }) {
  const ytId = getYtShortId(item.url || item.youtube_url || item.youtube_music_url || "");
  const thumb = item.thumbnail_url || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null);
  const [expanded, setExpanded] = useState(false);

  const creatorName = creatorProfile?.artist_name || creatorProfile?.display_name || creatorProfile?.full_name || "Desconocido";
  const creatorUsername = creatorProfile?.username ? `@${creatorProfile.username}` : "";
  const creatorAvatar = creatorProfile?.profile_photo_url || creatorProfile?.avatar_url;
  const creatorEmail = item.created_by || "";

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

      {/* Creator info - compact */}
      <div className="px-3 py-2.5 border-t border-white/5">
        <div className="flex items-center gap-2 mb-2">
          {creatorAvatar ? (
            <img src={creatorAvatar} alt={creatorName} className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
              <User className="w-3 h-3 text-white/40" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{creatorName}</p>
            {creatorUsername && <p className="text-[10px] text-white/30 truncate">{creatorUsername}</p>}
          </div>
        </div>

        <p className="text-xs font-bold text-white truncate leading-tight mb-0.5">{item.title || "Sin título"}</p>
        <p className="text-[10px] text-white/30 truncate">{item.description || item.caption || ""}</p>

        {/* Expand button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
          style={{
            background: "rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.5)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {expanded ? <><ChevronUp className="w-3 h-3" /> Ocultar detalles</> : <><ChevronDown className="w-3 h-3" /> Ver detalles</>}
        </button>

        {/* Toggle visibility button */}
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

      {/* Expanded metadata panel */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-3 pb-3 border-t border-white/5 pt-3"
        >
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 space-y-2.5">
            {/* Creator section */}
            <div>
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-wider mb-1.5">Creador</p>
              <div className="flex items-center gap-2">
                {creatorAvatar ? (
                  <img src={creatorAvatar} alt={creatorName} className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                    <User className="w-2.5 h-2.5 text-white/40" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate">{creatorName}</p>
                  {creatorUsername && <p className="text-[10px] text-white/40 truncate">{creatorUsername}</p>}
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-wider mb-1.5">Cuenta</p>
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3 text-white/30 flex-shrink-0" />
                <p className="text-[10px] text-white/60 truncate">{creatorEmail}</p>
              </div>
            </div>

            {/* Created date */}
            {item.created_date && (
              <div>
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-wider mb-1.5">Fecha</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-white/30 flex-shrink-0" />
                  <p className="text-[10px] text-white/60">
                    {new Date(item.created_date).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Source type */}
            {item._is_gallery && (
              <div>
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-wider mb-1.5">Origen</p>
                <div className="px-2 py-1.5 rounded bg-[#ff5833]/10 border border-[#ff5833]/20">
                  <p className="text-[10px] text-[#ff5833] font-semibold">
                    Galería: <span className="text-white/80">{item._parent_item?.title || "Item"}</span>
                  </p>
                </div>
              </div>
            )}

            {/* URL */}
            {(item.url || item.youtube_url || item.youtube_music_url) && (
              <div>
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-wider mb-1.5">Enlace</p>
                <a
                  href={item.url || item.youtube_url || item.youtube_music_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-2 py-1.5 rounded bg-[#ff5833]/10 border border-[#ff5833]/20 text-[10px] text-[#ff5833] font-semibold hover:bg-[#ff5833]/15 transition-colors text-center"
                >
                  Abrir en YouTube
                </a>
              </div>
            )}
          </div>
        </motion.div>
      )}
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

  // Fetch all user profiles to get creator info
  const { data: userProfiles = [] } = useQuery({
    queryKey: ["admin-all-user-profiles"],
    queryFn: () => base44.entities.UserProfile.list(),
    staleTime: 60000,
  });

  // Create a map of user_id -> profile for quick lookup
  const profileMap = React.useMemo(() => {
    const map = {};
    userProfiles.forEach(p => {
      map[p.user_id] = p;
    });
    return map;
  }, [userProfiles]);

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
            created_by: item.created_by, // Heredar el creador del item padre
            created_date: item.created_date,
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
                creatorProfile={profileMap[item.created_by] || null}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}