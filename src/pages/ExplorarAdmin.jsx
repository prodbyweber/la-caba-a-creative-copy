import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Edit, GripVertical, Eye, EyeOff,
  Star, ExternalLink, Youtube, Music2, Image as ImageIcon, X, Save
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const ROW_CATEGORIES = [
  { key: "trending",      label: "En Tendencia" },
  { key: "new_releases",  label: "Nuevos Lanzamientos" },
  { key: "mini_films",    label: "Mini Films" },
  { key: "afro_caribbean",label: "Afro / Caribbean Vibes" },
  { key: "experimental",  label: "Experimental / New Wave" },
];

function getYoutubeThumbnail(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (!match) return null;
  return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
}

function getYoutubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

const EMPTY_FORM = {
  title: "",
  subtitle: "",
  row_category: "trending",
  order: 0,
  youtube_url: "",
  youtube_music_url: "",
  audio_file_url: "",
  thumbnail_url: "",
  artist_id: "",
  is_hero: false,
  is_active: true,
};

function ItemModal({ item, artists, onClose, onSave }) {
  const [form, setForm] = useState(item || EMPTY_FORM);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [previewVideo, setPreviewVideo] = useState(false);

  const ytThumb = getYoutubeThumbnail(form.youtube_url || form.youtube_music_url);
  const displayThumb = form.thumbnail_url || ytThumb;
  const ytId = getYoutubeId(form.youtube_url || form.youtube_music_url);

  const handleUploadThumb = async (file) => {
    if (!file) return;
    setUploadingThumb(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(f => ({ ...f, thumbnail_url: file_url }));
    } finally {
      setUploadingThumb(false);
    }
  };

  const handleUploadAudio = async (file) => {
    if (!file) return;
    setUploadingAudio(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(f => ({ ...f, audio_file_url: file_url }));
    } finally {
      setUploadingAudio(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-lg flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-[#111113] border border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-base font-bold text-white">{item ? "Editar item" : "Nuevo item"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Thumbnail preview + video preview */}
          <div className="relative rounded-xl overflow-hidden bg-white/5 border border-white/10" style={{ aspectRatio: "16/9" }}>
            {previewVideo && ytId ? (
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
                className="w-full h-full"
                allow="autoplay"
                allowFullScreen
              />
            ) : displayThumb ? (
              <img src={displayThumb} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-10 h-10 text-white/15" />
              </div>
            )}
            {ytId && !previewVideo && (
              <button
                onClick={() => setPreviewVideo(true)}
                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                  <Youtube className="w-6 h-6 text-white" />
                </div>
              </button>
            )}
            {previewVideo && (
              <button onClick={() => setPreviewVideo(false)} className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-lg text-white hover:bg-black/90">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="text-xs text-white/40 font-medium mb-1.5 block uppercase tracking-wider">Título *</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
              placeholder="Nombre del track, film o artista"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="text-xs text-white/40 font-medium mb-1.5 block uppercase tracking-wider">Subtítulo / Género</label>
            <input
              value={form.subtitle}
              onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
              placeholder="Urban, Afrobeats, Film..."
            />
          </div>

          {/* Row category + order */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/40 font-medium mb-1.5 block uppercase tracking-wider">Fila</label>
              <select
                value={form.row_category}
                onChange={e => setForm(f => ({ ...f, row_category: e.target.value }))}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
              >
                {ROW_CATEGORIES.map(r => (
                  <option key={r.key} value={r.key} className="bg-[#111]">{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/40 font-medium mb-1.5 block uppercase tracking-wider">Orden</label>
              <input
                type="number"
                value={form.order}
                onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* YouTube URL */}
          <div>
            <label className="text-xs text-white/40 font-medium mb-1.5 block uppercase tracking-wider flex items-center gap-1.5">
              <Youtube className="w-3.5 h-3.5 text-red-400" /> URL de YouTube
            </label>
            <input
              value={form.youtube_url}
              onChange={e => setForm(f => ({ ...f, youtube_url: e.target.value }))}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
              placeholder="https://www.youtube.com/watch?v=..."
            />
            {getYoutubeThumbnail(form.youtube_url) && !form.thumbnail_url && (
              <p className="text-[10px] text-emerald-400 mt-1">Miniatura de YouTube detectada automaticamente</p>
            )}
          </div>

          {/* YouTube Music URL */}
          <div>
            <label className="text-xs text-white/40 font-medium mb-1.5 block uppercase tracking-wider flex items-center gap-1.5">
              <Music2 className="w-3.5 h-3.5 text-green-400" /> URL de YouTube Music
            </label>
            <input
              value={form.youtube_music_url}
              onChange={e => setForm(f => ({ ...f, youtube_music_url: e.target.value }))}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
              placeholder="https://music.youtube.com/watch?v=..."
            />
          </div>

          {/* Audio file */}
          <div>
            <label className="text-xs text-white/40 font-medium mb-1.5 block uppercase tracking-wider">Archivo de Audio (opcional)</label>
            {form.audio_file_url ? (
              <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
                <audio controls src={form.audio_file_url} className="flex-1 h-8" />
                <button onClick={() => setForm(f => ({ ...f, audio_file_url: "" }))} className="text-red-400 hover:text-red-300 p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 px-3 py-2.5 bg-white/5 border border-dashed border-white/10 rounded-lg cursor-pointer hover:bg-white/8 transition-colors">
                <input type="file" accept="audio/*" className="hidden" onChange={e => e.target.files?.[0] && handleUploadAudio(e.target.files[0])} />
                <Music2 className="w-4 h-4 text-white/30" />
                <span className="text-sm text-white/30">{uploadingAudio ? "Subiendo..." : "Subir audio"}</span>
              </label>
            )}
          </div>

          {/* Custom thumbnail */}
          <div>
            <label className="text-xs text-white/40 font-medium mb-1.5 block uppercase tracking-wider">Miniatura personalizada (sobreescribe la de YouTube)</label>
            <div className="flex gap-2">
              <input
                value={form.thumbnail_url}
                onChange={e => setForm(f => ({ ...f, thumbnail_url: e.target.value }))}
                className="flex-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
                placeholder="https://... o sube una imagen"
              />
              <label className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors flex items-center gap-1.5 text-white/50 hover:text-white text-xs">
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUploadThumb(e.target.files[0])} />
                <ImageIcon className="w-4 h-4" />
                {uploadingThumb ? "..." : "Subir"}
              </label>
            </div>
          </div>

          {/* Artist link */}
          <div>
            <label className="text-xs text-white/40 font-medium mb-1.5 block uppercase tracking-wider">Vincular a Artista (opcional)</label>
            <select
              value={form.artist_id}
              onChange={e => setForm(f => ({ ...f, artist_id: e.target.value }))}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
            >
              <option value="" className="bg-[#111]">Sin artista</option>
              {artists.map(a => (
                <option key={a.id} value={a.id} className="bg-[#111]">{a.stageName}</option>
              ))}
            </select>
          </div>

          {/* Toggles */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => setForm(f => ({ ...f, is_hero: !f.is_hero }))}
                className={`w-9 h-5 rounded-full transition-colors ${form.is_hero ? 'bg-yellow-500' : 'bg-white/10'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform shadow ${form.is_hero ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-xs text-white/50">Hero principal</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                className={`w-9 h-5 rounded-full transition-colors ${form.is_active ? 'bg-emerald-500' : 'bg-white/10'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform shadow ${form.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-xs text-white/50">Visible</span>
            </label>
          </div>

          {/* Save */}
          <button
            onClick={() => onSave(form)}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Save className="w-4 h-4" />
            Guardar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ItemCard({ item, index, onEdit, onDelete, onToggle, artists, provided }) {
  const ytThumb = getYoutubeThumbnail(item.youtube_url || item.youtube_music_url);
  const thumb = item.thumbnail_url || ytThumb;
  const artist = artists.find(a => a.id === item.artist_id);

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      className="flex items-center gap-3 p-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-xl transition-all group"
    >
      {/* Drag handle */}
      <div {...provided.dragHandleProps} className="text-white/20 hover:text-white/50 cursor-grab flex-shrink-0">
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Thumbnail */}
      <div className="w-16 h-10 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
        {thumb ? (
          <img src={thumb} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music2 className="w-4 h-4 text-white/15" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-white truncate">{item.title}</p>
          {item.is_hero && <Star className="w-3 h-3 text-yellow-400 flex-shrink-0" />}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {item.subtitle && <span className="text-[10px] text-white/30">{item.subtitle}</span>}
          {artist && <span className="text-[10px] text-emerald-400/70">{artist.stageName}</span>}
          {item.youtube_url && <Youtube className="w-3 h-3 text-red-400/60" />}
          {item.youtube_music_url && <Music2 className="w-3 h-3 text-green-400/60" />}
          {item.audio_file_url && <Music2 className="w-3 h-3 text-blue-400/60" />}
        </div>
      </div>

      {/* Order badge */}
      <span className="text-[10px] text-white/20 w-5 text-center flex-shrink-0">#{item.order ?? index}</span>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onToggle(item)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title={item.is_active ? "Ocultar" : "Mostrar"}>
          {item.is_active ? <Eye className="w-3.5 h-3.5 text-white/50" /> : <EyeOff className="w-3.5 h-3.5 text-white/25" />}
        </button>
        <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
          <Edit className="w-3.5 h-3.5 text-white/50 hover:text-white" />
        </button>
        <button onClick={() => { if (confirm("¿Eliminar este item?")) onDelete(item.id); }} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
          <Trash2 className="w-3.5 h-3.5 text-white/30 hover:text-red-400" />
        </button>
      </div>
    </div>
  );
}

export default function ExplorarAdmin() {
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const qc = useQueryClient();

  const { data: items = [] } = useQuery({
    queryKey: ["explorar-items"],
    queryFn: () => base44.entities.ExplorarItem.list("order"),
  });

  const { data: artists = [] } = useQuery({
    queryKey: ["artists"],
    queryFn: () => base44.entities.Artist.list(),
  });

  const saveMutation = useMutation({
    mutationFn: (form) => form.id
      ? base44.entities.ExplorarItem.update(form.id, form)
      : base44.entities.ExplorarItem.create(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["explorar-items"] }); setShowModal(false); setEditingItem(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ExplorarItem.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["explorar-items"] }),
  });

  const toggleMutation = useMutation({
    mutationFn: (item) => base44.entities.ExplorarItem.update(item.id, { is_active: !item.is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["explorar-items"] }),
  });

  const handleDragEnd = async (result, category) => {
    if (!result.destination) return;
    const catItems = items.filter(i => i.row_category === category).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const [moved] = catItems.splice(result.source.index, 1);
    catItems.splice(result.destination.index, 0, moved);
    // Update order for each item in this category
    await Promise.all(catItems.map((item, idx) => base44.entities.ExplorarItem.update(item.id, { order: idx })));
    qc.invalidateQueries({ queryKey: ["explorar-items"] });
  };

  const openNew = () => { setEditingItem(null); setShowModal(true); };
  const openEdit = (item) => { setEditingItem(item); setShowModal(true); };

  return (
    <AdminLayout activePage="ExplorarAdmin">
      <div className="px-4 sm:px-8 lg:px-14 py-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Editor Explorar</h1>
            <p className="text-sm text-white/30 mt-0.5">Gestiona el contenido de la plataforma de descubrimiento</p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo item
          </button>
        </div>

        {/* Rows by category */}
        <div className="space-y-8">
          {ROW_CATEGORIES.map(cat => {
            const catItems = items.filter(i => i.row_category === cat.key).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            return (
              <div key={cat.key}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-white">{cat.label}</h2>
                  <span className="text-[10px] text-white/25">{catItems.length} items</span>
                </div>

                <DragDropContext onDragEnd={(result) => handleDragEnd(result, cat.key)}>
                  <Droppable droppableId={cat.key}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                        {catItems.length === 0 && (
                          <div className="py-6 border border-dashed border-white/[0.07] rounded-xl text-center">
                            <p className="text-xs text-white/20">Sin items en esta fila</p>
                          </div>
                        )}
                        {catItems.map((item, index) => (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided) => (
                              <ItemCard
                                item={item}
                                index={index}
                                onEdit={openEdit}
                                onDelete={deleteMutation.mutate}
                                onToggle={toggleMutation.mutate}
                                artists={artists}
                                provided={provided}
                              />
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <ItemModal
            item={editingItem}
            artists={artists}
            onClose={() => { setShowModal(false); setEditingItem(null); }}
            onSave={saveMutation.mutate}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}