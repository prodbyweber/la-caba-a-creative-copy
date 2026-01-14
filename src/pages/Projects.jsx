import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Search, FolderKanban, Calendar, Clock, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, parseISO } from "date-fns";

export default function Projects() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('-created_date')
  });

  const { data: artists = [] } = useQuery({
    queryKey: ['artists'],
    queryFn: () => base44.entities.Artist.list()
  });

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    All: projects.length,
    Draft: projects.filter(p => p.status === 'Draft').length,
    Recording: projects.filter(p => p.status === 'Recording').length,
    Producing: projects.filter(p => p.status === 'Producing').length,
    Mixing: projects.filter(p => p.status === 'Mixing').length,
    Mastering: projects.filter(p => p.status === 'Mastering').length,
    Delivered: projects.filter(p => p.status === 'Delivered').length
  };

  const statusColors = {
    Draft: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    Recording: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Producing: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    Mixing: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    Mastering: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    Delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Archived: "bg-gray-500/10 text-gray-400 border-gray-500/20"
  };

  return (
    <AdminLayout activePage="Projects">
      <div className="p-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Projects</h1>
            <p className="text-gray-500">Manage music production projects</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        {/* Status Pipeline */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`p-4 rounded-xl border transition-all ${
                statusFilter === status
                  ? statusColors[status] || 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <div className="text-2xl font-bold mb-1">{count}</div>
              <div className="text-xs">{status}</div>
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-white/10 rounded w-3/4 mb-4" />
                <div className="h-4 bg-white/10 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <FolderKanban className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No projects found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium"
            >
              Create your first project
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project, i) => {
              const artist = artists.find(a => a.id === project.artist_id);
              const isOverdue = project.target_delivery_date && 
                new Date(project.target_delivery_date) < new Date() && 
                project.status !== 'Delivered';

              return (
                <Link key={project.id} to={createPageUrl(`ProjectDetail?id=${project.id}`)}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`bg-white/5 rounded-2xl p-6 border transition-all cursor-pointer group hover:border-emerald-500/30 ${
                      isOverdue ? 'border-red-500/20' : 'border-white/5'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">
                          {project.title}
                        </h3>
                        {artist && (
                          <p className="text-sm text-gray-500">{artist.stageName}</p>
                        )}
                      </div>
                      {isOverdue && (
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      )}
                    </div>

                    {/* Status & Type */}
                    <div className="flex gap-2 mb-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${statusColors[project.status]}`}>
                        {project.status}
                      </span>
                      <span className="px-3 py-1 rounded-lg text-xs font-medium bg-purple-500/10 text-purple-400">
                        {project.type}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-2 text-sm text-gray-400">
                      {project.genre && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Genre:</span>
                          <span>{project.genre}</span>
                        </div>
                      )}
                      {project.target_delivery_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-600" />
                          <span className={isOverdue ? 'text-red-400' : ''}>
                            {format(parseISO(project.target_delivery_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                      )}
                      {project.priority && (
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            project.priority === 'High' ? 'bg-red-500/10 text-red-400' :
                            project.priority === 'Medium' ? 'bg-orange-500/10 text-orange-400' :
                            'bg-blue-500/10 text-blue-400'
                          }`}>
                            {project.priority} Priority
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        artists={artists}
      />
    </AdminLayout>
  );
}

function CreateProjectModal({ isOpen, onClose, artists }) {
  const [formData, setFormData] = useState({
    artist_id: "",
    title: "",
    type: "Single",
    status: "Draft",
    priority: "Medium",
    start_date: "",
    target_delivery_date: "",
    genre: "",
    bpm: null,
    key: "",
    description: ""
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Project.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onClose();
      setFormData({
        artist_id: "",
        title: "",
        type: "Single",
        status: "Draft",
        priority: "Medium",
        start_date: "",
        target_delivery_date: "",
        genre: "",
        bpm: null,
        key: "",
        description: ""
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-2xl bg-[#141414] rounded-2xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#141414] z-10">
          <h3 className="text-xl font-bold">Create New Project</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Artist *</label>
              <select
                value={formData.artist_id}
                onChange={(e) => setFormData({ ...formData, artist_id: e.target.value })}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
              >
                <option value="">Select Artist</option>
                {artists.map((artist) => (
                  <option key={artist.id} value={artist.id}>{artist.stageName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
              >
                <option value="Single">Single</option>
                <option value="EP">EP</option>
                <option value="Album">Album</option>
                <option value="ContentPack">Content Pack</option>
                <option value="MixMaster">Mix/Master</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
              >
                <option value="Draft">Draft</option>
                <option value="Recording">Recording</option>
                <option value="Producing">Producing</option>
                <option value="Mixing">Mixing</option>
                <option value="Mastering">Mastering</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Target Delivery</label>
              <input
                type="date"
                value={formData.target_delivery_date}
                onChange={(e) => setFormData({ ...formData, target_delivery_date: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Genre</label>
              <input
                type="text"
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                placeholder="Reggaeton, Trap..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">BPM</label>
              <input
                type="number"
                value={formData.bpm || ""}
                onChange={(e) => setFormData({ ...formData, bpm: parseInt(e.target.value) || null })}
                placeholder="120"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Key</label>
              <input
                type="text"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                placeholder="Am, C#m..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Project details..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}