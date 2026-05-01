import React, { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Play, ChevronLeft, ChevronRight, Music2 } from "lucide-react";

function getYtThumb(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null;
}

const TYPE_LABEL = {
  song: "Canción", album: "Álbum", ep: "EP",
  minifilm: "Mini Film", film: "Film", series: "Serie",
};

// ── Mini Hero (read-only, no interactions) ──────────────────────────────────
function MiniHero({ items }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const intervalRef = useRef(null);

  const heroItems = items.filter(i => i.is_hero || i.hero_media_url || i.thumbnail_url || i.youtube_url);
  const current = heroItems[activeIdx] || heroItems[0];

  const bg = current
    ? current.thumbnail_url || getYtThumb(current.youtube_url || current.youtube_music_url) ||
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600&q=80"
    : "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600&q=80";
  const isVideo = current?.hero_media_type === "video" && current?.hero_media_url;

  const resetInterval = () => {
    clearInterval(intervalRef.current);
    if (heroItems.length > 1) {
      intervalRef.current = setInterval(() => {
        setActiveIdx(i => (i + 1) % heroItems.length);
      }, 4500);
    }
  };

  const goTo = (idx) => {
    if (idx === activeIdx || transitioning || heroItems.length < 2) return;
    setTransitioning(true);
    setTimeout(() => { setActiveIdx(idx); setTransitioning(false); }, 250);
    resetInterval();
  };

  useEffect(() => {
    resetInterval();
    return () => clearInterval(intervalRef.current);
  }, [heroItems.length]);

  if (!current) return null;

  return (
    <div className="relative w-full overflow-hidden" style={{ height: "38vh", minHeight: 220 }}>
      {/* Background */}
      <div className="absolute inset-0">
        {isVideo ? (
          <video
            key={current.id}
            src={current.hero_media_url}
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.85) saturate(1.1)" }}
            autoPlay muted loop playsInline
          />
        ) : (
          <img
            key={current.id}
            src={current.hero_media_url || bg}
            alt={current.title}
            className="w-full h-full object-cover transition-all duration-700"
            style={{ filter: "brightness(0.85) saturate(1.1)" }}
          />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(8,8,8,0.55) 20%, transparent 65%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,8,8,0.85) 0%, transparent 45%)" }} />
      </div>

      {/* Curtain */}
      <div
        className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-200"
        style={{ background: "#080808", opacity: transitioning ? 1 : 0 }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full px-5 sm:px-8 pb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[9px] font-black uppercase tracking-widest text-[#ff5833]">Destacado</span>
          {current.subtitle && (
            <>
              <span className="text-white/20 text-[9px]">·</span>
              <span className="text-[9px] text-white/40 uppercase tracking-wider">{current.subtitle}</span>
            </>
          )}
        </div>
        <h3
          className="text-base sm:text-xl font-black text-white leading-tight"
          style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.025em", maxWidth: 320 }}
        >
          {current.title}
        </h3>
        {/* Dots */}
        {heroItems.length > 1 && (
          <div className="absolute bottom-4 right-5 flex items-center gap-1">
            {heroItems.slice(0, 6).map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className="h-[2px] rounded-full transition-all duration-300"
                style={{ width: idx === activeIdx ? 18 : 6, background: idx === activeIdx ? "white" : "rgba(255,255,255,0.25)" }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Netflix card (16:9) ─────────────────────────────────────────────────────
function NetflixCard({ item, index, rowIndex }) {
  const [hovered, setHovered] = useState(false);
  const thumb = item.thumbnail_url || getYtThumb(item.youtube_url || item.youtube_music_url);
  const label = TYPE_LABEL[item.content_type] || null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: rowIndex * 0.06 + index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex-shrink-0 rounded-lg overflow-hidden cursor-default"
      style={{
        width: 180,
        aspectRatio: "16/9",
        transform: hovered ? "scale(1.06)" : "scale(1)",
        transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1)",
        zIndex: hovered ? 10 : 1,
      }}
    >
      {thumb ? (
        <img
          src={thumb}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: hovered ? "brightness(1.1) saturate(1.2)" : "brightness(0.95)" }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)" }}>
          <Music2 className="w-6 h-6 text-white/10" />
        </div>
      )}

      {/* Overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: hovered
            ? "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)"
            : "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)",
        }}
      />

      {/* Badge */}
      {label && (
        <div className="absolute top-1.5 left-1.5">
          <span className="text-[7px] font-black uppercase tracking-widest px-1 py-0.5 rounded"
            style={{ background: "rgba(255,88,51,0.9)", color: "white" }}>
            {label}
          </span>
        </div>
      )}

      {/* Play on hover */}
      {hovered && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
            <Play className="w-3 h-3 text-white ml-0.5" fill="white" />
          </div>
        </div>
      )}

      {/* Title */}
      <div className="absolute bottom-0 left-0 right-0 px-2 pb-1.5">
        <p className="text-white font-bold text-[10px] truncate leading-tight"
          style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
          {item.title || "—"}
        </p>
      </div>
    </motion.div>
  );
}

// ── Row ─────────────────────────────────────────────────────────────────────
function NetflixRow({ label, items, rowIndex }) {
  if (!items?.length) return null;
  return (
    <div className="mb-4 px-5 sm:px-8">
      <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.18em] mb-2"
        style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
        {label}
      </p>
      <div className="flex gap-2 overflow-x-hidden">
        {items.map((item, i) => (
          <NetflixCard key={item.id} item={item} index={i} rowIndex={rowIndex} />
        ))}
      </div>
    </div>
  );
}

// ── Fake nav ────────────────────────────────────────────────────────────────
function FakeNav() {
  return (
    <div className="flex items-center justify-between px-5 sm:px-8 py-3 absolute top-0 left-0 right-0 z-20"
      style={{ background: "linear-gradient(to bottom, rgba(8,8,8,0.9) 0%, transparent 100%)" }}>
      <div className="flex items-center gap-3">
        <img
          src="https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png"
          alt="Cabaña"
          className="h-7 w-auto opacity-90"
        />
        <div className="hidden sm:flex items-center gap-4 ml-2">
          {["Inicio", "Música", "Films"].map(l => (
            <span key={l} className="text-[10px] text-white/40 font-semibold">{l}</span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-white/10" />
      </div>
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────
export default function ExplorarPreview() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-60px" });

  const { data: items = [] } = useQuery({
    queryKey: ["explorar-preview-items"],
    queryFn: () => base44.entities.ExplorarItem.filter({ is_active: true }),
    staleTime: 60000,
  });

  const withThumb = items.filter(i => i.thumbnail_url || i.youtube_url || i.youtube_music_url);
  const row1 = withThumb.slice(0, 7);
  const row2 = withThumb.slice(7, 14);
  const row3 = withThumb.slice(14, 21);

  return (
    <section ref={sectionRef} className="relative w-full bg-[#0a0a0b] overflow-hidden py-16 sm:py-24">
      {/* Ambient top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,88,51,0.06) 0%, transparent 70%)" }} />

      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          <p className="text-[10px] font-semibold text-[#ff5833] uppercase tracking-[0.35em] mb-3"
            style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
            Plataforma
          </p>
          <h2
            className="font-black text-white leading-[0.9] tracking-[-0.04em]"
            style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: "clamp(2rem, 5.5vw, 3.6rem)" }}
          >
            Descubre el universo<br />
            <span style={{ color: "rgba(255,255,255,0.3)" }}>Cabaña Creative.</span>
          </h2>
        </motion.div>

        {/* Platform window */}
        <motion.div
          initial={{ opacity: 0, y: 36, scale: 0.97 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.85, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-2xl overflow-hidden"
          style={{
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 48px 120px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.03)",
          }}
        >
          {/* Fake browser chrome */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b"
            style={{ borderColor: "rgba(255,255,255,0.06)", background: "#0a0a0b" }}>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
            </div>
            <div className="flex-1 mx-3 h-5 rounded flex items-center px-2.5"
              style={{ background: "rgba(255,255,255,0.04)", maxWidth: 260 }}>
              <span className="text-[9px] text-white/18" style={{ fontFamily: "monospace" }}>
                cabanacreative.es/Explorar
              </span>
            </div>
          </div>

          {/* App content */}
          <div className="relative" style={{ background: "#080808" }}>
            <FakeNav />

            {/* Hero */}
            <MiniHero items={items} />

            {/* Content rows — overlapping hero bottom */}
            <div className="relative -mt-10 pb-10">
              {/* top fade from hero into rows */}
              <div className="absolute top-0 left-0 right-0 h-10 pointer-events-none z-10"
                style={{ background: "linear-gradient(to bottom, rgba(8,8,8,0.7) 0%, transparent 100%)" }} />

              {row1.length > 0 && <NetflixRow label="En Tendencia" items={row1} rowIndex={0} />}
              {row2.length > 0 && <NetflixRow label="Nuevos Lanzamientos" items={row2} rowIndex={1} />}
              {row3.length > 0 && <NetflixRow label="Mini Films" items={row3} rowIndex={2} />}

              {items.length === 0 && (
                <div className="space-y-4 px-5 sm:px-8 pb-6">
                  {[0, 1, 2].map(ri => (
                    <div key={ri}>
                      <div className="h-2 w-24 rounded bg-white/[0.06] mb-2" />
                      <div className="flex gap-2">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="flex-shrink-0 rounded-lg bg-white/[0.03]"
                            style={{ width: 180, aspectRatio: "16/9" }} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom fade vignette */}
            <div className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
              style={{ background: "linear-gradient(to top, #0a0a0b 0%, transparent 100%)" }} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}