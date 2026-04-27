import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Eye, EyeOff, Music2, Film, Search, Star } from "lucide-react";

const TYPE_LABELS = {
  song: "Canción", album: "Álbum", ep: "EP",
  minifilm: "Mini Film", film: "Film", series: "Serie",
};

function getYoutubeThumbnail(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}

export default function ProjectsLibrary({ items, artists, onEdit, onDelete, onToggle, onNew }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [genreFilter, setGenreFilter] = useState("");

  // Collect all unique genres across all items
  const allGenres = [...new Set(items.flatMap(i => i.genres || []))].sort();

  const filtered = items.filter(item => {
    const matchSearch = !search || item.title?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || item.content_type === typeFilter;
    const matchGenre = !genreFilter || (item.genres || []).includes(genreFilter);
    return matchSearch && matchType && matchGenre;
  });

  const typeFilters = ["all", "song", "album", "ep", "minifilm", "film", "series"];

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5">
          <Search className="w-3.5 h-3.5 text-white/25 flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar proyectos..."
            className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none"
          />
        </div>
        <button
          onClick={onNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-black font-bold rounded-xl text-sm transition-all hover:bg-white/90"
        >
          <Plus className="w-4 h-4" />
          Nuevo proyecto
        </button>
      </div>

      {/* Type filter pills */}
      <div className="flex gap-1.5 flex-wrap mb-3">
        {typeFilters.map(f => (
          <button
            key={f}
            onClick={() => setTypeFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              typeFilter === f
                ? "bg-white text-black border-white"
                : "bg-white/[0.04] text-white/35 border-white/[0.08] hover:border-white/20"
            }`}
          >
            {f === "all" ? "Todos" : TYPE_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Genre filter */}
      {allGenres.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-5">
          <button
            onClick={() => setGenreFilter("")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all border ${
              !genreFilter
                ? "bg-white/15 text-white border-white/30"
                : "bg-white/[0.03] text-white/30 border-white/[0.06] hover:border-white/15"
            }`}
          >
            Todos los géneros
          </button>
          {allGenres.map(g => (
            <button
              key={g}
              onClick={() => setGenreFilter(genreFilter === g ? "" : g)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all border ${
                genreFilter === g
                  ? "bg-white text-black border-white"
                  : "bg-white/[0.03] text-white/30 border-white/[0.06] hover:border-white/15"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <Film className="w-10 h-10 text-white/10 mx-auto mb-3" />
          <p className="text-sm text-white/20">{search ? `Sin resultados para "${search}"` : "No hay proyectos aún"}</p>
          <p className="text-xs text-white/10 mt-1">Crea tu primer proyecto con el botón superior</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map(item => {
            const thumb = item.thumbnail_url || getYoutubeThumbnail(item.youtube_url || item.youtube_music_url);
            const artist = artists.find(a => a.id === item.artist_id);
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.07] hover:border-white/15 transition-all cursor-pointer"
                style={{ aspectRatio: "3/4" }}
              >
                {/* Cover */}
                {thumb ? (
                  <img src={thumb} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music2 className="w-8 h-8 text-white/10" />
                  </div>
                )}

                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {/* Badges */}
                <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                  {item.content_type && (
                    <span className="text-[9px] bg-black/70 text-white/70 px-1.5 py-0.5 rounded font-medium">
                      {TYPE_LABELS[item.content_type]}
                    </span>
                  )}
                  {item.is_hero && <span className="text-[9px] bg-yellow-500 text-black px-1.5 py-0.5 rounded font-black">Hero</span>}
                  {!item.is_active && <span className="text-[9px] bg-red-600/80 text-white px-1.5 py-0.5 rounded font-bold">Oculto</span>}
                </div>

                {/* Bottom info */}
                <div className="absolute bottom-0 left-0 right-0 p-2.5">
                  <p className="text-xs font-bold text-white truncate">{item.title}</p>
                  {artist && (
                    <p className="text-[10px] text-white/40 truncate">{artist.stageName}</p>
                  )}
                  {item.genres?.length > 0 && (
                    <p className="text-[9px] text-white/25 truncate mt-0.5">{item.genres.slice(0, 2).join(" · ")}</p>
                  )}
                </div>

                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => onEdit(item)}
                    className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => onToggle(item)}
                    className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 transition-colors"
                    title={item.is_active ? "Ocultar" : "Mostrar"}
                  >
                    {item.is_active ? <Eye className="w-4 h-4 text-white/70" /> : <EyeOff className="w-4 h-4 text-white/40" />}
                  </button>
                  <button
                    onClick={() => { if (confirm("¿Eliminar este proyecto?")) onDelete(item.id); }}
                    className="p-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}