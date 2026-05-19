import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Edit, Music2, ExternalLink, ChevronDown, X, Globe, Lock, Trash2, FolderOpen, Upload, Check, Link } from "lucide-react";
import { useGlobalAudio } from "@/context/GlobalAudioContext";
import { base44 } from "@/api/base44Client";
import { useQueryClient, useMutation } from "@tanstack/react-query";

const statusConfig = {
  idea:       { label: "Idea",          color: "#6b7280" },
  production: { label: "Producción",    color: "#60a5fa" },
  mixing:     { label: "Mezcla",        color: "#a78bfa" },
  mastering:  { label: "Masterización", color: "#fb923c" },
  completed:  { label: "Completado",    color: "#34d399" },
};

const FOLDER_DEFS = [
  { key: "mp3",          label: "MP3" },
  { key: "wav_24bit",    label: "WAV 24bit" },
  { key: "stems",        label: "Stems" },
  { key: "mix",          label: "Mix" },
  { key: "master_24bit", label: "Master 24bit" },
  { key: "show",         label: "Show" },
  { key: "acapella",     label: "Acapella" },
  { key: "beat_wav",     label: "Beat WAV" },
];

function getYoutubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/|music\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function AudioWave() {
  const bars = [3, 6, 9, 5, 8, 4, 7, 3, 6, 8, 5];
  return (
    <div className="flex items-end gap-[2px] h-4">
      {bars.map((h, i) => (
        <div key={i} className="w-[2px] rounded-full"
          style={{
            height: `${h}px`,
            background: "rgba(255,255,255,0.5)",
            animation: `waveBar 0.${6 + (i % 5)}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.07}s`,
          }}
        />
      ))}
      <style>{`@keyframes waveBar { from { transform: scaleY(0.3); opacity:0.3; } to { transform: scaleY(1); opacity:0.9; } }`}</style>
    </div>
  );
}

