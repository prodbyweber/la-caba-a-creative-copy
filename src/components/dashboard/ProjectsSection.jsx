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
  const [editingProject, setEditingProject] = useState(null);
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

  const { data: artists = [] } = useQuery({
    queryKey: ['artists'],
    queryFn: () => base44.entities.Artist.list(),
    initialData: [],
  });

  const getProjectTracks = (projectId) => {
    return tracks.filter(track => track.project_id === projectId);
  };

  const getArtistName = (artistId) => {
    const artist = artists.find(a => a.id === artistId);
    return artist?.stageName || 'Unknown Artist';
  };

  const getCollaboratorNames = (collaboratorIds) => {
    if (!collaboratorIds || collaboratorIds.length === 0) return "";
    const names = collaboratorIds
      .map(id => {
        const artist = artists.find(a => a.id === id);
        return artist?.stageName;
      })
      .filter(Boolean);
    return names.length > 0 ? ` ft. ${names.join(', ')}` : "";
  };

  const getProjectYear = (project) => {
    return project.start_date ? new Date(project.start_date).getFullYear() : new Date(project.created_date).getFullYear();
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
        <div className="p-3 lg:p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <FolderOpen className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Proyectos Activos</h3>
              <p className="text-xs text-gray-500 hidden lg:block">Albums, EPs y Singles</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Nuevo</span>
          </button>
        </div>

        {/* Projects Carousel */}
        <div className="p-3 lg:p-4">
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
                  <div 
                    key={project.id} 
                    className="flex-[0_0_110px] sm:flex-[0_0_130px]"
                  >
                    <motion.div
                      onClick={() => setEditingProject(project)}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="group bg-white/5 rounded-lg p-1.5 border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer h-full"
                    >
                      {/* Project Cover */}
                      <div className="relative aspect-square rounded-md bg-gradient-to-br from-emerald-500/20 to-purple-500/20 mb-1 overflow-hidden">
                        {project.cover_url ? (
                          <img 
                            src={project.cover_url} 
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        ) : projectTracks[0]?.cover_url ? (
                          <img 
                            src={projectTracks[0].cover_url} 
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music2 className="w-6 h-6 text-white/20" />
                          </div>
                        )}
                        {/* Track Count Badge */}
                        <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[8px] font-medium">
                          {projectTracks.length}
                        </div>
                      </div>

                      {/* Info - Estilo Netflix */}
                      <div className="space-y-0.5">
                        <h4 className="font-semibold text-[10px] text-white group-hover:text-emerald-400 transition-colors truncate">
                          {project.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-1 text-[8px] text-gray-400">
                          <span className="font-medium text-white">{getProjectYear(project)}</span>
                          {project.type && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-400 font-semibold">{project.type}</span>
                            </>
                          )}
                        </div>
                        <div className="text-[8px] text-gray-500 truncate">
                          {getArtistName(project.artist_id)}{getCollaboratorNames(project.collaborator_artist_ids)}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <CreateProjectModal
        isOpen={showCreateModal || editingProject !== null}
        onClose={() => {
          setShowCreateModal(false);
          setEditingProject(null);
        }}
        jlyArtistId={jlyArtistId}
        project={editingProject}
      />
    </>
  );
}