import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, FolderOpen, Music2, Image, ChevronRight } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

  const queryClient = useQueryClient();

  const { data: allProjects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('-created_date'),
    initialData: [],
    staleTime: 0,
  });

  // Filtrar proyectos solo del artista JLY
  const projects = jlyArtistId 
    ? allProjects.filter(project => project.artist_id === jlyArtistId)
    : allProjects;

  const { data: tracks } = useQuery({
    queryKey: ['all-tracks'],
    queryFn: () => base44.entities.Track.list('-created_date'),
    initialData: [],
    staleTime: 0,
  });

  const { data: artists = [] } = useQuery({
    queryKey: ['artists'],
    queryFn: () => base44.entities.Artist.list(),
    initialData: [],
    staleTime: 0,
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
        className="sm:bg-gradient-to-br sm:from-[#141414] sm:to-black sm:rounded-2xl sm:border sm:border-white/5 sm:overflow-hidden"
      >
        {/* Header */}
        <div className="px-0 sm:px-4 sm:py-3 sm:border-b sm:border-white/5 flex items-center justify-between mb-3 sm:mb-0">
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex w-8 h-8 rounded-lg bg-white/5 items-center justify-center">
              <FolderOpen className="w-4 h-4 text-white/40" />
            </div>
            <h3 className="text-base font-bold text-white">Proyectos Activos</h3>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3 h-3" />
            <span className="hidden lg:inline">Nuevo</span>
          </button>
        </div>

        {/* Projects Carousel */}
        <div className="sm:p-4 lg:p-5">
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
            /* Mobile: scroll nativo edge-to-edge. Desktop: Embla */
            <>
              {/* MOBILE carousel */}
              <div className="sm:hidden -mx-4 px-4 overflow-x-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                <div className="flex gap-2.5" style={{ width: "max-content" }}>
                  {projects.map((project, i) => {
                    const projectTracks = getProjectTracks(project.id);
                    return (
                      <Link key={project.id} to={createPageUrl(`ProjectDetail?id=${project.id}`)}>
                        <div className="flex-shrink-0 w-[120px]">
                          <div className="relative aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-white/10 to-white/5 mb-1.5">
                            {project.cover_url ? (
                              <img src={project.cover_url} alt={project.title} className="w-full h-full object-cover" />
                            ) : projectTracks[0]?.cover_url ? (
                              <img src={projectTracks[0].cover_url} alt={project.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Music2 className="w-7 h-7 text-white/20" />
                              </div>
                            )}
                            <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[8px] font-medium text-white">
                              {projectTracks.length}
                            </div>
                          </div>
                          <p className="text-[11px] font-semibold text-white truncate leading-tight">{project.title}</p>
                          <p className="text-[10px] text-white/35 truncate">{getProjectYear(project)}{project.type ? ` · ${project.type}` : ""}</p>
                        </div>
                      </Link>
                    );
                  })}
                  {/* trailing space */}
                  <div className="flex-shrink-0 w-1" />
                </div>
              </div>

              {/* DESKTOP carousel (Embla) */}
              <div className="hidden sm:block overflow-hidden" ref={emblaRef}>
                <div className="flex gap-4">
                  {projects.map((project, i) => {
                  const projectTracks = getProjectTracks(project.id);
                  return (
                    <div key={project.id} className="flex-[0_0_150px] sm:flex-[0_0_175px]">
                      <Link to={createPageUrl(`ProjectDetail?id=${project.id}`)}>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="group bg-white/5 rounded-xl p-2 border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer h-full"
                        >
                          <div className="relative aspect-square rounded-lg bg-gradient-to-br from-emerald-500/20 to-purple-500/20 mb-2 overflow-hidden">
                            {project.cover_url ? (
                              <img src={project.cover_url} alt={project.title} className="w-full h-full object-cover" />
                            ) : projectTracks[0]?.cover_url ? (
                              <img src={projectTracks[0].cover_url} alt={project.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Music2 className="w-8 h-8 text-white/20" />
                              </div>
                            )}
                            <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[9px] font-medium">
                              {projectTracks.length}
                            </div>
                          </div>
                          <div className="space-y-0.5 px-0.5">
                            <h4 className="font-semibold text-xs text-white group-hover:text-emerald-400 transition-colors truncate">{project.title}</h4>
                            <div className="flex flex-wrap items-center gap-1 text-[10px] text-gray-400">
                              <span className="font-medium text-white">{getProjectYear(project)}</span>
                              {project.type && <><span>•</span><span className="text-emerald-400 font-semibold">{project.type}</span></>}
                            </div>
                            <div className="text-[10px] text-gray-500 truncate">{getArtistName(project.artist_id)}{getCollaboratorNames(project.collaborator_artist_ids)}</div>
                          </div>
                        </motion.div>
                      </Link>
                    </div>
                  );
                  })}
                </div>
              </div>
            </>
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