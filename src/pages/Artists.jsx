import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Search, User, X, MoreHorizontal, Pencil, Trash2, Music2, Camera, Briefcase } from "lucide-react";
import ArtistProfilePanel from "@/components/admin/ArtistProfilePanel";

const TYPE_FILTERS = [
  { key: "all", label: "Todos" },
  { key: "artist", label: "Artista" },
  { key: "creator", label: "Creador" },
  { key: "brand", label: "Marca" },
];

const TYPE_LABEL = {
  artist: "Artista",
  creator: "Creador",
  brand: "Marca",
};

const TYPE_ICON = {
  artist: Music2,
  creator: Camera,
  brand: Briefcase,
};

const ic = "w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-white/25 placeholder-white/20 transition-colors";

export default function Artists() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
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

  // Merge artist with their userProfile account_type
  const enriched = useMemo(() => {
    return artists.map(artist => {
      const profile = userProfiles.find(p => p.user_id === artist.user_id);
      const accountType = profile?.account_type || "artist";
      return { ...artist, _accountType: accountType, _profile: profile };
    });
  }, [artists, userProfiles]);

  const filtered = useMemo(() => {
    return enriched.filter(a => {
      const matchType = typeFilter === "all" || a._accountType === typeFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch = !searchQuery || a.stageName?.toLowerCase().includes(q) || a.legalName?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }, [enriched, typeFilter, searchQuery]);

  const counts = useMemo(() => ({
    all: enriched.length,
    artist: enriched.filter(a => a._accountType === "artist").length,
    creator: enriched.filter(a => a._accountType === "creator").length,
    brand: enriched.filter(a => a._accountType === "brand").length,
  }), [enriched]);

  return (
    <AdminLayout activePage="Artists">
      <div className="px-4 sm:px-8 lg:px-12 py-6 max-w-[1600px] mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Creadores</h1>
            <p className="text-xs text-white/30 mt-0.5">{enriched.length} perfiles registrados</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/15 text-white text-sm font-medium hover:border-white/30 hover:bg-white/[0.05] transition-all"
          >
            <Plus className="w-4 h-4" />
            Nuevo
          </button>
        </div>

        {/* Filters row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Type pills */}
          <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1 flex-shrink-0">
            {TYPE_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setTypeFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${typeFilter === f.key ? "bg-white text-black" : "text-white/35 hover:text-white/70"}`}
              >
                {f.label}
                <span className={`ml-1.5 text-[9px] ${typeFilter === f.key ? "text-black/40" : "text-white/15"}`}>{counts[f.key]}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.07] rounded-xl">
            <Search className="w-4 h-4 text-white/20 flex-shrink-0" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre o email..."
              className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-white/20 hover:text-white/50 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-52 bg-white/[0.03] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <User className="w-10 h-10 text-white/10 mx-auto mb-3" />
            <p className="text-sm text-white/25">No hay creadores para este filtro</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filtered.map((artist, i) => {
              const TypeIcon = TYPE_ICON[artist._accountType] || User;
              const typeLabel = TYPE_LABEL[artist._accountType] || "Artista";
              return (
                <motion.div
                  key={artist.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  className="group relative bg-[#0f0f10] border border-white/[0.07] rounded-xl overflow-hidden hover:border-white/[0.16] transition-all duration-300"
                  style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.35)" }}
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
                    {/* Avatar — square aspect */}
                    <div className="relative w-full aspect-square bg-[#171718] overflow-hidden">
                      {artist.avatar_url ? (
                        <img
                          src={artist.avatar_url}
                          alt={artist.stageName}
                          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                          style={{ objectPosition: artist.photo_position || "center top" }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl font-black text-white/10">{artist.stageName?.[0]?.toUpperCase() || "?"}</span>
                        </div>
                      )}
                      {/* Subtle bottom gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Type badge — bottom left */}
                      <div className="absolute bottom-2 left-2">
                        <span className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-black/70 text-white/45 backdrop-blur-sm border border-white/[0.08]">
                          <TypeIcon className="w-2.5 h-2.5" />
                          {typeLabel}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <h3 className="text-xs font-bold text-white truncate leading-tight mb-0.5">
                        {artist.stageName}
                      </h3>
                      {artist.genre ? (
                        <p className="text-[10px] text-white/30 truncate">{artist.genre}</p>
                      ) : artist._profile?.username ? (
                        <p className="text-[10px] text-white/20 truncate">@{artist._profile.username}</p>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              );
            })}
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