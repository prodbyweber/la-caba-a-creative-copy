import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

// ── helpers ───────────────────────────────────────────────────────────────────

function getYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:music\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
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
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

// ── default data ──────────────────────────────────────────────────────────────

const defaultStories = [
  {
    id: 1,
    name: "Carlos Mendoza",
    role: "Artista Urbano",
    quote: "Trabajar con Cabaña Creative transformó completamente mi proyecto. No solo produjimos música de calidad, sino que encontramos la identidad que le faltaba.",
    image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=1920&h=1080&fit=crop&q=90",
    clips: []
  },
  {
    id: 2,
    name: "Ana Martínez",
    role: "Cantautora",
    quote: "La dirección creativa me ayudó a ver mi música desde otra perspectiva. Pasé de tener canciones sueltas a construir un proyecto coherente con narrativa visual.",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&h=1080&fit=crop&q=90",
    clips: []
  },
  {
    id: 3,
    name: "Miguel Ángel Torres",
    role: "Productor & Artista",
    quote: "El proceso fue profesional de principio a fin. Me enseñaron a trabajar con visión, y eso cambió completamente mi enfoque como artista independiente.",
    image: "https://images.unsplash.com/photo-1516575150278-77136aed6920?w=1920&h=1080&fit=crop&q=90",
    clips: []
  },
  {
    id: 4,
    name: "Laura Sánchez",
    role: "Artista Pop",
    quote: "Lo que más valoro es la honestidad. Nada de promesas vacías, solo trabajo real y resultados tangibles. Mi música ahora suena a lo que siempre quise transmitir.",
    image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=1920&h=1080&fit=crop&q=90",
    clips: []
  }
];

// ── slide background (image / YouTube embed / video file) ────────────────────

function SlideBackground({ story, active }) {
  const videoId = story.clips?.[0]?.video_url ? getYouTubeId(story.clips[0].video_url) : null;
  const isFile = story.clips?.[0]?.video_url ? isVideoFile(story.clips[0].video_url) : false;
  const fileUrl = isFile ? story.clips[0].video_url : null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Layer 1: image always present as fallback */}
      {story.image && (
        <motion.img
          src={story.image}
          alt={story.name}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.08 }}
          animate={{ scale: active ? 1 : 1.08 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        />
      )}

      {/* Layer 2: video file */}
      {fileUrl && active && (
        <video
          src={fileUrl}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Layer 3: YouTube iframe */}
      {videoId && active && (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3`}
          title={story.name}
          allow="autoplay; encrypted-media"
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            transform: "scale(1.1)",
          }}
        />
      )}

      {/* cinematic vignette + bottom gradient */}
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/30" />
    </div>
  );
}

// ── progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ total, current, onSelect }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <button key={i} onClick={() => onSelect(i)} className="relative h-[2px] flex-1 bg-white/20 rounded-full overflow-hidden">
          {i === current && (
            <motion.div
              className="absolute inset-y-0 left-0 bg-white rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 6, ease: "linear" }}
              key={current}
            />
          )}
          {i < current && <div className="absolute inset-0 bg-white/70" />}
        </button>
      ))}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function StoriesSection() {
  const { data: config } = useQuery({
    queryKey: ['landingConfig'],
    queryFn: async () => {
      const configs = await base44.entities.LandingConfig.list();
      return configs.length > 0 ? configs[0] : null;
    }
  });

  const stories = (config?.testimonials?.length > 0 ? config.testimonials : defaultStories);

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [paused, setPaused] = useState(false);
  const autoRef = useRef(null);

  const go = (idx, dir = 1) => {
    setDirection(dir);
    setCurrent(idx);
  };

  const prev = () => go(current === 0 ? stories.length - 1 : current - 1, -1);
  const next = () => go((current + 1) % stories.length, 1);

  // auto-advance every 6s
  useEffect(() => {
    if (paused) return;
    autoRef.current = setTimeout(() => next(), 6000);
    return () => clearTimeout(autoRef.current);
  }, [current, paused, stories.length]);

  // keyboard nav
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [current]);

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? "6%" : "-6%", opacity: 0, scale: 1.02 }),
    center: { x: "0%", opacity: 1, scale: 1 },
    exit: (dir) => ({ x: dir > 0 ? "-6%" : "6%", opacity: 0, scale: 0.98 }),
  };

  const story = stories[current];

  return (
    <section
      className="relative w-full overflow-hidden bg-black"
      style={{ height: "100svh", minHeight: 560 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Slides ── */}
      <AnimatePresence custom={direction} mode="sync">
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <SlideBackground story={story} active={true} />
        </motion.div>
      </AnimatePresence>

      {/* ── Top UI bar ── */}
      <div className="absolute top-0 left-0 right-0 z-20 px-6 sm:px-12 lg:px-20 pt-8 pb-4">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center gap-3 mb-6"
        >
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.35em]">Historias que hemos contado</span>
          <div className="h-px bg-white/15 flex-1 max-w-[80px]" />
        </motion.div>

        {/* Progress bars */}
        <ProgressBar total={stories.length} current={current} onSelect={(i) => go(i, i > current ? 1 : -1)} />
      </div>

      {/* ── Bottom content ── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-6 sm:px-12 lg:px-20 pb-12 sm:pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Quote */}
            <blockquote
              className="text-white text-xl sm:text-2xl lg:text-3xl font-light leading-snug max-w-3xl mb-6"
              style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
            >
              "{story.quote}"
            </blockquote>

            {/* Author */}
            <div className="flex items-center gap-4">
              {story.image && (
                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 flex-shrink-0">
                  <img src={story.image} alt={story.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <p className="text-white font-semibold text-sm tracking-wide">{story.name}</p>
                <p className="text-white/45 text-xs">{story.role}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Nav arrows + counter ── */}
        <div className="flex items-center gap-4 mt-10">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.93 }}
            onClick={prev}
            className="w-11 h-11 rounded-full border border-white/20 bg-white/[0.07] backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/15 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.93 }}
            onClick={next}
            className="w-11 h-11 rounded-full border border-white/20 bg-white/[0.07] backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/15 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>

          <span className="text-white/30 text-xs tabular-nums ml-1">
            {String(current + 1).padStart(2, "0")} / {String(stories.length).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* ── Click zones (left/right half) for swipe-like nav ── */}
      <div className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-w-resize" onClick={prev} />
      <div className="absolute inset-y-0 right-0 w-1/3 z-10 cursor-e-resize" onClick={next} />

      {/* ── Subtle film grain texture overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />
    </section>
  );
}