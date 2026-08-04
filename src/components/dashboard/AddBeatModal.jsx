import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Upload, Music2, Check, Play, Pause, Search, Sparkles, Lock, Link2,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGlobalAudio } from "@/context/GlobalAudioContext";
import { GENRES, KEYS } from "@/lib/musicConstants";
import { rankBeatsByGenre } from "@/lib/artistBeats";

// Modal unificado para añadir beats al catálogo del artista.
//   • Pestaña "Subir privado"  → crea un ArtistBeat (privado, con metadata).
//   • Pestaña "Asignar público" → crea ArtistBeatAssignment con beats públicos
//     priorizados por los géneros de los soundtracks del artista.
export default function AddBeatModal({
  artistId,
  artistGenres,
  excludeBeatIds,
  assignedById,
  onClose,
}) {
  const qc = useQueryClient();
  const [tab, setTab] = useState("private");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[160] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-2xl rounded-2xl overflow-hidden max-h-[92vh] flex flex-col"
        style={{ background: "#141416", border: "1px solid rgba(255,255,255,0.08)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header + tabs */}
        <div
          className="sticky top-0 z-10 border-b border-white/5"
          style={{ background: "#141416" }}
        >
          <div className="flex items-center justify-between px-5 pt-4 pb-3">
            <h2 className="text-lg font-black text-white tracking-tight">Añadir beat</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white/50" />
            </button>
          </div>
          <div className="flex gap-1 px-5 pb-2">
            <TabButton
              active={tab === "private"}
              onClick={() => setTab("private")}
              icon={<Lock className="w-3 h-3" />}
              label="Subir privado"
            />
            <TabButton
              active={tab === "public"}
              onClick={() => setTab("public")}
              icon={<Link2 className="w-3 h-3" />}
              label="Asignar público"
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {tab === "private" ? (
            <PrivateTab artistId={artistId} onClose={onClose} />
          ) : (
            <PublicTab
              artistId={artistId}
              artistGenres={artistGenres}
              excludeBeatIds={excludeBeatIds}
              assignedById={assignedById}
              onClose={onClose}
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all"
      style={{
        background: active ? "rgba(255,88,51,0.12)" : "transparent",
        color: active ? "#ff8866" : "rgba(255,255,255,0.4)",
        borderBottom: active ? "2px solid #ff5833" : "2px solid transparent",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

// ── Pestaña privada: subir un beat exclusivo con metadata ────────────────────
function PrivateTab({ artistId, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    audio_url: "",
    cover_url: "",
    genre: "",
    genres: [],
    bpm: null,
    key: "",
    description: "",
    tags: [],
  });
  const [uploading, setUploading] = useState(null);
  const [mp3Error, setMp3Error] = useState(null);

  const saveMutation = useMutation({
    mutationFn: async (data) =>
      base44.entities.ArtistBeat.create({ ...data, artist_id: artistId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["artist-beats", artistId] });
      onClose();
    },
  });

  const handleUpload = async (file, field) => {
    if (!file) return;
    setUploading(field);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm((f) => ({ ...f, [field]: file_url }));
    } finally {
      setUploading(null);
    }
  };

  const handleUploadMp3 = async (file) => {
    if (!file) return;
    const isMp3 =
      file.name.toLowerCase().endsWith(".mp3") ||
      ["audio/mpeg", "audio/mp3"].includes(file.type);
    if (!isMp3) {
      setMp3Error("El archivo debe ser un MP3 (.mp3).");
      return;
    }
    setMp3Error(null);
    setUploading("mp3");
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm((f) => ({ ...f, audio_url: file_url }));
    } finally {
      setUploading(null);
    }
  };

  const toggleGenre = (g) =>
    setForm((f) => {
      const genres = f.genres.includes(g) ? f.genres.filter((x) => x !== g) : [...f.genres, g];
      return { ...f, genres, genre: genres[0] || "" };
    });
  const toggleTag = (g) =>
    setForm((f) => ({
      ...f,
      tags: (f.tags || []).includes(g) ? f.tags.filter((x) => x !== g) : [...(f.tags || []), g],
    }));

  const iCls =
    "w-full px-3 py-2.5 rounded-xl text-sm text-white bg-white/[0.05] border border-white/[0.08] focus:outline-none focus:border-white/20 transition-colors placeholder-white/20";
  const labelCls = "block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1.5";

  return (
    <div className="p-5 space-y-5">
      {/* Portada */}
      <div>
        <label className={labelCls}>Portada</label>
        <div className="flex items-center gap-3">
          <div
            className="w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
            style={{ background: "#1a1a1c", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {form.cover_url ? (
              <img src={form.cover_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <Music2 className="w-6 h-6 text-white/20" />
            )}
          </div>
          <label className="flex-1 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], "cover_url")}
            />
            <div className={`${iCls} flex items-center justify-center gap-2 hover:bg-white/[0.08] cursor-pointer`}>
              <Upload className="w-3.5 h-3.5 text-white/40" />
              {uploading === "cover_url" ? "Subiendo..." : form.cover_url ? "Cambiar portada" : "Subir portada"}
            </div>
          </label>
        </div>
      </div>

      <div>
        <label className={labelCls}>Título</label>
        <input
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className={iCls}
          placeholder="Título del beat"
        />
      </div>

      <div>
        <label className={labelCls}>Audio (MP3)</label>
        <label className="cursor-pointer">
          <input
            type="file"
            accept="audio/mpeg,.mp3"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleUploadMp3(e.target.files[0])}
          />
          <div className={`${iCls} flex items-center gap-2 hover:bg-white/[0.08] cursor-pointer`}>
            <Music2 className="w-3.5 h-3.5 text-white/40" />
            {uploading === "mp3" ? "Subiendo..." : form.audio_url ? "Archivo subido — Cambiar" : "Subir MP3"}
          </div>
        </label>
        {mp3Error && <p className="text-[11px] font-semibold text-red-400 mt-1.5">{mp3Error}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>BPM</label>
          <input
            type="number"
            value={form.bpm || ""}
            onChange={(e) => setForm((f) => ({ ...f, bpm: e.target.value ? parseInt(e.target.value) : null }))}
            className={iCls}
            placeholder="140"
          />
        </div>
        <div>
          <label className={labelCls}>Tonalidad</label>
          <select
            value={form.key || ""}
            onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
            className={iCls}
          >
            <option value="">—</option>
            {KEYS.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>Género</label>
        <div className="flex flex-wrap gap-1.5">
          {GENRES.map((g) => {
            const active = form.genres.includes(g);
            return (
              <button
                key={g}
                type="button"
                onClick={() => toggleGenre(g)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  active ? "bg-[#ff5833] text-white" : "bg-white/5 text-white/40 hover:bg-white/10 border border-white/10"
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className={labelCls}>Etiquetas</label>
        <div className="flex flex-wrap gap-1.5">
          {GENRES.map((g) => {
            const active = (form.tags || []).includes(g);
            return (
              <button
                key={g}
                type="button"
                onClick={() => toggleTag(g)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  active ? "bg-white/15 text-white" : "bg-white/5 text-white/40 hover:bg-white/10 border border-white/10"
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className={labelCls}>Descripción (opcional)</label>
        <textarea
          value={form.description || ""}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={3}
          className={`${iCls} resize-none`}
          placeholder="Notas internas para el artista..."
        />
      </div>

      <div
        className="rounded-xl px-4 py-3 text-[11px] text-white/45 leading-relaxed"
        style={{ background: "rgba(255,88,51,0.06)", border: "1px solid rgba(255,88,51,0.12)" }}
      >
        Este beat será <span className="font-bold text-[#ff8866]">privado</span>: solo visible para
        administradores y el artista. No aparecerá en el marketplace.
      </div>

      <div className="flex gap-3 pt-1">
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 text-sm font-semibold transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={() => saveMutation.mutate(form)}
          disabled={saveMutation.isPending || !form.title}
          className="flex-1 py-3 rounded-xl text-white text-sm font-bold transition-colors disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #ff5833, #e0451f)" }}
        >
          {saveMutation.isPending ? "Guardando..." : "Guardar beat"}
        </button>
      </div>
    </div>
  );
}

// ── Pestaña pública: asignar beats públicos priorizados por género ───────────
function PublicTab({ artistId, artistGenres, excludeBeatIds, assignedById, onClose }) {
  const qc = useQueryClient();
  const { playQueue, playingTrack, isPlaying, pauseTrack, resumeTrack } = useGlobalAudio();
  const [selected, setSelected] = useState(new Set());
  const [search, setSearch] = useState("");

  const { data: publicBeats = [], isLoading } = useQuery({
    queryKey: ["beats-public"],
    queryFn: async () => {
      const beats = await base44.entities.Beat.filter({ status: "Publicado" });
      return beats.filter((b) => !b.archived);
    },
  });

  const ranked = useMemo(() => {
    const r = rankBeatsByGenre(publicBeats, artistGenres);
    return r.filter(({ beat }) => !excludeBeatIds.has(beat.id));
  }, [publicBeats, artistGenres, excludeBeatIds]);

  const filtered = useMemo(() => {
    if (!search.trim()) return ranked;
    const q = search.toLowerCase();
    return ranked.filter(
      ({ beat }) =>
        (beat.title || "").toLowerCase().includes(q) ||
        (beat.producer || "").toLowerCase().includes(q)
    );
  }, [ranked, search]);

  const assignMutation = useMutation({
    mutationFn: async () => {
      const ids = Array.from(selected);
      const existing = await base44.entities.ArtistBeatAssignment.filter({ artist_id: artistId });
      const existingIds = new Set(existing.map((a) => a.beat_id));
      const maxOrder = existing.reduce((m, a) => Math.max(m, a.order || 0), 0);
      const toCreate = ids
        .filter((id) => !existingIds.has(id))
        .map((id, i) => ({
          artist_id: artistId,
          beat_id: id,
          type: "manual",
          order: maxOrder + i + 1,
          assigned_by_id: assignedById,
        }));
      if (toCreate.length) await base44.entities.ArtistBeatAssignment.bulkCreate(toCreate);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["artist-beat-assignments", artistId] });
      onClose();
    },
  });

  const toggleSelect = (id) =>
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const handlePreview = (beat) => {
    const active = playingTrack?.beat_id === beat.id;
    if (active && isPlaying) pauseTrack();
    else if (active) resumeTrack();
    else playQueue([{ ...beat, beat_id: beat.id }], 0);
  };

  const iCls =
    "w-full px-3 py-2.5 rounded-xl text-sm text-white bg-white/[0.05] border border-white/[0.08] focus:outline-none focus:border-white/20 transition-colors placeholder-white/20";

  return (
    <div className="p-5 space-y-4">
      <p className="text-[11px] text-white/35 flex items-center gap-1">
        <Sparkles className="w-3 h-3 text-[#ff5833]" />
        Priorizados por los géneros de tus soundtracks
      </p>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={iCls + " pl-9"}
          placeholder="Buscar por título o productor..."
        />
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-white/30 text-sm">Cargando beats...</div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-white/30 text-sm">No hay beats disponibles para asignar.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(({ beat, score }) => {
            const isSel = selected.has(beat.id);
            const active = playingTrack?.beat_id === beat.id;
            return (
              <div
                key={beat.id}
                className="flex items-center gap-3 p-2.5 rounded-xl transition-colors cursor-pointer"
                style={{
                  background: isSel ? "rgba(255,88,51,0.08)" : "rgba(255,255,255,0.03)",
                  border: isSel ? "1px solid rgba(255,88,51,0.3)" : "1px solid rgba(255,255,255,0.06)",
                }}
                onClick={() => toggleSelect(beat.id)}
              >
                <div
                  className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
                  style={{ background: "#1a1a1c" }}
                >
                  {beat.cover_url ? (
                    <img src={beat.cover_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Music2 className="w-4 h-4 text-white/20" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{beat.title}</p>
                  <p className="text-[11px] text-white/40 truncate">
                    {beat.producer || "—"}
                    {score > 0 && <span className="text-[#ff8866] ml-1.5">· {score} coincidencia(s)</span>}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handlePreview(beat); }}
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  {active && isPlaying ? (
                    <Pause className="w-3.5 h-3.5 text-white" fill="white" />
                  ) : (
                    <Play className="w-3.5 h-3.5 text-white ml-0.5" fill="white" />
                  )}
                </button>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{ background: isSel ? "#ff5833" : "rgba(255,255,255,0.08)" }}
                >
                  {isSel && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 text-sm font-semibold transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={() => assignMutation.mutate()}
          disabled={assignMutation.isPending || selected.size === 0}
          className="flex-1 py-3 rounded-xl text-white text-sm font-bold transition-colors disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #ff5833, #e0451f)" }}
        >
          {assignMutation.isPending ? "Asignando..." : `Asignar ${selected.size > 0 ? `(${selected.size})` : ""}`}
        </button>
      </div>
    </div>
  );
}