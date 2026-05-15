import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, CalendarClock } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const inputCls = "w-full px-3 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-white/30 focus:bg-white/[0.07] transition-all text-sm";
const labelCls = "block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-1.5";

export default function CreateDeliverableModal({ isOpen, onClose, editData = null }) {
  const queryClient = useQueryClient();
  const { data: artists = [] } = useQuery({ queryKey: ['artists'], queryFn: () => base44.entities.Artist.list() });
  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: () => base44.entities.Project.list() });

  const defaultForm = { artist_id: "", project_id: "", deliverable_type: "Demo", title: "", due_date_time: "", status: "Pending", notes: "" };
  const [formData, setFormData] = useState(defaultForm);
  const [scheduleStatus, setScheduleStatus] = useState(null); // null | 'scheduling' | 'done' | 'error'

  useEffect(() => {
    if (editData) {
      setFormData({
        artist_id: editData.artist_id || "",
        project_id: editData.project_id || "",
        deliverable_type: editData.deliverable_type || "Demo",
        title: editData.title || "",
        due_date_time: editData.due_date_time ? editData.due_date_time.slice(0, 16) : "",
        status: editData.status || "Pending",
        notes: editData.notes || ""
      });
    } else {
      setFormData(defaultForm);
    }
    setScheduleStatus(null);
  }, [editData, isOpen]);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const deliverable = await base44.entities.Deliverable.create(data);
      queryClient.invalidateQueries({ queryKey: ['deliverables'] });
      // Auto-schedule work sessions if due_date_time is set
      if (data.due_date_time) {
        setScheduleStatus('scheduling');
        try {
          await base44.functions.invoke('scheduleDeliverableWorkSessions', {
            deliverable_title: data.title,
            due_date_time: new Date(data.due_date_time).toISOString(),
          });
          queryClient.invalidateQueries({ queryKey: ['sessions'] });
          setScheduleStatus('done');
        } catch {
          setScheduleStatus('error');
        }
      }
      return deliverable;
    },
    onSuccess: () => { setTimeout(() => onClose(), scheduleStatus === 'error' ? 2000 : 1200); }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Deliverable.update(editData.id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['deliverables'] }); onClose(); }
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
          <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                <Package className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <h3 className="text-base font-bold text-white">{editData ? "Editar Entregable" : "Nuevo Entregable"}</h3>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/10 flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-white/50" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className={labelCls}>Tipo</label>
              <select value={formData.deliverable_type} onChange={(e) => setFormData({ ...formData, deliverable_type: e.target.value })} className={inputCls} style={{ colorScheme: 'dark' }}>
                <option value="Demo">Demo</option>
                <option value="Beat">Beat</option>
                <option value="Recording">Grabación</option>
                <option value="Mix">Mezcla</option>
                <option value="Master">Master</option>
                <option value="Stems">Stems</option>
                <option value="Visual">Visual</option>
                <option value="ContentPack">Pack de Contenido</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Título</label>
              <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={inputCls} placeholder="Ej: Mezcla Final - Track 01" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Artista</label>
                <select required value={formData.artist_id} onChange={(e) => setFormData({ ...formData, artist_id: e.target.value })} className={inputCls} style={{ colorScheme: 'dark' }}>
                  <option value="">Seleccionar</option>
                  {artists.map(a => <option key={a.id} value={a.id}>{a.stageName}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Proyecto</label>
                <select required value={formData.project_id} onChange={(e) => setFormData({ ...formData, project_id: e.target.value })} className={inputCls} style={{ colorScheme: 'dark' }}>
                  <option value="">Seleccionar</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Fecha límite</label>
              <input type="datetime-local" required value={formData.due_date_time} onChange={(e) => setFormData({ ...formData, due_date_time: e.target.value })} className={inputCls} style={{ colorScheme: 'dark' }} />
            </div>

            <div>
              <label className={labelCls}>Notas</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className={inputCls} rows="3" placeholder="Notas adicionales..." />
            </div>

            {/* Scheduling status */}
            {scheduleStatus === 'scheduling' && (
              <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", color: "rgba(167,139,250,0.9)" }}>
                <div className="w-3.5 h-3.5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin flex-shrink-0" />
                Agendando sesiones de trabajo en Google Calendar...
              </div>
            )}
            {scheduleStatus === 'done' && (
              <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "#34d399" }}>
                <CalendarClock className="w-3.5 h-3.5 flex-shrink-0" />
                4 sesiones de trabajo agendadas automáticamente en tu calendario
              </div>
            )}
            {scheduleStatus === 'error' && (
              <div className="px-3.5 py-3 rounded-xl text-xs" style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)", color: "rgba(251,191,36,0.8)" }}>
                ⚠ Entregable guardado. Error al agendar sesiones automáticas en Calendar.
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-white/[0.05] text-white/60 hover:bg-white/[0.08] transition-all text-sm font-medium">
                Cancelar
              </button>
              <button type="submit" disabled={isPending} className="flex-1 px-4 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm transition-all disabled:opacity-50">
                {isPending ? (scheduleStatus === 'scheduling' ? "Agendando..." : "Guardando...") : editData ? "Guardar Cambios" : "Crear Entregable"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}