import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Pencil, Trash2, ExternalLink, BarChart3, Plus, X, Check, Globe, Lock, Link, Music2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { ensureUniqueLandingSlug, DEFAULT_PLATFORM_ORDER } from "@/lib/releaseUtils";

const inp = "w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors";
const lbl = "block text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-1.5";

export default function LandingPagesSection({ jlyArtistId, userEmail }) {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState("");

  // Tracks del artista (para picker y para resolver títulos/portadas)
  const { data: tracks = [] } = useQuery({
    queryKey: ["tracks", jlyArtistId || "user", userEmail || "anon"],
    queryFn: async () => {
      if (jlyArtistId) return base44.entities.Track.filter({ artist_id: jlyArtistId });
      if (userEmail) return base44.entities.Track.list("-created_date", 200).then((a) => a.filter((t) => t.created_by === userEmail));
      return [];
    },
    initialData: [],
  });

  // Landings
  const { data: landings = [], isLoading } = useQuery({
    queryKey: ["release-landings"],
    queryFn: () => base44.entities.ReleaseLanding.list("-updated_date", 200),
    initialData: [],
  });

  const trackMap = Object.fromEntries(tracks.map((t) => [t.id, t]));

  const copyLink = (l) => {
    const url = `${window.location.origin}/release/${l.slug}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    setToast("Enlace copiado");
    setTimeout(() => setToast(""), 1800);
  };

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ReleaseLanding.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["release-landings"] }),
  });

  const handleDelete = (l) => {
    const t = trackMap[l.track_id];
    if (!window.confirm(`¿Eliminar la landing de "${t?.title || l.slug}"? El soundtrack no se borra.`)) return;
    deleteMutation.mutate(l.id);
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-[#141414] to-black overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Landing Pages</p>
        <button
          onClick={() => setShowCreate(true)}
          disabled={tracks.length === 0}
          className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all disabled:opacity-40"
        >
          <Plus className="w-3 h-3" />
          <span className="hidden lg:inline">Nueva landing</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-8"><div className="h-20 bg-white/5 rounded animate-pulse" /></div>
      ) : landings.length === 0 ? (
        <div className="text-center py-10 px-4">
          <Link className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-3">Aún no tienes landing pages</p>
          {tracks.length > 0 ? (
            <button onClick={() => setShowCreate(true)} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors">
              Crear tu primera landing
            </button>
          ) : (
            <p className="text-white/30 text-xs">Primero crea un soundtrack.</p>
          )}
        </div>
      ) : (
        <div className="divide-y divide-white/[0.04]">
          {landings.map((l) => {
            const t = trackMap[l.track_id];
            const cover = t?.cover_url;
            return (
              <div key={l.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                  {cover ? <img src={cover} alt="" className="w-full h-full object-cover" /> : <Music2 className="w-5 h-5 text-white/20 m-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{l.title_override || t?.title || "Sin título"}</p>
                  <p className="text-[11px] text-white/30 truncate">/release/{l.slug}</p>
                </div>
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full" style={{
                  background: l.is_active ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.05)",
                  color: l.is_active ? "#34d399" : "rgba(255,255,255,0.4)",
                }}>
                  {l.is_active ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                  {l.is_active ? "Activa" : "Pausada"}
                </span>
                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <IconBtn title="Copiar enlace" onClick={() => copyLink(l)}><Link2 className="w-3.5 h-3.5" /></IconBtn>
                  <a href={`/release/${l.slug}`} target="_blank" rel="noreferrer" title="Abrir landing">
                    <IconBtn><ExternalLink className="w-3.5 h-3.5" /></IconBtn>
                  </a>
                  <Link to={`/release/${l.slug}/analytics`} title="Analíticas">
                    <IconBtn><BarChart3 className="w-3.5 h-3.5" /></IconBtn>
                  </Link>
                  <IconBtn title="Editar" onClick={() => setEditing(l)}><Pencil className="w-3.5 h-3.5" /></IconBtn>
                  <IconBtn title="Eliminar" onClick={() => handleDelete(l)} danger><Trash2 className="w-3.5 h-3.5" /></IconBtn>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-white text-black text-sm font-medium shadow-xl">
          {toast}
        </div>
      )}

      {(showCreate || editing) && (
        <LandingModal
          tracks={tracks}
          editing={editing}
          onClose={() => { setShowCreate(false); setEditing(null); }}
          onSaved={() => { setShowCreate(false); setEditing(null); qc.invalidateQueries({ queryKey: ["release-landings"] }); }}
        />
      )}
    </div>
  );
}

function IconBtn({ children, onClick, title, danger }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${danger ? "hover:bg-red-500/20 text-white/40 hover:text-red-400" : "hover:bg-white/10 text-white/40 hover:text-white"}`}
    >
      {children}
    </button>
  );
}

