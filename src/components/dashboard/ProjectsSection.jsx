import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, FolderOpen, Music2, Image, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import CreateProjectModal from "./CreateProjectModal";

export default function ProjectsSection() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('-created_date'),
    initialData: [],
  });

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

        {/* Projects Grid */}
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => {
                const projectTracks = getProjectTracks(project.id);
                return (
                  <Link key={project.id} to={createPageUrl(`ProjectDetail?id=${project.id}`)}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      className="group bg-white/5 rounded-xl p-4 border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer"
                    >
                      {/* Project Cover/Preview */}
                      <div className="relative aspect-square rounded-lg bg-gradient-to-br from-emerald-500/20 to-purple-500/20 mb-3 overflow-hidden">
                        {projectTracks[0]?.cover_url ? (
                          <img 
                            src={projectTracks[0].cover_url} 
                            alt={project.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music2 className="w-16 h-16 text-white/20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        
                        {/* Track Count Badge */}
                        <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-xs font-medium">
                          {projectTracks.length} tracks
                        </div>
                      </div>

                      {/* Project Info */}
                      <div className="space-y-2">
                        <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                          {project.name}
                          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                        </h4>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {project.description || 'Sin descripción'}
                        </p>
                        
                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            project.status === 'active' 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : project.status === 'completed'
                              ? 'bg-blue-500/10 text-blue-400'
                              : 'bg-gray-500/10 text-gray-400'
                          }`}>
                            {project.status === 'active' ? 'Activo' : project.status === 'completed' ? 'Completado' : 'Archivado'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
}