// ── Edit Modal (self-contained, no parent dependency) ─────────────────────────
function TrackEditModal({ track, onClose, onSaved }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ ...track });
  const [audioMode, setAudioMode] = useState(track?.youtube_music_url ? "link" : "file");
  const [newComposer, setNewComposer] = useState("");
  const [newProducer, setNewProducer] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const clean = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
      );
      return base44.entities.Track.update(track.id, clean);
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      onSaved({ ...formData, ...updated });
    },
  });

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData(f => ({ ...f, cover_url: file_url }));
    setUploadingCover(false);
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 70 * 1024 * 1024) { alert('El archivo supera los 70MB'); return; }
    setUploadingAudio(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData(f => ({ ...f, audio_file_url: file_url }));
    setUploadingAudio(false);
  };

  const addComposer = () => {
    if (newComposer.trim()) {
      setFormData(f => ({ ...f, composers: [...(f.composers || []), newComposer.trim()] }));
      setNewComposer("");
    }
  };
  const removeComposer = (i) => setFormData(f => ({ ...f, composers: f.composers.filter((_, idx) => idx !== i) }));

  const addProducer = () => {
    if (newProducer.trim()) {
      setFormData(f => ({ ...f, producers: [...(f.producers || []), newProducer.trim()] }));
      setNewProducer("");
    }
  };
  const removeProducer = (i) => setFormData(f => ({ ...f, producers: f.producers.filter((_, idx) => idx !== i) }));

  return ReactDOM.createPortal(
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999999 }}>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        style={{ background: "#141414", maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/[0.07] flex items-center justify-between sticky top-0 bg-[#141414] z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center">
              <Music2 className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Editar Soundtrack</h3>
              <p className="text-xs text-white/30">{track.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-white/50" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); if (!formData.title?.trim()) { alert('El título es requerido'); return; } saveMutation.mutate(formData); }} className="p-5 space-y-5">

          {/* Cover */}
          <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2.5">Portada</label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0" style={{ background: "rgba(255,255,255,0.05)" }}>
                {formData.cover_url
                  ? <img src={formData.cover_url} alt="Cover" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><Music2 className="w-8 h-8 text-white/15" /></div>
                }
              </div>
              <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-sm font-medium transition-colors">
                <Upload className="w-4 h-4" />
                {uploadingCover ? 'Subiendo...' : 'Cambiar portada'}
                <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" disabled={uploadingCover} />
              </label>
            </div>
          </div>

          {/* Audio */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Audio</label>
              <div className="flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5">
                <button type="button" onClick={() => setAudioMode("file")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${audioMode === "file" ? "bg-white/10 text-white" : "text-white/35 hover:text-white/60"}`}>
                  <Upload className="w-3 h-3" /> MP3
                </button>
                <button type="button" onClick={() => setAudioMode("link")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${audioMode === "link" ? "bg-white/10 text-white" : "text-white/35 hover:text-white/60"}`}>
                  <Link className="w-3 h-3" /> YouTube
                </button>
              </div>
            </div>
            {audioMode === "file" ? (
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.04)" }}>
                  {formData.audio_file_url ? <Check className="w-6 h-6 text-emerald-400" /> : <Music2 className="w-6 h-6 text-white/20" />}
                </div>
                <div>
                  <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-sm font-medium transition-colors">
                    <Upload className="w-4 h-4" />
                    {uploadingAudio ? 'Subiendo...' : formData.audio_file_url ? 'Cambiar MP3' : 'Subir MP3'}
                    <input type="file" accept=".mp3,audio/mpeg" onChange={handleAudioUpload} className="hidden" disabled={uploadingAudio} />
                  </label>
                  {formData.audio_file_url && <p className="text-xs text-emerald-400 mt-1">✓ MP3 cargado</p>}
                </div>
              </div>
            ) : (
              <input
                type="url"
                value={formData.youtube_music_url || ""}
                onChange={(e) => setFormData(f => ({ ...f, youtube_music_url: e.target.value }))}
                placeholder="https://music.youtube.com/watch?v=..."
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/40 text-sm transition-colors"
              />
            )}
          </div>

          {/* Title + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Título *</label>
              <input
                type="text"
                value={formData.title || ""}
                onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
                placeholder="Nombre de la pista"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/40 text-sm transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Estado</label>
              <select
                value={formData.status || "idea"}
                onChange={(e) => setFormData(f => ({ ...f, status: e.target.value }))}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/40 text-sm transition-colors"
              >
                <option value="idea">Idea</option>
                <option value="production">Producción</option>
                <option value="mixing">Mezcla</option>
                <option value="mastering">Masterización</option>
                <option value="completed">Completado</option>
              </select>
            </div>
          </div>

          {/* Genre + BPM + Key */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Género</label>
              <input type="text" value={formData.genre || ""} onChange={(e) => setFormData(f => ({ ...f, genre: e.target.value }))} placeholder="Trap, Pop..." className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/40 text-sm transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">BPM</label>
              <input type="number" value={formData.bpm || ""} onChange={(e) => setFormData(f => ({ ...f, bpm: parseInt(e.target.value) || null }))} placeholder="120" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/40 text-sm transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Tonalidad</label>
              <input type="text" value={formData.key || ""} onChange={(e) => setFormData(f => ({ ...f, key: e.target.value }))} placeholder="Am, C#m..." className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/40 text-sm transition-colors" />
            </div>
          </div>

          {/* Credits */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-3.5 bg-purple-500 rounded-full" /> Créditos
            </h4>
            {/* Composers */}
            <div>
              <label className="block text-xs text-white/30 mb-1.5">Compositores</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {formData.composers?.map((c, i) => (
                  <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-white/[0.07] rounded-lg text-xs text-white/70">
                    {c}
                    <button type="button" onClick={() => removeComposer(i)} className="hover:text-red-400 transition-colors ml-0.5"><X className="w-2.5 h-2.5" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={newComposer} onChange={(e) => setNewComposer(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addComposer())} placeholder="Agregar compositor" className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/40 text-sm transition-colors" />
                <button type="button" onClick={addComposer} className="px-3 py-2 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/25 rounded-lg text-purple-400 text-sm font-medium transition-colors">+</button>
              </div>
            </div>
            {/* Producers */}
            <div>
              <label className="block text-xs text-white/30 mb-1.5">Productores</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {formData.producers?.map((p, i) => (
                  <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-white/[0.07] rounded-lg text-xs text-white/70">
                    {p}
                    <button type="button" onClick={() => removeProducer(i)} className="hover:text-red-400 transition-colors ml-0.5"><X className="w-2.5 h-2.5" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={newProducer} onChange={(e) => setNewProducer(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addProducer())} placeholder="Agregar productor" className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/40 text-sm transition-colors" />
                <button type="button" onClick={addProducer} className="px-3 py-2 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/25 rounded-lg text-purple-400 text-sm font-medium transition-colors">+</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/30 mb-1.5">Ing. Mezcla</label>
                <input type="text" value={formData.mix_engineer || ""} onChange={(e) => setFormData(f => ({ ...f, mix_engineer: e.target.value }))} placeholder="Mix engineer" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/40 text-sm transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-white/30 mb-1.5">Ing. Master</label>
                <input type="text" value={formData.master_engineer || ""} onChange={(e) => setFormData(f => ({ ...f, master_engineer: e.target.value }))} placeholder="Mastering engineer" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/40 text-sm transition-colors" />
              </div>
            </div>
          </div>

          {/* Dolby Atmos */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-orange-500/5 border border-orange-500/15">
            <label className="flex items-center gap-3 cursor-pointer flex-1">
              <div className="relative">
                <input type="checkbox" checked={formData.dolby_atmos || false} onChange={(e) => setFormData(f => ({ ...f, dolby_atmos: e.target.checked }))} className="sr-only peer" />
                <div className="w-10 h-5 bg-white/10 rounded-full peer-checked:bg-orange-500 transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Dolby Atmos</p>
                <p className="text-[11px] text-white/30">Masterización espacial inmersiva</p>
              </div>
            </label>
          </div>

          {/* Drive Folder */}
          <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Carpeta de Drive</label>
            <input
              type="text"
              value={formData.versions?.drive_folder || ""}
              onChange={(e) => setFormData(f => ({ ...f, versions: { ...(f.versions || {}), drive_folder: e.target.value } }))}
              placeholder="https://drive.google.com/drive/folders/..."
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/40 text-sm transition-colors"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Notas</label>
            <textarea
              value={formData.notes || ""}
              onChange={(e) => setFormData(f => ({ ...f, notes: e.target.value }))}
              placeholder="Notas adicionales..."
              rows={3}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/40 text-sm transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-medium text-sm transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saveMutation.isPending} className="flex-1 px-4 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {saveMutation.isPending ? 'Guardando...' : <><Check className="w-4 h-4" /> Guardar cambios</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function TrackDetailModal({ track, onClose, onEdit, onDelete, onTogglePublic }) {
  const status = statusConfig[track.status] || statusConfig.idea;
  const folders = FOLDER_DEFS.filter(f => track.versions?.[f.key]);
  const isPublic = track.is_public === true;
  const hasAudio = !!track.audio_file_url;
  const hasYoutube = !!track.youtube_music_url;
  const ytId = getYoutubeId(track.youtube_music_url);
  const [playing, setPlaying] = useState(false);
  const [showYtPlayer, setShowYtPlayer] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      if (audioRef.current) { audioRef.current.pause(); }
    };
  }, []);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.currentTime = 0; audioRef.current.volume = 1; audioRef.current.play().then(() => setPlaying(true)).catch(() => {}); }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 flex items-end sm:items-center justify-center" style={{ zIndex: 99999 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.96 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full sm:max-w-xl rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "#0f0f0f", maxHeight: "92vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}
      >
        {hasAudio && <audio ref={audioRef} src={track.audio_file_url} preload="metadata" onEnded={() => setPlaying(false)} />}

        {/* Hero */}
        <div className="relative" style={{ height: 260, overflow: "hidden" }}>
          <motion.div className="absolute inset-0"
            animate={playing ? { scale: 1.08, x: [0, 4, -4, 2, 0] } : { scale: 1.04, x: 0 }}
            transition={playing ? { scale: { duration: 0.8 }, x: { duration: 10, repeat: Infinity, ease: "easeInOut" } } : { duration: 0.8 }}
          >
            {track.cover_url
              ? <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1e0a3c 0%, #0a1628 40%, #0a0a0b 100%)" }}><Music2 className="w-20 h-20 text-white/10" /></div>
            }
          </motion.div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #0f0f0f 0%, rgba(15,15,15,0.5) 50%, transparent 100%)" }} />
          {playing && <div className="absolute bottom-16 left-5"><AudioWave /></div>}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: status.color + "25", color: status.color }}>{status.label}</span>
              {track.dolby_atmos && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400">ATMOS</span>}
              {isPublic && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400">Público</span>}
            </div>
            <h2 className="text-white font-black text-2xl leading-tight">{track.title}</h2>
            {track.genre && <p className="text-white/40 text-sm mt-0.5">{track.genre}</p>}
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)" }}>
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 pb-8 pt-4 space-y-5">
          {/* Action row */}
          <div className="flex items-center gap-2 flex-wrap">
            {hasAudio && (
              <button onClick={toggleAudio} className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all" style={{ background: playing ? "rgba(255,255,255,0.12)" : "white", border: playing ? "1px solid rgba(255,255,255,0.2)" : "none" }}>
                {playing ? <Pause className="w-4 h-4 text-white" fill="white" /> : <Play className="w-4 h-4 text-black ml-0.5" fill="black" />}
              </button>
            )}
            {hasYoutube && (
              <button onClick={() => setShowYtPlayer(v => !v)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all flex-shrink-0" style={{ background: showYtPlayer ? "rgba(255,80,80,0.2)" : "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", color: "#f87171" }}>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                {showYtPlayer ? "Cerrar video" : "YouTube Music"}
              </button>
            )}
            <button onClick={onEdit} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all" style={{ background: "rgba(255,255,255,0.06)" }}>
              <Edit className="w-3.5 h-3.5 text-white/60" /> <span className="text-white/60 hover:text-white">Editar</span>
            </button>
            <button onClick={onTogglePublic} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${isPublic ? "bg-emerald-500/15 text-emerald-400" : "text-white/30"}`} style={!isPublic ? { background: "rgba(255,255,255,0.05)" } : {}}>
              {isPublic ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              {isPublic ? "Público" : "Privado"}
            </button>
            <button onClick={onDelete} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
              <Trash2 className="w-3.5 h-3.5" /> Eliminar
            </button>
          </div>

          {/* YouTube embed */}
          <AnimatePresence>
            {showYtPlayer && ytId && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden rounded-xl">
                <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: "56.25%" }}>
                  <iframe className="absolute inset-0 w-full h-full" src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Technical metadata */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {track.bpm && <div><p className="text-[10px] font-semibold text-white/20 uppercase tracking-wider">BPM</p><p className="text-sm text-white/70 font-medium">{track.bpm}</p></div>}
            {track.key && <div><p className="text-[10px] font-semibold text-white/20 uppercase tracking-wider">Tonalidad</p><p className="text-sm text-white/70 font-medium">{track.key}</p></div>}
          </div>

          {/* Credits */}
          {(track.composers?.length > 0 || track.producers?.length > 0 || track.mix_engineer || track.master_engineer) && (
            <div className="space-y-3">
              <p className="text-[10px] font-semibold text-white/20 uppercase tracking-widest">Créditos</p>
              <div className="grid grid-cols-1 gap-2">
                {track.composers?.length > 0 && <div className="flex items-start gap-3 py-2 border-b border-white/[0.05]"><span className="text-[10px] text-white/25 uppercase tracking-wider w-24 flex-shrink-0 pt-0.5">Compositores</span><span className="text-sm text-white/65 font-medium">{track.composers.join(", ")}</span></div>}
                {track.producers?.length > 0 && <div className="flex items-start gap-3 py-2 border-b border-white/[0.05]"><span className="text-[10px] text-white/25 uppercase tracking-wider w-24 flex-shrink-0 pt-0.5">Productores</span><span className="text-sm text-white/65 font-medium">{track.producers.join(", ")}</span></div>}
                {track.mix_engineer && <div className="flex items-start gap-3 py-2 border-b border-white/[0.05]"><span className="text-[10px] text-white/25 uppercase tracking-wider w-24 flex-shrink-0 pt-0.5">Mezcla</span><span className="text-sm text-white/65 font-medium">{track.mix_engineer}</span></div>}
                {track.master_engineer && <div className="flex items-start gap-3 py-2 border-b border-white/[0.05]"><span className="text-[10px] text-white/25 uppercase tracking-wider w-24 flex-shrink-0 pt-0.5">Masterización</span><span className="text-sm text-white/65 font-medium">{track.master_engineer}</span></div>}
              </div>
            </div>
          )}

          {/* Files */}
          {(folders.length > 0 || track.versions?.drive_folder) && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-white/20 uppercase tracking-widest">Archivos</p>
              {track.versions?.drive_folder && (
                <a href={track.versions.drive_folder} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/[0.07] hover:border-white/15 transition-all group" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <FolderOpen className="w-4 h-4 text-white/30 group-hover:text-white/60" />
                  <span className="text-sm text-white/50 group-hover:text-white/80">Carpeta de Drive</span>
                  <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-white/50 ml-auto" />
                </a>
              )}
              {folders.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {folders.map(f => (
                    <a key={f.key} href={track.versions[f.key]} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/[0.07] hover:border-white/15 text-white/40 hover:text-white/80 text-xs transition-all" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <ExternalLink className="w-2.5 h-2.5" /> {f.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {track.notes && <div><p className="text-[10px] font-semibold text-white/20 uppercase tracking-widest mb-1.5">Notas</p><p className="text-sm text-white/35 leading-relaxed">{track.notes}</p></div>}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

// ── Track Card ────────────────────────────────────────────────────────────────
function TrackCard({ track, onEdit, isFirst }) {
  const [hovered, setHovered] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showPreviewAnimation, setShowPreviewAnimation] = useState(false);
  const [localTrack, setLocalTrack] = useState(track);

  useEffect(() => { setLocalTrack(track); }, [track]);

  const previewRef = useRef(null);
  const playbackRef = useRef(null);
  const previewTimerRef = useRef(null);
  const hoverDelayRef = useRef(null);

  const globalAudio = useGlobalAudio();
  const queryClient = useQueryClient();

  const status = statusConfig[localTrack.status] || statusConfig.idea;
  const hasAudio = !!localTrack.audio_file_url;
  const hasYoutube = !!localTrack.youtube_music_url;
  const metaParts = [localTrack.genre, localTrack.bpm ? `${localTrack.bpm} BPM` : null, localTrack.key].filter(Boolean);

  const stopPreview = () => {
    if (previewRef.current) { previewRef.current.pause(); previewRef.current.currentTime = 0; }
    clearTimeout(previewTimerRef.current);
    clearTimeout(hoverDelayRef.current);
    previewTimerRef.current = null;
    hoverDelayRef.current = null;
    setPreviewing(false);
    setShowPreviewAnimation(false);
  };

  const handleMouseEnter = () => {
    setHovered(true);
    if (hasAudio && previewRef.current && !playing && !globalAudio?.isPlaying) {
      hoverDelayRef.current = setTimeout(() => {
        setShowPreviewAnimation(true);
        previewRef.current.currentTime = 0;
        previewRef.current.volume = 0.6;
        previewRef.current.play().then(() => {
          setPreviewing(true);
          previewTimerRef.current = setTimeout(() => stopPreview(), 40000);
        }).catch(() => {});
      }, 1500);
    }
  };

  const handleMouseLeave = () => { setHovered(false); stopPreview(); };

  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    if (!playbackRef.current) return;
    clearTimeout(hoverDelayRef.current);
    stopPreview();
    if (playing) { playbackRef.current.pause(); setPlaying(false); }
    else { playbackRef.current.currentTime = 0; playbackRef.current.volume = 1; playbackRef.current.play().then(() => setPlaying(true)).catch(() => {}); }
  };

  const handleTogglePublic = async () => {
    const updated = { ...localTrack, is_public: !localTrack.is_public };
    await base44.entities.Track.update(localTrack.id, { is_public: updated.is_public });
    setLocalTrack(updated);
    queryClient.invalidateQueries({ queryKey: ['tracks'] });
  };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar "${localTrack.title}"?`)) return;
    await base44.entities.Track.delete(localTrack.id);
    setShowDetail(false);
    queryClient.invalidateQueries({ queryKey: ['tracks'] });
  };

  return (
    <>
      <div
        style={{ width: 240, flexShrink: 0, position: "relative", zIndex: hovered ? 200 : 1 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          animate={{ scale: hovered ? 1.16 : 1 }}
          transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ width: 240, transformOrigin: isFirst ? "left center" : "center center", cursor: "pointer", position: "relative" }}
          onClick={() => setShowDetail(true)}
        >
          {/* ChevronDown */}
          <button
            style={{ position: "absolute", top: 8, right: 8, zIndex: 50, pointerEvents: "all" }}
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); setShowDetail(true); }}
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(10,10,10,0.8)", border: "1px solid rgba(255,255,255,0.3)", backdropFilter: "blur(8px)" }}>
              <ChevronDown className="w-3.5 h-3.5 text-white" />
            </div>
          </button>

          <div className="rounded-xl shadow-2xl" style={{ background: "#1a1a1c", overflow: "visible" }}>
            {hasAudio && (
              <>
                <audio ref={previewRef} src={localTrack.audio_file_url} preload="metadata" />
                <audio ref={playbackRef} src={localTrack.audio_file_url} preload="metadata" onEnded={() => setPlaying(false)} />
              </>
            )}

            {/* Cover */}
            <div style={{ height: 150, overflow: "hidden", position: "relative", borderRadius: "0.75rem 0.75rem 0 0" }}>
              <motion.div style={{ width: "100%", height: "100%" }}
                animate={playing ? { scale: 1.1, x: [0, 3, -3, 1, 0] } : showPreviewAnimation ? { scale: 1.1, x: 2 } : hovered ? { scale: 1.08 } : { scale: 1, x: 0 }}
                transition={playing ? { scale: { duration: 0.7 }, x: { duration: 8, repeat: Infinity, ease: "easeInOut" } } : showPreviewAnimation ? { duration: 1.5 } : { duration: 0.7 }}
              >
                {localTrack.cover_url
                  ? <img src={localTrack.cover_url} alt={localTrack.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex flex-col items-center justify-center gap-1.5" style={{ background: "linear-gradient(135deg, #1e1a3e 0%, #1a1a2e 50%, #0a0a0b 100%)" }}><Music2 className="w-10 h-10 text-white/15" /><p className="text-[9px] text-white/15 font-medium text-center px-2 line-clamp-2 leading-tight">{localTrack.title}</p></div>
                }
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: status.color + "30", color: status.color }}>{status.label}</div>
              {!hasAudio && hasYoutube && (
                <div className="absolute top-2 left-14 flex items-center gap-1 px-1.5 py-0.5 rounded" style={{ background: "rgba(255,0,0,0.18)", border: "1px solid rgba(255,80,80,0.25)" }}>
                  <svg className="w-2.5 h-2.5 text-red-400" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                  <span className="text-[8px] text-red-400 font-bold">YT</span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2 flex items-end justify-between">
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-white font-bold text-[11px] leading-tight line-clamp-1">{localTrack.title}</p>
                  {localTrack.genre && <p className="text-white/30 text-[9px] truncate mt-0.5">{localTrack.genre}</p>}
                </div>
                {hasAudio && (
                  <button onClick={(e) => { e.stopPropagation(); togglePlay(e); }} className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: playing ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.88)", border: playing ? "1px solid rgba(255,255,255,0.18)" : "none" }}>
                    {playing ? <Pause className="w-2.5 h-2.5 text-white" fill="white" /> : <Play className="w-2.5 h-2.5 text-black ml-0.5" fill="black" />}
                  </button>
                )}
              </div>
            </div>

            {/* Hover panel */}
            <AnimatePresence>
              {hovered && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} style={{ background: "#1a1a1c", overflow: "hidden", borderRadius: "0 0 0.75rem 0.75rem" }}>
                  <div className="px-2.5 pt-2 pb-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold" style={{ background: status.color + "25", color: status.color }}>{status.label}</span>
                        {localTrack.dolby_atmos && <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-orange-500/20 text-orange-400">ATMOS</span>}
                        {hasYoutube && <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-red-500/15 text-red-400">YT Music</span>}
                      </div>
                      {(playing || previewing) && <AudioWave />}
                    </div>
                    {metaParts.length > 0 && (
                      <div className="flex flex-wrap gap-x-1.5 gap-y-0.5">
                        {metaParts.map((part, i) => (
                          <React.Fragment key={i}>
                            <span className="text-[9px] text-white/45">{part}</span>
                            {i < metaParts.length - 1 && <span className="text-[9px] text-white/20">·</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                    {(localTrack.producers?.length > 0 || localTrack.mix_engineer) && (
                      <p className="text-[8px] text-white/25 truncate">
                        {localTrack.producers?.length > 0 && `Prod. ${localTrack.producers[0]}`}
                        {localTrack.producers?.length > 0 && localTrack.mix_engineer && " · "}
                        {localTrack.mix_engineer && `Mix: ${localTrack.mix_engineer}`}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {showDetail && (
          <TrackDetailModal
            track={localTrack}
            onClose={() => setShowDetail(false)}
            onEdit={() => { setShowDetail(false); setShowEdit(true); }}
            onDelete={handleDelete}
            onTogglePublic={handleTogglePublic}
          />
        )}
      </AnimatePresence>

      {/* Edit modal — self-contained, no parent z-index issues */}
      <AnimatePresence>
        {showEdit && (
          <TrackEditModal
            track={localTrack}
            onClose={() => setShowEdit(false)}
            onSaved={(updated) => {
              setLocalTrack(updated);
              setShowEdit(false);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default function NetflixTrackCard({ track, index, onEdit }) {
  return <TrackCard track={track} index={index} onEdit={onEdit} isFirst={index === 0} />;
}