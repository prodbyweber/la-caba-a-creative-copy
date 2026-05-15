import React, { useState, useEffect, useMemo } from "react";
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
  const pad = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const SESSION_TYPES = ["Session", "Meeting", "StudioWork"];
const typeLabels = { Session: "Sesión", Meeting: "Reunión", StudioWork: "Studio", Deliverable: "Entregable" };
const DELIVERABLE_TYPES = ["Demo", "Beat", "Recording", "Mix", "Master", "Stems", "Visual", "ContentPack"];

export default function CreateSessionModal({ isOpen, onClose, editData = null }) {
  const queryClient = useQueryClient();
  const { data: artists = [] } = useQuery({ queryKey: ['artists'], queryFn: () => base44.entities.Artist.list() });
  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: () => base44.entities.Project.list() });

  const defaultForm = {
    type: "Session", title: "", artist_id: "", project_id: "",
    start_time: "", end_time: "", location: "Studio",
    description: "", status: "Pending", attendees: [],
    deliverable_type: "Demo", due_date_time: "",
  };

  const [formData, setFormData] = useState(defaultForm);
  const [newAttendee, setNewAttendee] = useState("");
  const [gcalStatus, setGcalStatus] = useState(null);

  const isDeliverable = formData.type === "Deliverable";

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
        attendees: editData.attendees || [],
        deliverable_type: editData.deliverable_type || "Demo",
        due_date_time: editData.due_date_time ? editData.due_date_time.slice(0, 16) : "",
      });
    } else {
      setFormData(defaultForm);
    }
    setGcalStatus(null);
    setNewAttendee("");
  }, [editData, isOpen]);

  const handleStartChange = (val) => {
    setFormData(prev => ({ ...prev, start_time: val, end_time: addHours(val, 2) }));
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

  const [showContacts, setShowContacts] = useState(false);
  const [contactSearch, setContactSearch] = useState("");

  // Construir lista de contactos: artistas con email + emails de sesiones recientes
  const allContacts = useMemo(() => {
    const map = new Map();
    artists.forEach(a => { if (a.email) map.set(a.email, { email: a.email, name: a.stageName, avatar: a.avatar_url }); });
    return Array.from(map.values());
  }, [artists]);

  const filteredContacts = contactSearch
    ? allContacts.filter(c => c.name?.toLowerCase().includes(contactSearch.toLowerCase()) || c.email.toLowerCase().includes(contactSearch.toLowerCase()))
    : allContacts;

  const addContactAsAttendee = (email) => {
    if (!formData.attendees.includes(email)) {
      setFormData(prev => ({ ...prev, attendees: [...prev.attendees, email] }));
    }
    setShowContacts(false);
    setContactSearch("");
  };

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
      if (data.type === "Deliverable") {
        const d = await base44.entities.Deliverable.create({
          title: data.title,
          artist_id: data.artist_id,
          project_id: data.project_id,
          deliverable_type: data.deliverable_type,
          due_date_time: data.due_date_time ? new Date(data.due_date_time).toISOString() : null,
          notes: data.description,
          status: "Pending",
        });
        queryClient.invalidateQueries({ queryKey: ['deliverables'] });
        return d;
      }
      const session = await base44.entities.Session.create({ ...data, source: 'cabana' });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      await syncToGCal(session, false);
      return session;
    },
    onSuccess: () => setTimeout(() => onClose(), gcalStatus === 'error' ? 1800 : 800)
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      if (data.type === "Deliverable") {
        const d = await base44.entities.Deliverable.update(editData.id, {
          title: data.title,
          artist_id: data.artist_id,
          project_id: data.project_id,
          deliverable_type: data.deliverable_type,
          due_date_time: data.due_date_time ? new Date(data.due_date_time).toISOString() : null,
          notes: data.description,
        });
        queryClient.invalidateQueries({ queryKey: ['deliverables'] });
        return d;
      }
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

  const statusOpts = [{ v: "Scheduled", l: "Programado" }, { v: "Pending", l: "Pendiente" }, { v: "Confirmed", l: "Confirmado" }];
  const allTypes = [...SESSION_TYPES, "Deliverable"];

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
                {editData ? editData.title || "Editar" : "Agendar sesión"}
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
              {allTypes.map(t => (
                <button key={t} type="button"
                  onClick={() => setFormData(f => ({ ...f, type: t }))}
                  className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
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
                className={field} placeholder={isDeliverable ? "Ej: Mix Voces v2" : "Ej: Grabación de Voces"} />
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

            {/* Campos específicos de Entregable */}
            {isDeliverable ? (
              <>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className={label}>Tipo</label>
                    <select value={formData.deliverable_type}
                      onChange={e => setFormData(f => ({ ...f, deliverable_type: e.target.value }))}
                      className={field} style={{ colorScheme: 'dark' }}>
                      {DELIVERABLE_TYPES.map(dt => <option key={dt} value={dt}>{dt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={label}>Proyecto</label>
                    <select value={formData.project_id}
                      onChange={e => setFormData(f => ({ ...f, project_id: e.target.value }))}
                      className={field} style={{ colorScheme: 'dark' }}>
                      <option value="">Sin proyecto</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={label}>Fecha límite</label>
                  <input type="datetime-local" value={formData.due_date_time}
                    onChange={e => setFormData(f => ({ ...f, due_date_time: e.target.value }))}
                    className={field}
                    style={{ colorScheme: 'dark', fontSize: '10px', padding: '6px 8px' }} />
                </div>
                <div>
                  <label className={label}>Notas</label>
                  <textarea value={formData.description}
                    onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                    className={field} rows="1" placeholder="Detalles del entregable..." />
                </div>
              </>
            ) : (
              <>
                {/* Fechas */}
                <div>
                  <p className={label}>Horario</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[9px] text-white/20 uppercase tracking-widest mb-1">Inicio</p>
                      <input type="datetime-local" required value={formData.start_time}
                        onChange={e => handleStartChange(e.target.value)}
                        className={field}
                        style={{ colorScheme: 'dark', fontSize: '10px', padding: '6px 8px' }} />
                    </div>
                    <div>
                      <p className="text-[9px] text-white/20 uppercase tracking-widest mb-1">
                        Fin <span style={{ color: "rgba(255,88,51,0.5)", fontSize: 8 }}>+2h auto</span>
                      </p>
                      <input type="datetime-local" required value={formData.end_time}
                        onChange={e => setFormData(f => ({ ...f, end_time: e.target.value }))}
                        className={field}
                        style={{ colorScheme: 'dark', fontSize: '10px', padding: '6px 8px' }} />
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

                {/* Notas + Invitados */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className={label}>Notas</label>
                    <textarea value={formData.description}
                      onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                      className={field} rows="1" placeholder="Objetivos, refs..." />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className={label} style={{ marginBottom: 0 }}>Invitado</label>
                      <button type="button" onClick={() => { setShowContacts(v => !v); setContactSearch(""); }}
                        className="text-[9px] font-semibold transition-colors px-1.5 py-0.5 rounded-md"
                        style={{ color: showContacts ? "#ff5833" : "rgba(255,255,255,0.25)", background: showContacts ? "rgba(255,88,51,0.08)" : "transparent" }}>
                        {showContacts ? "Cerrar" : "Contactos"}
                      </button>
                    </div>
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
                    {/* Panel de contactos desplegable */}
                    {showContacts && (
                      <div className="mt-1.5 rounded-xl overflow-hidden" style={{ background: "#0a0a0c", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <div className="px-2 pt-2 pb-1.5">
                          <input
                            type="text" value={contactSearch}
                            onChange={e => setContactSearch(e.target.value)}
                            placeholder="Buscar..."
                            className="w-full px-2.5 py-1.5 rounded-lg text-[10px] text-white placeholder-white/20 focus:outline-none"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
                          />
                        </div>
                        <div className="overflow-y-auto" style={{ maxHeight: 140 }}>
                          {filteredContacts.length === 0 ? (
                            <p className="text-[10px] text-white/20 text-center py-3">Sin resultados</p>
                          ) : filteredContacts.map(c => (
                            <button key={c.email} type="button"
                              onClick={() => addContactAsAttendee(c.email)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-white/[0.04]"
                              style={{ opacity: formData.attendees.includes(c.email) ? 0.35 : 1 }}
                            >
                              <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[8px] font-bold"
                                style={{ background: "rgba(255,88,51,0.15)", color: "#ff5833" }}>
                                {c.name ? c.name[0].toUpperCase() : c.email[0].toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                {c.name && <p className="text-[10px] font-semibold text-white/70 truncate leading-tight">{c.name}</p>}
                                <p className="text-[9px] text-white/30 truncate leading-tight">{c.email}</p>
                              </div>
                              {formData.attendees.includes(c.email) && (
                                <span className="ml-auto text-[8px] text-white/20 flex-shrink-0">✓</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
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
              </>
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
                ) : editData ? "Guardar cambios" : isDeliverable ? "Crear entregable" : "Crear sesión"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}