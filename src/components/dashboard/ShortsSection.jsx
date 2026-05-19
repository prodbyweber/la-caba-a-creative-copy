import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Trash2, Play, Loader2, Check, Pencil, Globe, Lock, Zap, ExternalLink, Search, Music2, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// ── Helpers ──────────────────────────────────────────────────────────────────
function getYoutubeId(url) {
  if (!url) return null;
  // Shorts: youtube.com/shorts/ID
  const shorts = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shorts) return shorts[1];
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function getThumbnail(url) {
  const id = getYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
}

const ic = "w-full px-3 py-2.5 bg-white/5 border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-white/25 placeholder-white/20 transition-colors";

// ── User search picker ────────────────────────────────────────────────────────
function UserSearchPicker({ onAdd, addedIds = [] }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const profiles = await base44.entities.UserProfile.list("-created_date", 50);
        const q = query.toLowerCase();
        setResults(
          profiles.filter(p =>
            !addedIds.includes(p.id) &&
            ((p.display_name || "").toLowerCase().includes(q) ||
             (p.username || "").toLowerCase().includes(q) ||
             (p.artist_name || "").toLowerCase().includes(q))
          ).slice(0, 6)
        );
      } finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [query, addedIds.join(",")]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          className={ic + " pl-9"}
          placeholder="Buscar usuario por nombre o @usuario..."
        />
        {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 animate-spin" />}
      </div>
      {results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-xl border border-white/[0.08] overflow-hidden"
          style={{ background: "#1a1a1a" }}>
          {results.map(p => (
            <button key={p.id} type="button"
              onClick={() => { onAdd(p); setQuery(""); setResults([]); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.06] transition-colors text-left">
              {p.avatar_url || p.profile_photo_url
                ? <img src={p.avatar_url || p.profile_photo_url} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                : <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-3.5 h-3.5 text-white/30" />
                  </div>
              }
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{p.display_name || p.artist_name || p.username}</p>
                {p.username && <p className="text-[10px] text-white/30">@{p.username}</p>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Short Form Modal ──────────────────────────────────────────────────────────
function ShortFormModal({ onClose, onSave, artistId, editingShort = null }) {
  const isEdit = !!editingShort;
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState(() => ({
    title: editingShort?.title || "",
    youtube_url: editingShort?.youtube_url || "",
    thumbnail_url: editingShort?.thumbnail_url || "",
    collaborators: editingShort?.collaborators || [], // [{id, display_name, username, avatar_url}]
    track_id: editingShort?.track_id || "",           // soundtrack vinculado (opcional)
  }));

  const ytId = getYoutubeId(form.youtube_url);
  const ytThumb = ytId ? getThumbnail(form.youtube_url) : null;

  // Cargar TODOS los soundtracks públicos (de cualquier artista)
  const { data: allPublicTracks = [] } = useQuery({
    queryKey: ["all-public-tracks"],
    queryFn: async () => base44.entities.Track.filter({ is_public: true }),
    enabled: true,
  });

  const [trackSearch, setTrackSearch] = useState("");
  const filteredTracks = trackSearch.trim()
    ? allPublicTracks.filter(t =>
        t.title?.toLowerCase().includes(trackSearch.toLowerCase()) ||
        (t.composers || []).join(" ").toLowerCase().includes(trackSearch.toLowerCase()) ||
        (t.producers || []).join(" ").toLowerCase().includes(trackSearch.toLowerCase())
      )
    : allPublicTracks;

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(f => ({ ...f, thumbnail_url: file_url }));
    } finally { setUploading(false); }
  };

  const addCollaborator = (profile) => {
    if (form.collaborators.find(c => c.id === profile.id)) return;
    setForm(f => ({
      ...f,
      collaborators: [...f.collaborators, {
        id: profile.id,
        display_name: profile.display_name || profile.artist_name || profile.username,
        username: profile.username,
        avatar_url: profile.avatar_url || profile.profile_photo_url || null,
      }]
    }));
  };

  const removeCollaborator = (id) => {
    setForm(f => ({ ...f, collaborators: f.collaborators.filter(c => c.id !== id) }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { alert("El título es obligatorio"); return; }
    if (!form.youtube_url.trim()) { alert("Añade la URL del Short de YouTube"); return; }
    if (!ytId) { alert("URL de YouTube inválida"); return; }
    setLoading(true);
    const payload = {
      title: form.title,
      content_type: "short",
      youtube_url: form.youtube_url,
      thumbnail_url: form.thumbnail_url || ytThumb || undefined,
      artist_id: artistId || undefined,
      collaborators: form.collaborators,
      track_id: form.track_id || undefined,
      is_active: true,
    };
    try {
      if (isEdit) {
        await base44.entities.ExplorarItem.update(editingShort.id, payload);
      } else {
        await base44.entities.ExplorarItem.create(payload);
      }
      onSave();
      onClose();
    } finally { setLoading(false); }
  };

  return ReactDOM.createPortal(
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] bg-black/90 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="bg-[#111] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg overflow-hidden max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
          <div>
            <p className="text-sm font-bold text-white">{isEdit ? "Editar short" : "Nuevo short"}</p>
            <p className="text-[10px] text-white/25 mt-0.5">YouTube Shorts / Reels / TikTok</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">

          {/* URL + preview */}
          <div>
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block mb-2">URL de YouTube Shorts *</label>
            <input
              value={form.youtube_url}
              onChange={e => setForm(f => ({ ...f, youtube_url: e.target.value }))}
              className={ic}
              placeholder="https://youtube.com/shorts/... o youtu.be/..."
            />
            {ytId && (
              <div className="mt-2.5 flex items-center gap-3">
                <div className="relative rounded-xl overflow-hidden bg-black/50 flex-shrink-0"
                  style={{ aspectRatio: "9/16", height: 120 }}>
                  <img src={ytThumb} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="w-3 h-3 text-black ml-0.5" fill="black" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-white/40 mb-1">Preview detectado</p>
                  <p className="text-[11px] text-emerald-400 font-semibold">✓ Video válido</p>
                </div>
              </div>
            )}
          </div>

          {/* Título */}
          <div>
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block mb-2">Título *</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className={ic}
              placeholder="Nombre del short"
            />
          </div>

          {/* Portada: informativo, no editable */}
          <div className="px-3 py-2.5 rounded-xl border border-white/[0.06] flex items-center gap-3">
            {ytId
              ? <img src={ytThumb} alt="" className="w-8 h-12 object-cover rounded-lg flex-shrink-0" />
              : <div className="w-8 h-12 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0"><Zap className="w-3.5 h-3.5 text-white/20" /></div>
            }
            <div>
              <p className="text-[10px] text-white/40 font-semibold">Portada</p>
              <p className="text-[10px] text-white/20 mt-0.5">Se usa automáticamente la miniatura de YouTube</p>
            </div>
          </div>

          {/* Soundtrack vinculado */}
          <div>
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block mb-2">
              Soundtrack <span className="text-white/15 normal-case font-normal">(opcional)</span>
            </label>
            <div className="space-y-2">
              {/* Buscador */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
                <input
                  value={trackSearch}
                  onChange={e => setTrackSearch(e.target.value)}
                  className={ic + " pl-9"}
                  placeholder="Buscar soundtrack..."
                />
              </div>
              {/* Sin soundtrack */}
              <button type="button"
                onClick={() => setForm(f => ({ ...f, track_id: "" }))}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors"
                style={{
                  background: !form.track_id ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
                  border: !form.track_id ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(255,255,255,0.06)",
                }}>
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Music2 className="w-3.5 h-3.5 text-white/20" />
                </div>
                <span className="text-xs text-white/40">Sin soundtrack</span>
              </button>
              {/* Lista */}
              {allPublicTracks.length === 0 ? (
                <p className="text-[11px] text-white/20 px-3 py-2">No hay soundtracks públicos en la plataforma aún.</p>
              ) : filteredTracks.length === 0 ? (
                <p className="text-[11px] text-white/20 px-3 py-2">Sin resultados para "{trackSearch}"</p>
              ) : (
                <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
                  {filteredTracks.map(track => (
                    <button key={track.id} type="button"
                      onClick={() => setForm(f => ({ ...f, track_id: track.id }))}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-left"
                      style={{
                        background: form.track_id === track.id ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.03)",
                        border: form.track_id === track.id ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(255,255,255,0.06)",
                      }}>
                      {track.cover_url
                        ? <img src={track.cover_url} className="w-7 h-7 rounded-lg object-cover flex-shrink-0" />
                        : <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                            <Music2 className="w-3.5 h-3.5 text-white/20" />
                          </div>
                      }
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white truncate">{track.title}</p>
                        {(track.composers?.length > 0 || track.producers?.length > 0) && (
                          <p className="text-[10px] text-white/30 truncate">
                            {[...(track.composers || []), ...(track.producers || [])].slice(0, 2).join(", ")}
                          </p>
                        )}
                      </div>
                      {form.track_id === track.id && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Colaboradores */}
          <div>
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block mb-2">
              Colaboradores <span className="text-white/15 normal-case font-normal">(opcional)</span>
            </label>
            <UserSearchPicker onAdd={addCollaborator} addedIds={form.collaborators.map(c => c.id)} />
            {form.collaborators.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-2">
                {form.collaborators.map(c => (
                  <div key={c.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }}>
                    {c.avatar_url
                      ? <img src={c.avatar_url} className="w-5 h-5 rounded-full object-cover" />
                      : <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                          <Users className="w-3 h-3 text-white/30" />
                        </div>
                    }
                    <span className="text-xs text-white/70 font-medium">{c.display_name}</span>
                    {c.username && <span className="text-[10px] text-white/30">@{c.username}</span>}
                    <button type="button" onClick={() => removeCollaborator(c.id)}
                      className="ml-0.5 text-white/25 hover:text-white/60 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="flex gap-2 p-5 border-t border-white/[0.06] flex-shrink-0">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-colors">
            Cancelar
          </button>
          <button type="button" onClick={handleSubmit} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-white text-black text-sm font-bold hover:bg-white/90 disabled:opacity-30 flex items-center justify-center gap-2 transition-colors">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> {isEdit ? "Guardar" : "Añadir short"}</>}
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

// ── Short Card (portrait 9:16 poster with inline YT player) ──────────────────
function ShortCard({ short, onEdit, onDelete, onTogglePublic }) {
  const [playing, setPlaying] = useState(false);
  const thumb = short.thumbnail_url || getThumbnail(short.youtube_url);
  const ytId = getYoutubeId(short.youtube_url);
  const isPublic = short.is_active !== false;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="group relative flex-shrink-0 w-[130px]">
      {/* Poster / Player */}
      <div className="relative rounded-xl overflow-hidden bg-black"
        style={{ aspectRatio: "9/16" }}>

        {playing && ytId ? (
          /* Inline YouTube embed (9:16) */
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <>
            {thumb
              ? <img src={thumb} alt={short.title} className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0b] flex items-center justify-center">
                  <Zap className="w-7 h-7 text-white/15" />
                </div>
            }
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            {/* YT badge */}
            <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold"
              style={{ background: "rgba(255,0,0,0.75)", color: "white" }}>
              SHORT
            </div>

            {/* Title bottom */}
            <div className="absolute bottom-10 left-0 right-0 px-2 pb-1">
              <p className="text-white font-bold text-[10px] leading-tight line-clamp-2">{short.title}</p>
            </div>

            {/* Play button — centered */}
            {ytId && (
              <button
                onClick={() => setPlaying(true)}
                className="absolute inset-0 flex items-center justify-center group/play"
              >
                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover/play:opacity-100 transition-opacity shadow-lg">
                  <Play className="w-4 h-4 text-black ml-0.5" fill="black" />
                </div>
              </button>
            )}
          </>
        )}

        {/* Stop button when playing */}
        {playing && (
          <button
            onClick={() => setPlaying(false)}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center z-10 hover:bg-black/90 transition-colors">
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        )}
      </div>

      {/* Action row below poster */}
      <div className="flex items-center justify-between mt-1.5 gap-1">
        <button onClick={() => onTogglePublic(short)}
          className={`p-1.5 rounded-lg transition-colors ${isPublic ? "bg-emerald-500/15" : "bg-white/5"}`}>
          {isPublic ? <Globe className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-white/25" />}
        </button>
        <button onClick={() => onEdit(short)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
          <Pencil className="w-3 h-3 text-white/40" />
        </button>
        {short.youtube_url && (
          <a href={short.youtube_url} target="_blank" rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <ExternalLink className="w-3 h-3 text-white/40" />
          </a>
        )}
        <button onClick={() => onDelete(short.id)} className="p-1.5 rounded-lg bg-white/5 hover:bg-red-900/60 transition-colors">
          <Trash2 className="w-3 h-3 text-white/30 hover:text-red-400" />
        </button>
      </div>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ShortsSection({ artistId, userProfileId }) {
  const [showModal, setShowModal] = useState(false);
  const [editingShort, setEditingShort] = useState(null);
  const [playingYt, setPlayingYt] = useState(null);
  const qc = useQueryClient();

  const { data: shorts = [], isLoading, refetch } = useQuery({
    queryKey: ["artist-shorts", artistId, userProfileId],
    queryFn: async () => {
      let items = [];
      if (artistId) {
        items = await base44.entities.ExplorarItem.filter({ artist_id: artistId, content_type: "short" });
      } else {
        const all = await base44.entities.ExplorarItem.list("-created_date", 100);
        const me = await base44.auth.me();
        items = all.filter(i => i.created_by === me?.email && i.content_type === "short");
      }
      return items;
    },
    enabled: !!(artistId || userProfileId),
  });

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este short?")) return;
    await base44.entities.ExplorarItem.delete(id);
    refetch();
  };

  const handleTogglePublic = async (short) => {
    await base44.entities.ExplorarItem.update(short.id, { is_active: !short.is_active });
    refetch();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ overflow: "visible" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-white/30" />
          <h3 className="text-sm font-bold text-white">Shorts</h3>
          {shorts.length > 0 && (
            <span className="text-[10px] text-white/25 px-1.5 py-0.5 bg-white/5 rounded-full">{shorts.length}</span>
          )}
        </div>
        <button
          onClick={() => { setEditingShort(null); setShowModal(true); }}
          className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-3 h-3" />
          <span className="hidden lg:inline">Nuevo short</span>
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex gap-3 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[110px] rounded-xl bg-white/5 animate-pulse" style={{ aspectRatio: "9/16" }} />
          ))}
        </div>
      ) : shorts.length === 0 ? (
        <button
          onClick={() => setShowModal(true)}
          className="w-full py-16 rounded-2xl border border-dashed border-white/[0.06] flex flex-col items-center gap-3 hover:border-white/15 transition-colors"
        >
          <Zap className="w-8 h-8 text-white/10" />
          <div className="text-center">
            <p className="text-xs text-white/25">Sin shorts aún</p>
            <p className="text-[10px] text-white/[0.12] mt-0.5">Añade tus YouTube Shorts con un link</p>
          </div>
        </button>
      ) : (
        <div style={{ overflowX: "auto", overflowY: "visible", scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <div className="flex gap-3 pb-2" style={{ width: "max-content" }}>
            {shorts.map(short => (
              <ShortCard
                key={short.id}
                short={short}
                onEdit={s => { setEditingShort(s); setShowModal(true); }}
                onDelete={handleDelete}
                onTogglePublic={handleTogglePublic}
                onPlay={setPlayingYt}
              />
            ))}
          </div>
        </div>
      )}

      {/* Form modal */}
      <AnimatePresence>
        {showModal && (
          <ShortFormModal
            onClose={() => { setShowModal(false); setEditingShort(null); }}
            onSave={() => { refetch(); qc.invalidateQueries({ queryKey: ["explorar-items"] }); }}
            artistId={artistId}
            editingShort={editingShort}
          />
        )}
      </AnimatePresence>

      {/* YouTube player overlay */}
      <AnimatePresence>
        {playingYt && ReactDOM.createPortal(
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[700] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setPlayingYt(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="relative w-full max-w-xs" onClick={e => e.stopPropagation()}>
              <button onClick={() => setPlayingYt(null)}
                className="absolute -top-10 right-0 p-2 text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              {/* 9:16 player for shorts */}
              <div className="relative rounded-xl overflow-hidden" style={{ paddingBottom: "177.78%" }}>
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${playingYt}?autoplay=1&rel=0`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>,
          document.body
        )}
      </AnimatePresence>
    </motion.div>
  );
}