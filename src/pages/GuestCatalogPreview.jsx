import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Music2, Film, Camera, Lock, Sparkles, ArrowRight, Play, Image as ImageIcon } from "lucide-react";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";

// Sample placeholder catalog items (visible blurred/teased to guests)
const SAMPLE_TRACKS = [
  { id: "s1", title: "Tu primer single", cover: null, status: "completed" },
  { id: "s2", title: "Demo Producción", cover: null, status: "mixing" },
  { id: "s3", title: "Colaboración feat.", cover: null, status: "idea" },
];

const SAMPLE_PROJECTS = [
  { id: "p1", title: "EP Debut", type: "EP", tracks: 4 },
  { id: "p2", title: "Album de Arte", type: "Album", tracks: 10 },
];

const SAMPLE_VIDEOS = [
  { id: "v1", title: "Mini Film / Clip", type: "minifilm" },
  { id: "v2", title: "Documental BTS", type: "film" },
];

function LockedCard({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative group"
    >
      <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl"
        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)" }}>
        <Lock className="w-4 h-4 text-white/40" />
      </div>
      <div className="opacity-40 pointer-events-none">
        {children}
      </div>
    </motion.div>
  );
}

function SectionHeader({ icon: IconComp, label }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <IconComp className="w-3.5 h-3.5 text-white/25" />
      <p className="text-[10px] font-bold text-white/25 uppercase tracking-[0.25em]">{label}</p>
    </div>
  );
}

export default function GuestCatalogPreview() {
  const [showModal, setShowModal] = useState(false);

  // Fetch real ExplorarItems for the preview backdrop
  const { data: explorarItems = [] } = useQuery({
    queryKey: ["guest-catalog-preview-items"],
    queryFn: () => base44.entities.ExplorarItem.filter({ is_active: true }),
    staleTime: 60000,
  });

  const featuredItem = explorarItems.find(i => i.is_hero) || explorarItems[0];
  const bgImage = featuredItem?.thumbnail_url
    || featuredItem?.hero_media_url
    || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600&q=80";

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white pb-36 overflow-x-hidden">

      {/* ── Cinematic hero header ── */}
      <div className="relative h-48 overflow-hidden mb-6">
        <img
          src={bgImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.25) saturate(0.8)" }}
        />
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to bottom, rgba(10,10,11,0.2) 0%, rgba(10,10,11,0.98) 100%)"
        }} />

        {/* Logo */}
        <div className="absolute top-4 left-4">
          <img
            src="https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png"
            alt="Cabaña Creative"
            className="h-10 w-auto opacity-70"
          />
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ff5833]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#ff5833]">Tu espacio creativo</span>
            </div>
            <h1
              className="text-2xl font-black text-white leading-none"
              style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.04em" }}
            >
              Tu catálogo
            </h1>
            <p className="text-xs text-white/35 mt-1">Gestiona tus tracks, proyectos, fotos y videos</p>
          </motion.div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-4 space-y-8">

        {/* Tracks preview */}
        <div>
          <SectionHeader icon={Music2} label="Tracks" />
          <div className="space-y-2">
            {SAMPLE_TRACKS.map((track, i) => (
              <LockedCard key={track.id} delay={0.1 + i * 0.05}>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                  <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                    <Music2 className="w-4 h-4 text-white/20" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{track.title}</p>
                    <p className="text-[10px] text-white/30">{track.status}</p>
                  </div>
                  <Play className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />
                </div>
              </LockedCard>
            ))}
          </div>
        </div>

        {/* Projects preview */}
        <div>
          <SectionHeader icon={Film} label="Proyectos" />
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {SAMPLE_PROJECTS.map((p, i) => (
              <LockedCard key={p.id} delay={0.2 + i * 0.06}>
                <div className="flex-shrink-0 w-[110px]">
                  <div className="aspect-square rounded-lg bg-white/[0.05] flex items-center justify-center mb-1.5 border border-white/[0.05]">
                    <Music2 className="w-7 h-7 text-white/10" />
                  </div>
                  <p className="text-[11px] font-semibold text-white truncate">{p.title}</p>
                  <p className="text-[10px] text-white/30">{p.type} · {p.tracks} tracks</p>
                </div>
              </LockedCard>
            ))}
          </div>
        </div>

        {/* Video preview */}
        <div>
          <SectionHeader icon={Film} label="Video" />
          <div className="space-y-2">
            {SAMPLE_VIDEOS.map((v, i) => (
              <LockedCard key={v.id} delay={0.3 + i * 0.05}>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                  <div className="w-20 h-12 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                    <Film className="w-4 h-4 text-white/20" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{v.title}</p>
                    <p className="text-[10px] text-white/30 uppercase tracking-wide">{v.type}</p>
                  </div>
                </div>
              </LockedCard>
            ))}
          </div>
        </div>

        {/* Photos preview */}
        <div>
          <SectionHeader icon={Camera} label="Fotos" />
          <div className="grid grid-cols-3 gap-1.5">
            {[...Array(6)].map((_, i) => (
              <LockedCard key={i} delay={0.35 + i * 0.03}>
                <div
                  className="aspect-square rounded-lg"
                  style={{ background: `rgba(255,255,255,${0.03 + i * 0.01})`, border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-white/10" />
                  </div>
                </div>
              </LockedCard>
            ))}
          </div>
        </div>

        {/* CTA block */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-2xl p-6 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(255,88,51,0.12) 0%, rgba(255,88,51,0.04) 50%, rgba(10,10,11,0) 100%)",
            border: "1px solid rgba(255,88,51,0.2)",
          }}
        >
          {/* Ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at top, rgba(255,88,51,0.18) 0%, transparent 70%)" }} />

          <Sparkles className="w-6 h-6 text-[#ff5833] mx-auto mb-3 relative z-10" />
          <h2
            className="text-lg font-black text-white mb-2 relative z-10"
            style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.03em" }}
          >
            Tu espacio creativo
          </h2>
          <p className="text-xs text-white/45 mb-5 leading-relaxed relative z-10 max-w-xs mx-auto">
            Gestiona tus tracks, proyectos audiovisuales, fotos y videos en una sola plataforma diseñada para creadores.
          </p>

          <div className="flex flex-col gap-2.5 relative z-10">
            <button
              onClick={() => base44.auth.redirectToLogin(window.location.href)}
              className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{ background: "#ff5833" }}
            >
              Empieza gratis — 14 días
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => base44.auth.redirectToLogin(window.location.href)}
              className="w-full py-2.5 rounded-xl font-medium text-xs text-white/50 hover:text-white/80 transition-colors"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              Ya tengo cuenta — Iniciar sesión
            </button>
          </div>
        </motion.div>

      </div>

      {/* Bottom nav — shown without user */}
      <MobileBottomNav artistId={null} isAdmin={false} />
    </div>
  );
}