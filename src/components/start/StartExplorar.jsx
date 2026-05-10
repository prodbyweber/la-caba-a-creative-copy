import React, { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

function getYtThumb(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null;
}

function MiniHero({ items }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const intervalRef = useRef(null);

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
    <div className="relative w-full overflow-hidden" style={{ height: "52vh", minHeight: 280 }}>
      <div className="absolute inset-0">
        {isVideo ? (
          <video key={current.id} src={current.hero_media_url} className="w-full h-full object-cover"
            style={{ filter: "brightness(0.85) saturate(1.1)" }} autoPlay muted loop playsInline />
        ) : (
          <img key={current.id} src={current.hero_media_url || bg} alt={current.title}
            className="w-full h-full object-cover transition-all duration-700"
            style={{ filter: "brightness(0.85) saturate(1.1)" }} />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(8,8,8,0.55) 20%, transparent 65%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,8,8,1) 0%, rgba(8,8,8,0.4) 35%, transparent 60%)" }} />
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-200"
        style={{ background: "#080808", opacity: transitioning ? 1 : 0 }} />

      <div className="relative z-10 flex flex-col justify-end h-full px-4 sm:px-8 pb-3 sm:pb-5">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-[#ff5833]">Destacado</span>
        </div>
        <h3 className="text-xs sm:text-lg font-black text-white leading-tight line-clamp-2"
          style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.025em", maxWidth: "100%" }}>
          {current.title}
        </h3>

        <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-5 flex items-center gap-2 sm:gap-3">
          {heroItems.length > 1 && (
            <div className="flex items-center gap-0.5 sm:gap-1">
              {heroItems.slice(0, 4).map((_, idx) => (
                <button key={idx} onClick={() => goTo(idx)}
                  className="h-[1.5px] sm:h-[2px] rounded-full transition-all duration-300"
                  style={{ width: idx === activeIdx ? 12 : 4, background: idx === activeIdx ? "white" : "rgba(255,255,255,0.25)" }} />
              ))}
            </div>
          )}
          <a href="/Explorar"
            onClick={(e) => { e.preventDefault(); base44.auth.redirectToLogin("/Explorar"); }}
            className="group relative inline-flex items-center gap-0.5 sm:gap-1.5 overflow-hidden flex-shrink-0"
            style={{ padding: "4px 10px", borderRadius: 99, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.22)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
            <span className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 text-[7px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-white group-hover:text-black transition-colors duration-300 whitespace-nowrap"
              style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>Acceder</span>
            <svg className="relative z-10 w-2 h-2 sm:w-2.5 sm:h-2.5 text-white group-hover:text-black transition-colors duration-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

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
        width: "clamp(120px, 15vw, 180px)",
        aspectRatio: "16/9",
        transform: hovered ? "scale(1.06)" : "scale(1)",
        transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1)",
        zIndex: hovered ? 10 : 1,
      }}>
      {thumb ? (
        <img src={thumb} alt="" className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: hovered ? "brightness(1.08) saturate(1.15)" : "brightness(0.92)" }} />
      ) : (
        <div className="absolute inset-0" style={{ background: "rgba(255,255,255,0.04)" }} />
      )}
      {hovered && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)" }} />
      )}
    </motion.div>
  );
}

function NetflixRow({ label, items, rowIndex }) {
  if (!items?.length) return null;
  return (
    <div className="mb-3 sm:mb-4 px-4 sm:px-8">
      <p className="text-[8px] sm:text-[10px] font-bold text-white/40 uppercase tracking-[0.15em] sm:tracking-[0.18em] mb-1.5 sm:mb-2"
        style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>{label}</p>
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {items.map((item, i) => <NetflixCard key={item.id} item={item} index={i} rowIndex={rowIndex} />)}
      </div>
    </div>
  );
}

