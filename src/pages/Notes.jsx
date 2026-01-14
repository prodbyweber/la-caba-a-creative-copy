import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, MessageSquare, Clock } from "lucide-react";

export default function Notes() {
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: notes = [] } = useQuery({
    queryKey: ['notes'],
    queryFn: () => base44.entities.Note.list('-created_date')
  });

  const { data: artists = [] } = useQuery({
    queryKey: ['artists'],
    queryFn: () => base44.entities.Artist.list()
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list()
  });

  const filteredNotes = notes.filter(note => {
    if (categoryFilter === "All") return true;
    return note.category === categoryFilter;
  });

  const categories = ['All', 'CreativeDirection', 'Lyrics', 'Arrangement', 'MixNotes', 'Branding', 'VisualIdeas'];

  return (
    <AdminLayout activePage="Notes">
      <div className="p-6 max-w-[1600px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Notes</h1>
            <p className="text-gray-500">Production notes and creative direction</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Note
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                categoryFilter === category
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Notes List */}
        <div className="space-y-3">
          {filteredNotes.map((note, i) => {
            const artist = artists.find(a => a.id === note.artist_id);
            const project = projects.find(p => p.id === note.project_id);

            return (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/5 rounded-2xl p-6 border border-white/5 hover:border-emerald-500/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 rounded-lg text-sm font-medium bg-purple-500/10 text-purple-400">
                        {note.category}
                      </span>
                      {note.timecode && (
                        <span className="font-mono text-emerald-400 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {note.timecode}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-300 mb-3 whitespace-pre-wrap">{note.text}</p>

                    <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                      {artist && <span>Artist: {artist.stageName}</span>}
                      {project && <span>• Project: {project.title}</span>}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <CreateNoteModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        artists={artists}
        projects={projects}
      />
    </AdminLayout>
  );
}

function CreateNoteModal({ isOpen, onClose, artists, projects }) {
  const [formData, setFormData] = useState({
    artist_id: "",
    project_id: "",
    timecode: "",
    category: "CreativeDirection",
    text: ""
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Note.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
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
        <h3 className="text-xl font-bold mb-6">New Note</h3>
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
          <div className="grid grid-cols-2 gap-4">
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="CreativeDirection">Creative Direction</option>
              <option value="Lyrics">Lyrics</option>
              <option value="Arrangement">Arrangement</option>
              <option value="MixNotes">Mix Notes</option>
              <option value="Branding">Branding</option>
              <option value="VisualIdeas">Visual Ideas</option>
            </select>
            <input
              type="text"
              placeholder="Timecode (MM:SS)"
              value={formData.timecode}
              onChange={(e) => setFormData({ ...formData, timecode: e.target.value })}
              pattern="[0-9]{2}:[0-9]{2}"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <textarea
            placeholder="Note content *"
            value={formData.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            required
            rows={6}
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