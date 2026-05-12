import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { X, Save, Loader, Upload, Image as ImageIcon, Youtube, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

function getYoutubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function EditClipModal({ clip, onClose, onUpdate }) {
  const [saving, setSaving] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [title, setTitle] = useState(clip.title || "");
  const [youtubeUrl, setYoutubeUrl] = useState(clip.file_url || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(clip.thumbnail_url || "");
  const fileInputRef = useRef(null);

  const ytId = getYoutubeId(youtubeUrl);
  const ytThumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;
  const previewThumb = thumbnailUrl || ytThumb;

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingThumbnail(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setThumbnailUrl(file_url);
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) { alert("El título es obligatorio"); return; }
    setSaving(true);
    try {
      await base44.entities.Clip.update(clip.id, {
        title: title.trim(),
        file_url: youtubeUrl,
        thumbnail_url: thumbnailUrl || ytThumb || clip.thumbnail_url || "",
      });
      onUpdate();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#111113] rounded-2xl border border-white/10 w-full max-w-sm overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Editar Short</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
            <X className="w-4 h-4 text-white/50" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Título */}
          <div>
            <label className="block text-[10px] font-semibold text-white/35 uppercase tracking-widest mb-1.5">Título *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Título del short"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-colors"
            />
          </div>

          {/* Enlace YouTube */}
          <div>
            <label className="block text-[10px] font-semibold text-white/35 uppercase tracking-widest mb-1.5">Enlace de YouTube</label>
            <div className="relative">
              <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400/60" />
              <input
                type="text"
                value={youtubeUrl}
                onChange={e => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-red-500/40 transition-colors"
              />
            </div>
            {ytId && (
              <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                <Check className="w-3 h-3" /> Video detectado
              </p>
            )}
          </div>

          {/* Portada */}
          <div>
            <label className="block text-[10px] font-semibold text-white/35 uppercase tracking-widest mb-1.5">Portada</label>
            {previewThumb && (
              <div className="relative mb-2 rounded-xl overflow-hidden bg-black mx-auto" style={{ aspectRatio: "9/16", maxWidth: 120 }}>
                <img src={previewThumb} alt="Portada" className="w-full h-full object-cover" />
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingThumbnail}
              className="w-full py-2.5 rounded-xl border border-dashed border-white/10 hover:border-white/25 transition-all flex items-center justify-center gap-2 text-xs text-white/40 disabled:opacity-50"
            >
              {uploadingThumbnail ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {uploadingThumbnail ? "Subiendo..." : "Cambiar portada"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/5 flex gap-2">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-white/50 hover:bg-white/5 transition-all disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="flex-1 py-2.5 rounded-xl bg-white text-black text-sm font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}