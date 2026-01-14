import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Video } from "lucide-react";

export default function ContentCalendar() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: contentItems = [] } = useQuery({
    queryKey: ['content-items'],
    queryFn: () => base44.entities.ContentItem.list('-created_date')
  });

  const { data: artists = [] } = useQuery({
    queryKey: ['artists'],
    queryFn: () => base44.entities.Artist.list()
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list()
  });

  const statuses = ['Idea', 'Script', 'ToRecord', 'Recorded', 'Edited', 'Scheduled', 'Posted'];

  const getItemsByStatus = (status) => {
    return contentItems.filter(item => item.status === status);
  };

  return (
    <AdminLayout activePage="ContentCalendar">
      <div className="p-6 max-w-[1600px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Content Calendar</h1>
            <p className="text-gray-500">Manage content production pipeline</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Content
          </button>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {statuses.map((status) => {
            const items = getItemsByStatus(status);
            return (
              <div key={status} className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white">{status === 'ToRecord' ? 'To Record' : status}</h3>
                  <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-medium">
                    {items.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {items.map((item, i) => {
                    const artist = artists.find(a => a.id === item.artist_id);
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer"
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <Video className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-white line-clamp-2">{item.idea}</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 text-xs">
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">
                            {item.platform}
                          </span>
                          {artist && (
                            <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400">
                              {artist.stageName}
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400">
                            {item.content_pillar}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CreateContentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        artists={artists}
        projects={projects}
      />
    </AdminLayout>
  );
}

function CreateContentModal({ isOpen, onClose, artists, projects }) {
  const [formData, setFormData] = useState({
    artist_id: "",
    project_id: "",
    platform: "IGReels",
    content_pillar: "BTS",
    idea: "",
    script: "",
    recording_date: "",
    scheduled_post_date_time: "",
    status: "Idea"
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ContentItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-items'] });
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
        className="relative w-full max-w-lg bg-[#141414] rounded-2xl border border-white/10 p-6 max-h-[90vh] overflow-y-auto"
      >
        <h3 className="text-xl font-bold mb-6">New Content Item</h3>
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <select
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="IGReels">IG Reels</option>
              <option value="TikTok">TikTok</option>
              <option value="YouTubeShorts">YouTube Shorts</option>
              <option value="YouTubeLong">YouTube Long</option>
              <option value="Blog">Blog</option>
            </select>
            <select
              value={formData.content_pillar}
              onChange={(e) => setFormData({ ...formData, content_pillar: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="BTS">BTS</option>
              <option value="Education">Education</option>
              <option value="Results">Results</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Offer">Offer</option>
              <option value="UrbanLeague">Urban League</option>
            </select>
          </div>
          <select
            value={formData.artist_id}
            onChange={(e) => setFormData({ ...formData, artist_id: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
          >
            <option value="">Select Artist (optional)</option>
            {artists.map((artist) => (
              <option key={artist.id} value={artist.id}>{artist.stageName}</option>
            ))}
          </select>
          <textarea
            placeholder="Content Idea *"
            value={formData.idea}
            onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
            required
            rows={3}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 resize-none"
          />
          <textarea
            placeholder="Script (optional)"
            value={formData.script}
            onChange={(e) => setFormData({ ...formData, script: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 resize-none"
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Recording Date</label>
              <input
                type="date"
                value={formData.recording_date}
                onChange={(e) => setFormData({ ...formData, recording_date: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Scheduled Post</label>
              <input
                type="datetime-local"
                value={formData.scheduled_post_date_time}
                onChange={(e) => setFormData({ ...formData, scheduled_post_date_time: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600">Create</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}