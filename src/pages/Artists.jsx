import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Search, Filter, User, Mail, Phone, MapPin, Tag, X, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import ArtistProfilePanel from "@/components/admin/ArtistProfilePanel";

export default function Artists() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [editArtist, setEditArtist] = useState(null);

  const queryClient = useQueryClient();

  const deleteArtistMutation = useMutation({
    mutationFn: (id) => base44.entities.Artist.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['artists'] })
  });

  const { data: artists = [], isLoading } = useQuery({
    queryKey: ['artists'],
    queryFn: async () => {
      const allArtists = await base44.entities.Artist.list('-created_date');
      // Asegurar que los artistas tengan avatares correctos
      return allArtists.map(artist => {
        if (artist.stageName === 'JLY' && !artist.avatar_url) {
          return {
            ...artist,
            avatar_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6965118e2b17684fa124077e/5cdacd140_jlytransparente.png'
          };
        }
        // Puedes agregar más artistas aquí con sus avatares
        if (artist.stageName === 'Ronby' && !artist.avatar_url) {
          return {
            ...artist,
            avatar_url: 'https://via.placeholder.com/400x400/7c3aed/ffffff?text=RONBY'
          };
        }
        return artist;
      });
    }
  });

  const filteredArtists = artists.filter(artist => {
    const matchesSearch = artist.stageName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         artist.legalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         artist.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || artist.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    All: artists.length,
    Lead: artists.filter(a => a.status === 'Lead').length,
    Active: artists.filter(a => a.status === 'Active').length,
    Inactive: artists.filter(a => a.status === 'Inactive').length
  };

  return (
    <AdminLayout activePage="Artists">
      <div className="px-6 sm:px-12 lg:px-16 xl:px-24 py-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Artists</h1>
            <p className="text-gray-500">Manage your artist roster</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Artist
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
              placeholder="Search artists..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['All', 'Lead', 'Active', 'Inactive'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                  statusFilter === status
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {status} ({statusCounts[status]})
              </button>
            ))}
          </div>
        </div>

        {/* Artists Grid/List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-2xl p-6 animate-pulse">
                <div className="h-24 w-24 bg-white/10 rounded-xl mx-auto mb-4" />
                <div className="h-4 bg-white/10 rounded w-3/4 mx-auto mb-2" />
                <div className="h-3 bg-white/10 rounded w-1/2 mx-auto" />
              </div>
            ))}
          </div>
        ) : filteredArtists.length === 0 ? (
          <div className="text-center py-20">
            <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No artists found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium"
            >
              Add your first artist
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredArtists.map((artist, i) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/5 rounded-2xl p-6 border border-white/5 hover:border-emerald-500/30 transition-all group relative"
              >
                {/* 3-dot menu */}
                <ArtistCardMenu
                  onView={() => setSelectedArtist(artist)}
                  onEdit={() => setEditArtist(artist)}
                  onDelete={() => {
                    if (confirm(`¿Eliminar a ${artist.stageName}?`)) deleteArtistMutation.mutate(artist.id);
                  }}
                />
                {/* Clickable area */}
                <div onClick={() => setSelectedArtist(artist)} className="cursor-pointer">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-emerald-500/20 to-purple-500/20 mx-auto mb-4 overflow-hidden">
                  {artist.avatar_url ? (
                    <img src={artist.avatar_url} alt={artist.stageName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-10 h-10 text-white/40" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="text-center mb-3">
                  <h3 className="font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">
                    {artist.stageName}
                  </h3>
                  {artist.genre && (
                    <p className="text-sm text-gray-500">{artist.genre}</p>
                  )}
                </div>

                {/* Status & Tags */}
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    artist.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' :
                    artist.status === 'Lead' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-gray-500/10 text-gray-400'
                  }`}>
                    {artist.status}
                  </span>
                  {artist.tags && artist.tags.slice(0, 2).map((tag, i) => (
                    <span key={i} className="px-2 py-1 rounded text-xs bg-purple-500/10 text-purple-400">
                      {tag}
                    </span>
                  ))}
                </div>
                </div>{/* end clickable */}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Artist Modal */}
      <CreateArtistModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Edit Artist Modal */}
      {editArtist && (
        <EditArtistModal
          artist={editArtist}
          onClose={() => setEditArtist(null)}
        />
      )}

      {/* Artist Profile Panel */}
      {selectedArtist && (
        <ArtistProfilePanel
          artist={selectedArtist}
          onClose={() => setSelectedArtist(null)}
        />
      )}
    </AdminLayout>
  );
}

function ArtistCardMenu({ onView, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="absolute top-3 right-3 z-10" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen(!open)}
        className="w-7 h-7 rounded-lg bg-white/0 hover:bg-white/10 flex items-center justify-center transition-colors"
      >
        <MoreHorizontal className="w-4 h-4 text-white/30 hover:text-white/70" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 bg-[#1a1a1c] border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[130px]">
            <button onClick={() => { setOpen(false); onView(); }}
              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-white/70 hover:bg-white/[0.07] hover:text-white transition-colors">
              <User className="w-3.5 h-3.5" /> Ver Perfil
            </button>
            <button onClick={() => { setOpen(false); onEdit(); }}
              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-white/70 hover:bg-white/[0.07] hover:text-white transition-colors">
              <Pencil className="w-3.5 h-3.5" /> Editar
            </button>
            <button onClick={() => { setOpen(false); onDelete(); }}
              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Eliminar
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function EditArtistModal({ artist, onClose }) {
  const [formData, setFormData] = useState({
    stageName: artist.stageName || "",
    legalName: artist.legalName || "",
    email: artist.email || "",
    phone: artist.phone || "",
    location: artist.location || "",
    status: artist.status || "Lead",
    genre: artist.genre || "",
    tags: artist.tags || [],
    notes: artist.notes || ""
  });
  const [tagInput, setTagInput] = useState("");
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Artist.update(artist.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
      onClose();
    }
  });

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-2xl bg-[#141414] rounded-2xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#141414] z-10">
          <h3 className="text-xl font-bold">Editar Artista</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(formData); }} className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Stage Name *</label>
              <input type="text" value={formData.stageName} onChange={(e) => setFormData({ ...formData, stageName: e.target.value })} required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Legal Name</label>
              <input type="text" value={formData.legalName} onChange={(e) => setFormData({ ...formData, legalName: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50" />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50">
                <option value="Lead">Lead</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Genre</label>
              <input type="text" value={formData.genre} onChange={(e) => setFormData({ ...formData, genre: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
              <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-sm flex items-center gap-2">
                  {tag}
                  <button type="button" onClick={() => setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="Add tag..." className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50" />
              <button type="button" onClick={addTag} className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl text-purple-400">Add</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
            <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 resize-none" />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium">Cancelar</button>
            <button type="submit" disabled={updateMutation.isPending} className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium disabled:opacity-50">
              {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function CreateArtistModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    stageName: "",
    legalName: "",
    email: "",
    phone: "",
    location: "",
    status: "Lead",
    genre: "",
    tags: [],
    notes: ""
  });
  const [tagInput, setTagInput] = useState("");

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Artist.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
      onClose();
      setFormData({
        stageName: "",
        legalName: "",
        email: "",
        phone: "",
        location: "",
        status: "Lead",
        genre: "",
        tags: [],
        notes: ""
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const removeTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
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
          <h3 className="text-xl font-bold">Add New Artist</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Stage Name *</label>
              <input
                type="text"
                value={formData.stageName}
                onChange={(e) => setFormData({ ...formData, stageName: e.target.value })}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Legal Name</label>
              <input
                type="text"
                value={formData.legalName}
                onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
              >
                <option value="Lead">Lead</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Madrid, Spain"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-sm flex items-center gap-2">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tag..."
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl text-purple-400"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              placeholder="Internal notes about this artist..."
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
              {createMutation.isPending ? 'Creating...' : 'Create Artist'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}