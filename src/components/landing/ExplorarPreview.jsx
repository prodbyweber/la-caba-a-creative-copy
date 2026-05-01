import React, { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Play, Lock } from "lucide-react";

function getYtThumb(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null;
}

const TYPE_LABEL = {
  song: "Canción", album: "Álbum", ep: "EP",
  minifilm: "Mini Film", film: "Film", series: "Serie",
};

// Simulated row labels
const ROWS = [
  { label: "En Tendencia", ids: [] },
  { label: "Nuevos Lanzamientos", ids: [] },
  { label: "Mini Films", ids: [] },
];

function PreviewCard({ item, index, rowIndex }) {
  const [hovered, setHovered] = useState(false);
  const thumb = item.thumbnail_url || getYtThumb(item.youtube_url || item.youtube_music_url);
  const label = TYPE_LABEL[item.content_type] || "Contenido";

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.55, delay: rowIndex * 0.08 + index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex-shrink-0 rounded-xl overflow-hidden cursor-pointer group"
      style={{ width: 160, height: 220 }}
    >
      {/* Thumbnail */}
      {thumb ? (
        <img
          src={thumb}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
          style={{ transform: hovered ? "scale(1.07)" : "scale(1)" }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] to-white/[0.02]" />
      )}

      {/* Overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: hovered
            ? "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)"
            : "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)",
        }}
      />

      {/* Type badge */}
      <div className="absolute top-2.5 left-2.5">
        <span
          className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
          style={{ background: "rgba(255,88,51,0.85)", color: "white" }}
        >
          {label}
        </span>
      </div>

      {/* Play icon on hover */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.85 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
          <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
        </div>
      </motion.div>

      {/* Title */}
      <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-3">
        <p
          className="text-white font-bold text-xs leading-tight truncate"
          style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.01em" }}
        >
          {item.title || "—"}
        </p>
        {item.subtitle && (
          <p className="text-white/40 text-[9px] mt-0.5 truncate">{item.subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}

function ContentRow({ label, items, rowIndex }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-6">
      <motion.p
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: rowIndex * 0.12, duration: 0.5 }}
        className="text-[11px] font-bold text-white/40 uppercase tracking-[0.15em] mb-3 px-1"
        style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
      >
        {label}
      </motion.p>
      <div className="flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {items.map((item, i) => (
          <PreviewCard key={item.id} item={item} index={i} rowIndex={rowIndex} />
        ))}
      </div>
    </div>
  );
}

export default function ExplorarPreview() {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const { data: items = [] } = useQuery({
    queryKey: ["explorar-preview-items"],
    queryFn: () => base44.entities.ExplorarItem.filter({ is_active: true }),
    staleTime: 60000,
  });

  // Distribute items across rows: pick those with thumbnails first
  const withThumb = items.filter(i => i.thumbnail_url || i.youtube_url || i.youtube_music_url);
  const row1 = withThumb.slice(0, 6);
  const row2 = withThumb.slice(6, 12);
  const row3 = withThumb.slice(12, 18);

  const hasContent = row1.length > 0;

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#0a0a0b] overflow-hidden py-20 sm:py-28"
    >
      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,88,51,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6"
        >
          <div>
            <p
              className="text-[10px] font-semibold text-[#ff5833] uppercase tracking-[0.35em] mb-3"
              style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
            >
              Plataforma
            </p>
            <h2
              className="font-black text-white leading-[0.9] tracking-[-0.04em]"
              style={{
                fontFamily: "'Helvetica Neue', sans-serif",
                fontSize: "clamp(2.2rem, 6vw, 4rem)",
              }}
            >
              Descubre el universo<br />
              <span style={{ color: "rgba(255,255,255,0.35)" }}>Cabaña Creative.</span>
            </h2>
            <p className="text-white/35 text-sm mt-4 max-w-md font-light leading-relaxed">
              Música, mini films, series y más — todo en una plataforma privada para artistas y creadores.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/Explorar")}
            className="flex items-center gap-2.5 px-6 py-3 rounded-full font-bold text-sm text-black transition-all flex-shrink-0"
            style={{ background: "white" }}
          >
            Entrar a Explorar
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>

        {/* Platform preview frame */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-2xl overflow-hidden"
          style={{
            border: "1px solid rgba(255,255,255,0.07)",
            background: "#0d0d0f",
            boxShadow: "0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
          }}
        >
          {/* Fake browser bar */}
          <div
            className="flex items-center gap-2 px-4 py-3 border-b"
            style={{ borderColor: "rgba(255,255,255,0.06)", background: "#0a0a0b" }}
          >
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            </div>
            <div
              className="flex-1 mx-4 h-6 rounded-md flex items-center px-3"
              style={{ background: "rgba(255,255,255,0.05)", maxWidth: 280 }}
            >
              <span className="text-[10px] text-white/20" style={{ fontFamily: "monospace" }}>
                cabanacreative.es/Explorar
              </span>
            </div>
          </div>

          {/* Platform UI mock */}
          <div className="px-5 sm:px-8 pt-5 pb-8" style={{ background: "#080808" }}>
            {/* Fake nav */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-white/5" />
                <div className="h-2 w-24 rounded bg-white/8" />
              </div>
              <div className="flex gap-2">
                <div className="h-2 w-12 rounded bg-white/5" />
                <div className="h-2 w-12 rounded bg-white/5" />
                <div className="w-6 h-6 rounded-full bg-white/8" />
              </div>
            </div>

            {/* Content rows */}
            {hasContent ? (
              <div>
                {row1.length > 0 && <ContentRow label="En Tendencia" items={row1} rowIndex={0} />}
                {row2.length > 0 && <ContentRow label="Nuevos Lanzamientos" items={row2} rowIndex={1} />}
                {row3.length > 0 && <ContentRow label="Mini Films" items={row3} rowIndex={2} />}
              </div>
            ) : (
              // Skeleton fallback
              <div className="space-y-6">
                {[0, 1, 2].map(ri => (
                  <div key={ri}>
                    <div className="h-2 w-28 rounded bg-white/8 mb-3" />
                    <div className="flex gap-2.5">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex-shrink-0 rounded-xl bg-white/[0.04]" style={{ width: 160, height: 220 }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom fade + lock overlay */}
          <div
            className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end pb-10"
            style={{
              height: 180,
              background: "linear-gradient(to top, #0a0a0b 0%, rgba(10,10,11,0.85) 50%, transparent 100%)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-col items-center gap-3"
            >
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <Lock className="w-3 h-3 text-white/40" />
                <span className="text-[11px] text-white/50 font-semibold">Contenido exclusivo para miembros</span>
              </div>
              <button
                onClick={() => navigate("/Explorar")}
                className="text-[11px] text-[#ff5833] hover:text-white transition-colors font-semibold underline underline-offset-2"
              >
                Acceder ahora →
              </button>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-10 flex flex-wrap justify-center gap-8 sm:gap-16"
        >
          {[
            { value: "100%", label: "Contenido original" },
            { value: "Privado", label: "Red cerrada de creadores" },
            { value: "Vivo", label: "Actualizado constantemente" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p
                className="font-black text-white text-xl"
                style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.03em" }}
              >
                {s.value}
              </p>
              <p className="text-[11px] text-white/30 mt-0.5">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}