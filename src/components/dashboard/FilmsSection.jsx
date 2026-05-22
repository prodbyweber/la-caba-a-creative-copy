import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, X, Trash2, Play, Loader2, Upload, Film, Check,
  ExternalLink, Pencil, Globe, Lock, ChevronDown, ChevronRight, Tv
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// ── Helpers ────────────────────────────────────────────────────────────────
function getYoutubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}
function getYoutubeThumbnail(url) {
  const id = getYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

const CONTENT_TYPES = [
  { value: "minifilm",   label: "Mini Film" },
  { value: "film",       label: "Film / Cortometraje" },
  { value: "videoclip",  label: "Videoclip" },
  { value: "visualizer", label: "Visualizer" },
  { value: "series",     label: "Serie" },
];

const GENRES = [
  "Drama","Documental","Comedia","Acción","Thriller","Horror",
  "Fantasía","Ciencia Ficción","Romance","Aventura","Musical",
  "Experimental","Animación","Trap","Hip-Hop","R&B","Electrónica","Otro",
];

const CREDIT_ROLES = [
  { key: "director",       label: "Dirección" },
  { key: "producer",       label: "Producción" },
  { key: "cinematographer",label: "Cinematografía" },
  { key: "editor",         label: "Edición" },
  { key: "sound_engineer", label: "Sonido" },
  { key: "art_direction",  label: "Dirección de arte" },
  { key: "actress",        label: "Actriz" },
  { key: "actor",          label: "Actor" },
  { key: "music_producer", label: "Productor musical" },
  { key: "composer",       label: "Compositor" },
  { key: "other",          label: "Otro" },
];

const ic = "w-full px-3 py-2.5 bg-white/5 border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-white/25 placeholder-white/20 transition-colors";

// ── Series Season/Episode Manager ─────────────────────────────────────────
function SeasonsManager({ seasons, onChange }) {
  const addSeason = () => {
    onChange([...seasons, { number: seasons.length + 1, title: "", synopsis: "", episodes: [] }]);
  };
  const updateSeason = (si, field, val) => {
    const s = seasons.map((s, i) => i === si ? { ...s, [field]: val } : s);
    onChange(s);
  };
  const removeSeason = (si) => onChange(seasons.filter((_, i) => i !== si));

  const addEpisode = (si) => {
    const s = seasons.map((season, i) => i === si
      ? { ...season, episodes: [...(season.episodes || []), { number: (season.episodes?.length || 0) + 1, title: "", youtube_url: "", synopsis: "" }] }
      : season
    );
    onChange(s);
  };
  const updateEpisode = (si, ei, field, val) => {
    const s = seasons.map((season, i) => i === si
      ? { ...season, episodes: season.episodes.map((ep, j) => j === ei ? { ...ep, [field]: val } : ep) }
      : season
    );
    onChange(s);
  };
  const removeEpisode = (si, ei) => {
    const s = seasons.map((season, i) => i === si
      ? { ...season, episodes: season.episodes.filter((_, j) => j !== ei) }
      : season
    );
    onChange(s);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Temporadas</p>
        <button type="button" onClick={addSeason}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-xs transition-colors">
          <Plus className="w-3 h-3" /> Temporada
        </button>
      </div>
      {seasons.map((season, si) => (
        <div key={si} className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.03]">
            <Tv className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
            <input value={season.title || `Temporada ${season.number}`}
              onChange={e => updateSeason(si, "title", e.target.value)}
              className="flex-1 bg-transparent text-white text-xs font-semibold focus:outline-none placeholder-white/20"
              placeholder={`Temporada ${season.number}`} />
            <button type="button" onClick={() => removeSeason(si)}
              className="p-1 rounded hover:bg-red-500/20 text-white/20 hover:text-red-400 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="px-3 pb-2 pt-1.5 space-y-1.5">
            <textarea value={season.synopsis || ""} onChange={e => updateSeason(si, "synopsis", e.target.value)}
              className="w-full bg-transparent text-white/50 text-[11px] focus:outline-none resize-none placeholder-white/15"
              rows={1} placeholder="Sinopsis de la temporada (opcional)" />
            {(season.episodes || []).map((ep, ei) => (
              <div key={ei} className="grid grid-cols-[auto_1fr_1fr_auto] gap-1.5 items-center">
                <span className="text-[10px] text-white/25 w-5 text-center">{ep.number}</span>
                <input value={ep.title} onChange={e => updateEpisode(si, ei, "title", e.target.value)}
                  className="px-2 py-1.5 bg-white/5 rounded-lg text-white text-xs focus:outline-none placeholder-white/15"
                  placeholder="Título episodio" />
                <input value={ep.youtube_url} onChange={e => updateEpisode(si, ei, "youtube_url", e.target.value)}
                  className="px-2 py-1.5 bg-white/5 rounded-lg text-white text-xs focus:outline-none placeholder-white/15"
                  placeholder="URL YouTube" />
                <button type="button" onClick={() => removeEpisode(si, ei)}
                  className="p-1 rounded hover:bg-red-500/20 text-white/20 hover:text-red-400">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addEpisode(si)}
              className="w-full py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] text-white/30 hover:text-white/60 text-[10px] flex items-center justify-center gap-1 transition-colors">
              <Plus className="w-3 h-3" /> Episodio
            </button>
          </div>
        </div>
      ))}
      {seasons.length === 0 && (
        <button type="button" onClick={addSeason}
          className="w-full py-4 rounded-xl border border-dashed border-white/[0.07] text-white/25 text-xs hover:border-white/15 transition-colors flex items-center justify-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Añadir primera temporada
        </button>
      )}
    </div>
  );
}

// ── Film Form Modal ────────────────────────────────────────────────────────
function FilmFormModal({ onClose, onSave, artistId, allArtists = [], editingFilm = null }) {
  const isEdit = !!editingFilm;
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState(() => {
    if (editingFilm) {
      return {
        title: editingFilm.title || "",
        content_type: editingFilm.content_type || "film",
        genres: editingFilm.genres || (editingFilm.subtitle ? [editingFilm.subtitle] : []),
        year: editingFilm.year || new Date().getFullYear(),
        description: editingFilm.description || "",
        youtube_url: editingFilm.youtube_url || "",
        thumbnail_url: editingFilm.thumbnail_url || "",
        custom_thumbnail: !!(editingFilm.thumbnail_url && editingFilm.thumbnail_url !== getYoutubeThumbnail(editingFilm.youtube_url)),
        credits: (editingFilm.credits || []).map((c, i) => ({
          ...c, id: c.id || i.toString(),
          role: CREDIT_ROLES.find(r => r.label === c.role)?.key || c.role || "",
        })),
        seasons: editingFilm.gallery?.filter(g => g.type === "season").length > 0
          ? [] // will parse from description/notes
          : (editingFilm.seasons || []),
      };
    }
    return {
      title: "", content_type: "film",
      genres: [], year: new Date().getFullYear(),
      description: "", youtube_url: "",
      thumbnail_url: "", custom_thumbnail: false,
      credits: [], seasons: [],
    };
  });

  // Parse stored seasons from ExplorarItem.description if it's a series
  React.useEffect(() => {
    if (editingFilm?.content_type === "series" && editingFilm.description) {
      try {
        const parsed = JSON.parse(editingFilm.description);
        if (parsed.__seasons) {
          setForm(f => ({ ...f, seasons: parsed.__seasons, description: parsed.text || "" }));
        }
      } catch {}
    }
  }, []);

  const [newCredit, setNewCredit] = useState({ role: "", name: "", artist_id: "" });
  const isSeries = form.content_type === "series";
  const ytId = getYoutubeId(form.youtube_url);
  const ytThumb = ytId ? getYoutubeThumbnail(form.youtube_url) : null;
  const displayThumb = form.custom_thumbnail ? form.thumbnail_url : (form.thumbnail_url || ytThumb);

  const toggleGenre = (g) => {
    setForm(f => ({
      ...f,
      genres: f.genres.includes(g) ? f.genres.filter(x => x !== g) : [...f.genres, g].slice(0, 3)
    }));
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(f => ({ ...f, thumbnail_url: file_url, custom_thumbnail: true }));
    } finally { setUploading(false); }
  };

  const addCredit = () => {
    if (!newCredit.role || (!newCredit.name && !newCredit.artist_id)) return;
    const artist = allArtists.find(a => a.id === newCredit.artist_id);
    setForm(f => ({
      ...f, credits: [...f.credits, {
        id: Date.now().toString(), role: newCredit.role,
        artist_id: newCredit.artist_id || null,
        name: newCredit.name || artist?.stageName || "",
      }]
    }));
    setNewCredit({ role: "", name: "", artist_id: "" });
  };

  const handleSubmit = async () => {
    if (!form.title) { alert("El título es obligatorio"); return; }
    if (!isSeries && !form.youtube_url) { alert("Añade una URL de YouTube"); return; }
    setLoading(true);

    // Serialize seasons into description for series
    const descriptionPayload = isSeries
      ? JSON.stringify({ __seasons: form.seasons, text: form.description })
      : form.description;

    const payload = {
      title: form.title,
      content_type: form.content_type,
      subtitle: form.genres[0] || "",
      genres: form.genres,
      year: Number(form.year),
      description: descriptionPayload,
      youtube_url: form.youtube_url || undefined,
      thumbnail_url: displayThumb || undefined,
      artist_id: artistId || undefined,
      credits: form.credits.map(c => ({
        artist_id: c.artist_id || undefined,
        role: CREDIT_ROLES.find(r => r.key === c.role)?.label || c.role,
        name: c.name,
      })),
    };

    try {
      let item;
      if (isEdit) {
        item = await base44.entities.ExplorarItem.update(editingFilm.id, { ...payload, is_active: editingFilm.is_active });
      } else {
        item = await base44.entities.ExplorarItem.create({ ...payload, is_active: true });
        // Auto-create Project linked to this film
        await base44.entities.Project.create({
          title: form.title,
          type: form.content_type === "series" ? "Serie"
            : form.content_type === "minifilm" ? "MiniFilm"
            : form.content_type === "videoclip" ? "Single"
            : "Film",
          artist_id: artistId || undefined,
          cover_url: displayThumb || undefined,
          description: form.description,
          status: "Draft",
          is_public: false,
          explorar_item_id: item?.id,
        });
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
        className="bg-[#111] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-xl overflow-hidden max-h-[94vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
          <p className="text-sm font-bold text-white">{isEdit ? "Editar proyecto" : "Nuevo proyecto"}</p>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {/* Tipo */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Tipo de proyecto</p>
            <div className="flex flex-wrap gap-2">
              {CONTENT_TYPES.map(t => (
                <button key={t.value} type="button"
                  onClick={() => setForm(f => ({ ...f, content_type: t.value }))}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: form.content_type === t.value ? "white" : "rgba(255,255,255,0.06)",
                    color: form.content_type === t.value ? "black" : "rgba(255,255,255,0.4)",
                    border: form.content_type === t.value ? "1px solid white" : "1px solid rgba(255,255,255,0.08)",
                  }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Título */}
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className={ic} placeholder="Título del proyecto *" />

          {/* Géneros */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Géneros <span className="text-white/15 normal-case font-normal">(máx. 3)</span></p>
            <div className="flex flex-wrap gap-1.5">
              {GENRES.map(g => (
                <button key={g} type="button" onClick={() => toggleGenre(g)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium transition-all"
                  style={{
                    background: form.genres.includes(g) ? "rgba(255,88,51,0.2)" : "rgba(255,255,255,0.04)",
                    color: form.genres.includes(g) ? "#ff7a5a" : "rgba(255,255,255,0.35)",
                    border: form.genres.includes(g) ? "1px solid rgba(255,88,51,0.4)" : "1px solid rgba(255,255,255,0.06)",
                  }}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Año + descripción */}
          <div className="grid grid-cols-2 gap-2">
            <input value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
              className={ic} placeholder="Año" type="number" min={1990} max={2099} />
            <div />
          </div>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className={ic + " resize-none"} rows={2} placeholder="Sinopsis / Descripción" />

          {/* Contenido — YouTube + portada */}
          {!isSeries && (
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Contenido</p>
              <div>
                <label className="text-[10px] text-white/40 mb-1 block">URL de YouTube *</label>
                <input value={form.youtube_url} onChange={e => setForm(f => ({ ...f, youtube_url: e.target.value, custom_thumbnail: false, thumbnail_url: "" }))}
                  className={ic} placeholder="https://youtube.com/watch?v=..." />
              </div>
            </div>
          )}

          {/* Portada */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Portada</p>
            {displayThumb ? (
              <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: "16/9", maxHeight: 160 }}>
                <img src={displayThumb} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
                  <label className="px-3 py-1.5 bg-white text-black text-xs font-bold rounded-lg cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                    Cambiar
                  </label>
                  {form.custom_thumbnail && (
                    <button type="button" onClick={() => setForm(f => ({ ...f, custom_thumbnail: false, thumbnail_url: "" }))}
                      className="px-3 py-1.5 bg-black/70 text-white text-xs rounded-lg">
                      Usar YouTube
                    </button>
                  )}
                </div>
                {uploading && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Loader2 className="w-5 h-5 text-white animate-spin" /></div>}
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 py-5 rounded-xl border border-dashed border-white/10 cursor-pointer hover:border-white/25 transition-colors">
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                {uploading ? <Loader2 className="w-5 h-5 text-white/30 animate-spin" /> : <Upload className="w-5 h-5 text-white/20" />}
                <span className="text-xs text-white/25">{uploading ? "Subiendo..." : "Portada personalizada (opcional)"}</span>
              </label>
            )}
          </div>

          {/* Series: seasons manager */}
          {isSeries && <SeasonsManager seasons={form.seasons} onChange={s => setForm(f => ({ ...f, seasons: s }))} />}

          {/* Créditos */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Créditos</p>
            <div className="grid grid-cols-3 gap-2">
              <select value={newCredit.role} onChange={e => setNewCredit(c => ({ ...c, role: e.target.value }))} className={ic}>
                <option value="">Rol</option>
                {CREDIT_ROLES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
              </select>
              <input value={newCredit.name} onChange={e => setNewCredit(c => ({ ...c, name: e.target.value }))} className={ic} placeholder="Nombre" />
              <select value={newCredit.artist_id} onChange={e => setNewCredit(c => ({ ...c, artist_id: e.target.value }))} className={ic}>
                <option value="">Artista (opc.)</option>
                {allArtists.map(a => <option key={a.id} value={a.id}>{a.stageName}</option>)}
              </select>
            </div>
            <button type="button" onClick={addCredit} disabled={!newCredit.role || (!newCredit.name && !newCredit.artist_id)}
              className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold disabled:opacity-30 flex items-center justify-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Añadir crédito
            </button>
            {form.credits.length > 0 && (
              <div className="space-y-1.5">
                {form.credits.map(c => (
                  <div key={c.id} className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg">
                    <span className="text-xs text-white/60">{CREDIT_ROLES.find(r => r.key === c.role)?.label || c.role} — {c.name}</span>
                    <button type="button" onClick={() => setForm(f => ({ ...f, credits: f.credits.filter(x => x.id !== c.id) }))}
                      className="p-1 hover:bg-red-500/20 rounded text-white/30 hover:text-red-400">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 p-5 border-t border-white/[0.06] flex-shrink-0">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-colors">
            Cancelar
          </button>
          <button type="button" onClick={handleSubmit} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-white text-black text-sm font-bold hover:bg-white/90 disabled:opacity-30 flex items-center justify-center gap-2 transition-colors">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> {isEdit ? "Guardar" : "Crear proyecto"}</>}
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

// ── Series Card (Netflix style) ────────────────────────────────────────────
function SeriesCard({ film, onEdit, onDelete, onTogglePublic, onPlay }) {
  let seasons = [];
  try {
    const parsed = JSON.parse(film.description || "{}");
    if (parsed.__seasons) seasons = parsed.__seasons;
  } catch {}

  const totalEps = seasons.reduce((acc, s) => acc + (s.episodes?.length || 0), 0);
  const thumb = film.thumbnail_url || getYoutubeThumbnail(film.youtube_url);
  const isPublic = film.is_active !== false;
  const firstYtId = getYoutubeId(film.youtube_url) ||
    (seasons[0]?.episodes?.[0] ? getYoutubeId(seasons[0].episodes[0].youtube_url) : null);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="group flex gap-3 items-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition-colors">
      <div className="relative w-28 h-16 rounded-lg overflow-hidden bg-black/50 flex-shrink-0">
        {thumb ? (
          <img src={thumb} alt={film.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0b] flex items-center justify-center">
            <Tv className="w-6 h-6 text-white/15" />
          </div>
        )}
        {firstYtId && (
          <button onClick={() => onPlay(firstYtId)}
            className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 transition-colors">
            <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
              <Play className="w-3.5 h-3.5 text-black ml-0.5" fill="black" />
            </div>
          </button>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white truncate">{film.title}</p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className="text-[9px] text-white/30 uppercase tracking-wider">Serie</span>
          {seasons.length > 0 && <span className="text-[9px] text-white/20">· {seasons.length} temp.</span>}
          {totalEps > 0 && <span className="text-[9px] text-white/20">· {totalEps} ep.</span>}
          {film.genres?.length > 0 && <span className="text-[9px] text-white/20">· {film.genres.slice(0,2).join(", ")}</span>}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button onClick={() => onTogglePublic(film)}
          className={`p-1.5 rounded-lg transition-colors ${isPublic ? "bg-emerald-500/15 hover:bg-emerald-500/25" : "bg-white/5 hover:bg-white/10"}`}>
          {isPublic ? <Globe className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-white/30" />}
        </button>
        <button onClick={() => onEdit(film)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
          <Pencil className="w-3 h-3 text-white/40" />
        </button>
        <button onClick={() => onDelete(film.id)} className="p-1.5 rounded-lg bg-black/40 hover:bg-red-900/60 transition-colors">
          <Trash2 className="w-3 h-3 text-white/40" />
        </button>
      </div>
    </motion.div>
  );
}

// ── Regular Film Row ───────────────────────────────────────────────────────
function FilmRow({ film, onEdit, onDelete, onTogglePublic, onPlay }) {
  const thumb = film.thumbnail_url || getYoutubeThumbnail(film.youtube_url || film.youtube_music_url);
  const ytId = getYoutubeId(film.youtube_url);
  const typeLabel = CONTENT_TYPES.find(t => t.value === film.content_type)?.label || film.content_type;
  const isPublic = film.is_active !== false;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="group flex gap-3 items-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition-colors">
      <div className="relative w-28 h-16 rounded-lg overflow-hidden bg-black/50 flex-shrink-0">
        {thumb ? (
          <img src={thumb} alt={film.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0b] flex items-center justify-center">
            <Film className="w-6 h-6 text-white/15" />
          </div>
        )}
        {ytId && (
          <button onClick={() => onPlay(ytId)}
            className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 transition-colors">
            <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
              <Play className="w-3.5 h-3.5 text-black ml-0.5" fill="black" />
            </div>
          </button>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white truncate">{film.title}</p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {typeLabel && <span className="text-[9px] text-white/30 uppercase tracking-wider">{typeLabel}</span>}
          {film.genres?.length > 0 && <span className="text-[9px] text-white/20">· {film.genres.slice(0,2).join(", ")}</span>}
          {film.year && <span className="text-[9px] text-white/20">· {film.year}</span>}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button onClick={() => onTogglePublic(film)}
          className={`p-1.5 rounded-lg transition-colors ${isPublic ? "bg-emerald-500/15 hover:bg-emerald-500/25" : "bg-white/5 hover:bg-white/10"}`}>
          {isPublic ? <Globe className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-white/30" />}
        </button>
        <button onClick={() => onEdit(film)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
          <Pencil className="w-3 h-3 text-white/40" />
        </button>
        {film.youtube_url && (
          <a href={film.youtube_url} target="_blank" rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-black/40 hover:bg-black/70 transition-colors">
            <ExternalLink className="w-3 h-3 text-white/40" />
          </a>
        )}
        <button onClick={() => onDelete(film.id)} className="p-1.5 rounded-lg bg-black/40 hover:bg-red-900/60 transition-colors">
          <Trash2 className="w-3 h-3 text-white/40" />
        </button>
      </div>
    </motion.div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function FilmsSection({ artistId, userProfileId, userEmail }) {
  const [showModal, setShowModal] = useState(false);
  const [editingFilm, setEditingFilm] = useState(null);
  const [playingYt, setPlayingYt] = useState(null);
  const qc = useQueryClient();

  const { data: films = [], isLoading, refetch } = useQuery({
    queryKey: ["artist-films", artistId, userProfileId, userEmail],
    queryFn: async () => {
      let items = [];
      if (artistId) {
        items = await base44.entities.ExplorarItem.filter({ artist_id: artistId });
      } else if (userEmail) {
        const all = await base44.entities.ExplorarItem.list("-created_date", 100);
        items = all.filter(i => i.created_by === userEmail);
      } else {
        return [];
      }
      return items.filter(i => ["film","minifilm","series","videoclip","visualizer"].includes(i.content_type));
    },
    enabled: !!(artistId || userProfileId || userEmail),
  });

  const { data: allArtists = [] } = useQuery({
    queryKey: ["artists"],
    queryFn: () => base44.entities.Artist.list(),
  });

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este proyecto?")) return;
    await base44.entities.ExplorarItem.delete(id);
    refetch();
    qc.invalidateQueries({ queryKey: ["projects"] });
  };

  const handleTogglePublic = async (film) => {
    await base44.entities.ExplorarItem.update(film.id, { is_active: !film.is_active });
    refetch();
  };

  const seriesFilms = films.filter(f => f.content_type === "series");
  const otherFilms = films.filter(f => f.content_type !== "series");

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-white/30" />
          <h3 className="text-sm font-bold text-white">Films</h3>
          {films.length > 0 && <span className="text-[10px] text-white/25 px-1.5 py-0.5 bg-white/5 rounded-full">{films.length}</span>}
        </div>
        <button onClick={() => { setEditingFilm(null); setShowModal(true); }}
          className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all">
          <Plus className="w-3 h-3" /> Nuevo proyecto
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />)}</div>
      ) : films.length === 0 ? (
        <button onClick={() => setShowModal(true)}
          className="w-full py-16 rounded-2xl border border-dashed border-white/[0.06] flex flex-col items-center gap-3 hover:border-white/15 transition-colors">
          <Film className="w-8 h-8 text-white/10" />
          <div className="text-center">
            <p className="text-xs text-white/25">Sin proyectos</p>
            <p className="text-[10px] text-white/[0.12] mt-0.5">Crea un film, videoclip, visualizer o serie</p>
          </div>
        </button>
      ) : (
        <div className="space-y-3">
          {/* Series — compact row style */}
          {seriesFilms.map(film => (
            <SeriesCard key={film.id} film={film}
              onEdit={f => { setEditingFilm(f); setShowModal(true); }}
              onDelete={handleDelete}
              onTogglePublic={handleTogglePublic}
              onPlay={setPlayingYt} />
          ))}
          {/* Other films — row style */}
          {otherFilms.length > 0 && (
            <div className="space-y-2">
              {otherFilms.map(film => (
                <FilmRow key={film.id} film={film}
                  onEdit={f => { setEditingFilm(f); setShowModal(true); }}
                  onDelete={handleDelete}
                  onTogglePublic={handleTogglePublic}
                  onPlay={setPlayingYt} />
              ))}
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <FilmFormModal
            onClose={() => { setShowModal(false); setEditingFilm(null); }}
            onSave={() => { refetch(); qc.invalidateQueries({ queryKey: ["projects"] }); }}
            artistId={artistId}
            allArtists={allArtists}
            editingFilm={editingFilm}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {playingYt && ReactDOM.createPortal(
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[700] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setPlayingYt(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="relative w-full max-w-3xl" onClick={e => e.stopPropagation()}>
              <button onClick={() => setPlayingYt(null)} className="absolute -top-10 right-0 p-2 text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <div className="relative rounded-xl overflow-hidden" style={{ paddingBottom: "56.25%" }}>
                <iframe src={`https://www.youtube-nocookie.com/embed/${playingYt}?autoplay=1&rel=0`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen />
              </div>
            </motion.div>
          </motion.div>,
          document.body
        )}
      </AnimatePresence>
    </motion.div>
  );
}