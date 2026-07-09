import React, { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { GENRES, MOODS, SCALES } from "@/lib/musicConstants";

// Horizontal scrollable filter chips (mobile-friendly)
export default function BeatsFilters({ filters, setFilters, sort, setSort }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const scrollRef = useRef(null);

  const activeCount = (filters.genres?.length || 0) + (filters.moods?.length || 0) +
    (filters.bpmRange ? 1 : 0) + (filters.key ? 1 : 0);

  const toggleGenre = (g) => {
    setFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(g) ? prev.genres.filter(x => x !== g) : [...prev.genres, g],
    }));
  };

  const toggleMood = (m) => {
    setFilters(prev => ({
      ...prev,
      moods: prev.moods.includes(m) ? prev.moods.filter(x => x !== m) : [...prev.moods, m],
    }));
  };

  return (
    <div className="sticky top-0 z-30 -mx-5 sm:-mx-10 px-5 sm:px-10 py-3 mb-4"
      style={{ background: "rgba(10,10,11,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
    >
      {/* Search bar */}
      <div className="relative mb-3">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          value={filters.search || ""}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          placeholder="Buscar beats, géneros, moods, BPM..."
          className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm text-white bg-white/[0.05] border border-white/[0.08] focus:outline-none focus:border-white/20 placeholder-white/30 transition-colors"
        />
        {filters.search && (
          <button
            onClick={() => setFilters(prev => ({ ...prev, search: "" }))}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/10"
          >
            <X className="w-3.5 h-3.5 text-white/40" />
          </button>
        )}
      </div>

      {/* Quick genre chips — horizontal scroll */}
      <div ref={scrollRef} className="flex items-center gap-2 overflow-x-auto pb-1 -mb-1 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-all ${activeCount > 0 || showAdvanced ? "bg-white text-black" : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"}`}
        >
          <SlidersHorizontal className="w-3 h-3" />
          Filtros
          {activeCount > 0 && (
            <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-black/20 text-[9px]">{activeCount}</span>
          )}
        </button>

        {/* Sort */}
        <div className="relative flex-shrink-0">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-semibold bg-white/5 text-white/60 hover:bg-white/10 border border-white/10 cursor-pointer transition-colors focus:outline-none"
          >
            <option value="recent">Más recientes</option>
            <option value="popular">Populares</option>
            <option value="downloads">Más descargados</option>
            <option value="plays">Más escuchados</option>
          </select>
          <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40 pointer-events-none" />
        </div>

        {GENRES.slice(0, 12).map(g => {
          const active = filters.genres?.includes(g);
          return (
            <button
              key={g}
              onClick={() => toggleGenre(g)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-all whitespace-nowrap ${
                active
                  ? "bg-[#7c4dff] text-white"
                  : "bg-white/5 text-white/50 hover:bg-white/10 border border-white/10"
              }`}
            >
              {g}
            </button>
          );
        })}
      </div>

      {/* Advanced filters panel */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden mt-3 pt-3 border-t border-white/5"
          >
            {/* Genres */}
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Géneros</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {GENRES.map(g => {
                const active = filters.genres?.includes(g);
                return (
                  <button
                    key={g}
                    onClick={() => toggleGenre(g)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                      active ? "bg-[#7c4dff] text-white" : "bg-white/5 text-white/40 hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>

            {/* Moods */}
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Mood</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {MOODS.map(m => {
                const active = filters.moods?.includes(m);
                return (
                  <button
                    key={m}
                    onClick={() => toggleMood(m)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                      active ? "bg-[#7c4dff] text-white" : "bg-white/5 text-white/40 hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>

            {/* Key + BPM */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Tonalidad</p>
                <select
                  value={filters.key || ""}
                  onChange={(e) => setFilters(prev => ({ ...prev, key: e.target.value || null }))}
                  className="w-full px-3 py-2 rounded-xl text-sm bg-white/5 text-white border border-white/10 focus:outline-none focus:border-white/20"
                >
                  <option value="">Todas</option>
                  {SCALES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">BPM</p>
                <select
                  value={filters.bpmRange || ""}
                  onChange={(e) => setFilters(prev => ({ ...prev, bpmRange: e.target.value || null }))}
                  className="w-full px-3 py-2 rounded-xl text-sm bg-white/5 text-white border border-white/10 focus:outline-none focus:border-white/20"
                >
                  <option value="">Todos</option>
                  <option value="60-90">60 - 90</option>
                  <option value="90-120">90 - 120</option>
                  <option value="120-140">120 - 140</option>
                  <option value="140-180">140+</option>
                </select>
              </div>
            </div>

            {/* Clear */}
            {activeCount > 0 && (
              <button
                onClick={() => setFilters({ search: "", genres: [], moods: [], key: null, bpmRange: null })}
                className="mt-3 text-xs text-white/40 hover:text-white transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}