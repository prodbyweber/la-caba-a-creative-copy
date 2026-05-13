import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Plus, Trash2 } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const inputCls = "w-full px-3 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-white/30 focus:bg-white/[0.07] transition-all text-sm";
const labelCls = "block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-1.5";

export default function CreateSessionModal({ isOpen, onClose, editData = null }) {
  const queryClient = useQueryClient();
  const { data: artists = [] } = useQuery({ queryKey: ['artists'], queryFn: () => base44.entities.Artist.list() });
  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: () => base44.entities.Project.list() });

  const defaultForm = {
    type: "Session",
    title: "",
    artist_id: "",
    project_id: "",
    start_time: "",
    end_time: "",
    location: "Studio",
    description: "",
    status: "Pending",
    attendees: []
  };
  const [formData, setFormData] = useState(defaultForm);
  const [newAttendee, setNewAttendee] = useState("");
  const [gcalStatus, setGcalStatus] = useState(null); // null | 'syncing' | 'success' | 'error'

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
        status: editData.status || "Pending",
        attendees: editData.attendees || []
      });
    } else {
      setFormData(defaultForm);
    }
    setGcalStatus(null);
    setNewAttendee("");
  }, [editData, isOpen]);

  // Auto-add artist email when artist is selected
  const handleArtistChange = (artistId) => {
    const artist = artists.find(a => a.id === artistId);
    setFormData(prev => {
      const newAttendees = [...prev.attendees];
      // Remove previous artist email if any
      const prevArtist = artists.find(a => a.id === prev.artist_id);
      if (prevArtist?.email) {
        const idx = newAttendees.indexOf(prevArtist.email);
        if (idx !== -1) newAttendees.splice(idx, 1);
      }
      // Add new artist email if exists and not already present
      if (artist?.email && !newAttendees.includes(artist.email)) {
        newAttendees.unshift(artist.email);
      }
      return { ...prev, artist_id: artistId, attendees: newAttendees };
    });
  };

  const addAttendee = () => {
    const email = newAttendee.trim().toLowerCase();
    if (!email || !email.includes('@')) return;
    if (formData.attendees.includes(email)) return;
    setFormData(prev => ({ ...prev, attendees: [...prev.attendees, email] }));
    setNewAttendee("");
  };

  const removeAttendee = (email) => {
    setFormData(prev => ({ ...prev, attendees: prev.attendees.filter(e => e !== email) }));
  };

  // Sync to Google Calendar after DB save
  const syncToGCal = async (session, isUpdate = false) => {
    setGcalStatus('syncing');
    const artist = artists.find(a => a.id === session.artist_id);
    const project = projects.find(p => p.id === session.project_id);
    const enriched = {
      ...session,
      artist_name: artist?.stageName || null,
      project_name: project?.title || null,
    };
    try {
      if (isUpdate && session.google_event_id) {
        await base44.functions.invoke('updateGoogleCalendarEvent', {
          session: enriched,
          google_event_id: session.google_event_id
        });
        setGcalStatus('success');
      } else if (!isUpdate) {
        const res = await base44.functions.invoke('createGoogleCalendarEvent', { session: enriched });
        if (res.data?.google_event_id) {
          const updateData = {
            google_event_id: res.data.google_event_id,
            google_event_link: res.data.google_event_link
          };
          if (res.data.google_meet_link) {
            updateData.google_meet_link = res.data.google_meet_link;
          }
          await base44.entities.Session.update(session.id, updateData);
          queryClient.invalidateQueries({ queryKey: ['sessions'] });
        }
        setGcalStatus('success');
      }
    } catch (e) {
      setGcalStatus('error');
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const session = await base44.entities.Session.create({ ...data, source: 'cabana' });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      await syncToGCal(session, false);
      return session;
    },
    onSuccess: () => {
      setTimeout(() => onClose(), gcalStatus === 'error' ? 1800 : 800);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const session = await base44.entities.Session.update(editData.id, data);
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      await syncToGCal({ ...data, id: editData.id, google_event_id: editData.google_event_id }, true);
      return session;
    },
    onSuccess: () => {
      setTimeout(() => onClose(), gcalStatus === 'error' ? 1800 : 800);
    }
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
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-white">{editData ? "Editar Sesión" : "Nueva Sesión"}</h3>
              <span className="text-[10px] text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-2 py-0.5">
                Google Calendar
              </span>
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

            {/* Artista */}
            <div>
              <label className={labelCls}>Artista</label>
              <select value={formData.artist_id} onChange={(e) => handleArtistChange(e.target.value)} className={inputCls} style={{ colorScheme: 'dark' }}>
                <option value="">Sin asignar</option>
                {artists.map(a => <option key={a.id} value={a.id}>{a.stageName}</option>)}
              </select>
            </div>

            {/* Fechas — datetime-local usa tu hora local automáticamente */}
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

            {/* Ubicación & Estado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Ubicación</label>
                <select value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className={inputCls} style={{ colorScheme: 'dark' }}>
                  <option value="Studio">Estudio</option>
                  <option value="Online">Online</option>
                  <option value="External">Externo</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Estado</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={inputCls} style={{ colorScheme: 'dark' }}>
                  <option value="Scheduled">Programado</option>
                  <option value="Pending">Pendiente</option>
                  <option value="Confirmed">Confirmado</option>
                </select>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className={labelCls}>Descripción / Notas</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={inputCls} rows="3" placeholder="Notas sobre la sesión, objetivos, materiales..." />
            </div>

            {/* Invitados */}
            <div>
              <label className={labelCls}>Invitados (correos)</label>
              <p className="text-[11px] text-white/25 mb-2">Se les enviará una invitación desde tu cuenta de Google</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newAttendee}
                  onChange={(e) => setNewAttendee(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAttendee(); } }}
                  className={inputCls + " flex-1"}
                  placeholder="correo@ejemplo.com"
                />
                <button
                  type="button"
                  onClick={addAttendee}
                  className="px-3 py-2.5 rounded-xl bg-white/[0.07] hover:bg-white/10 border border-white/10 text-white/60 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {formData.attendees.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {formData.attendees.map(email => {
                    const isArtistEmail = artists.find(a => a.id === formData.artist_id)?.email === email;
                    return (
                      <div key={email} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${isArtistEmail ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-blue-500/10 border-blue-500/20'}`}>
                        <span className={`text-xs ${isArtistEmail ? 'text-emerald-300' : 'text-blue-300'}`}>
                          {email} {isArtistEmail && <span className="text-emerald-500/70">(artista)</span>}
                        </span>
                        <button type="button" onClick={() => removeAttendee(email)} className="text-white/30 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* GCal status */}
            {gcalStatus === 'syncing' && (
              <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-500/10 rounded-xl px-3 py-2.5">
                <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                Sincronizando con Google Calendar...
              </div>
            )}
            {gcalStatus === 'success' && (
              <div className="text-xs text-emerald-400 bg-emerald-500/10 rounded-xl px-3 py-2.5">
                ✓ Evento sincronizado en Google Calendar. Los invitados recibirán una notificación.
              </div>
            )}
            {gcalStatus === 'error' && (
              <div className="text-xs text-yellow-400 bg-yellow-500/10 rounded-xl px-3 py-2.5">
                ⚠ Sesión guardada. Error al sincronizar con Google Calendar.
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-white/[0.05] text-white/60 hover:bg-white/[0.08] transition-all text-sm font-medium">
                Cancelar
              </button>
              <button type="submit" disabled={isPending} className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {isPending ? (
                  <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Guardando...</>
                ) : editData ? "Guardar Cambios" : "Crear Sesión"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}