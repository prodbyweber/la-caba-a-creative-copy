import React, { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Play } from "lucide-react";

function getYtThumb(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null;
}

// ── Mini Hero (read-only, no interactions) ──────────────────────────────────
function MiniHero({ items }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const intervalRef = useRef(null);

  // All items with any visual — prefer hero items first, then others
  const heroItems = [
    ...items.filter(i => i.is_hero),
    ...items.filter(i => !i.is_hero && (i.thumbnail_url || i.youtube_url || i.youtube_music_url)),
  ].slice(0, 8);
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

      {/* Content — title + dots */}
      <div className="relative z-10 flex flex-col justify-end h-full px-5 sm:px-8 pb-5">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[8px] font-black uppercase tracking-widest text-[#ff5833]">Destacado</span>
        </div>
        <h3
          className="text-sm sm:text-lg font-black text-white leading-tight"
          style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.025em", maxWidth: 280 }}
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
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: hovered ? "brightness(1.08) saturate(1.15)" : "brightness(0.92)" }}
        />
      ) : (
        <div className="absolute inset-0" style={{ background: "rgba(255,255,255,0.04)" }} />
      )}

      {/* Subtle hover vignette */}
      {hovered && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)" }} />
      )}
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
        <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20 flex-shrink-0">
          <img
            src="https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png"
            alt="avatar"
            className="w-full h-full object-cover"
          />
        </div>
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

            {/* Content rows — separated from hero with gentle fade bridge */}
            <div className="relative pt-6 pb-10">
              {/* subtle top fade for visual continuity */}
              <div className="absolute top-0 left-0 right-0 h-6 pointer-events-none z-10"
                style={{ background: "linear-gradient(to bottom, rgba(8,8,8,0.4) 0%, transparent 100%)" }} />

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

        {/* CTA — acceder */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 px-1"
        >
          <p className="text-sm text-white/30 font-light">
            Un universo privado de artistas, creadores y marcas.
          </p>
          <a
            href="/Explorar"
            onClick={(e) => {
              e.preventDefault();
              base44.auth.redirectToLogin("/Explorar");
            }}
            className="group relative inline-flex items-center gap-2.5 px-6 py-3 rounded-full overflow-hidden transition-all duration-300"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.14)",
            }}
          >
            <span className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span
              className="relative z-10 text-[11px] font-bold uppercase tracking-widest text-white group-hover:text-black transition-colors duration-300"
              style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
            >
              Acceder a la plataforma
            </span>
            <svg className="relative z-10 w-3.5 h-3.5 text-white group-hover:text-black transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}