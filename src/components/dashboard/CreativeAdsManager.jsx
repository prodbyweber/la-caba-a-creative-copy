import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, X, Play, Trash2, Eye, BarChart3, Plus, Loader2 } from "lucide-react";

export default function CreativeAdsManager({ userProfileId }) {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    frequency: "moderate",
    is_active: true
  });

  const qc = useQueryClient();

  const { data: ads = [] } = useQuery({
    queryKey: ["creative-ads", userProfileId],
    queryFn: () => base44.entities.BrandCampaign.filter({ user_profile_id: userProfileId, type: "internal" }),
    enabled: !!userProfileId,
  });

  const createAdMutation = useMutation({
    mutationFn: (data) => base44.entities.BrandCampaign.create({
      ...data,
      user_profile_id: userProfileId,
      type: "internal",
      impressions: 0,
      clicks: 0
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["creative-ads", userProfileId] });
      setShowUploadForm(false);
      setFormData({ title: "", description: "", image_url: "", frequency: "moderate", is_active: true });
    },
  });

  const deleteAdMutation = useMutation({
    mutationFn: (id) => base44.entities.BrandCampaign.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["creative-ads", userProfileId] }),
  });

  const handleFileUpload = async (file) => {
    if (!file) return;
    const maxSize = 7 * 1024 * 1024; // 7MB
    if (file.size > maxSize) {
      alert("El archivo supera 7MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Solo se permiten imágenes");
      return;
    }

    setUploadingFile(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(f => ({ ...f, image_url: file_url }));
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.image_url) {
      alert("Completa título e imagen");
      return;
    }
    createAdMutation.mutate(formData);
  };

  const frequencyLabels = { rare: "Raro", moderate: "Moderado", frequent: "Frecuente" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Creative Ads</h3>
          <p className="text-xs text-white/40 mt-0.5">Gestiona anuncios promocionales para tu marca</p>
        </div>
        <button
          onClick={() => setShowUploadForm(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Nuevo Ad
        </button>
      </div>

      {/* Upload Form */}
      <AnimatePresence>
        {showUploadForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5"
          >
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-2">Imagen (máx 7MB)</label>
                <label className="flex flex-col items-center justify-center gap-2 py-6 rounded-lg border-2 border-dashed border-emerald-500/30 cursor-pointer hover:border-emerald-500/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    disabled={uploadingFile}
                  />
                  {uploadingFile ? (
                    <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-emerald-400/50" />
                      <span className="text-xs text-emerald-400/70">{formData.image_url ? "Cambiar" : "Subir imagen"}</span>
                    </>
                  )}
                </label>
                {formData.image_url && (
                  <div className="mt-2 rounded-lg overflow-hidden w-32 h-32">
                    <img src={formData.image_url} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5">Título</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
                  placeholder="Ej: New Collection"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/25 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5">Descripción (opcional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                  placeholder="Breve descripción"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/25 focus:outline-none focus:border-emerald-500/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5">Frecuencia</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData(f => ({ ...f, frequency: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500/50"
                >
                  {Object.entries(frequencyLabels).map(([key, label]) => (
                    <option key={key} value={key} className="bg-[#111]">{label}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowUploadForm(false)}
                  className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={createAdMutation.isPending}
                  className="flex-1 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {createAdMutation.isPending ? "Creando..." : "Crear Ad"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ads Grid */}
      {ads.length === 0 ? (
        <div className="text-center py-12 p-6 rounded-xl border border-white/[0.06] bg-white/[0.03]">
          <Eye className="w-12 h-12 text-emerald-500/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">Sin Creative Ads aún</p>
          <p className="text-white/20 text-xs mt-1">Crea anuncios promocionales para mostrar a tus usuarios</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {ads.map((ad, i) => (
            <motion.div
              key={ad.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative rounded-xl overflow-hidden border border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40 transition-all group"
            >
              {ad.image_url && (
                <div className="relative w-full h-32 overflow-hidden">
                  <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}

              <div className="p-3 space-y-2">
                <h4 className="font-semibold text-white text-sm">{ad.title}</h4>
                {ad.description && (
                  <p className="text-xs text-white/50 line-clamp-2">{ad.description}</p>
                )}

                <div className="flex gap-3 pt-2 text-[10px] text-white/30">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {ad.impressions || 0}
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    {ad.clicks || 0}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {frequencyLabels[ad.popup_frequency] || "Moderado"}
                  </span>
                  {!ad.is_active && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-white/50">Inactivo</span>
                  )}
                </div>

                <button
                  onClick={() => deleteAdMutation.mutate(ad.id)}
                  className="w-full mt-2 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 text-xs font-semibold transition-all flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Eliminar
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}