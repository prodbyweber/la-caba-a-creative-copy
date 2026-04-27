import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Film, Upload, Star, Image as ImageIcon, Youtube, Music2, Link, Volume2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

function getYoutubeThumbnail(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (!match) return null;
  return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
}

const EMPTY_HERO = {
  title: "",
  subtitle: "",
  row_category: "trending",
  order: 0,
  hero_order: 0,
  hero_media_url: "",
  hero_media_type: "image",
  hero_audio_enabled: false,
  hero_link: "",
  hero_link_label: "Más info",
  youtube_url: "",
  youtube_music_url: "",
  thumbnail_url: "",
  artist_id: "",
  is_hero: true,
  is_active: true,
};

export default function HeroSlideModal({ item, artists, onClose, onSave }) {
  const [form, setForm] = useState(item ? { ...EMPTY_HERO, ...item, is_hero: true } : EMPTY_HERO);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleUploadMedia = async (file) => {
    if (!file) return;
    setUploadingMedia(true);
    const isVid = file.type.startsWith("video/");
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(f => ({ ...f, hero_media_url: file_url, hero_media_type: isVid ? "video" : "image" }));
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleUploadThumb = async (file) => {
    if (!file) return;
    setUploadingThumb(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      set("thumbnail_url", file_url);
    } finally {
      setUploadingThumb(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500/40 placeholder-white/20";
  const labelClass = "text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-1.5 block";

  const ytThumb = getYoutubeThumbnail(form.youtube_url || form.youtube_music_url);
  const previewThumb = form.thumbnail_url || ytThumb;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-lg flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-[#111113] border border-yellow-500/20 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <h2 className="text-base font-bold text-white">{item ? "Editar slide Hero" : "Nuevo slide Hero"}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* === SECCIÓN: MEDIA DE FONDO === */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-yellow-400/70 mb-3 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5" /> Media de Fondo (video loop o imagen)
            </p>

            {/* Preview */}
            {form.hero_media_url && (
              <div className="relative rounded-xl overflow-hidden mb-3" style={{ aspectRatio: "16/9" }}>
                {form.hero_media_type === "video" ? (
                  <video src={form.hero_media_url} className="w-full h-full object-cover" muted autoPlay loop playsInline />
                ) : (
                  <img src={form.hero_media_url} alt="" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                  <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider ${form.hero_media_type === "video" ? "bg-purple-500 text-white" : "bg-blue-500 text-white"}`}>
                    {form.hero_media_type === "video" ? "🎬 Video Loop" : "🖼 Imagen"}
                  </span>
                </div>
                <button
                  onClick={() => setForm(f => ({ ...f, hero_media_url: "", hero_media_type: "image" }))}
                  className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-lg text-white hover:bg-black/90"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <input
                value={form.hero_media_url}
                onChange={e => set("hero_media_url", e.target.value)}
                className={inputClass}
                placeholder="https://... (imagen o video MP4/WebM)"
              />
              <label className="flex-shrink-0 px-3 py-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg cursor-pointer hover:bg-yellow-500/20 transition-colors flex items-center gap-1.5 text-yellow-400 text-xs font-medium">
                <input type="file" accept="image/*,video/mp4,video/webm" className="hidden" onChange={e => e.target.files?.[0] && handleUploadMedia(e.target.files[0])} />
                <Upload className="w-3.5 h-3.5" />
                {uploadingMedia ? "Subiendo..." : "Subir"}
              </label>
            </div>
            <p className="text-[10px] text-white/20 mt-1">El video se reproducirá en loop. Acepta .mp4, .webm, .jpg, .png, .webp</p>
          </div>

          {/* Audio toggle — solo visible si es video */}
          {form.hero_media_type === "video" && form.hero_media_url && (
            <div className="flex items-center justify-between p-3 rounded-xl border border-white/[0.07] bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-white/40" />
                <div>
                  <p className="text-xs font-semibold text-white/70">Activar audio del video</p>
                  <p className="text-[10px] text-white/25">El visitante verá un botón de bocina para activar/silenciar</p>
                </div>
              </div>
              <div
                onClick={() => set("hero_audio_enabled", !form.hero_audio_enabled)}
                className={`w-9 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0 ${form.hero_audio_enabled ? "bg-emerald-500" : "bg-white/10"}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full mt-0.5 shadow transition-transform ${form.hero_audio_enabled ? "translate-x-4" : "translate-x-0.5"}`} />
              </div>
            </div>
          )}

          {/* === SECCIÓN: INFORMACIÓN === */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>Título *</label>
              <input value={form.title} onChange={e => set("title", e.target.value)} className={inputClass} placeholder="Título del slide" />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Subtítulo / Género</label>
              <input value={form.subtitle} onChange={e => set("subtitle", e.target.value)} className={inputClass} placeholder="Urban, Afrobeats, Film..." />
            </div>
            <div>
              <label className={labelClass}>Orden en carrusel</label>
              <input type="number" value={form.hero_order ?? 0} onChange={e => set("hero_order", parseInt(e.target.value) || 0)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Artista vinculado</label>
              <select value={form.artist_id} onChange={e => set("artist_id", e.target.value)} className={inputClass}>
                <option value="" className="bg-[#111]">Sin artista</option>
                {artists.map(a => <option key={a.id} value={a.id} className="bg-[#111]">{a.stageName}</option>)}
              </select>
            </div>
          </div>

          {/* === SECCIÓN: BOTÓN REPRODUCIR (YouTube) === */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">Botón Reproducir</p>
            <div>
              <label className={labelClass}><Youtube className="w-3 h-3 inline mr-1 text-red-400" />URL de YouTube (muestra botón ▶)</label>
              <input value={form.youtube_url} onChange={e => set("youtube_url", e.target.value)} className={inputClass} placeholder="https://www.youtube.com/watch?v=..." />
            </div>
            <div className="mt-3">
              <label className={labelClass}><Music2 className="w-3 h-3 inline mr-1 text-green-400" />URL YouTube Music (alternativa)</label>
              <input value={form.youtube_music_url} onChange={e => set("youtube_music_url", e.target.value)} className={inputClass} placeholder="https://music.youtube.com/watch?v=..." />
            </div>
          </div>

          {/* === SECCIÓN: BOTÓN "MÁS INFO" / LINK === */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3 flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5" /> Botón de Acción / Redirect
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Texto del botón</label>
                <input value={form.hero_link_label} onChange={e => set("hero_link_label", e.target.value)} className={inputClass} placeholder="Más info" />
              </div>
              <div>
                <label className={labelClass}>URL / Ruta de destino</label>
                <input value={form.hero_link} onChange={e => set("hero_link", e.target.value)} className={inputClass} placeholder="/Explorar o https://..." />
              </div>
            </div>
            <p className="text-[10px] text-white/20 mt-1">Puede ser una ruta interna (/ArtistDashboard?id=...) o URL externa</p>
          </div>

          {/* === SECCIÓN: MINIATURA (para lista admin) === */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" /> Miniatura (preview en admin)
            </p>
            <div className="flex gap-2 items-center">
              {previewThumb && <img src={previewThumb} alt="" className="w-16 h-10 rounded-lg object-cover border border-white/10 flex-shrink-0" />}
              <input value={form.thumbnail_url} onChange={e => set("thumbnail_url", e.target.value)} className={inputClass} placeholder="URL miniatura (opcional)" />
              <label className="flex-shrink-0 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors flex items-center gap-1 text-white/40 text-xs">
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUploadThumb(e.target.files[0])} />
                <Upload className="w-3.5 h-3.5" />
                {uploadingThumb ? "..." : "Subir"}
              </label>
            </div>
          </div>

          {/* Visible toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <div onClick={() => set("is_active", !form.is_active)} className={`w-9 h-5 rounded-full transition-colors cursor-pointer ${form.is_active ? "bg-emerald-500" : "bg-white/10"}`}>
              <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform shadow ${form.is_active ? "translate-x-4" : "translate-x-0.5"}`} />
            </div>
            <span className="text-xs text-white/50">Visible en plataforma</span>
          </label>

          <button
            onClick={() => onSave(form)}
            disabled={!form.title}
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-40"
          >
            <Save className="w-4 h-4" />
            Guardar slide
          </button>
        </div>
      </motion.div>
    </div>
  );
}