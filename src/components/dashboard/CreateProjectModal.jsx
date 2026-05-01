import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Image as ImageIcon, Loader2, Check } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const PROJECT_TYPES = ["Single", "EP", "Album", "ContentPack", "MixMaster"];
const TYPE_LABELS = {
  Single: "Single",
  EP: "EP",
  Album: "Álbum",
  ContentPack: "Content Pack",
  MixMaster: "Mix & Master",
};

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 20 }, (_, i) => currentYear + 2 - i);

const fieldClass = "w-full bg-transparent border-b border-white/[0.1] py-3 text-white text-sm focus:outline-none focus:border-white/40 transition-colors placeholder-white/20";
const labelClass = "block text-[10px] font-semibold text-white/30 uppercase tracking-[0.18em] mb-1";

export default function CreateProjectModal({ isOpen, onClose, jlyArtistId, project = null }) {
  const [formData, setFormData] = useState({
    title: "",
    type: "Single",
    year: currentYear,
    cover_url: "",
  });

  const [uploading, setUploading] = useState(false);
  const [coverPreview, setCoverPreview] = useState("");

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || "",
        type: project.type || "Single",
        year: project.year || currentYear,
        cover_url: project.cover_url || "",
      });
      setCoverPreview(project.cover_url || "");
    } else {
      setFormData({ title: "", type: "Single", year: currentYear, cover_url: "" });
      setCoverPreview("");
    }
  }, [project, isOpen]);

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => project
      ? base44.entities.Project.update(project.id, data)
      : base44.entities.Project.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["all-tracks"] });
      onClose();
    },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(f => ({ ...f, cover_url: file_url }));
      setCoverPreview(file_url);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    createMutation.mutate({
      ...formData,
      artist_id: jlyArtistId || undefined,
      year: Number(formData.year),
      status: "Draft",
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Panel */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col"
          style={{
            background: "#0e0e0f",
            border: "1px solid rgba(255,255,255,0.06)",
            maxHeight: "92svh",
          }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 pt-6 pb-5 flex-shrink-0">
            <p
              className="text-base font-black text-white leading-none"
              style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", letterSpacing: "-0.03em" }}
            >
              {project ? "Editar proyecto" : "Nuevo proyecto"}
            </p>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white/50" />
            </button>
          </div>

          {/* Scrollable form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 pb-8 space-y-7" style={{ scrollbarWidth: "none" }}>

            {/* Cover */}
            <div>
              <label className={labelClass}>Portada</label>
              <label className="block cursor-pointer group">
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                <div
                  className="relative w-full rounded-2xl overflow-hidden flex items-center justify-center transition-all"
                  style={{ aspectRatio: "1/1", maxHeight: 200, background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.1)" }}
                >
                  {coverPreview ? (
                    <img src={coverPreview} alt="Portada" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-8">
                      {uploading
                        ? <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
                        : <ImageIcon className="w-6 h-6 text-white/15 group-hover:text-white/30 transition-colors" />
                      }
                      <span className="text-[11px] text-white/20 group-hover:text-white/35 transition-colors">
                        {uploading ? "Subiendo..." : "Toca para añadir portada"}
                      </span>
                    </div>
                  )}
                  {coverPreview && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              </label>
            </div>

            {/* Título */}
            <div>
              <label className={labelClass}>Título *</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                placeholder="Nombre del proyecto"
                className={fieldClass}
                required
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
              />
            </div>

            {/* Tipo — pills */}
            <div>
              <label className={labelClass}>Tipo</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {PROJECT_TYPES.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData(f => ({ ...f, type: t }))}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={{
                      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                      letterSpacing: "0.04em",
                      background: formData.type === t ? "white" : "rgba(255,255,255,0.05)",
                      color: formData.type === t ? "black" : "rgba(255,255,255,0.4)",
                      border: formData.type === t ? "1px solid white" : "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            {/* Año */}
            <div>
              <label className={labelClass}>Año</label>
              <select
                value={formData.year}
                onChange={e => setFormData(f => ({ ...f, year: e.target.value }))}
                className={fieldClass + " bg-transparent appearance-none cursor-pointer"}
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
              >
                {YEARS.map(y => (
                  <option key={y} value={y} className="bg-[#0e0e0f]">{y}</option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={createMutation.isPending || uploading || !formData.title.trim()}
              className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all disabled:opacity-30 flex items-center justify-center gap-2"
              style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                letterSpacing: "-0.01em",
                background: "white",
                color: "black",
              }}
            >
              {createMutation.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" /> {project ? "Guardando..." : "Creando..."}</>
                : <><Check className="w-4 h-4" /> {project ? "Guardar cambios" : "Crear proyecto"}</>
              }
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}