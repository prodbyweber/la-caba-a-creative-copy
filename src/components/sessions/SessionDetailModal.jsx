import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Save, Clock, MapPin, Link as LinkIcon, Calendar, FileText, Trash2, Video, HardDrive, ChevronDown, ChevronUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const DESC_LIMIT = 120;

export default function SessionDetailModal({ session, onClose, artists, readOnly = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [formData, setFormData] = useState({
    title: session.title || "",
    description: session.description || "",
    notes: session.notes || "",
    start_time: session.start_time ? format(parseISO(session.start_time), "yyyy-MM-dd'T'HH:mm") : "",
    end_time: session.end_time ? format(parseISO(session.end_time), "yyyy-MM-dd'T'HH:mm") : "",
    location: session.location || "Studio",
    status: session.status || "Pending",
    google_meet_link: session.google_meet_link || "",
    drive_link: session.drive_link || "",
    artist_id: session.artist_id || ""
  });

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Session.update(session.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setIsEditing(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Session.delete(session.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      onClose();
    }
  });

  const handleSave = () => updateMutation.mutate(formData);

  const artist = artists?.find(a => a.id === formData.artist_id);

  const descText = session.description || "";
  const descLong = descText.length > DESC_LIMIT;
  const descShown = descLong && !descExpanded ? descText.slice(0, DESC_LIMIT) + "…" : descText;

  const Row = ({ icon: Icon, label, children }) => (
    <div className="flex items-start gap-2.5 py-2.5 border-b border-white/[0.05] last:border-0">
      <Icon className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-gray-500 uppercase tracking-wide leading-none mb-0.5">{label}</p>
        {children}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="bg-[#111113] rounded-t-2xl sm:rounded-2xl border border-white/10 w-full sm:max-w-md overflow-hidden flex flex-col"
        style={{ maxHeight: 'calc(100dvh - 80px)' }}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-white/[0.06] flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full text-base font-semibold bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500/50"
              />
            ) : (
              <h2 className="text-base font-semibold text-white leading-tight">{session.title}</h2>
            )}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[11px] text-gray-500">{session.type}</span>
              {artist && (
                <>
                  <span className="text-gray-700 text-[10px]">·</span>
                  <span className="text-[11px] text-gray-400">{artist.stageName}</span>
                </>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <div className="divide-y divide-white/[0.05]">

            {/* Fecha y horario */}
            <Row icon={Calendar} label="Fecha y horario">
              {isEditing ? (
                <div className="space-y-2 mt-1">
                  <input type="datetime-local" value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500/50" />
                  <input type="datetime-local" value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500/50" />
                </div>
              ) : (
                <div>
                  {session.start_time && (
                    <p className="text-[13px] text-white font-medium">
                      {format(parseISO(session.start_time), "EEEE, d 'de' MMMM", { locale: es })}
                    </p>
                  )}
                  {session.start_time && session.end_time && (
                    <p className="text-[12px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {format(parseISO(session.start_time), "HH:mm")} – {format(parseISO(session.end_time), "HH:mm")}
                    </p>
                  )}
                </div>
              )}
            </Row>

            {/* Ubicación */}
            <Row icon={MapPin} label="Ubicación">
              {isEditing ? (
                <select value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500/50">
                  <option value="Studio">Studio</option>
                  <option value="Online">Online</option>
                  <option value="External">External</option>
                </select>
              ) : (
                <p className="text-[13px] text-white">{session.location || "No especificado"}</p>
              )}
            </Row>

            {/* Descripción */}
            {(session.description || isEditing) && (
              <Row icon={FileText} label="Descripción">
                {isEditing ? (
                  <textarea value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs h-20 resize-none focus:outline-none focus:border-emerald-500/50"
                    placeholder="Detalles de la sesión..." />
                ) : (
                  <div>
                    <p className="text-[12px] text-gray-300 leading-relaxed">{descShown}</p>
                    {descLong && (
                      <button onClick={() => setDescExpanded(v => !v)}
                        className="flex items-center gap-1 mt-1 text-[11px] text-emerald-400 hover:text-emerald-300">
                        {descExpanded ? <><ChevronUp className="w-3 h-3" />Ver menos</> : <><ChevronDown className="w-3 h-3" />Ver más</>}
                      </button>
                    )}
                  </div>
                )}
              </Row>
            )}

            {/* Google Meet */}
            {(formData.google_meet_link || isEditing) && (
              <Row icon={Video} label="Google Meet">
                {isEditing ? (
                  <input type="url" value={formData.google_meet_link}
                    onChange={(e) => setFormData({ ...formData, google_meet_link: e.target.value })}
                    className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500/50"
                    placeholder="https://meet.google.com/..." />
                ) : formData.google_meet_link ? (
                  <a href={formData.google_meet_link} target="_blank" rel="noopener noreferrer"
                    className="text-[12px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                    <LinkIcon className="w-3 h-3" />Unirse a la reunión
                  </a>
                ) : null}
              </Row>
            )}

            {/* Drive */}
            {(formData.drive_link || isEditing) && (
              <Row icon={HardDrive} label="Drive / WeTransfer">
                {isEditing ? (
                  <input type="url" value={formData.drive_link}
                    onChange={(e) => setFormData({ ...formData, drive_link: e.target.value })}
                    className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500/50"
                    placeholder="https://drive.google.com/..." />
                ) : formData.drive_link ? (
                  <a href={formData.drive_link} target="_blank" rel="noopener noreferrer"
                    className="text-[12px] text-purple-400 hover:text-purple-300 flex items-center gap-1">
                    <LinkIcon className="w-3 h-3" />Ver archivos
                  </a>
                ) : null}
              </Row>
            )}

            {/* Notas */}
            {(session.notes || isEditing) && (
              <Row icon={FileText} label="Notas">
                {isEditing ? (
                  <textarea value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs h-20 resize-none focus:outline-none focus:border-emerald-500/50"
                    placeholder="Notas adicionales..." />
                ) : (
                  <p className="text-[12px] text-gray-300 leading-relaxed">{session.notes}</p>
                )}
              </Row>
            )}
          </div>
        </div>

        {/* Footer */}
        {!readOnly && (
          <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
            <button
              onClick={() => { if (window.confirm("¿Eliminar esta sesión?")) deleteMutation.mutate(); }}
              disabled={deleteMutation.isPending}
              className="p-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button onClick={() => setIsEditing(false)}
                    className="px-4 py-1.5 rounded-lg border border-white/10 text-xs text-gray-400 hover:bg-white/5 transition-colors">
                    Cancelar
                  </button>
                  <button onClick={handleSave} disabled={updateMutation.isPending}
                    className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition-colors flex items-center gap-1">
                    <Save className="w-3 h-3" />
                    {updateMutation.isPending ? "Guardando..." : "Guardar"}
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)}
                  className="px-4 py-1.5 rounded-lg bg-white/8 hover:bg-white/12 border border-white/10 text-xs text-white font-medium transition-colors">
                  Editar
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}