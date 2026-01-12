import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

const statuses = [
  { value: "all", label: "Todos los estados", color: "gray" },
  { value: "draft", label: "Borrador", color: "gray" },
  { value: "scheduled", label: "Programado", color: "blue" },
  { value: "publishing", label: "Publicando", color: "yellow" },
  { value: "published", label: "Publicado", color: "green" },
  { value: "error", label: "Error", color: "red" }
];

const platforms = [
  { value: "youtube", label: "YouTube Shorts", icon: "📺" },
  { value: "instagram", label: "Instagram Reels", icon: "📸" },
  { value: "tiktok", label: "TikTok", icon: "🎵" }
];

export default function ClipsFilters({ filters, setFilters, onClose }) {
  const { data: artists = [] } = useQuery({
    queryKey: ['artists'],
    queryFn: () => base44.entities.Artist.list(),
  });

  const togglePlatform = (platform) => {
    const newPlatforms = filters.platform.includes(platform)
      ? filters.platform.filter(p => p !== platform)
      : [...filters.platform, platform];
    setFilters({ ...filters, platform: newPlatforms });
  };

  const clearFilters = () => {
    setFilters({
      status: "all",
      platform: [],
      artist: "all",
      dateRange: null,
      search: filters.search
    });
  };

  const activeFiltersCount = 
    (filters.status !== "all" ? 1 : 0) + 
    filters.platform.length +
    (filters.artist !== "all" ? 1 : 0);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-4 bg-[#111113] rounded-2xl border border-white/5 overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">Filtros</h3>
            {activeFiltersCount > 0 && (
              <span className="text-xs text-gray-500">
                {activeFiltersCount} activo{activeFiltersCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                Limpiar todo
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Status */}
          <div>
            <label className="text-sm font-medium text-gray-400 mb-3 block">Estado</label>
            <div className="space-y-2">
              {statuses.map((status) => (
                <button
                  key={status.value}
                  onClick={() => setFilters({ ...filters, status: status.value })}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                    filters.status === status.value
                      ? "bg-purple-500/10 border border-purple-500/20 text-purple-400"
                      : "bg-white/5 hover:bg-white/10 text-gray-400"
                  }`}
                >
                  <span>{status.label}</span>
                  {filters.status === status.value && (
                    <Check className="w-4 h-4" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Platforms */}
          <div>
            <label className="text-sm font-medium text-gray-400 mb-3 block">Plataformas</label>
            <div className="space-y-2">
              {platforms.map((platform) => (
                <button
                  key={platform.value}
                  onClick={() => togglePlatform(platform.value)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                    filters.platform.includes(platform.value)
                      ? "bg-purple-500/10 border border-purple-500/20 text-purple-400"
                      : "bg-white/5 hover:bg-white/10 text-gray-400"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{platform.icon}</span>
                    {platform.label}
                  </span>
                  {filters.platform.includes(platform.value) && (
                    <Check className="w-4 h-4" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Artist */}
          <div>
            <label className="text-sm font-medium text-gray-400 mb-3 block">Artista</label>
            <select
              value={filters.artist}
              onChange={(e) => setFilters({ ...filters, artist: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
            >
              <option value="all">Todos los artistas</option>
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.name}
                </option>
              ))}
            </select>

            {/* Date Range - Placeholder for future */}
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-400 mb-3 block">Rango de fechas</label>
              <button className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-white/10 transition-colors text-left">
                Seleccionar rango...
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}