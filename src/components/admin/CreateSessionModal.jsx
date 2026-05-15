import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2 } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const field = "w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-[#ff5833]/50 focus:bg-white/[0.06] transition-all text-xs";
const label = "block text-[9px] font-semibold text-white/30 uppercase tracking-[0.12em] mb-1";

function addHours(dateStr, hours) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  d.setHours(d.getHours() + hours);
  // Format back to datetime-local (YYYY-MM-DDTHH:mm)
  const pad = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function CreateSessionModal({ isOpen, onClose, editData = null }) {
  const queryClient = useQueryClient();
  const { data: artists = [] } = useQuery({ queryKey: ['artists'], queryFn: () => base44.entities.Artist.list() });
  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: () => base44.entities.Project.list() });

  const defaultForm = {
    type: "Session", title: "", artist_id: "", project_id: "",
    start_time: "", end_time: "", location: "Studio",
    description: "", status: "Pending", attendees: []
  };

  const [formData, setFormData] = useState(defaultForm);
  const [newAttendee, setNewAttendee] = useState("");
  const [gcalStatus, setGcalStatus] = useState(null);

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

  const handleStartChange = (val) => {
    setFormData(prev => ({
      ...prev,
      start_time: val,
      end_time: addHours(val, 2),
    }));
  };

  const handleArtistChange = (artistId) => {
    const artist = artists.find(a => a.id === artistId);
    setFormData(prev => {
      const list = [...prev.attendees];
      const prev_artist = artists.find(a => a.id === prev.artist_id);
      if (prev_artist?.email) { const i = list.indexOf(prev_artist.email); if (i !== -1) list.splice(i, 1); }
      if (artist?.email && !list.includes(artist.email)) list.unshift(artist.email);
      return { ...prev, artist_id: artistId, attendees: list };
    });
  };

  const addAttendee = () => {
    const email = newAttendee.trim().toLowerCase();
    if (!email || !email.includes('@') || formData.attendees.includes(email)) return;
    setFormData(prev => ({ ...prev, attendees: [...prev.attendees, email] }));
    setNewAttendee("");
  };

  const removeAttendee = (email) => setFormData(prev => ({ ...prev, attendees: prev.attendees.filter(e => e !== email) }));

  const syncToGCal = async (session, isUpdate = false) => {
    setGcalStatus('syncing');
    const artist = artists.find(a => a.id === session.artist_id);
    const project = projects.find(p => p.id === session.project_id);
    const enriched = { ...session, artist_name: artist?.stageName || null, project_name: project?.title || null };
    try {
      if (isUpdate && session.google_event_id) {
        await base44.functions.invoke('updateGoogleCalendarEvent', { session: enriched, google_event_id: session.google_event_id });
      } else if (!isUpdate) {
        const res = await base44.functions.invoke('createGoogleCalendarEvent', { session: enriched });
        if (res.data?.google_event_id) {
          const upd = { google_event_id: res.data.google_event_id, google_event_link: res.data.google_event_link };
          if (res.data.google_meet_link) upd.google_meet_link = res.data.google_meet_link;
          await base44.entities.Session.update(session.id, upd);
          queryClient.invalidateQueries({ queryKey: ['sessions'] });
        }
      }
      setGcalStatus('success');
    } catch { setGcalStatus('error'); }
  };

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const session = await base44.entities.Session.create({ ...data, source: 'cabana' });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      await syncToGCal(session, false);
      return session;
    },
    onSuccess: () => setTimeout(() => onClose(), gcalStatus === 'error' ? 1800 : 800)
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const session = await base44.entities.Session.update(editData.id, data);
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      await syncToGCal({ ...data, id: editData.id, google_event_id: editData.google_event_id }, true);
      return session;
    },
    onSuccess: () => setTimeout(() => onClose(), gcalStatus === 'error' ? 1800 : 800)
  });

  const handleSubmit = (e) => { e.preventDefault(); editData ? updateMutation.mutate(formData) : createMutation.mutate(formData); };
  const isPending = createMutation.isPending || updateMutation.isPending;

  if (!isOpen) return null;

  const typeLabels = { Session: "Sesión", Meeting: "Reunión", StudioWork: "Studio Work" };
  const statusOpts = [{ v: "Scheduled", l: "Programado" }, { v: "Pending", l: "Pendiente" }, { v: "Confirmed", l: "Confirmado" }];

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex justify-center"
        style={{
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(8px)",
          alignItems: "flex-end",
          paddingBottom: "calc(65px + env(safe-area-inset-bottom, 0px) + 16px)",
          paddingTop: "16px",
          paddingLeft: "12px",
          paddingRight: "12px",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="w-full sm:max-w-md overflow-y-auto"
          style={{
            background: "#0d0d0f",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "16px 16px 12px 12px",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,88,51,0.08)",
            maxHeight: "calc(100dvh - 65px - env(safe-area-inset-bottom, 0px) - 32px)",
            overflowY: "auto",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center gap-2">
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#ff5833", display: "inline-block", flexShrink: 0 }} />
              <h3 className="text-sm font-black text-white" style={{ letterSpacing: "-0.02em" }}>
                {editData ? editData.title || "Editar sesión" : "Agendar sesión"}
              </h3>
            </div>
            <button onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <X className="w-3 h-3 text-white/50" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-4 py-3 space-y-3">

            {/* Tipo — pill selector */}
            <div className="flex gap-1.5">
              {["Session", "Meeting", "StudioWork"].map(t => (
                <button key={t} type="button"
                  onClick={() => setFormData(f => ({ ...f, type: t }))}
                  className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                  style={{
                    background: formData.type === t ? "rgba(255,88,51,0.15)" : "rgba(255,255,255,0.04)",
                    border: formData.type === t ? "1px solid rgba(255,88,51,0.4)" : "1px solid rgba(255,255,255,0.07)",
                    color: formData.type === t ? "#ff5833" : "rgba(255,255,255,0.35)",
                  }}
                >{typeLabels[t]}</button>
              ))}
            </div>

            {/* Título */}
            <div>
              <label className={label}>Título</label>
              <input type="text" required value={formData.title}
                onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                className={field} placeholder="Ej: Grabación de Voces" />
            </div>

            {/* Artista */}
            <div>
              <label className={label}>Artista</label>
              <select value={formData.artist_id}
                onChange={e => handleArtistChange(e.target.value)}
                className={field} style={{ colorScheme: 'dark' }}>
                <option value="">Sin asignar</option>
                {artists.map(a => <option key={a.id} value={a.id}>{a.stageName}</option>)}
              </select>
            </div>

            {/* Fechas */}
            <div>
              <p className={label}>Horario</p>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <p className="text-[9px] text-white/20 uppercase tracking-widest mb-1">Inicio</p>
                  <input type="datetime-local" required value={formData.start_time}
                    onChange={e => handleStartChange(e.target.value)}
                    className={field} style={{ colorScheme: 'dark' }} />
                </div>
                <div>
                  <p className="text-[9px] text-white/20 uppercase tracking-widest mb-1">
                    Fin <span style={{ color: "rgba(255,88,51,0.5)", fontSize: 8 }}>+2h auto</span>
                  </p>
                  <input type="datetime-local" required value={formData.end_time}
                    onChange={e => setFormData(f => ({ ...f, end_time: e.target.value }))}
                    className={field} style={{ colorScheme: 'dark' }} />
                </div>
              </div>
            </div>

            {/* Ubicación & Estado */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className={label}>Ubicación</label>
                <select value={formData.location}
                  onChange={e => setFormData(f => ({ ...f, location: e.target.value }))}
                  className={field} style={{ colorScheme: 'dark' }}>
                  <option value="Studio">Estudio</option>
                  <option value="Online">Online</option>
                  <option value="External">Externo</option>
                </select>
              </div>
              <div>
                <label className={label}>Estado</label>
                <select value={formData.status}
                  onChange={e => setFormData(f => ({ ...f, status: e.target.value }))}
                  className={field} style={{ colorScheme: 'dark' }}>
                  {statusOpts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
              </div>
            </div>

            {/* Notas + Invitados en fila */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className={label}>Notas</label>
                <textarea value={formData.description}
                  onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                  className={field} rows="1" placeholder="Objetivos, refs..." />
              </div>
              <div>
                <label className={label}>Invitado</label>
                <div className="flex gap-1.5">
                  <input type="email" value={newAttendee}
                    onChange={e => setNewAttendee(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAttendee(); } }}
                    className={field + " flex-1 min-w-0"} placeholder="email" />
                  <button type="button" onClick={addAttendee}
                    className="px-2 rounded-lg flex-shrink-0 transition-all"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <Plus className="w-3 h-3 text-white/40" />
                  </button>
                </div>
                {formData.attendees.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {formData.attendees.map(email => {
                      const isArtist = artists.find(a => a.id === formData.artist_id)?.email === email;
                      return (
                        <div key={email} className="flex items-center justify-between px-2 py-1 rounded-md"
                          style={{ background: isArtist ? "rgba(255,88,51,0.08)" : "rgba(255,255,255,0.04)", border: `1px solid ${isArtist ? "rgba(255,88,51,0.2)" : "rgba(255,255,255,0.06)"}` }}>
                          <span className="text-[10px] truncate" style={{ color: isArtist ? "#ff5833" : "rgba(255,255,255,0.5)" }}>{email}</span>
                          <button type="button" onClick={() => removeAttendee(email)} className="text-white/20 hover:text-red-400 transition-colors ml-1 flex-shrink-0">
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* GCal status */}
            {gcalStatus === 'syncing' && (
              <div className="flex items-center gap-2 text-xs rounded-lg px-3 py-2"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)" }}>
                <div className="w-3 h-3 border-2 border-white/30 border-t-white/80 rounded-full animate-spin flex-shrink-0" />
                Sincronizando con Google Calendar...
              </div>
            )}
            {gcalStatus === 'success' && (
              <div className="text-xs rounded-lg px-3 py-2"
                style={{ background: "rgba(255,88,51,0.08)", border: "1px solid rgba(255,88,51,0.2)", color: "#ff5833" }}>
                ✓ Sincronizado en Google Calendar
              </div>
            )}
            {gcalStatus === 'error' && (
              <div className="text-xs rounded-lg px-3 py-2"
                style={{ background: "rgba(255,200,0,0.06)", border: "1px solid rgba(255,200,0,0.15)", color: "rgba(255,200,0,0.7)" }}>
                ⚠ Sesión guardada. Error al sincronizar con Calendar.
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)" }}>
                Cancelar
              </button>
              <button type="submit" disabled={isPending}
                className="py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                style={{
                  flex: 2,
                  background: isPending ? "rgba(255,88,51,0.4)" : "#ff5833",
                  color: "white",
                  letterSpacing: "-0.01em",
                  boxShadow: isPending ? "none" : "0 4px 16px rgba(255,88,51,0.3)",
                }}>
                {isPending ? (
                  <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
                ) : editData ? "Guardar cambios" : "Crear sesión"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}