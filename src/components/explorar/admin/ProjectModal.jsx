import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  X, Save, Upload, Youtube, Music2, Image as ImageIcon, Film,
  Plus, Trash2, User, Star, ChevronDown
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const CONTENT_TYPES = [
  { key: "song",     label: "Canción",   icon: "🎵" },
  { key: "album",    label: "Álbum",     icon: "💿" },
  { key: "ep",       label: "EP",        icon: "🎶" },
  { key: "minifilm", label: "Mini Film", icon: "🎬" },
  { key: "film",     label: "Film",      icon: "🎞" },
  { key: "series",   label: "Serie",     icon: "📺" },
];

const ROW_CATEGORIES = [
  { key: "",              label: "Sin sección" },
  { key: "trending",      label: "En Tendencia" },
  { key: "new_releases",  label: "Nuevos Lanzamientos" },
  { key: "mini_films",    label: "Mini Films" },
  { key: "afro_caribbean","label": "Afro / Caribbean Vibes" },
  { key: "experimental",  label: "Experimental / New Wave" },
];

const CREDIT_ROLES = [
  "Director", "Productor Musical", "Compositor", "Letra",
  "Artista Principal", "Featuring", "Mezcla", "Masterización",
  "Fotografía", "Edición de Video", "Dirección de Arte", "Cámara", "Otro"
];

const EMPTY = {
  title: "", content_type: "song", subtitle: "", description: "",
  year: new Date().getFullYear(), duration: "",
  thumbnail_url: "", preview_media_url: "", preview_media_type: "image",
  youtube_url: "", youtube_music_url: "", audio_file_url: "",
  artist_id: "", credits: [],
  row_category: "", order: 0,
  is_hero: false, hero_order: 0, hero_media_url: "", hero_media_type: "image",
  hero_link: "", hero_link_label: "Más info",
  is_active: true,
};

function Toggle({ value, onChange, color = "emerald" }) {
  const bg = value ? `bg-${color}-500` : "bg-white/10";
  return (
    <div onClick={() => onChange(!value)} className={`w-9 h-5 rounded-full transition-colors cursor-pointer ${bg}`}>
      <div className={`w-4 h-4 bg-white rounded-full mt-0.5 shadow transition-transform ${value ? "translate-x-4" : "translate-x-0.5"}`} />
    </div>
  );
}

