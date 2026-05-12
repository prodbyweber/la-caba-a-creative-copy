import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Save, Loader, Youtube, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

function getYoutubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function EditClipModal({ clip, onClose, onUpdate }) {
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(clip.title || "");
  const [youtubeUrl, setYoutubeUrl] = useState(clip.file_url || "");

  const ytId = getYoutubeId(youtubeUrl);
  const ytThumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;

  const handleSave = async () => {
    if (!title.trim()) { alert("El título es obligatorio"); return; }
    setSaving(true);
    try {
      await base44.entities.Clip.update(clip.id, {
        title: title.trim(),
        file_url: youtubeUrl,
        thumbnail_url: ytThumb || clip.thumbnail_url || "",
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
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Editar Short</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
            <X className="w-4 h-4 text-white/50" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Preview miniatura YouTube */}
          {ytThumb && (
            <div className="rounded-xl overflow-hidden bg-black mx-auto" style={{ aspectRatio: "16/9" }}>
              <img src={ytThumb} alt="Portada" className="w-full h-full object-cover" />
            </div>
          )}

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
            {saving ? <Loader className="w-4 h-4 animate-spin text-black" /> : <Save className="w-4 h-4" />}
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}