import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { X, Upload, Music2, FolderOpen, Plus, Trash2, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GENRES, MOODS, KEYS, BEAT_STATUS, LICENSE_TYPES } from "@/lib/musicConstants";

export default function BeatFormModal({ beat, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState(beat ? { ...beat } : {
    title: "", producer: "", slug: "", cover_url: "", preview_mp3_url: "", free_mp3_url: "",
    drive_folder_url: "", bpm: null, key: "", scale: "", genres: [], moods: [],
    description: "", tags: [], status: "Borrador", featured: false, licenses: [],
    checkout_type: "internal", buy_link: "",
  });

  // Generar slug válido automáticamente desde el título
  const slugify = (str) => (str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const ensureSlug = () => {
    if (form.title) setForm(f => ({ ...f, slug: slugify(f.title) }));
  };
  const [uploading, setUploading] = useState(null);
  const coverRef = useRef(null);
  const previewRef = useRef(null);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (beat?.id) return base44.entities.Beat.update(beat.id, data);
      return base44.entities.Beat.create(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["beats-admin"] });
      qc.invalidateQueries({ queryKey: ["beats-public"] });
      onClose();
    },
  });

  const handleUpload = async (file, field) => {
    if (!file) return;
    setUploading(field);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(f => ({ ...f, [field]: file_url }));
    } finally {
      setUploading(null);
    }
  };

  // MP3 único: el mismo archivo con tag sirve para preview y descarga.
  const handleUploadMp3 = async (file) => {
    if (!file) return;
    setUploading("mp3");
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(f => ({ ...f, preview_mp3_url: file_url, free_mp3_url: file_url }));
    } finally {
      setUploading(null);
    }
  };

  const toggleGenre = (g) => {
    setForm(f => ({ ...f, genres: f.genres.includes(g) ? f.genres.filter(x => x !== g) : [...f.genres, g] }));
  };
  const toggleMood = (m) => {
    setForm(f => ({ ...f, moods: f.moods.includes(m) ? f.moods.filter(x => x !== m) : [...f.moods, m] }));
  };
  // Etiquetas como chips (mismos géneros disponibles)
  const toggleTag = (g) => {
    setForm(f => ({ ...f, tags: (f.tags || []).includes(g) ? f.tags.filter(x => x !== g) : [...(f.tags || []), g] }));
  };

  // License management
  const addLicense = () => {
    setForm(f => ({ ...f, licenses: [...(f.licenses || []), { type: "mp3_free", price: 0, description: "", files_included: "", drive_folder_url: "", download_url: "" }] }));
  };
  const updateLicense = (idx, field, value) => {
    setForm(f => {
      const licenses = [...(f.licenses || [])];
      licenses[idx] = { ...licenses[idx], [field]: value };
      return { ...f, licenses };
    });
  };
  const removeLicense = (idx) => {
    setForm(f => ({ ...f, licenses: (f.licenses || []).filter((_, i) => i !== idx) }));
  };

  const handleSubmit = () => {
    const data = { ...form };
    if (data.preview_mp3_url) data.free_mp3_url = data.preview_mp3_url;
    saveMutation.mutate(data);
  };

  const iCls = "w-full px-3 py-2.5 rounded-xl text-sm text-white bg-white/[0.05] border border-white/[0.08] focus:outline-none focus:border-white/20 transition-colors placeholder-white/20";
  const labelCls = "block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1.5";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[160] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-2xl rounded-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
        style={{ background: "#141416", border: "1px solid rgba(255,255,255,0.08)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-white/5"
          style={{ background: "#141416" }}
        >
          <h2 className="text-lg font-black text-white tracking-tight">{beat ? "Editar Beat" : "Crear Beat"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-white/50" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Cover upload */}
          <div>
            <label className={labelCls}>Portada</label>
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0" style={{ background: "#1a1a1c", border: "1px solid rgba(255,255,255,0.08)" }}>
                {form.cover_url ? (
                  <img src={form.cover_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Music2 className="w-6 h-6 text-white/20" />
                )}
              </div>
              <label className="flex-1 cursor-pointer">
                <input type="file" accept="image/*" className="hidden" ref={coverRef}
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], "cover_url")} />
                <div className={`${iCls} flex items-center justify-center gap-2 hover:bg-white/[0.08] cursor-pointer`}>
                  <Upload className="w-3.5 h-3.5 text-white/40" />
                  {uploading === "cover_url" ? "Subiendo..." : form.cover_url ? "Cambiar portada" : "Subir portada"}
                </div>
              </label>
            </div>
          </div>

          {/* Title + Producer */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Título</label>
              <input value={form.title || ""} onChange={(e) => {
                const title = e.target.value;
                setForm(f => ({ ...f, title, slug: f.slug && f.slug !== slugify(f.title) ? f.slug : slugify(title) }));
              }} className={iCls} placeholder="Título del beat" />
            </div>
            <div>
              <label className={labelCls}>Productor</label>
              <input value={form.producer || ""} onChange={(e) => setForm(f => ({ ...f, producer: e.target.value }))} className={iCls} placeholder="Nombre del productor" />
            </div>
          </div>

          {/* Slug (URL pública) */}
          <div>
            <label className={labelCls}>Slug (URL pública)</label>
            <div className="flex gap-2">
              <input value={form.slug || ""} onBlur={ensureSlug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} className={iCls} placeholder="auto desde título" />
              <button type="button" onClick={ensureSlug} className="px-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white text-xs font-semibold transition-colors">Generar</button>
            </div>
          </div>

          {/* BPM + Key + Scale */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>BPM</label>
              <input type="number" value={form.bpm || ""} onChange={(e) => setForm(f => ({ ...f, bpm: e.target.value ? parseInt(e.target.value) : null }))} className={iCls} placeholder="140" />
            </div>
            <div>
              <label className={labelCls}>Tonalidad</label>
              <select value={form.key || ""} onChange={(e) => setForm(f => ({ ...f, key: e.target.value }))} className={iCls}>
                <option value="">—</option>
                {KEYS.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Escala</label>
              <select value={form.scale || ""} onChange={(e) => setForm(f => ({ ...f, scale: e.target.value }))} className={iCls}>
                <option value="">—</option>
                <option value="Mayor">Mayor</option>
                <option value="Menor">Menor</option>
              </select>
            </div>
          </div>

          {/* MP3 único — preview y descarga (mismo archivo con tag) */}
          <div>
            <label className={labelCls}>MP3 (Preview y descarga)</label>
            <label className="cursor-pointer">
              <input type="file" accept="audio/*" className="hidden" ref={previewRef}
                onChange={(e) => e.target.files?.[0] && handleUploadMp3(e.target.files[0])} />
              <div className={`${iCls} flex items-center gap-2 hover:bg-white/[0.08] cursor-pointer`}>
                <Music2 className="w-3.5 h-3.5 text-white/40" />
                {uploading === "mp3" ? "Subiendo..." : form.preview_mp3_url ? "Archivo subido — Cambiar" : "Subir MP3 (con tag)"}
              </div>
            </label>
            <p className="text-[10px] text-white/35 mt-1.5 leading-relaxed">
              Un único archivo MP3 con tag sirve para la previsualización y la descarga gratuita. Al descargar, el usuario acepta los términos de uso: el beat se entrega con tag y es para uso personal / no comercial salvo licencia adquirida.
            </p>
          </div>

          {/* Drive folder */}
          <div>
            <label className={labelCls}>Carpeta Drive</label>
            <div className="relative">
              <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input value={form.drive_folder_url || ""} onChange={(e) => setForm(f => ({ ...f, drive_folder_url: e.target.value }))} className={iCls + " pl-9"} placeholder="https://drive.google.com/..." />
            </div>
          </div>

          {/* Compra del beat (buy link + checkout type) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Tipo de checkout</label>
              <select value={form.checkout_type || "internal"} onChange={(e) => setForm(f => ({ ...f, checkout_type: e.target.value }))} className={iCls}>
                <option value="internal">Interno (licencias)</option>
                <option value="stripe">Stripe</option>
                <option value="shopify">Shopify</option>
                <option value="lemonsqueezy">Lemon Squeezy</option>
                <option value="gumroad">Gumroad</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Link de compra</label>
              <input value={form.buy_link || ""} onChange={(e) => setForm(f => ({ ...f, buy_link: e.target.value }))} className={iCls} placeholder="https://..." />
            </div>
          </div>

          {/* Genres */}
          <div>
            <label className={labelCls}>Géneros</label>
            <div className="flex flex-wrap gap-1.5">
              {GENRES.map(g => {
                const active = (form.genres || []).includes(g);
                return (
                  <button key={g} type="button" onClick={() => toggleGenre(g)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${active ? "bg-[#ff5833] text-white" : "bg-white/5 text-white/40 hover:bg-white/10 border border-white/10"}`}
                  >{g}</button>
                );
              })}
            </div>
          </div>

          {/* Moods */}
          <div>
            <label className={labelCls}>Mood</label>
            <div className="flex flex-wrap gap-1.5">
              {MOODS.map(m => {
                const active = (form.moods || []).includes(m);
                return (
                  <button key={m} type="button" onClick={() => toggleMood(m)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${active ? "bg-[#ff5833] text-white" : "bg-white/5 text-white/40 hover:bg-white/10 border border-white/10"}`}
                  >{m}</button>
                );
              })}
            </div>
          </div>

          {/* Tags — chips (mismos que géneros) */}
          <div>
            <label className={labelCls}>Etiquetas</label>
            <div className="flex flex-wrap gap-1.5">
              {GENRES.map(g => {
                const active = (form.tags || []).includes(g);
                return (
                  <button key={g} type="button" onClick={() => toggleTag(g)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${active ? "bg-[#ff5833] text-white" : "bg-white/5 text-white/40 hover:bg-white/10 border border-white/10"}`}
                  >{g}</button>
                );
              })}
            </div>
          </div>

          {/* Status + Featured */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Estado</label>
              <select value={form.status || "Borrador"} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))} className={iCls}>
                {BEAT_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Destacado</label>
              <button type="button" onClick={() => setForm(f => ({ ...f, featured: !f.featured }))}
                className={`${iCls} flex items-center justify-center gap-2 ${form.featured ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : ""}`}
              >
                {form.featured && <Check className="w-3.5 h-3.5" />}
                {form.featured ? "Destacado" : "No destacado"}
              </button>
            </div>
          </div>

          {/* Licenses */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelCls}>Licencias</label>
              <button type="button" onClick={addLicense} className="flex items-center gap-1 text-xs font-semibold text-[#ff8866] hover:text-white transition-colors">
                <Plus className="w-3 h-3" /> Añadir licencia
              </button>
            </div>
            <div className="space-y-2">
              {(form.licenses || []).map((license, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-white/8 bg-white/[0.02] space-y-2">
                  <div className="flex items-center justify-between">
                    <select value={license.type} onChange={(e) => updateLicense(idx, "type", e.target.value)} className="px-2 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white focus:outline-none flex-1 mr-2">
                      {LICENSE_TYPES.map(lt => <option key={lt.id} value={lt.id}>{lt.label}</option>)}
                    </select>
                    <button type="button" onClick={() => removeLicense(idx)} className="w-7 h-7 rounded-full hover:bg-red-500/10 flex items-center justify-center text-white/40 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" value={license.price || 0} onChange={(e) => updateLicense(idx, "price", parseFloat(e.target.value) || 0)} className="px-2 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white focus:outline-none" placeholder="Precio €" />
                    <input value={license.files_included || ""} onChange={(e) => updateLicense(idx, "files_included", e.target.value)} className="px-2 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white focus:outline-none" placeholder="Archivos incluidos" />
                  </div>
                  <textarea value={license.description || ""} onChange={(e) => updateLicense(idx, "description", e.target.value)} rows={2} className="w-full px-2 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white focus:outline-none resize-none" placeholder="Descripción de la licencia" />
                  <div className="grid grid-cols-2 gap-2">
                    <input value={license.download_url || ""} onChange={(e) => updateLicense(idx, "download_url", e.target.value)} className="px-2 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white focus:outline-none" placeholder="URL descarga" />
                    <input value={license.drive_folder_url || ""} onChange={(e) => updateLicense(idx, "drive_folder_url", e.target.value)} className="px-2 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white focus:outline-none" placeholder="URL Drive" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 sticky bottom-0 -mx-5 px-5 py-3 border-t border-white/5" style={{ background: "#141416" }}>
            <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 text-sm font-semibold transition-colors">Cancelar</button>
            <button onClick={handleSubmit} disabled={saveMutation.isPending || !form.title}
              className="flex-1 py-3 rounded-xl text-white text-sm font-bold transition-colors disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #ff5833, #e0451f)" }}
            >
              {saveMutation.isPending ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}