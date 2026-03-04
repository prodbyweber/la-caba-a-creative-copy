import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, GitPullRequest } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const inputCls = "w-full px-3 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-white/30 focus:bg-white/[0.07] transition-all text-sm";
const labelCls = "block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-1.5";

export default function CreateRevisionModal({ isOpen, onClose, editData = null }) {
  const queryClient = useQueryClient();
  const { data: artists = [] } = useQuery({ queryKey: ['artists'], queryFn: () => base44.entities.Artist.list() });
  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: () => base44.entities.Project.list() });
  const { data: tracks = [] } = useQuery({ queryKey: ['tracks'], queryFn: () => base44.entities.Track.list() });

  const defaultForm = { artist_id: "", project_id: "", track_id: "", timecode: "", revision_type: "Mix", request_text: "", severity: "Medium", status: "Open", assigned_to: "Me" };
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    if (editData) {
      setFormData({
        artist_id: editData.artist_id || "",
        project_id: editData.project_id || "",
        track_id: editData.track_id || "",
        timecode: editData.timecode || "",
        revision_type: editData.revision_type || "Mix",
        request_text: editData.request_text || "",
        severity: editData.severity || "Medium",
        status: editData.status || "Open",
        assigned_to: editData.assigned_to || "Me"
      });
    } else {
      setFormData(defaultForm);
    }
  }, [editData, isOpen]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Revision.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['revisions'] }); onClose(); }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Revision.update(editData.id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['revisions'] }); onClose(); }
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
              <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
                <GitPullRequest className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <h3 className="text-base font-bold text-white">{editData ? "Editar Revisión" : "Nueva Revisión"}</h3>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/10 flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-white/50" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Track (opcional)</label>
                <select value={formData.track_id} onChange={(e) => setFormData({ ...formData, track_id: e.target.value })} className={inputCls} style={{ colorScheme: 'dark' }}>
                  <option value="">Sin track</option>
                  {tracks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Timecode (MM:SS)</label>
                <input type="text" required value={formData.timecode} onChange={(e) => setFormData({ ...formData, timecode: e.target.value })} className={inputCls} placeholder="01:45" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Tipo</label>
                <select value={formData.revision_type} onChange={(e) => setFormData({ ...formData, revision_type: e.target.value })} className={inputCls} style={{ colorScheme: 'dark' }}>
                  <option value="Vocal">Vocal</option>
                  <option value="Beat">Beat</option>
                  <option value="Mix">Mezcla</option>
                  <option value="Master">Master</option>
                  <option value="Arrangement">Arreglo</option>
                  <option value="FX">Efectos</option>
                  <option value="Lyrics">Letra</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Severidad</label>
                <select value={formData.severity} onChange={(e) => setFormData({ ...formData, severity: e.target.value })} className={inputCls} style={{ colorScheme: 'dark' }}>
                  <option value="Small">Pequeña</option>
                  <option value="Medium">Media</option>
                  <option value="Critical">Crítica</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Descripción</label>
              <textarea required value={formData.request_text} onChange={(e) => setFormData({ ...formData, request_text: e.target.value })} className={inputCls} rows="3" placeholder="Describe la revisión necesaria..." />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-white/[0.05] text-white/60 hover:bg-white/[0.08] transition-all text-sm font-medium">
                Cancelar
              </button>
              <button type="submit" disabled={isPending} className="flex-1 px-4 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-sm transition-all disabled:opacity-50">
                {isPending ? "Guardando..." : editData ? "Guardar Cambios" : "Crear Revisión"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}