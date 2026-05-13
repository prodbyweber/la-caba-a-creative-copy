import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Search, User, X, MoreHorizontal, Pencil, Trash2, ChevronRight } from "lucide-react";
import ArtistProfilePanel from "@/components/admin/ArtistProfilePanel";

const ic = "w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-white/25 placeholder-white/20 transition-colors";

export default function Artists() {
  const [searchQuery, setSearchQuery] = useState("");
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
    queryFn: () => base44.entities.Artist.list('-created_date'),
  });

  const { data: userProfiles = [] } = useQuery({
    queryKey: ['all-user-profiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 200),
  });

  const enriched = useMemo(() => {
    return artists.map(artist => {
      const profile = userProfiles.find(p => p.user_id === artist.user_id);
      return { ...artist, _profile: profile };
    });
  }, [artists, userProfiles]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return enriched.filter(a =>
      !searchQuery || a.stageName?.toLowerCase().includes(q) || a.legalName?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q)
    );
  }, [enriched, searchQuery]);

  return (
    <AdminLayout activePage="Artists">
      <div className="px-4 sm:px-8 lg:px-12 py-6 max-w-3xl lg:max-w-none mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">Creadores</h1>
            <p className="text-[11px] text-white/25 mt-0.5">{enriched.length} perfiles</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-white/60 text-xs font-medium hover:border-white/25 hover:text-white hover:bg-white/[0.04] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.07] rounded-xl mb-4">
          <Search className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar creador..."
            className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-white/20 hover:text-white/50 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-1">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-14 bg-white/[0.03] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <User className="w-8 h-8 text-white/10 mx-auto mb-2" />
            <p className="text-sm text-white/20">Sin resultados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-px">
            {filtered.map((artist, i) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.25) }}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer"
                onClick={() => setSelectedArtist(artist)}
              >
                {/* Avatar circle */}
                <div className="w-9 h-9 rounded-full overflow-hidden bg-white/[0.06] flex-shrink-0">
                  {artist.avatar_url ? (
                    <img
                      src={artist.avatar_url}
                      alt={artist.stageName}
                      className="w-full h-full object-cover"
                      style={{ objectPosition: artist.photo_position || "center top" }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white/20">{artist.stageName?.[0]?.toUpperCase() || "?"}</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate leading-tight">{artist.stageName}</p>
                  <p className="text-[11px] text-white/25 truncate">
                    {artist._profile?.username
                      ? `@${artist._profile.username}`
                      : artist._profile?.user_email || artist.email || artist.genre || "—"}
                  </p>
                  {(artist._profile?.nationality || artist._profile?.account_type) && (
                    <p className="text-[10px] text-white/15 truncate">
                      {artist._profile?.account_type === "brand" ? "Marca" : artist._profile?.account_type === "artist" ? "Artista" : ""}
                      {artist._profile?.nationality ? ` · ${artist._profile.nationality}` : ""}
                    </p>
                  )}
                </div>

                {/* Status dot + arrow */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    artist.status === 'Active' ? 'bg-emerald-400' :
                    artist.status === 'Lead' ? 'bg-[#ff5833]' : 'bg-white/15'
                  }`} />
                  <ChevronRight className="w-3.5 h-3.5 text-white/15 group-hover:text-white/40 transition-colors" />
                </div>

                {/* 3-dot menu */}
                <div onClick={e => e.stopPropagation()}>
                  <ArtistCardMenu
                    onView={() => setSelectedArtist(artist)}
                    onEdit={() => setEditArtist(artist)}
                    onDelete={() => {
                      if (confirm(`¿Eliminar a ${artist.stageName}?`)) deleteArtistMutation.mutate(artist.id);
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <CreateArtistModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />

      {editArtist && <EditArtistModal artist={editArtist} onClose={() => setEditArtist(null)} />}

      {selectedArtist && (
        <ArtistProfilePanel artist={selectedArtist} onClose={() => setSelectedArtist(null)} />
      )}
    </AdminLayout>
  );
}

function ArtistCardMenu({ onView, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="absolute top-2 right-2 z-10" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(!open)}
        className="w-7 h-7 rounded-lg bg-black/50 backdrop-blur-sm border border-white/[0.07] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <MoreHorizontal className="w-3.5 h-3.5 text-white/60" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 bg-[#141415] border border-white/[0.09] rounded-xl shadow-2xl overflow-hidden min-w-[130px]">
            <button onClick={() => { setOpen(false); onView(); }}
              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-xs text-white/60 hover:bg-white/[0.06] hover:text-white transition-colors">
              <User className="w-3.5 h-3.5" /> Ver Perfil
            </button>
            <button onClick={() => { setOpen(false); onEdit(); }}
              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-xs text-white/60 hover:bg-white/[0.06] hover:text-white transition-colors">
              <Pencil className="w-3.5 h-3.5" /> Editar
            </button>
            <button onClick={() => { setOpen(false); onDelete(); }}
              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-xs text-red-400/70 hover:bg-red-500/[0.08] hover:text-red-400 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Eliminar
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ArtistForm({ data, onChange, onSubmit, onClose, submitLabel, loading }) {
  const [tagInput, setTagInput] = useState("");
  const addTag = () => {
    if (tagInput.trim() && !data.tags.includes(tagInput.trim())) {
      onChange({ ...data, tags: [...data.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(); }} className="p-5 space-y-4 overflow-y-auto max-h-[72vh]">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1.5">Nombre artístico *</label>
          <input value={data.stageName} onChange={e => onChange({ ...data, stageName: e.target.value })} required className={ic} placeholder="Stage name" />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1.5">Nombre legal</label>
          <input value={data.legalName} onChange={e => onChange({ ...data, legalName: e.target.value })} className={ic} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1.5">Email</label>
          <input type="email" value={data.email} onChange={e => onChange({ ...data, email: e.target.value })} className={ic} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1.5">Teléfono</label>
          <input value={data.phone} onChange={e => onChange({ ...data, phone: e.target.value })} className={ic} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1.5">Género</label>
          <input value={data.genre} onChange={e => onChange({ ...data, genre: e.target.value })} className={ic} placeholder="Reggaeton, Trap..." />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1.5">Ubicación</label>
          <input value={data.location} onChange={e => onChange({ ...data, location: e.target.value })} className={ic} placeholder="Madrid, España" />
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1.5">Tags</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {data.tags.map((t, i) => (
            <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.07] text-white/50 text-[10px]">
              {t}
              <button type="button" onClick={() => onChange({ ...data, tags: data.tags.filter(x => x !== t) })}>
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="Añadir tag..." className={ic} />
          <button type="button" onClick={addTag} className="px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/50 text-xs hover:bg-white/10 transition-colors">+</button>
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1.5">Notas internas</label>
        <textarea value={data.notes} onChange={e => onChange({ ...data, notes: e.target.value })} rows={3} className={ic + " resize-none"} />
      </div>
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/[0.05] text-white/50 text-sm font-semibold hover:bg-white/10 transition-colors">Cancelar</button>
        <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-white text-black text-sm font-bold hover:bg-white/90 disabled:opacity-40 transition-colors">
          {loading ? "Guardando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

function ModalShell({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
        className="relative w-full max-w-lg bg-[#111112] rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h3 className="text-sm font-bold text-white">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors">
            <X className="w-4 h-4 text-white/40" />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

function EditArtistModal({ artist, onClose }) {
  const [formData, setFormData] = useState({
    stageName: artist.stageName || "", legalName: artist.legalName || "",
    email: artist.email || "", phone: artist.phone || "",
    location: artist.location || "", genre: artist.genre || "",
    tags: artist.tags || [], notes: artist.notes || ""
  });
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: d => base44.entities.Artist.update(artist.id, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['artists'] }); onClose(); }
  });
  return (
    <ModalShell title="Editar creador" onClose={onClose}>
      <ArtistForm data={formData} onChange={setFormData} onSubmit={() => mutation.mutate(formData)} onClose={onClose} submitLabel="Guardar" loading={mutation.isPending} />
    </ModalShell>
  );
}

function CreateArtistModal({ isOpen, onClose }) {
  const emptyForm = { stageName: "", legalName: "", email: "", phone: "", location: "", genre: "", tags: [], notes: "" };
  const [formData, setFormData] = useState(emptyForm);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: d => base44.entities.Artist.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['artists'] }); onClose(); setFormData(emptyForm); }
  });
  if (!isOpen) return null;
  return (
    <ModalShell title="Nuevo creador" onClose={onClose}>
      <ArtistForm data={formData} onChange={setFormData} onSubmit={() => mutation.mutate(formData)} onClose={onClose} submitLabel="Crear" loading={mutation.isPending} />
    </ModalShell>
  );
}