function FakeNav() {
  return (
    <div className="flex items-center justify-between px-5 sm:px-8 py-3 absolute top-0 left-0 right-0 z-20"
      style={{ background: "linear-gradient(to bottom, rgba(8,8,8,0.9) 0%, transparent 100%)" }}>
      <div className="flex items-center gap-3">
        <img src="https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png"
          alt="Cabaña" className="h-7 w-auto opacity-90" />
        <div className="hidden sm:flex items-center gap-4 ml-2">
          {["Inicio", "Música", "Films"].map(l => (
            <span key={l} className="text-[10px] text-white/40 font-semibold">{l}</span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.07)" }}>
          <svg className="w-3.5 h-3.5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    title: "Accede gratis a Cabaña Creative.",
    desc: "Explora una nueva generación de música, cine y cultura visual.",
  },
  {
    title: "Descubre contenido exclusivo",
    desc: "artistas emergentes y proyectos seleccionados desde nuestra plataforma.",
  },
  {
    title: "Membresía — 8€/mes",
    desc: "Alertas de campañas, oportunidades creativas, descuentos de hasta 20% y acceso prioritario a nuevos lanzamientos.",
  },
  {
    title: "Impulsa tu presencia en YouTube.",
    desc: "Si tu proyecto conecta con nuestra visión, nuestro Explorer puede ayudarte a posicionar contenido, potenciar Shorts y abrir nuevas oportunidades de monetización.",
  },
];

export default function StartExplorar() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-60px" });

  const { data: items = [] } = useQuery({
    queryKey: ["explorar-preview-items"],
    queryFn: () => base44.entities.ExplorarItem.filter({ is_active: true }),
    staleTime: 60000,
  });

  const withThumb = items.filter(i => i.thumbnail_url || i.youtube_url || i.youtube_music_url);
  const featuredItems = withThumb.slice(0, 6);

  React.useEffect(() => {
    if (featuredItems.length > 0) {
      featuredItems.forEach(item => {
        if (item.thumbnail_url || item.youtube_url) {
          const img = new Image();
          img.src = item.thumbnail_url || `https://img.youtube.com/vi/${item.youtube_url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1]}/hqdefault.jpg`;
        }
      });
    }
  }, [featuredItems]);

  return (
    <section
      id="explorar"
      ref={sectionRef}
      style={{
        position: "relative",
        width: "100%",
        minHeight: "auto",
        background: "#0a0a0b",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        padding: "clamp(60px, 10vw, 100px) clamp(24px, 6vw, 56px)",
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "600px", height: "250px", pointerEvents: "none",
        background: "radial-gradient(ellipse 50% 50% at 50% 0%, rgba(255,88,51,0.04) 0%, transparent 70%)"
      }} />

      {/* Label + headline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ marginBottom: "clamp(24px, 4vw, 40px)", position: "relative", zIndex: 1 }}
      >
        <p style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontWeight: 700, fontSize: "9px", letterSpacing: "0.3em",
          textTransform: "uppercase", color: "#ff5833",
          marginBottom: "clamp(8px, 1.5vw, 16px)",
        }}>
          Explorar
        </p>
        <h2 style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontWeight: 900,
          fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
          letterSpacing: "-0.04em",
          lineHeight: 1,
          color: "#f0ede8",
          marginBottom: "clamp(12px, 2vw, 20px)",
        }}>
          Atrévete a explorar
        </h2>
        <p style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontWeight: 300,
          fontSize: "clamp(0.8rem, 1.5vw, 0.95rem)",
          color: "rgba(240,237,232,0.5)",
          maxWidth: "500px",
          lineHeight: 1.6,
        }}>
          Curamos música, films y contenido con criterio. Una plataforma donde convergen creadores, marcas y cultura.
        </p>
      </motion.div>

      {/* Platform Preview + Features Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(20px, 3vw, 36px)", position: "relative", zIndex: 1, alignItems: "stretch" }}>
        
        {/* Left: Compact Platform Preview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "relative",
            borderRadius: "12px", overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)",
            minHeight: "320px",
          }}
        >
          {/* Browser chrome */}
          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)",
            background: "rgba(0,0,0,0.5)",
          }}>
            <div style={{ display: "flex", gap: "4px" }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
              ))}
            </div>
          </div>

          {/* Content */}
          <div style={{ position: "relative", background: "linear-gradient(135deg, #0a0a0b 0%, #0f0f11 100%)", minHeight: "280px", display: "flex", flexDirection: "column", padding: "clamp(16px, 3vw, 24px)" }}>
            {/* Platform bg mockup */}
            <div style={{ position: "absolute", inset: 0, opacity: 0.3, pointerEvents: "none" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", padding: "16px", height: "100%" }}>
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.05)", borderRadius: "6px" }} />
                ))}
              </div>
            </div>

            {/* Fake nav */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "clamp(12px, 2vw, 20px)", position: "relative", zIndex: 1 }}>
              <div style={{ width: 18, height: 6, background: "rgba(255,255,255,0.08)", borderRadius: "1px" }} />
              <div style={{ fontSize: "7px", color: "rgba(255,255,255,0.2)", fontFamily: "monospace" }}>Inicio • Música • Films</div>
            </div>

            {/* Featured cards */}
            <div style={{ display: "flex", gap: "8px", position: "relative", zIndex: 2, overflow: "hidden" }}>
              {featuredItems.map((item, i) => {
                const thumb = item.thumbnail_url || getYtThumb(item.youtube_url || item.youtube_music_url);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.05 }}
                    style={{
                      flex: "0 0 auto",
                      width: "60px",
                      aspectRatio: "2/3",
                      borderRadius: "4px",
                      overflow: "hidden",
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: thumb ? `url(${thumb})` : "rgba(255,255,255,0.05)",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Right: Features Cards (2x2 grid) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(14px, 2.5vw, 24px)", alignContent: "start" }}
        >
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: "rgba(255,88,51,0.04)",
                border: "1px solid rgba(255,88,51,0.15)",
                borderRadius: "10px",
                padding: "clamp(16px, 2.5vw, 22px)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            >
              <h3 style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontWeight: 900,
                fontSize: "clamp(0.85rem, 1.8vw, 1rem)",
                letterSpacing: "-0.02em",
                color: "#f0ede8",
                marginBottom: "clamp(6px, 1vw, 10px)",
                lineHeight: 1.2,
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontWeight: 300,
                fontSize: "clamp(0.7rem, 1.2vw, 0.85rem)",
                color: "rgba(240,237,232,0.5)",
                lineHeight: 1.4,
                margin: 0,
              }}>
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ marginTop: "clamp(32px, 5vw, 48px)", position: "relative", zIndex: 1 }}
      >
        <a
          href="/Explorar"
          onClick={(e) => { e.preventDefault(); base44.auth.redirectToLogin("/Explorar"); }}
          className="group relative inline-flex items-center gap-2 overflow-hidden"
          style={{
            padding: "clamp(10px, 1.8vw, 14px) clamp(24px, 4vw, 36px)",
            borderRadius: "99px",
            background: "#ff5833",
            border: "none",
            cursor: "pointer",
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(0.8rem, 1.5vw, 0.95rem)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#fff",
            textDecoration: "none",
            transition: "background 0.2s ease",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#e04a20"}
          onMouseLeave={e => e.currentTarget.style.background = "#ff5833"}
        >
          Acceder
          <svg style={{ width: "clamp(14px, 2vw, 18px)", height: "clamp(14px, 2vw, 18px)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </a>
      </motion.div>
    </section>
  );
}