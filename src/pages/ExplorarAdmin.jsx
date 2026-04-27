import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Edit, GripVertical, Eye, EyeOff,
  Star, Youtube, Music2, Image as ImageIcon, X, Save, Film, Upload, ChevronDown, ChevronUp, ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import HeroSlideModal from "@/components/explorar/HeroSlideModal";

const ROW_CATEGORIES = [
  { key: "trending",       label: "En Tendencia" },
  { key: "new_releases",   label: "Nuevos Lanzamientos" },
  { key: "mini_films",     label: "Mini Films" },
  { key: "afro_caribbean", label: "Afro / Caribbean Vibes" },
  { key: "experimental",   label: "Experimental / New Wave" },
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

const EMPTY_ITEM_FORM = {
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

// ─── Modal para items de FILAS (sin hero) ──────────────────────────────────
function ItemModal({ item, artists, onClose, onSave }) {
  const [form, setForm] = useState(item ? { ...EMPTY_ITEM_FORM, ...item } : EMPTY_ITEM_FORM);
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
    } finally { setUploadingThumb(false); }
  };

  const handleUploadAudio = async (file) => {
    if (!file) return;
    setUploadingAudio(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(f => ({ ...f, audio_file_url: file_url }));
    } finally { setUploadingAudio(false); }
  };

  const inputClass = "w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder-white/20";
  const labelClass = "text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-1.5 block";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-lg flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-[#111113] border border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-base font-bold text-white">{item ? "Editar item" : "Nuevo item"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Thumbnail preview */}
          <div className="relative rounded-xl overflow-hidden bg-white/5 border border-white/10" style={{ aspectRatio: "16/9" }}>
            {previewVideo && ytId ? (
              <iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`} className="w-full h-full" allow="autoplay" allowFullScreen />
            ) : displayThumb ? (
              <img src={displayThumb} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-10 h-10 text-white/15" /></div>
            )}
            {ytId && !previewVideo && (
              <button onClick={() => setPreviewVideo(true)} className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                  <Youtube className="w-6 h-6 text-white" />
                </div>
              </button>
            )}
            {previewVideo && (
              <button onClick={() => setPreviewVideo(false)} className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-lg text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div>
            <label className={labelClass}>Título *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={inputClass} placeholder="Nombre del track, film o artista" />
          </div>

          <div>
            <label className={labelClass}>Subtítulo / Género</label>
            <input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} className={inputClass} placeholder="Urban, Afrobeats, Film..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Fila</label>
              <select value={form.row_category} onChange={e => setForm(f => ({ ...f, row_category: e.target.value }))} className={inputClass}>
                {ROW_CATEGORIES.map(r => <option key={r.key} value={r.key} className="bg-[#111]">{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Orden</label>
              <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}><Youtube className="w-3 h-3 inline mr-1 text-red-400" />URL de YouTube</label>
            <input value={form.youtube_url} onChange={e => setForm(f => ({ ...f, youtube_url: e.target.value }))} className={inputClass} placeholder="https://www.youtube.com/watch?v=..." />
            {getYoutubeThumbnail(form.youtube_url) && !form.thumbnail_url && (
              <p className="text-[10px] text-emerald-400 mt-1">Miniatura de YouTube detectada automáticamente</p>
            )}
          </div>

          <div>
            <label className={labelClass}><Music2 className="w-3 h-3 inline mr-1 text-green-400" />URL YouTube Music</label>
            <input value={form.youtube_music_url} onChange={e => setForm(f => ({ ...f, youtube_music_url: e.target.value }))} className={inputClass} placeholder="https://music.youtube.com/watch?v=..." />
          </div>

          <div>
            <label className={labelClass}>Archivo de Audio (opcional)</label>
            {form.audio_file_url ? (
              <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
                <audio controls src={form.audio_file_url} className="flex-1 h-8" />
                <button onClick={() => setForm(f => ({ ...f, audio_file_url: "" }))} className="text-red-400 p-1"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <label className="flex items-center gap-2 px-3 py-2.5 bg-white/5 border border-dashed border-white/10 rounded-lg cursor-pointer hover:bg-white/8 transition-colors">
                <input type="file" accept="audio/*" className="hidden" onChange={e => e.target.files?.[0] && handleUploadAudio(e.target.files[0])} />
                <Music2 className="w-4 h-4 text-white/30" />
                <span className="text-sm text-white/30">{uploadingAudio ? "Subiendo..." : "Subir audio"}</span>
              </label>
            )}
          </div>

          <div>
            <label className={labelClass}>Miniatura personalizada</label>
            <div className="flex gap-2">
              <input value={form.thumbnail_url} onChange={e => setForm(f => ({ ...f, thumbnail_url: e.target.value }))} className={inputClass} placeholder="https://... o sube una imagen" />
              <label className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors flex items-center gap-1.5 text-white/50 text-xs">
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUploadThumb(e.target.files[0])} />
                <Upload className="w-4 h-4" />
                {uploadingThumb ? "..." : "Subir"}
              </label>
            </div>
          </div>

          <div>
            <label className={labelClass}>Vincular a Artista (opcional)</label>
            <select value={form.artist_id} onChange={e => setForm(f => ({ ...f, artist_id: e.target.value }))} className={inputClass}>
              <option value="" className="bg-[#111]">Sin artista</option>
              {artists.map(a => <option key={a.id} value={a.id} className="bg-[#111]">{a.stageName}</option>)}
            </select>
          </div>

          {/* Destacar en Hero desde el modal de item */}
          <div className="p-3 rounded-xl border border-yellow-500/15 bg-yellow-500/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400/60" />
              <span className="text-xs text-white/40">Incluir también en carrusel Hero</span>
            </div>
            <div onClick={() => setForm(f => ({ ...f, is_hero: !f.is_hero }))} className={`w-9 h-5 rounded-full transition-colors cursor-pointer ${form.is_hero ? "bg-yellow-500" : "bg-white/10"}`}>
              <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform shadow ${form.is_hero ? "translate-x-4" : "translate-x-0.5"}`} />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <div onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))} className={`w-9 h-5 rounded-full transition-colors ${form.is_active ? "bg-emerald-500" : "bg-white/10"}`}>
              <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform shadow ${form.is_active ? "translate-x-4" : "translate-x-0.5"}`} />
            </div>
            <span className="text-xs text-white/50">Visible en plataforma</span>
          </label>

          <button onClick={() => onSave(form)} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
            <Save className="w-4 h-4" />
            Guardar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Tarjeta de item en fila ────────────────────────────────────────────────
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
      <div {...provided.dragHandleProps} className="text-white/20 hover:text-white/50 cursor-grab flex-shrink-0">
        <GripVertical className="w-4 h-4" />
      </div>
      <div className="w-16 h-10 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
        {thumb ? <img src={thumb} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Music2 className="w-4 h-4 text-white/15" /></div>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-white truncate">{item.title}</p>
          {item.is_hero && <Star className="w-3 h-3 text-yellow-400 flex-shrink-0" />}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {item.subtitle && <span className="text-[10px] text-white/30">{item.subtitle}</span>}
          {artist && <span className="text-[10px] text-emerald-400/70">{artist.stageName}</span>}
          {item.youtube_url && <Youtube className="w-3 h-3 text-red-400/60" />}
          {item.audio_file_url && <Music2 className="w-3 h-3 text-blue-400/60" />}
        </div>
      </div>
      <span className="text-[10px] text-white/20 w-5 text-center flex-shrink-0">#{item.order ?? index}</span>
      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onToggle(item)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
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

// ─── Página principal ───────────────────────────────────────────────────────
export default function ExplorarAdmin() {
  const [editingItem, setEditingItem] = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingHero, setEditingHero] = useState(null);
  const [showHeroModal, setShowHeroModal] = useState(false);
  const [heroExpanded, setHeroExpanded] = useState(true);
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["explorar-items"] });
      setShowItemModal(false);
      setShowHeroModal(false);
      setEditingItem(null);
      setEditingHero(null);
    },
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
    await Promise.all(catItems.map((item, idx) => base44.entities.ExplorarItem.update(item.id, { order: idx })));
    qc.invalidateQueries({ queryKey: ["explorar-items"] });
  };

  const heroItems = items.filter(i => i.is_hero).sort((a, b) => (a.hero_order ?? 0) - (b.hero_order ?? 0));

  return (
    <AdminLayout activePage="ExplorarAdmin">
      <div className="px-4 sm:px-8 lg:px-14 py-8 max-w-5xl mx-auto">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Editor Explorar</h1>
            <p className="text-sm text-white/30 mt-0.5">Gestiona hero y contenido de la plataforma</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/Explorar"
              className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white font-medium rounded-xl text-sm transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Ver Explorar
            </Link>
            <button
              onClick={() => { setEditingItem(null); setShowItemModal(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo item
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            SECCIÓN HERO CARRUSEL — completamente separada
        ═══════════════════════════════════════════ */}
        <div className="mb-10 rounded-2xl border border-yellow-500/20 bg-yellow-500/[0.03] overflow-hidden">
          {/* Hero section header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-yellow-500/10">
            <div className="flex items-center gap-2.5">
              <Star className="w-4 h-4 text-yellow-400" />
              <div>
                <h2 className="text-sm font-bold text-white">Carrusel Hero</h2>
                <p className="text-[10px] text-white/25">Banners principales con video loop · {heroItems.length} slides</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setEditingHero(null); setShowHeroModal(true); }}
                className="flex items-center gap-1.5 px-3 py-2 bg-yellow-500/15 hover:bg-yellow-500/25 text-yellow-400 font-bold rounded-lg text-xs transition-colors border border-yellow-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                Nuevo slide
              </button>
              <button onClick={() => setHeroExpanded(v => !v)} className="p-2 rounded-lg hover:bg-white/5 text-white/30 transition-colors">
                {heroExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Hero slides grid */}
          <AnimatePresence>
            {heroExpanded && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="p-5">
                  {heroItems.length === 0 ? (
                    <div className="py-10 text-center">
                      <Film className="w-8 h-8 text-yellow-500/20 mx-auto mb-2" />
                      <p className="text-xs text-white/20">Sin slides en el carrusel</p>
                      <p className="text-[10px] text-white/10 mt-1">Crea un nuevo slide o activa "Incluir en Hero" en un item existente</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {heroItems.map((item) => {
                        const artist = artists.find(a => a.id === item.artist_id);
                        const bgThumb = item.hero_media_type !== "video"
                          ? (item.hero_media_url || item.thumbnail_url || (item.youtube_url && `https://img.youtube.com/vi/${(item.youtube_url.match(/[?&]v=([a-zA-Z0-9_-]{11})/) || [])[1]}/hqdefault.jpg`))
                          : null;

                        return (
                          <div
                            key={item.id}
                            className="relative rounded-xl overflow-hidden border border-yellow-500/20 bg-white/[0.02] group cursor-pointer"
                            style={{ aspectRatio: "16/9" }}
                            onClick={() => { setEditingHero(item); setShowHeroModal(true); }}
                          >
                            {item.hero_media_type === "video" && item.hero_media_url ? (
                              <video src={item.hero_media_url} className="w-full h-full object-cover" muted loop playsInline />
                            ) : bgThumb ? (
                              <img src={bgThumb} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-white/[0.02]">
                                <ImageIcon className="w-6 h-6 text-white/10" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-2.5">
                              <p className="text-xs font-bold text-white truncate">{item.title}</p>
                              {artist && <p className="text-[10px] text-white/40 truncate">{artist.stageName}</p>}
                            </div>
                            <div className="absolute top-2 left-2 flex gap-1 items-center">
                              <span className="text-[9px] bg-yellow-500 text-black font-black px-1.5 py-0.5 rounded">#{(item.hero_order ?? 0) + 1}</span>
                              {item.hero_media_type === "video" && (
                                <span className="text-[9px] bg-purple-600 text-white font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                  <Film className="w-2.5 h-2.5" /> VIDEO
                                </span>
                              )}
                              {!item.is_active && <span className="text-[9px] bg-red-600/80 text-white font-bold px-1.5 py-0.5 rounded">OCULTO</span>}
                            </div>
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-yellow-400/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <div className="bg-black/60 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                                <Edit className="w-3.5 h-3.5 text-yellow-400" />
                                <span className="text-xs text-yellow-400 font-medium">Editar</span>
                              </div>
                            </div>
                            {/* Delete button */}
                            <button
                              onClick={e => { e.stopPropagation(); if (confirm("¿Eliminar este slide del hero?")) deleteMutation.mutate(item.id); }}
                              className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-red-600/80 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-white" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ═══════════════════════════════════════════
            FILAS DE CONTENIDO
        ═══════════════════════════════════════════ */}
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
                                onEdit={(i) => { setEditingItem(i); setShowItemModal(true); }}
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

      {/* Modal de item de fila */}
      <AnimatePresence>
        {showItemModal && (
          <ItemModal
            item={editingItem}
            artists={artists}
            onClose={() => { setShowItemModal(false); setEditingItem(null); }}
            onSave={saveMutation.mutate}
          />
        )}
      </AnimatePresence>

      {/* Modal de slide Hero */}
      <AnimatePresence>
        {showHeroModal && (
          <HeroSlideModal
            item={editingHero}
            artists={artists}
            onClose={() => { setShowHeroModal(false); setEditingHero(null); }}
            onSave={saveMutation.mutate}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}