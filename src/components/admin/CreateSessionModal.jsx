import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, MapPin, User, FolderOpen } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const inputCls = "w-full px-3 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-white/30 focus:bg-white/[0.07] transition-all text-sm";
const labelCls = "block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-1.5";

export default function CreateSessionModal({ isOpen, onClose, editData = null }) {
  const queryClient = useQueryClient();
  const { data: artists = [] } = useQuery({ queryKey: ['artists'], queryFn: () => base44.entities.Artist.list() });
  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: () => base44.entities.Project.list() });

  const defaultForm = { type: "Session", title: "", artist_id: "", project_id: "", start_time: "", end_time: "", location: "Studio", description: "", status: "Pending" };
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    if (editData) {
      setFormData({
        type: editData.type || "Session",
        title: editData.title || "",
        artist_id: editData.artist_id || "",
        project_id: editData.project_id || "",
        start_time: editData.start_time ? editData.start_time.slice(0, 16) : "",
        end_time: editData.end_time ? editData.end_time.slice(0, 16) : "",
        location: editData.location || "Studio",
        description: editData.description || "",
        status: editData.status || "Pending"
      });
    } else {
      setFormData(defaultForm);
    }
  }, [editData, isOpen]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Session.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sessions'] }); onClose(); }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Session.update(editData.id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sessions'] }); onClose(); }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    editData ? updateMutation.mutate(formData) : createMutation.mutate(formData);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          className="bg-[#111113] border border-white/[0.08] rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <h3 className="text-base font-bold text-white">{editData ? "Editar Sesión" : "Nueva Sesión"}</h3>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/10 flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-white/50" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Tipo */}
            <div>
              <label className={labelCls}>Tipo</label>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className={inputCls} style={{ colorScheme: 'dark' }}>
                <option value="Session">Sesión de Estudio</option>
                <option value="Meeting">Reunión</option>
                <option value="StudioWork">Trabajo en Estudio</option>
              </select>
            </div>

            {/* Título */}
            <div>
              <label className={labelCls}>Título</label>
              <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={inputCls} placeholder="Ej: Grabación de Voces" />
            </div>

            {/* Artista & Proyecto */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Artista</label>
                <select value={formData.artist_id} onChange={(e) => setFormData({ ...formData, artist_id: e.target.value })} className={inputCls} style={{ colorScheme: 'dark' }}>
                  <option value="">Sin asignar</option>
                  {artists.map(a => <option key={a.id} value={a.id}>{a.stageName}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Proyecto</label>
                <select value={formData.project_id} onChange={(e) => setFormData({ ...formData, project_id: e.target.value })} className={inputCls} style={{ colorScheme: 'dark' }}>
                  <option value="">Sin asignar</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Inicio</label>
                <input type="datetime-local" required value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} className={inputCls} style={{ colorScheme: 'dark' }} />
              </div>
              <div>
                <label className={labelCls}>Fin</label>
                <input type="datetime-local" required value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} className={inputCls} style={{ colorScheme: 'dark' }} />
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <label className={labelCls}>Ubicación</label>
              <select value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className={inputCls} style={{ colorScheme: 'dark' }}>
                <option value="Studio">Estudio</option>
                <option value="Online">Online</option>
                <option value="External">Externo</option>
              </select>
            </div>

            {/* Descripción */}
            <div>
              <label className={labelCls}>Descripción</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={inputCls} rows="3" placeholder="Notas adicionales..." />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-white/[0.05] text-white/60 hover:bg-white/[0.08] transition-all text-sm font-medium">
                Cancelar
              </button>
              <button type="submit" disabled={isPending} className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-all disabled:opacity-50">
                {isPending ? "Guardando..." : editData ? "Guardar Cambios" : "Crear Sesión"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}