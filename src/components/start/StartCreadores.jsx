import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ROTATING_WORDS = ["Artistas", "Modelos", "Creadoras", "Creadores"];

function isVideo(url) {
  return url && /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

function useAutoPlay(src) {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || !src) return;
    const play = () => { v.muted = true; v.play().catch(() => {}); };
    play();
    v.addEventListener("canplay", play);
    v.addEventListener("pause", play);
    const onVis = () => { if (!document.hidden) play(); };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      v.removeEventListener("canplay", play);
      v.removeEventListener("pause", play);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [src]);
  return ref;
}

function SlideMedia({ url }) {
  const vidRef = useAutoPlay(isVideo(url) ? url : null);
  if (!url) return null;
  if (isVideo(url)) {
    return (
      <video
        ref={vidRef}
        key={url}
        src={url}
        autoPlay muted loop playsInline preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ pointerEvents: "none" }}
      />
    );
  }
  return <img key={url} src={url} alt="" className="absolute inset-0 w-full h-full object-cover" />;
}

// ── Stories helpers ────────────────────────────────────────────────────────────

function getYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function isVideoFile(url) {
  return url && /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

const defaultStories = [
  { id: 1, name: "Carlos Mendoza", role: "Artista Urbano", quote: "Trabajar con Cabaña Creative transformó completamente mi proyecto. No solo produjimos música de calidad, sino que encontramos la identidad que le faltaba.", image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=1920&h=1080&fit=crop&q=90", clips: [] },
  { id: 2, name: "Ana Martínez", role: "Cantautora", quote: "La dirección creativa me ayudó a ver mi música desde otra perspectiva. Pasé de tener canciones sueltas a construir un proyecto coherente con narrativa visual.", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&h=1080&fit=crop&q=90", clips: [] },
  { id: 3, name: "Miguel Ángel Torres", role: "Productor & Artista", quote: "El proceso fue profesional de principio a fin. Me enseñaron a trabajar con visión, y eso cambió completamente mi enfoque como artista independiente.", image: "https://images.unsplash.com/photo-1516575150278-77136aed6920?w=1920&h=1080&fit=crop&q=90", clips: [] },
  { id: 4, name: "Laura Sánchez", role: "Artista Pop", quote: "Lo que más valoro es la honestidad. Nada de promesas vacías, solo trabajo real y resultados tangibles. Mi música ahora suena a lo que siempre quise transmitir.", image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=1920&h=1080&fit=crop&q=90", clips: [] },
];

function StoryBackground({ story }) {
  const firstClipUrl = story.clips?.[0]?.video_url || null;
  const videoId = getYouTubeId(firstClipUrl);
  const isFile = isVideoFile(firstClipUrl);
  const hasVideo = !!(videoId || isFile);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {!hasVideo && story.image && (
        <img src={story.image} alt={story.name} className="absolute inset-0 w-full h-full object-cover" />
      )}
      {isFile && (
        <video src={firstClipUrl} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
      )}
      {videoId && (
        <div className="absolute pointer-events-none" style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "177.78vh", minWidth: "100%", height: "56.25vw", minHeight: "100%" }}>
          <iframe src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1`} title={story.name} allow="autoplay; encrypted-media" className="w-full h-full" style={{ border: "none" }} />
        </div>
      )}
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/30" />
    </div>
  );
}

function ProgressBar({ total, current, onSelect }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <button key={i} onClick={() => onSelect(i)} className="relative h-[2px] flex-1 bg-white/20 rounded-full overflow-hidden">
          {i === current && (
            <motion.div className="absolute inset-y-0 left-0 bg-white rounded-full" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 6, ease: "linear" }} key={current} />
          )}
          {i < current && <div className="absolute inset-0 bg-white/70" />}
        </button>
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function StartCreadores() {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: false, margin: "-30%" });

  // Tab state
  const [activeTab, setActiveTab] = useState("creadores"); // "creadores" | "stories"

  // Creadores carousel state
  const [slideIdx, setSlideIdx] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  // Stories state
  const [storyCurrent, setStoryCurrent] = useState(0);
  const [storyDirection, setStoryDirection] = useState(1);
  const [storyPaused, setStoryPaused] = useState(false);
  const storyAutoRef = useRef(null);
  const touchStartX = useRef(null);

  const { data: cfg } = useQuery({
    queryKey: ["landingConfig"],
    queryFn: async () => { const c = await base44.entities.LandingConfig.list(); return c[0] || null; },
    staleTime: 30000,
  });

  const slides = cfg?.creadores_slides?.length
    ? cfg.creadores_slides
    : [
        { url: cfg?.hero_banner_1_image || "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1800&q=85" },
        { url: cfg?.hero_banner_2_image || "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1800&q=85" },
        { url: cfg?.hero_banner_3_image || "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1800&q=85" },
      ];

  const SERVICES = cfg?.creadores_services || [
    "Producción musical",
    "Producción audiovisual",
    "Estrategia de marca",
    "Fotografía editorial",
  ];

  const stories = (cfg?.testimonials?.length > 0 ? cfg.testimonials : defaultStories);

  const SLIDE_DURATION = 2800;
  const WORD_DURATION = 1200;

  // Slide carousel
  useEffect(() => {
    if (!inView || slides.length < 2) return;
    const id = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => { setSlideIdx(i => (i + 1) % slides.length); setTransitioning(false); }, 500);
    }, SLIDE_DURATION);
    return () => clearInterval(id);
  }, [inView, slides.length]);

  // Word rotation
  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => {
      setWordIdx(i => (i + 1) % ROTATING_WORDS.length);
    }, WORD_DURATION);
    return () => clearInterval(id);
  }, [inView]);

  // Stories auto-advance
  const goStory = (idx, dir = 1) => { setStoryDirection(dir); setStoryCurrent(idx); };
  const prevStory = () => goStory(storyCurrent === 0 ? stories.length - 1 : storyCurrent - 1, -1);
  const nextStory = () => goStory((storyCurrent + 1) % stories.length, 1);

  useEffect(() => {
    if (storyPaused) return;
    storyAutoRef.current = setTimeout(() => nextStory(), 6000);
    return () => clearTimeout(storyAutoRef.current);
  }, [storyCurrent, storyPaused, stories.length]);

  // Touch swipe for stories
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) { dx < 0 ? nextStory() : prevStory(); }
    touchStartX.current = null;
  };



  const storyVariants = {
    enter: (dir) => ({ x: dir > 0 ? "6%" : "-6%", opacity: 0, scale: 1.02 }),
    center: { x: "0%", opacity: 1, scale: 1 },
    exit: (dir) => ({ x: dir > 0 ? "-6%" : "6%", opacity: 0, scale: 0.98 }),
  };

  const currentUrl = typeof slides[slideIdx] === "string" ? slides[slideIdx] : slides[slideIdx]?.url;
  const story = stories[storyCurrent];

  // Preload carousel images
  React.useEffect(() => {
    slides.slice(0, 3).forEach(slide => {
      const url = typeof slide === "string" ? slide : slide?.url;
      if (url && !isVideo(url)) {
        const img = new Image();
        img.src = url;
      }
    });
  }, [slides]);

  return (
    <section
      id="artists"
      ref={sectionRef}
      style={{ position: "relative", width: "100%", height: "100dvh", minHeight: "600px", overflow: "hidden", background: "#080808" }}
    >
      {/* ── Creadores Panel ── */}
      <AnimatePresence mode="wait">
        {activeTab === "creadores" && (
          <motion.div
            key="creadores"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end" }}
          >
      <div style={{ position: "relative", width: "100%", height: "100dvh", minHeight: "600px", overflow: "hidden", display: "flex", alignItems: "flex-end" }}>
        {/* Background slides */}
        <AnimatePresence mode="crossfade">
          <motion.div key={slideIdx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: "easeInOut" }} className="absolute inset-0">
            <SlideMedia url={currentUrl} />
          </motion.div>
        </AnimatePresence>

        {/* Overlay */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)" }} />

        {/* Navigation dots and label — top right */}
        <div style={{ position: "absolute", top: "clamp(140px, 18vw, 180px)", right: "clamp(24px, 6vw, 56px)", zIndex: 10, display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-end" }}>
          <div style={{ display: "flex", gap: "6px" }}>
            {[
              { key: "creadores", label: "Creadores" },
              { key: "stories", label: "Historias" },
            ].map((tab, idx) => (
              <motion.button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); if (tab.key === "stories") setStoryCurrent(0); else setSlideIdx(0); }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  width: activeTab === tab.key ? 16 : 5,
                  height: 2,
                  borderRadius: 2,
                  background: activeTab === tab.key ? "#ff5833" : "rgba(240,237,232,0.25)",
                  border: "none",
                  cursor: "pointer",
                  transition: "width 0.4s ease, background 0.3s ease",
                  padding: 0,
                }}
                title={tab.label}
              />
            ))}
          </div>
        </div>

        {/* Content — bottom */}
        <div style={{ position: "relative", zIndex: 10, padding: "0 clamp(24px, 6vw, 56px) clamp(140px, 16vw, 200px)", width: "100%", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "clamp(16px, 3vw, 28px)" }}>
          {/* Rotating word */}
          <div style={{ textAlign: "right", minHeight: "clamp(2.8rem, 7vw, 5rem)", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
            <AnimatePresence mode="wait">
              <motion.span key={wordIdx} initial={{ opacity: 0, y: 14, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -14, filter: "blur(8px)" }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 900, fontSize: "clamp(2rem, 6vw, 4.5rem)", letterSpacing: "-0.04em", color: "#f0ede8", lineHeight: 1, display: "block" }}>
                {ROTATING_WORDS[wordIdx]}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Services */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0", width: "100%", alignItems: "flex-end" }}>
            {SERVICES.map((service, i) => (
              <motion.div key={service} initial={{ opacity: 0, x: 12 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.3 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 900, fontSize: "clamp(1rem, 2.5vw, 1.8rem)", letterSpacing: "-0.025em", color: "rgba(240,237,232,0.4)", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "clamp(6px, 1.5vw, 12px)", marginBottom: "clamp(6px, 1.5vw, 12px)", lineHeight: 1.1, cursor: "default", transition: "color 0.2s ease", textAlign: "right", width: "fit-content", marginLeft: "auto" }}
                onMouseEnter={e => e.currentTarget.style.color = "#f0ede8"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(240,237,232,0.4)"}>
                {service}
              </motion.div>
            ))}
          </div>

          <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.8, delay: 0.9 }}
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 300, fontSize: "clamp(0.75rem, 1.5vw, 0.9rem)", color: "rgba(240,237,232,0.35)", maxWidth: "480px", lineHeight: 1.5, textAlign: "right", display: window.innerWidth < 768 ? "none" : "block" }}>
            Desarrollamos creadores con dirección artística, identidad y visión.
          </motion.p>
        </div>
      </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Historias Panel ── */}
      <AnimatePresence mode="wait">
        {activeTab === "stories" && (
          <motion.div
            key="stories"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 w-full overflow-hidden bg-black"
            onMouseEnter={() => setStoryPaused(true)}
            onMouseLeave={() => setStoryPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
        {/* Slides */}
        <AnimatePresence custom={storyDirection} mode="sync">
          <motion.div key={storyCurrent} custom={storyDirection} variants={storyVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0">
            <StoryBackground story={story} />
          </motion.div>
        </AnimatePresence>

        {/* Top UI */}
        <div className="absolute top-0 left-0 right-0 z-20 px-6 sm:px-12 lg:px-20 pt-8 pb-4">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="flex items-center gap-3 mb-6">
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.35em]">Historias que hemos contado</span>
            <div className="h-px bg-white/15 flex-1 max-w-[80px]" />
          </motion.div>
          <ProgressBar total={stories.length} current={storyCurrent} onSelect={(i) => goStory(i, i > storyCurrent ? 1 : -1)} />
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-6 sm:px-12 lg:px-20 pb-12 sm:pb-16">
          <AnimatePresence mode="wait">
            <motion.div key={storyCurrent} initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}>
              <blockquote className="text-white text-xl sm:text-2xl lg:text-3xl font-light leading-snug max-w-3xl mb-6" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                "{story.quote}"
              </blockquote>
              <div className="flex items-center gap-4">
                {(story.avatar_url || story.image) && (
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30 flex-shrink-0">
                    <img src={story.avatar_url || story.image} alt={story.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <p className="text-white font-semibold text-sm tracking-wide">{story.name}</p>
                  <p className="text-white/45 text-xs">{story.role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-4 mt-10">
            <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }} onClick={prevStory} className="w-11 h-11 rounded-full border border-white/20 bg-white/[0.07] backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/15 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }} onClick={nextStory} className="w-11 h-11 rounded-full border border-white/20 bg-white/[0.07] backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/15 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </motion.button>
            <span className="text-white/30 text-xs tabular-nums ml-1">{String(storyCurrent + 1).padStart(2, "0")} / {String(stories.length).padStart(2, "0")}</span>
          </div>
        </div>

        {/* Click zones */}
        <div className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-w-resize" onClick={prevStory} />
        <div className="absolute inset-y-0 right-0 w-1/3 z-10 cursor-e-resize" onClick={nextStory} />

        {/* Film grain */}
        <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`, backgroundRepeat: "repeat", backgroundSize: "128px 128px" }} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}