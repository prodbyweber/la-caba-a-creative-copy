import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import ClipCard from "./ClipCard.jsx";
import { LayoutGrid, List, Loader } from "lucide-react";

export default function ClipsLibrary({ filters }) {
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  const { data: clips = [], isLoading, refetch } = useQuery({
    queryKey: ['clips', filters],
    queryFn: async () => {
      let query = {};
      
      if (filters.status !== "all") {
        query.status = filters.status;
      }
      
      if (filters.artist !== "all") {
        query.artist_id = filters.artist;
      }

      const allClips = await base44.entities.Clip.filter(query, '-created_date');
      
      // Client-side filtering for platforms and search
      return allClips.filter(clip => {
        // Platform filter
        if (filters.platform.length > 0) {
          const hasMatchingPlatform = filters.platform.some(p => 
            clip.platforms?.includes(p)
          );
          if (!hasMatchingPlatform) return false;
        }

        // Search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          const matchesTitle = clip.title?.toLowerCase().includes(searchLower);
          const matchesTags = clip.tags?.some(tag => 
            tag.toLowerCase().includes(searchLower)
          );
          if (!matchesTitle && !matchesTags) return false;
        }

        return true;
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-500">
          {clips.length} clip{clips.length !== 1 ? 's' : ''} encontrado{clips.length !== 1 ? 's' : ''}
        </div>
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-all ${
              viewMode === "grid"
                ? "bg-purple-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-all ${
              viewMode === "list"
                ? "bg-purple-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Clips Grid/List */}
      {clips.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
            <LayoutGrid className="w-10 h-10 text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No hay clips aún</h3>
          <p className="text-gray-500 mb-6">
            Sube tu primer clip para comenzar a publicar en redes sociales
          </p>
        </motion.div>
      ) : (
        <div className={
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        }>
          {clips.map((clip, i) => (
            <ClipCard 
              key={clip.id} 
              clip={clip} 
              viewMode={viewMode}
              delay={i * 0.05}
              onUpdate={refetch}
            />
          ))}
        </div>
      )}
    </div>
  );
}