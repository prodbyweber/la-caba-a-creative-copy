import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, FolderOpen, Music2, Image, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import CreateProjectModal from "./CreateProjectModal";
import useEmblaCarousel from 'embla-carousel-react';

export default function ProjectsSection({ jlyArtistId }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [emblaRef] = useEmblaCarousel({ 
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps'
  });

  const { data: allProjects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('-created_date'),
    initialData: [],
  });

  // Filtrar proyectos solo del artista JLY
  const projects = jlyArtistId 
    ? allProjects.filter(project => project.artist_id === jlyArtistId)
    : allProjects;

  const { data: tracks } = useQuery({
    queryKey: ['tracks'],
    queryFn: () => base44.entities.Track.list(),
    initialData: [],
  });

  const getProjectTracks = (projectId) => {
    return tracks.filter(track => track.project_id === projectId);
  };

  if (isLoading) {
    return (
      <div className="bg-[#141414] rounded-2xl border border-white/5 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/5 rounded w-1/4" />
          <div className="h-32 bg-white/5 rounded" />
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#141414] to-black rounded-2xl border border-white/5 overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Proyectos Activos</h3>
              <p className="text-sm text-gray-500">Gestiona tus proyectos y tracks</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Proyecto
          </button>
        </div>

        {/* Projects Carousel */}
        <div className="p-6">
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No tienes proyectos aún</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
              >
                Crear tu primer proyecto
              </button>
            </div>
          ) : (
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-3">
                {projects.map((project, i) => {
                  const projectTracks = getProjectTracks(project.id);
                  return (
                    <Link 
                      key={project.id} 
                      to={createPageUrl(`ProjectDetail?id=${project.id}`)}
                      className="flex-[0_0_160px] sm:flex-[0_0_200px]"
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="group bg-white/5 rounded-xl p-3 border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer h-full"
                      >
                        {/* Project Cover */}
                        <div className="relative aspect-square rounded-lg bg-gradient-to-br from-emerald-500/20 to-purple-500/20 mb-2 overflow-hidden">
                          {projectTracks[0]?.cover_url ? (
                            <img 
                              src={projectTracks[0].cover_url} 
                              alt={project.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Music2 className="w-10 h-10 text-white/20" />
                            </div>
                          )}
                          {/* Track Count Badge */}
                          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] font-medium">
                            {projectTracks.length}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="space-y-1">
                          <h4 className="font-semibold text-sm text-white group-hover:text-emerald-400 transition-colors truncate">
                            {project.name}
                          </h4>
                          <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full ${
                            project.status === 'active' 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : project.status === 'completed'
                              ? 'bg-blue-500/10 text-blue-400'
                              : 'bg-gray-500/10 text-gray-400'
                          }`}>
                            {project.status === 'active' ? 'Activo' : project.status === 'completed' ? 'Completado' : 'Archivado'}
                          </span>
                        </div>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        jlyArtistId={jlyArtistId}
      />
    </>
  );
}