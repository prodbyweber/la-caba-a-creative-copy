import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Search, Check, Music2, GripVertical, X } from "lucide-react";
import { GENRES } from "@/lib/musicConstants";

// Selector visual de beats para una sección manual:
// filtro por géneros (chips) + búsqueda + selección por chip + reorden por drag & drop.
export default function BeatPicker({ selectedIds, beats, onChange }) {
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState([]);
  const ids = selectedIds || [];
  const selected = ids.map(id => beats.find(b => b.id === id)).filter(Boolean);

  const filtered = beats.filter(b => {
    if (search) {
      const q = search.toLowerCase();
      if (!(b.title?.toLowerCase().includes(q) || b.producer?.toLowerCase().includes(q))) return false;
    }
    if (genreFilter.length > 0) {
      const bGenres = b.genres || [];
      if (!genreFilter.some(g => bGenres.includes(g))) return false;
    }
    return true;
  });

  const toggle = (id) => onChange(ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);
  const remove = (id) => onChange(ids.filter(x => x !== id));
  const toggleGenre = (g) => setGenreFilter(arr => arr.includes(g) ? arr.filter(x => x !== g) : [...arr, g]);

  const onDragEnd = (r) => {
    if (!r.destination) return;
    const arr = [...ids];
    const [m] = arr.splice(r.source.index, 1);
    arr.splice(r.destination.index, 0, m);
    onChange(arr);
  };

  const Mini = ({ beat }) => (
    <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0" style={{ background: "#1a1a1c" }}>
      {beat.cover_url
        ? <img src={beat.cover_url} alt="" className="w-full h-full object-cover" />
        : <div className="w-full h-full flex items-center justify-center"><Music2 className="w-3.5 h-3.5 text-white/15" /></div>}
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Seleccionados + reorden */}
      {selected.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1.5">Orden actual ({selected.length})</p>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="selected">
              {(prov) => (
                <div ref={prov.innerRef} {...prov.droppableProps} className="space-y-1.5 max-h-48 overflow-y-auto">
                  {selected.map((b, i) => (
                    <Draggable key={b.id} draggableId={b.id} index={i}>
                      {(p) => (
                        <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps}
                          className="flex items-center gap-2 p-1.5 rounded-lg"
                          style={{ background: "rgba(255,88,51,0.06)", border: "1px solid rgba(255,88,51,0.2)", ...p.draggableProps.style }}>
                          <GripVertical className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                          <Mini beat={b} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{b.title}</p>
                            <p className="text-[10px] text-white/35 truncate">{b.producer}</p>
                          </div>
                          <button onClick={() => remove(b.id)} className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-500/10 text-white/40 hover:text-red-400 flex-shrink-0">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {prov.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}

      {/* Filtro por géneros (chips touch) */}
      <div>
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1.5">Filtrar por género</p>
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-0.5 px-0.5" style={{ scrollbarWidth: "none" }}>
          <button
            type="button"
            onClick={() => setGenreFilter([])}
            className="flex-shrink-0 px-2.5 py-1.5 rounded-full text-[11px] font-semibold transition-all"
            style={{
              background: genreFilter.length === 0 ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)",
              color: genreFilter.length === 0 ? "#fff" : "rgba(255,255,255,0.55)",
              border: genreFilter.length === 0 ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.08)",
            }}
          >
            Todos
          </button>
          {GENRES.map((g) => {
            const on = genreFilter.includes(g);
            return (
              <button
                key={g}
                type="button"
                onClick={() => toggleGenre(g)}
                className="flex-shrink-0 px-2.5 py-1.5 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1"
                style={{
                  background: on ? "#ff5833" : "rgba(255,255,255,0.05)",
                  color: on ? "#fff" : "rgba(255,255,255,0.55)",
                  border: on ? "1px solid #ff5833" : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {on && <Check className="w-2.5 h-2.5" />}
                {g}
              </button>
            );
          })}
        </div>
      </div>

      {/* Búsqueda + selección */}
      <div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm text-white bg-white/[0.05] border border-white/[0.08] focus:outline-none focus:border-white/20 transition-colors"
            placeholder="Buscar beats..." />
        </div>
        <div className="max-h-56 overflow-y-auto space-y-1.5 mt-2">
          {filtered.length === 0 ? (
            <p className="text-center text-white/30 text-xs py-6">Sin resultados</p>
          ) : filtered.map(b => {
            const sel = ids.includes(b.id);
            return (
              <button key={b.id} type="button" onClick={() => toggle(b.id)}
                className="flex items-center gap-2.5 w-full p-2 rounded-lg transition-colors text-left"
                style={{ background: sel ? "rgba(255,88,51,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${sel ? "rgba(255,88,51,0.3)" : "rgba(255,255,255,0.06)"}` }}>
                <Mini beat={b} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{b.title}</p>
                  <p className="text-[10px] text-white/35 truncate">{b.producer} · {(b.genres || []).join(", ")}</p>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${sel ? "" : "border border-white/15"}`} style={sel ? { background: "#ff5833" } : {}}>
                  {sel && <Check className="w-3 h-3 text-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}