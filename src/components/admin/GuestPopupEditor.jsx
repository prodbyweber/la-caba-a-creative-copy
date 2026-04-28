import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { X, Save } from "lucide-react";

const inputCls = "w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-lg text-white placeholder-white/25 focus:outline-none focus:border-white/30 text-sm";
const labelCls = "block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-1.5";

export default function GuestPopupEditor({ isOpen, onClose }) {
  const qc = useQueryClient();
  const [formData, setFormData] = useState({
    guest_popup_title: "",
    guest_popup_subtitle: "",
    guest_popup_cta_primary: "",
    guest_popup_cta_secondary: "",
    guest_popup_locked_badge: "",
    guest_popup_color_primary: "#ff5833",
    guest_popup_color_secondary: "#ffffff",
  });

  const { data: config } = useQuery({
    queryKey: ['landingConfig'],
    queryFn: async () => {
      const configs = await base44.entities.LandingConfig.list();
      return configs.length > 0 ? configs[0] : null;
    },
  });

  useEffect(() => {
    if (config) {
      setFormData({
        guest_popup_title: config.guest_popup_title || "Accede al universo\nCabaña Creative",
        guest_popup_subtitle: config.guest_popup_subtitle || "Descubre, conecta y crea dentro de una red privada de artistas, creadores y marcas",
        guest_popup_cta_primary: config.guest_popup_cta_primary || "Empieza gratis — 14 días",
        guest_popup_cta_secondary: config.guest_popup_cta_secondary || "Iniciar sesión",
        guest_popup_locked_badge: config.guest_popup_locked_badge || "Contenido exclusivo",
        guest_popup_color_primary: config.guest_popup_color_primary || "#ff5833",
        guest_popup_color_secondary: config.guest_popup_color_secondary || "#ffffff",
      });
    }
  }, [config]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.LandingConfig.update(config.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['landingConfig'] });
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (!isOpen || !config) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#111113] border border-white/[0.08] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-white/[0.06] bg-[#111113]/95 backdrop-blur-sm">
          <h2 className="text-lg font-bold text-white">Editar Popup de Invitados</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white/50" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Texto principal */}
          <div>
            <label className={labelCls}>Título principal</label>
            <textarea
              value={formData.guest_popup_title}
              onChange={(e) => setFormData({ ...formData, guest_popup_title: e.target.value })}
              className={inputCls}
              rows="3"
              placeholder="Accede al universo\nCabaña Creative"
            />
            <p className="text-[10px] text-white/25 mt-1">Usa \n para saltos de línea</p>
          </div>

          {/* Subtítulo */}
          <div>
            <label className={labelCls}>Subtítulo</label>
            <textarea
              value={formData.guest_popup_subtitle}
              onChange={(e) => setFormData({ ...formData, guest_popup_subtitle: e.target.value })}
              className={inputCls}
              rows="2"
            />
          </div>

          {/* Botones CTA */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Botón primario</label>
              <input
                type="text"
                value={formData.guest_popup_cta_primary}
                onChange={(e) => setFormData({ ...formData, guest_popup_cta_primary: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Botón secundario</label>
              <input
                type="text"
                value={formData.guest_popup_cta_secondary}
                onChange={(e) => setFormData({ ...formData, guest_popup_cta_secondary: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>

          {/* Badge */}
          <div>
            <label className={labelCls}>Badge de contenido exclusivo</label>
            <input
              type="text"
              value={formData.guest_popup_locked_badge}
              onChange={(e) => setFormData({ ...formData, guest_popup_locked_badge: e.target.value })}
              className={inputCls}
            />
          </div>

          {/* Colores */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Color primario (naranja)</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.guest_popup_color_primary}
                  onChange={(e) => setFormData({ ...formData, guest_popup_color_primary: e.target.value })}
                  className="w-12 h-12 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.guest_popup_color_primary}
                  onChange={(e) => setFormData({ ...formData, guest_popup_color_primary: e.target.value })}
                  className={`flex-1 ${inputCls}`}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Color secundario (botón)</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.guest_popup_color_secondary}
                  onChange={(e) => setFormData({ ...formData, guest_popup_color_secondary: e.target.value })}
                  className="w-12 h-12 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.guest_popup_color_secondary}
                  onChange={(e) => setFormData({ ...formData, guest_popup_color_secondary: e.target.value })}
                  className={`flex-1 ${inputCls}`}
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
            <p className="text-xs font-semibold text-white/40 mb-3">Vista previa</p>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-white/50 text-xs mb-1">Título:</p>
                <p className="text-white whitespace-pre-line">{formData.guest_popup_title}</p>
              </div>
              <div>
                <p className="text-white/50 text-xs mb-1">Subtítulo:</p>
                <p className="text-white/70">{formData.guest_popup_subtitle}</p>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  className="px-6 py-2 rounded-lg font-bold text-xs"
                  style={{ background: formData.guest_popup_color_secondary, color: formData.guest_popup_color_secondary === "#ffffff" ? "#000" : "#fff" }}
                >
                  {formData.guest_popup_cta_primary}
                </button>
                <button
                  type="button"
                  className="px-6 py-2 rounded-lg font-bold text-xs underline underline-offset-2 text-white/50"
                >
                  {formData.guest_popup_cta_secondary}
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg bg-white/[0.05] text-white/60 hover:bg-white/[0.08] transition-all text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 px-4 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {updateMutation.isPending ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}