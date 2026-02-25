import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { FolderKanban, Music2, Calendar, TrendingUp, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import DashboardNav from "@/components/dashboard/DashboardNav";

export default function ArtistProjectsPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const artistId = urlParams.get("artistId");

  const { data: allProjects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('-created_date'),
    initialData: [],
  });

  const { data: artist } = useQuery({
    queryKey: ['artist', artistId],
    queryFn: async () => {
      const artists = await base44.entities.Artist.list();
      return artists.find(a => a.id === artistId);
    },
    enabled: !!artistId
  });

  const { data: tracks = [] } = useQuery({
    queryKey: ['tracks'],
    queryFn: () => base44.entities.Track.list(),
    initialData: [],
  });

  // Filtrar solo proyectos del artista
  const artistProjects = allProjects.filter(p => p.artist_id === artistId);

  const statusColors = {
    Draft: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    Recording: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Producing: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    Mixing: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    Mastering: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    Delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Archived: "bg-gray-500/10 text-gray-500 border-gray-500/20"
  };

  const priorityColors = {
    Low: "bg-gray-500/10 text-gray-400",
    Medium: "bg-yellow-500/10 text-yellow-400",
    High: "bg-red-500/10 text-red-400"
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <DashboardNav artistName={artist?.stageName} artistId={artistId} />

      <main className="pt-14">
        <div className="px-6 sm:px-12 lg:px-16 xl:px-24 py-6 max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">Mis Proyectos</h1>
            <p className="text-sm text-gray-500">{artistProjects.length} proyectos activos</p>
          </div>

          {/* Projects Grid */}
          {isLoading ? (
            <div className="grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-4 animate-pulse">
                  <div className="h-6 bg-white/5 rounded w-2/3 mb-3" />
                  <div className="h-4 bg-white/5 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : artistProjects.length === 0 ? (
            <div className="text-center py-20">
              <FolderKanban className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No tienes proyectos aún</p>
              <p className="text-sm text-gray-600">Tus proyectos aparecerán aquí</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {artistProjects.map((project, i) => {
                const projectTracks = tracks.filter(t => t.project_id === project.id);
                
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link to={createPageUrl(`ProjectDetail?id=${project.id}`)}>
                      <div className="bg-[#141414] rounded-lg border border-white/5 hover:border-purple-500/30 transition-all overflow-hidden group cursor-pointer">
                        {/* Cover */}
                        <div className="relative aspect-square">
                          <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center overflow-hidden">
                            {project.cover_url ? (
                              <img src={project.cover_url} alt={project.title} className="w-full h-full object-cover" />
                            ) : (
                              <FolderKanban className="w-10 h-10 text-white/20" />
                            )}
                          </div>
                          
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          
                          {/* Status Badge */}
                          <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-lg border text-[10px] font-medium backdrop-blur-sm ${statusColors[project.status]}`}>
                            {project.status}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-bold text-white mb-0.5 truncate group-hover:text-purple-400 transition-colors">
                                {project.title}
                              </h3>
                              <p className="text-[10px] text-gray-500">{project.type}</p>
                            </div>
                            {project.priority && (
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${priorityColors[project.priority]} ml-2 flex-shrink-0`}>
                                {project.priority}
                              </span>
                            )}
                          </div>

                          {/* Stats */}
                          <div className="flex items-center gap-2 text-[10px]">
                            <div className="flex items-center gap-1 text-gray-400">
                              <Music2 className="w-3 h-3 text-purple-400" />
                              <span>{projectTracks.length}</span>
                            </div>
                            {project.target_delivery_date && (
                              <>
                                <span className="text-gray-600">•</span>
                                <div className="flex items-center gap-1 text-gray-400">
                                  <Calendar className="w-3 h-3 text-orange-400" />
                                  <span className="truncate">
                                    {new Date(project.target_delivery_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}