export default function ProjectModal({ item, artists, onClose, onSave }) {
  const [form, setForm] = useState(item ? { ...EMPTY, ...item } : EMPTY);
  const [uploading, setUploading] = useState({});
  const [tab, setTab] = useState("info"); // info | media | sections | credits
  const [newCredit, setNewCredit] = useState({ artist_id: "", role: "Artista Principal", name: "" });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const upload = async (key, file, typeKey) => {
    setUploading(u => ({ ...u, [key]: true }));
    try {
      const isVideo = file.type.startsWith("video/");
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(f => ({
        ...f,
        [key]: file_url,
        ...(typeKey ? { [typeKey]: isVideo ? "video" : "image" } : {}),
      }));
    } finally {
      setUploading(u => ({ ...u, [key]: false }));
    }
  };

  const addCredit = () => {
    if (!newCredit.role) return;
    const artist = artists.find(a => a.id === newCredit.artist_id);
    const credit = {
      artist_id: newCredit.artist_id,
      role: newCredit.role,
      name: newCredit.name || artist?.stageName || "",
    };
    setForm(f => ({ ...f, credits: [...(f.credits || []), credit] }));
    setNewCredit({ artist_id: "", role: "Artista Principal", name: "" });
  };

  const removeCredit = (idx) => {
    setForm(f => ({ ...f, credits: f.credits.filter((_, i) => i !== idx) }));
  };

  const ic = "w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/25 placeholder-white/20 transition-colors";
  const lc = "text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-1.5 block";

  const TABS = [
    { key: "info",     label: "Info" },
    { key: "media",    label: "Media" },
    { key: "sections", label: "Secciones" },
    { key: "credits",  label: "Créditos" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-[#111113] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] flex-shrink-0">
          <div>
            <h2 className="text-sm font-bold text-white">{item ? "Editar proyecto" : "Nuevo proyecto"}</h2>
            <p className="text-[10px] text-white/30 mt-0.5">{form.title || "Sin título"}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/[0.07] flex-shrink-0 px-2">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-xs font-semibold transition-colors border-b-2 ${
                tab === t.key
                  ? "text-white border-white/60"
                  : "text-white/30 border-transparent hover:text-white/60"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* ── TAB: INFO ── */}
          {tab === "info" && (
            <>
              {/* Content type pills */}
              <div>
                <label className={lc}>Tipo de contenido</label>
                <div className="flex flex-wrap gap-2">
                  {CONTENT_TYPES.map(ct => (
                    <button
                      key={ct.key}
                      onClick={() => set("content_type", ct.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                        form.content_type === ct.key
                          ? "bg-white text-black border-white"
                          : "bg-white/5 text-white/40 border-white/10 hover:border-white/25"
                      }`}
                    >
                      <span>{ct.icon}</span> {ct.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={lc}>Título *</label>
                <input value={form.title} onChange={e => set("title", e.target.value)} className={ic} placeholder="Nombre del proyecto" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lc}>Subtítulo / Género</label>
                  <input value={form.subtitle} onChange={e => set("subtitle", e.target.value)} className={ic} placeholder="Urban, Afrobeats..." />
                </div>
                <div>
                  <label className={lc}>Artista principal</label>
                  <select value={form.artist_id} onChange={e => set("artist_id", e.target.value)} className={ic}>
                    <option value="" className="bg-[#111]">Sin artista</option>
                    {artists.map(a => <option key={a.id} value={a.id} className="bg-[#111]">{a.stageName}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lc}>Año</label>
                  <input type="number" value={form.year} onChange={e => set("year", parseInt(e.target.value))} className={ic} placeholder="2024" />
                </div>
                <div>
                  <label className={lc}>Duración</label>
                  <input value={form.duration} onChange={e => set("duration", e.target.value)} className={ic} placeholder="3:24 o 1h 12min" />
                </div>
              </div>

              <div>
                <label className={lc}>Descripción</label>
                <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3}
                  className={`${ic} resize-none`} placeholder="Descripción del proyecto..." />
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-xs text-white/40">Visible en plataforma</span>
                <Toggle value={form.is_active} onChange={v => set("is_active", v)} />
              </div>
            </>
          )}

          {/* ── TAB: MEDIA ── */}
          {tab === "media" && (
            <>
              {/* Portada */}
              <div>
                <label className={lc}>Portada del proyecto</label>
                {form.thumbnail_url ? (
                  <div className="relative rounded-xl overflow-hidden mb-2" style={{ aspectRatio: "16/9" }}>
                    <img src={form.thumbnail_url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => set("thumbnail_url", "")}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-lg hover:bg-black/90 transition-colors">
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                ) : null}
                <div className="flex gap-2">
                  <input value={form.thumbnail_url} onChange={e => set("thumbnail_url", e.target.value)} className={ic} placeholder="https://..." />
                  <label className="flex-shrink-0 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors text-white/40 text-xs flex items-center gap-1">
                    <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && upload("thumbnail_url", e.target.files[0])} />
                    <Upload className="w-3.5 h-3.5" />
                    {uploading.thumbnail_url ? "..." : "Subir"}
                  </label>
                </div>
              </div>

              {/* Preview loop */}
              <div>
                <label className={lc}>Preview en loop (video o imagen)</label>
                {form.preview_media_url ? (
                  <div className="relative rounded-xl overflow-hidden mb-2" style={{ aspectRatio: "16/9" }}>
                    {form.preview_media_type === "video" ? (
                      <video src={form.preview_media_url} className="w-full h-full object-cover" muted autoPlay loop playsInline />
                    ) : (
                      <img src={form.preview_media_url} alt="" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute top-2 left-2">
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${form.preview_media_type === "video" ? "bg-purple-600 text-white" : "bg-blue-600 text-white"}`}>
                        {form.preview_media_type === "video" ? "🎬 Video loop" : "🖼 Imagen"}
                      </span>
                    </div>
                    <button onClick={() => set("preview_media_url", "")}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-lg hover:bg-black/90 transition-colors">
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                ) : null}
                <div className="flex gap-2">
                  <input value={form.preview_media_url} onChange={e => set("preview_media_url", e.target.value)} className={ic} placeholder="https://... (mp4, webm, jpg, png)" />
                  <label className="flex-shrink-0 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors text-white/40 text-xs flex items-center gap-1">
                    <input type="file" accept="image/*,video/mp4,video/webm" className="hidden" onChange={e => e.target.files?.[0] && upload("preview_media_url", e.target.files[0], "preview_media_type")} />
                    <Upload className="w-3.5 h-3.5" />
                    {uploading.preview_media_url ? "..." : "Subir"}
                  </label>
                </div>
                <p className="text-[10px] text-white/20 mt-1">El video se reproduce en loop sin sonido al hacer hover en la tarjeta</p>
              </div>

              {/* YouTube */}
              <div>
                <label className={lc}><Youtube className="w-3 h-3 inline mr-1 text-red-400" />URL de YouTube</label>
                <input value={form.youtube_url} onChange={e => set("youtube_url", e.target.value)} className={ic} placeholder="https://www.youtube.com/watch?v=..." />
              </div>
              <div>
                <label className={lc}><Music2 className="w-3 h-3 inline mr-1 text-green-400" />YouTube Music</label>
                <input value={form.youtube_music_url} onChange={e => set("youtube_music_url", e.target.value)} className={ic} placeholder="https://music.youtube.com/watch?v=..." />
              </div>
              <div>
                <label className={lc}>Archivo de audio</label>
                {form.audio_file_url ? (
                  <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-lg">
                    <audio controls src={form.audio_file_url} className="flex-1 h-8" />
                    <button onClick={() => set("audio_file_url", "")} className="text-red-400 p-1"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 px-3 py-2.5 bg-white/5 border border-dashed border-white/10 rounded-lg cursor-pointer hover:bg-white/[0.07] transition-colors">
                    <input type="file" accept="audio/*" className="hidden" onChange={e => e.target.files?.[0] && upload("audio_file_url", e.target.files[0])} />
                    <Music2 className="w-4 h-4 text-white/20" />
                    <span className="text-sm text-white/25">{uploading.audio_file_url ? "Subiendo..." : "Subir archivo de audio"}</span>
                  </label>
                )}
              </div>
            </>
          )}

          {/* ── TAB: SECCIONES ── */}
          {tab === "sections" && (
            <>
              <p className="text-xs text-white/30 mb-4">Define en qué sección aparece este proyecto en la página Explorar y si aparece en el hero destacado.</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lc}>Sección / Fila</label>
                  <select value={form.row_category || ""} onChange={e => set("row_category", e.target.value)} className={ic}>
                    {ROW_CATEGORIES.map(r => <option key={r.key} value={r.key} className="bg-[#111]">{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lc}>Orden en la fila</label>
                  <input type="number" value={form.order} onChange={e => set("order", parseInt(e.target.value) || 0)} className={ic} />
                </div>
              </div>

              {/* Hero toggle */}
              <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/[0.03]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400/70" />
                    <span className="text-sm font-semibold text-white/70">Destacar en Hero</span>
                  </div>
                  <Toggle value={form.is_hero} onChange={v => set("is_hero", v)} color="yellow" />
                </div>

                {form.is_hero && (
                  <div className="space-y-3 pt-3 border-t border-yellow-500/10">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={lc}>Orden en carrusel</label>
                        <input type="number" value={form.hero_order} onChange={e => set("hero_order", parseInt(e.target.value) || 0)} className={ic} />
                      </div>
                      <div>
                        <label className={lc}>Tipo de fondo hero</label>
                        <select value={form.hero_media_type} onChange={e => set("hero_media_type", e.target.value)} className={ic}>
                          <option value="image" className="bg-[#111]">Imagen</option>
                          <option value="video" className="bg-[#111]">Video loop</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className={lc}>Media de fondo (URL o subir)</label>
                      <div className="flex gap-2">
                        <input value={form.hero_media_url} onChange={e => set("hero_media_url", e.target.value)} className={ic} placeholder="https://... (mp4, jpg, png)" />
                        <label className="flex-shrink-0 px-3 py-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg cursor-pointer hover:bg-yellow-500/20 transition-colors text-yellow-400 text-xs flex items-center gap-1">
                          <input type="file" accept="image/*,video/mp4,video/webm" className="hidden" onChange={e => e.target.files?.[0] && upload("hero_media_url", e.target.files[0], "hero_media_type")} />
                          <Upload className="w-3.5 h-3.5" />
                          {uploading.hero_media_url ? "..." : "Subir"}
                        </label>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={lc}>Texto del botón</label>
                        <input value={form.hero_link_label} onChange={e => set("hero_link_label", e.target.value)} className={ic} placeholder="Más info" />
                      </div>
                      <div>
                        <label className={lc}>Enlace del botón</label>
                        <input value={form.hero_link} onChange={e => set("hero_link", e.target.value)} className={ic} placeholder="/Explorar o https://..." />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── TAB: CRÉDITOS ── */}
          {tab === "credits" && (
            <>
              <p className="text-xs text-white/30 mb-4">Asigna el equipo y elenco del proyecto. Los artistas vinculados a cuentas aparecerán conectados a su perfil.</p>

              {/* Lista de créditos */}
              {(form.credits || []).length > 0 && (
                <div className="space-y-2 mb-4">
                  {(form.credits || []).map((credit, idx) => {
                    const artist = artists.find(a => a.id === credit.artist_id);
                    return (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl group">
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex-shrink-0 flex items-center justify-center">
                          {artist?.avatar_url ? (
                            <img src={artist.avatar_url} alt={artist.stageName} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-3.5 h-3.5 text-white/30" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{credit.name || artist?.stageName || "—"}</p>
                          <p className="text-[10px] text-white/30">{credit.role}</p>
                        </div>
                        {artist && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                            Vinculado
                          </span>
                        )}
                        <button onClick={() => removeCredit(idx)} className="p-1.5 rounded-lg hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                          <Trash2 className="w-3.5 h-3.5 text-red-400/60" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Añadir crédito */}
              <div className="p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] space-y-3">
                <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest">Añadir crédito</p>

                <div>
                  <label className={lc}>Artista de la plataforma (opcional)</label>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                    {/* Quick artist grid */}
                    <select
                      value={newCredit.artist_id}
                      onChange={e => {
                        const a = artists.find(x => x.id === e.target.value);
                        setNewCredit(n => ({ ...n, artist_id: e.target.value, name: a?.stageName || n.name }));
                      }}
                      className={ic}
                    >
                      <option value="" className="bg-[#111]">Sin vincular a cuenta</option>
                      {artists.map(a => (
                        <option key={a.id} value={a.id} className="bg-[#111]">
                          {a.stageName}{a.genre ? ` · ${a.genre}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lc}>Nombre en créditos</label>
                    <input
                      value={newCredit.name}
                      onChange={e => setNewCredit(n => ({ ...n, name: e.target.value }))}
                      className={ic}
                      placeholder="Nombre a mostrar"
                    />
                  </div>
                  <div>
                    <label className={lc}>Rol</label>
                    <select
                      value={newCredit.role}
                      onChange={e => setNewCredit(n => ({ ...n, role: e.target.value }))}
                      className={ic}
                    >
                      {CREDIT_ROLES.map(r => <option key={r} value={r} className="bg-[#111]">{r}</option>)}
                    </select>
                  </div>
                </div>

                <button
                  onClick={addCredit}
                  disabled={!newCredit.role && !newCredit.name}
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Añadir al elenco
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-white/[0.07] flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 text-xs font-semibold transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={!form.title}
            className="flex-1 py-2.5 rounded-xl bg-white text-black font-bold text-xs transition-all hover:bg-white/90 disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <Save className="w-3.5 h-3.5" />
            Guardar proyecto
          </button>
        </div>
      </motion.div>
    </div>
  );
}