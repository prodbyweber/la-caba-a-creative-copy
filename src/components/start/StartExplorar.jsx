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
    title: "Accede gratis a Cabaña Creative",
    subtitle: "Explora una nueva generación de música, cine y cultura visual.",
  },
  {
    title: "Contenido exclusivo",
    subtitle: "Descubre artistas emergentes y proyectos seleccionados desde nuestra plataforma.",
  },
  {
    title: "Membresía — 8€/mes",
    subtitle: "Alertas de campañas, oportunidades creativas, descuentos de hasta 20% y acceso prioritario a nuevos lanzamientos.",
  },
  {
    title: "Impulsa tu presencia en YouTube",
    subtitle: "Si tu proyecto conecta con nuestra visión, nuestro Explorer puede ayudarte a posicionar contenido, potenciar Shorts y abrir nuevas oportunidades de monetización.",
  },
];

function CinematicCard({ item, index, rowIndex }) {
  const [hovered, setHovered] = useState(false);
  const thumb = item.thumbnail_url || getYtThumb(item.youtube_url || item.youtube_music_url);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: rowIndex * 0.04 + index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-lg overflow-hidden cursor-default"
      style={{
        aspectRatio: "16/10",
        transform: hovered ? "scale(1.05)" : "scale(1)",
        transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
        boxShadow: hovered ? "0 20px 40px rgba(255,88,51,0.15)" : "0 8px 24px rgba(0,0,0,0.3)",
      }}
    >
      {/* Image/Video background */}
      {thumb ? (
        <img 
          src={thumb} 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover"
          style={{ 
            filter: hovered ? "brightness(1.15) saturate(1.3) contrast(1.1)" : "brightness(0.8) saturate(0.85)",
            transition: "filter 0.3s ease"
          }}
        />
      ) : (
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,88,51,0.12) 0%, rgba(8,8,8,0.6) 100%)" }} />
      )}
      
      {/* Premium cinematic overlay */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 40%, rgba(8,8,8,0.85) 100%)",
        transition: "all 0.3s ease"
      }} />
      
      {/* Border accent on hover */}
      {hovered && (
        <div className="absolute inset-0 rounded-lg pointer-events-none" style={{
          border: "1.5px solid rgba(255,88,51,0.3)",
          animation: "none",
        }} />
      )}
      
      {/* Bottom content - Always visible */}
      <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3" style={{ zIndex: 2 }}>
        <h3 className="text-white font-bold text-xs line-clamp-2 leading-tight"
          style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.015em", fontSize: "clamp(0.65rem, 1.2vw, 0.85rem)" }}>
          {item.title}
        </h3>
      </div>
    </motion.div>
  );
}

export default function StartExplorar() {
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

  // Preload hero images
  React.useEffect(() => {
    if (items.length > 0) {
      items.slice(0, 4).forEach(item => {
        if (item.thumbnail_url || item.youtube_url) {
          const img = new Image();
          img.src = item.thumbnail_url || `https://img.youtube.com/vi/${item.youtube_url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1]}/hqdefault.jpg`;
        }
      });
    }
  }, [items]);

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
        padding: "clamp(40px, 6vw, 80px) clamp(24px, 6vw, 56px)",
        gap: "clamp(20px, 4vw, 40px)",
      }}
    >
      {/* Label + headline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: "relative", zIndex: 1 }}
      >
        <p style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontWeight: 700, fontSize: "10px", letterSpacing: "0.35em",
          textTransform: "uppercase", color: "#ff5833",
          marginBottom: "8px",
        }}>
          Explorar
        </p>
        <h2 style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontWeight: 900,
          fontSize: "clamp(2rem, 5vw, 3.2rem)",
          letterSpacing: "-0.04em",
          lineHeight: 0.95,
          color: "#f0ede8",
        }}>
          Atrévete a explorar
        </h2>
      </motion.div>

      {/* Two column layout: Cards left, Features right */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "clamp(24px, 4vw, 48px)",
        position: "relative",
        zIndex: 1,
        alignItems: "start",
      }}>
        {/* LEFT: Cinematic cards grid */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "clamp(10px, 2vw, 16px)",
            width: "100%",
          }}
        >
          {withThumb.slice(0, 8).map((item, i) => (
            <CinematicCard key={item.id || i} item={item} index={i} rowIndex={Math.floor(i / 2)} />
          ))}
        </motion.div>

        {/* RIGHT: Features premium cards */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "clamp(12px, 2vw, 16px)",
            width: "100%",
            height: "100%",
          }}
        >
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              style={{
                padding: "clamp(14px, 2.5vw, 18px)",
                borderRadius: "8px",
                border: "1px solid rgba(255,88,51,0.25)",
                background: "linear-gradient(135deg, rgba(255,88,51,0.06) 0%, rgba(255,88,51,0.02) 100%)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
                cursor: "default",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "rgba(255,88,51,0.45)";
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,88,51,0.12) 0%, rgba(255,88,51,0.06) 100%)";
                e.currentTarget.style.transform = "translateX(6px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "rgba(255,88,51,0.25)";
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,88,51,0.06) 0%, rgba(255,88,51,0.02) 100%)";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <h3 style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontWeight: 700,
                fontSize: "clamp(0.85rem, 1.8vw, 1rem)",
                color: "#f0ede8",
                marginBottom: "clamp(4px, 1vw, 8px)",
                lineHeight: 1.3,
                letterSpacing: "-0.01em",
                margin: "0 0 clamp(4px, 1vw, 8px) 0",
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontWeight: 300,
                fontSize: "clamp(0.7rem, 1.2vw, 0.8rem)",
                color: "rgba(240,237,232,0.55)",
                lineHeight: 1.4,
                margin: 0,
              }}>
                {feature.subtitle}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}