function LandingModal({ tracks, editing, onClose, onSaved }) {
  const [form, setForm] = useState(() => editing
    ? {
        track_id: editing.track_id, slug: editing.slug, is_active: editing.is_active !== false,
        preview_limit_seconds: editing.preview_limit_seconds || 0,
        background_url: editing.background_url || "", background_type: editing.background_type || "image",
        accent_color: editing.accent_color || "#ff5833",
        title_override: editing.title_override || "", artist_override: editing.artist_override || "",
      }
    : { track_id: "", slug: "", is_active: true, preview_limit_seconds: 30, background_url: "", background_type: "image", accent_color: "#ff5833", title_override: "", artist_override: "" }
  );
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.track_id) { alert("Selecciona un soundtrack"); return; }
    setSaving(true);
    try {
      if (editing) {
        await base44.entities.ReleaseLanding.update(editing.id, {
          is_active: form.is_active,
          preview_limit_seconds: Number(form.preview_limit_seconds) || 0,
          background_url: form.background_url, background_type: form.background_type,
          accent_color: form.accent_color,
          title_override: form.title_override, artist_override: form.artist_override,
        });
      } else {
        const track = tracks.find((t) => t.id === form.track_id);
        const slug = await ensureUniqueLandingSlug(form.slug || track?.title || "release");
        await base44.entities.ReleaseLanding.create({
          track_id: form.track_id, slug,
          is_active: form.is_active,
          preview_limit_seconds: Number(form.preview_limit_seconds) || 0,
          background_url: form.background_url, background_type: form.background_type,
          accent_color: form.accent_color,
          title_override: form.title_override, artist_override: form.artist_override,
        });
      }
      onSaved();
    } catch (err) {
      alert("Error al guardar: " + (err?.message || err));
    } finally {
      setSaving(false);
    }
  };

  const selectedTrack = tracks.find((t) => t.id === form.track_id);
  const availableTracks = editing ? null : tracks.filter((t) => true);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 flex items-end sm:items-center justify-center sm:p-4 z-[999999]">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
        <motion.div
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="relative w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl flex flex-col"
          style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.07)", maxHeight: "92vh" }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <h3 className="text-sm font-bold text-white">{editing ? "Editar landing" : "Nueva landing"}</h3>
            <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/8"><X className="w-3.5 h-3.5 text-white/40" /></button>
          </div>

          <form onSubmit={submit} className="overflow-y-auto flex-1 px-5 py-5 space-y-4">
            {!editing && (
              <div>
                <label className={lbl}>Soundtrack *</label>
                <select value={form.track_id} onChange={(e) => {
                  const t = tracks.find((x) => x.id === e.target.value);
                  setForm((f) => ({ ...f, track_id: e.target.value, slug: f.slug || (t ? t.slug || "" : "") }));
                }} className={inp} required>
                  <option value="">Selecciona un soundtrack</option>
                  {availableTracks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select>
              </div>
            )}

            {editing && (
              <div>
                <label className={lbl}>URL (slug)</label>
                <input value={form.slug} disabled className={inp + " opacity-50"} />
                <p className="text-[10px] text-white/25 mt-1">/release/{form.slug}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Título (override)</label>
                <input value={form.title_override} onChange={(e) => setForm((f) => ({ ...f, title_override: e.target.value }))} placeholder={selectedTrack?.title || "Usa el del track"} className={inp} />
              </div>
              <div>
                <label className={lbl}>Artista (override)</label>
                <input value={form.artist_override} onChange={(e) => setForm((f) => ({ ...f, artist_override: e.target.value }))} placeholder={selectedTrack?.display_artist || "Usa el del track"} className={inp} />
              </div>
            </div>

            <div>
              <label className={lbl}>Vista previa (segundos · 0 = completo)</label>
              <input type="number" min="0" value={form.preview_limit_seconds} onChange={(e) => setForm((f) => ({ ...f, preview_limit_seconds: e.target.value }))} className={inp} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Fondo (URL)</label>
                <input value={form.background_url} onChange={(e) => setForm((f) => ({ ...f, background_url: e.target.value }))} placeholder="Imagen o video" className={inp} />
              </div>
              <div>
                <label className={lbl}>Tipo de fondo</label>
                <select value={form.background_type} onChange={(e) => setForm((f) => ({ ...f, background_type: e.target.value }))} className={inp}>
                  <option value="image">Imagen</option>
                  <option value="video">Video</option>
                </select>
              </div>
            </div>

            <div>
              <label className={lbl}>Color de acento</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.accent_color} onChange={(e) => setForm((f) => ({ ...f, accent_color: e.target.value }))} className="w-10 h-10 rounded-lg bg-transparent border border-white/10 cursor-pointer" />
                <input value={form.accent_color} onChange={(e) => setForm((f) => ({ ...f, accent_color: e.target.value }))} className={inp} />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-orange-500" />
              <span className="text-sm text-white/70">Landing activa y pública</span>
            </label>

            <div className="flex gap-2 pt-2 pb-2">
              <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-medium text-white/40 hover:text-white" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>Cancelar</button>
              <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl text-sm font-bold text-black flex items-center justify-center gap-2" style={{ background: "white" }}>
                {saving ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <><Check className="w-4 h-4" />{editing ? "Guardar" : "Crear landing"}</>}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}