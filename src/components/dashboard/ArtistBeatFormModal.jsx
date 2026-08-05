import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Upload, Music2, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GENRES, KEYS } from "@/lib/musicConstants";

// Formulario de subida/edición de un beat PRIVADO para un artista.
// El beat queda asignado al artista (artist_id) y es siempre privado:
// nunca aparece en el marketplace ni en el catálogo público de Beats.
export default function ArtistBeatFormModal({ artistId, beat, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState(
    beat
      ? { ...beat }
      : {
          title: "",
          audio_url: "",
          cover_url: "",
          genre: "",
          genres: [],
          bpm: null,
          key: "",
          description: "",
          tags: [],
        }
  );
  const [uploading, setUploading] = useState(null);
  const [mp3Error, setMp3Error] = useState(null);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      // Filtrar campos internos que no deben enviarse en el update/create.
      const { id, created_date, updated_date, created_by_id, ...rest } = data;
      const payload = { ...rest, artist_id: artistId };
      if (beat?.id) return base44.entities.ArtistBeat.update(beat.id, payload);
      return base44.entities.ArtistBeat.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["artist-beats", artistId] });
      onClose();
    },
    onError: (err) => {
      console.error("[ArtistBeatFormModal] save failed:", err);
      alert("No se pudo guardar el beat: " + (err?.message || "Error desconocido"));
    },
  });

  const handleUpload = async (file, field) => {
    if (!file) return;
    setUploading(field);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      if (!file_url) throw new Error("No se recibió la URL del archivo");
      setForm((f) => ({ ...f, [field]: file_url }));
    } catch (err) {
      console.error("[ArtistBeatFormModal] upload failed:", err);
      alert("No se pudo subir el archivo: " + (err?.message || "Error desconocido"));
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
    if (file.size > 70 * 1024 * 1024) {
      setMp3Error("El archivo supera los 70MB.");
      return;
    }
    setMp3Error(null);
    setUploading("mp3");
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      if (!file_url) throw new Error("No se recibió la URL del archivo");
      setForm((f) => ({ ...f, audio_url: file_url }));
    } catch (err) {
      console.error("[ArtistBeatFormModal] MP3 upload failed:", err);
      setMp3Error("No se pudo subir el MP3: " + (err?.message || "Error desconocido"));
    } finally {
      setUploading(null);
    }
  };

  const toggleGenre = (g) => {
    setForm((f) => {
      const genres = f.genres.includes(g)
        ? f.genres.filter((x) => x !== g)
        : [...f.genres, g];
      return { ...f, genres, genre: genres[0] || "" };
    });
  };
  const toggleTag = (g) => {
    setForm((f) => ({
      ...f,
      tags: (f.tags || []).includes(g)
        ? f.tags.filter((x) => x !== g)
        : [...(f.tags || []), g],
    }));
  };

  const handleSubmit = () => saveMutation.mutate(form);

  const iCls =
    "w-full px-3 py-2.5 rounded-xl text-sm text-white bg-white/[0.05] border border-white/[0.08] focus:outline-none focus:border-white/20 transition-colors placeholder-white/20";
  const labelCls =
    "block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1.5";

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
        className="w-full max-w-2xl rounded-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
        style={{ background: "#141416", border: "1px solid rgba(255,255,255,0.08)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-white/5"
          style={{ background: "#141416" }}
        >
          <h2 className="text-lg font-black text-white tracking-tight">
            {beat ? "Editar beat exclusivo" : "Añadir beat exclusivo"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white/50" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Portada */}
          <div>
            <label className={labelCls}>Portada</label>
            <div className="flex items-center gap-3">
              <div
                className="w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
                style={{
                  background: "#1a1a1c",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
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
                  onChange={(e) =>
                    e.target.files?.[0] && handleUpload(e.target.files[0], "cover_url")
                  }
                />
                <div
                  className={`${iCls} flex items-center justify-center gap-2 hover:bg-white/[0.08] cursor-pointer`}
                >
                  <Upload className="w-3.5 h-3.5 text-white/40" />
                  {uploading === "cover_url"
                    ? "Subiendo..."
                    : form.cover_url
                    ? "Cambiar portada"
                    : "Subir portada"}
                </div>
              </label>
            </div>
          </div>

          {/* Título */}
          <div>
            <label className={labelCls}>Título</label>
            <input
              value={form.title || ""}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className={iCls}
              placeholder="Título del beat"
            />
          </div>

          {/* Audio MP3 */}
          <div>
            <label className={labelCls}>Audio (MP3)</label>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="audio/mpeg,.mp3"
                className="hidden"
                onChange={(e) =>
                  e.target.files?.[0] && handleUploadMp3(e.target.files[0])
                }
              />
              <div
                className={`${iCls} flex items-center gap-2 hover:bg-white/[0.08] cursor-pointer`}
              >
                <Music2 className="w-3.5 h-3.5 text-white/40" />
                {uploading === "mp3"
                  ? "Subiendo..."
                  : form.audio_url
                  ? "Archivo subido — Cambiar"
                  : "Subir MP3"}
              </div>
            </label>
            {mp3Error && (
              <p className="text-[11px] font-semibold text-red-400 mt-1.5">{mp3Error}</p>
            )}
          </div>

          {/* BPM + Tonalidad */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>BPM</label>
              <input
                type="number"
                value={form.bpm || ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    bpm: e.target.value ? parseInt(e.target.value) : null,
                  }))
                }
                className={iCls}
                placeholder="140"
              />
            </div>
            <div>
              <label className={labelCls}>Tonalidad (opcional)</label>
              <select
                value={form.key || ""}
                onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
                className={iCls}
              >
                <option value="">—</option>
                {KEYS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Géneros */}
          <div>
            <label className={labelCls}>Género</label>
            <div className="flex flex-wrap gap-1.5">
              {GENRES.map((g) => {
                const active = (form.genres || []).includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                      active
                        ? "bg-[#ff5833] text-white"
                        : "bg-white/5 text-white/40 hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Etiquetas */}
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
                      active
                        ? "bg-white/15 text-white"
                        : "bg-white/5 text-white/40 hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Descripción */}
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

          {/* Aviso de privacidad */}
          <div
            className="rounded-xl px-4 py-3 text-[11px] text-white/45 leading-relaxed"
            style={{ background: "rgba(255,88,51,0.06)", border: "1px solid rgba(255,88,51,0.12)" }}
          >
            Este beat será <span className="font-bold text-[#ff8866]">privado</span>: solo
            visible para administradores y el artista propietario. No aparecerá en el
            marketplace ni en el catálogo público.
          </div>
        </div>

        <div
          className="flex gap-3 px-5 py-4 border-t border-white/5 sticky bottom-0"
          style={{ background: "#141416" }}
        >
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 text-sm font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saveMutation.isPending || !form.title}
            className="flex-1 py-3 rounded-xl text-white text-sm font-bold transition-colors disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #ff5833, #e0451f)" }}
          >
            {saveMutation.isPending ? "Guardando..." : "Guardar beat"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}