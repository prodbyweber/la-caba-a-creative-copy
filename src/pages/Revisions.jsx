import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, GitPullRequest, Clock, AlertCircle } from "lucide-react";

export default function Revisions() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: revisions = [] } = useQuery({
    queryKey: ['revisions'],
    queryFn: () => base44.entities.Revision.list('-created_date')
  });

  const { data: artists = [] } = useQuery({
    queryKey: ['artists'],
    queryFn: () => base44.entities.Artist.list()
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list()
  });

  const filteredRevisions = revisions.filter(revision => {
    if (statusFilter === "All") return true;
    return revision.status === statusFilter;
  });

  const statusCounts = {
    All: revisions.length,
    Open: revisions.filter(r => r.status === 'Open').length,
    InProgress: revisions.filter(r => r.status === 'InProgress').length,
    Fixed: revisions.filter(r => r.status === 'Fixed').length,
    Closed: revisions.filter(r => r.status === 'Closed').length
  };

  return (
    <AdminLayout activePage="Revisions">
      <div className="p-6 max-w-[1600px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Revisions</h1>
            <p className="text-gray-500">Track and manage song revisions</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Revision
          </button>
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                statusFilter === status
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {status} ({count})
            </button>
          ))}
        </div>

        {/* Revisions List */}
        <div className="space-y-3">
          {filteredRevisions.map((revision, i) => {
            const artist = artists.find(a => a.id === revision.artist_id);
            const project = projects.find(p => p.id === revision.project_id);

            return (
              <motion.div
                key={revision.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/5 rounded-2xl p-6 border border-white/5 hover:border-emerald-500/30 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-mono text-emerald-400 text-lg font-bold">
                        {revision.timecode}
                      </span>
                      <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        revision.severity === 'Critical' ? 'bg-red-500/10 text-red-400' :
                        revision.severity === 'Medium' ? 'bg-orange-500/10 text-orange-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {revision.severity}
                      </span>
                      <span className="px-3 py-1 rounded-lg text-sm font-medium bg-purple-500/10 text-purple-400">
                        {revision.revision_type}
                      </span>
                    </div>

                    <p className="text-gray-300 mb-3">{revision.request_text}</p>

                    <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                      {artist && <span>Artist: {artist.stageName}</span>}
                      {project && <span>• Project: {project.title}</span>}
                      <span>• Assigned to: {revision.assigned_to}</span>
                    </div>
                  </div>

                  <div className="flex lg:flex-col gap-2">
                    <span className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${
                      revision.status === 'Open' ? 'bg-red-500/10 text-red-400' :
                      revision.status === 'InProgress' ? 'bg-blue-500/10 text-blue-400' :
                      revision.status === 'Fixed' ? 'bg-emerald-500/10 text-emerald-400' :
                      'bg-gray-500/10 text-gray-400'
                    }`}>
                      {revision.status === 'InProgress' ? 'In Progress' : revision.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <CreateRevisionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        artists={artists}
        projects={projects}
      />
    </AdminLayout>
  );
}

function CreateRevisionModal({ isOpen, onClose, artists, projects }) {
  const [formData, setFormData] = useState({
    artist_id: "",
    project_id: "",
    timecode: "",
    revision_type: "Mix",
    request_text: "",
    severity: "Medium",
    status: "Open",
    assigned_to: "Me"
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Revision.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revisions'] });
      onClose();
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-lg bg-[#141414] rounded-2xl border border-white/10 p-6"
      >
        <h3 className="text-xl font-bold mb-6">New Revision</h3>
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="space-y-4">
          <select
            value={formData.artist_id}
            onChange={(e) => setFormData({ ...formData, artist_id: e.target.value })}
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
          >
            <option value="">Select Artist *</option>
            {artists.map((artist) => (
              <option key={artist.id} value={artist.id}>{artist.stageName}</option>
            ))}
          </select>
          <select
            value={formData.project_id}
            onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
          >
            <option value="">Select Project *</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.title}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Timecode (MM:SS) *"
            value={formData.timecode}
            onChange={(e) => setFormData({ ...formData, timecode: e.target.value })}
            pattern="[0-9]{2}:[0-9]{2}"
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50"
          />
          <div className="grid grid-cols-3 gap-4">
            <select
              value={formData.revision_type}
              onChange={(e) => setFormData({ ...formData, revision_type: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="Vocal">Vocal</option>
              <option value="Beat">Beat</option>
              <option value="Mix">Mix</option>
              <option value="Master">Master</option>
              <option value="Arrangement">Arrangement</option>
              <option value="FX">FX</option>
              <option value="Lyrics">Lyrics</option>
            </select>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Critical">Critical</option>
            </select>
            <select
              value={formData.assigned_to}
              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="Me">Me</option>
              <option value="Engineer">Engineer</option>
              <option value="Editor">Editor</option>
            </select>
          </div>
          <textarea
            placeholder="Revision details *"
            value={formData.request_text}
            onChange={(e) => setFormData({ ...formData, request_text: e.target.value })}
            required
            rows={4}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 resize-none"
          />
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600">Create</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}