import React, { useState, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Music2, Calendar, Clock, Play, Award, BarChart3, Eye, Heart, Users, Share2, ChevronRight, Pause } from "lucide-react";

const mockProjects = [
  {
    id: 1,
    title: "EP Distopia",
    status: "Mixing",
    progress: 70,
    cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=600&fit=crop",
    clips: [
      { name: "Neon Nights", duration: "3:24", cover: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&h=500&fit=crop" },
      { name: "Echoes", duration: "2:58", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=500&fit=crop" },
      { name: "Cipher", duration: "4:01", cover: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=300&h=500&fit=crop" },
    ]
  },
  {
    id: 2,
    title: "Album Resonance",
    status: "Production",
    progress: 45,
    cover: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=600&fit=crop",
    clips: [
      { name: "Velocity", duration: "3:47", cover: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=500&fit=crop" },
      { name: "Fracture", duration: "2:33", cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=500&fit=crop" },
      { name: "Void", duration: "5:12", cover: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=300&h=500&fit=crop" },
    ]
  },
  {
    id: 3,
    title: "Single — KALI",
    status: "Mastering",
    progress: 92,
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=600&fit=crop",
    clips: [
      { name: "KALI (Radio Edit)", duration: "3:15", cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&h=500&fit=crop" },
      { name: "KALI (Extended)", duration: "5:44", cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&h=500&fit=crop" },
    ]
  }
];

const mockMetrics = [
  { icon: Eye, label: "Vistas", value: "128.4K", change: "+32%" },
  { icon: Heart, label: "Likes", value: "24.8K", change: "+47%" },
  { icon: Users, label: "Seguidores", value: "34.2K", change: "+28%" },
  { icon: Share2, label: "Shares", value: "3.6K", change: "+56%" }
];

const mockSessions = [
  { day: "Lun 14:00", task: "Grabación Vocal" },
  { day: "Mié 19:00", task: "Mezcla Pistas" },
  { day: "Vie 16:00", task: "Masterización" }
];

// Clip vertical card — Netflix style
function ClipCard({ clip, index }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.45, ease: "easeOut" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative flex-shrink-0 cursor-pointer group"
      style={{ width: 90 }}
    >
      {/* Vertical cover */}
      <div className="relative rounded-xl overflow-hidden mb-2" style={{ aspectRatio: "9/16" }}>
        <img
          src={clip.cover}
          alt={clip.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-300" />
        {/* Play button on hover */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                <Play className="w-3.5 h-3.5 text-white ml-0.5" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#ff5833] scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
      </div>
      <p className="text-[9px] text-white/40 group-hover:text-white/75 transition-colors truncate text-center">{clip.name}</p>
      <p className="text-[8px] text-white/20 text-center">{clip.duration}</p>
    </motion.div>
  );
}

// Project row — Netflix row style
function ProjectRow({ project, index }) {
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.1, duration: 0.55, ease: "easeOut" }}
      className="mb-6"
    >
      {/* Row header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 mb-3 group"
      >
        {/* Project mini cover */}
        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-white/[0.08]">
          <img src={project.cover} alt={project.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors truncate">{project.title}</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-white/30 font-medium flex-shrink-0">{project.status}</span>
          </div>
          {/* Progress bar */}
          <div className="mt-1.5 h-[2px] bg-white/[0.06] rounded-full overflow-hidden w-32">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${project.progress}%` }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + index * 0.1, duration: 1, ease: "easeOut" }}
              className="h-full bg-[#ff5833]/60 rounded-full"
            />
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-[10px] text-white/25">{project.clips.length} clips</span>
          <motion.div
            animate={{ rotate: expanded ? 90 : 0 }}
            transition={{ duration: 0.25 }}
          >
            <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 transition-colors" />
          </motion.div>
        </div>
      </button>

      {/* Clips row */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex gap-3 pb-2 overflow-x-auto scrollbar-none pl-14">
              {project.clips.map((clip, i) => (
                <ClipCard key={i} clip={clip} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-px bg-white/[0.04] mt-2" />
    </motion.div>
  );
}

export default function DashboardPreview() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "6%"]);

  return (
    <section ref={sectionRef} className="relative py-24 overflow-hidden bg-[#080809]">
      {/* Ambient glow */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#ff5833]/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[300px] bg-white/[0.012] rounded-full blur-[100px]" />
      </motion.div>

      {/* Top separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="text-[10px] font-bold text-[#ff5833] uppercase tracking-[0.35em]">Plataforma</span>
            <div className="h-px bg-[#ff5833]/25 w-12" />
          </div>
          <h2
            className="text-5xl sm:text-7xl lg:text-8xl font-black text-white leading-[0.92] tracking-tight mb-6"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            Tu carrera.
            <br />
            <span className="text-white/20">Centralizada.</span>
          </h2>
          <p className="text-base text-white/30 max-w-md mx-auto leading-relaxed font-light">
            Proyectos, catálogo, clips y agenda — todo en un solo lugar.
          </p>
        </motion.div>

        {/* Desktop layout */}
        <div className="hidden lg:grid grid-cols-12 gap-4">

          {/* CENTER — Projects Netflix */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="col-span-7 rounded-2xl bg-[#0f0f10] border border-white/[0.07] p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-white/25" />
                <span className="text-[11px] font-semibold text-white/35 uppercase tracking-widest">Proyectos</span>
              </div>
              <span className="text-[10px] text-white/20">3 activos</span>
            </div>

            <div>
              {mockProjects.map((project, i) => (
                <ProjectRow key={project.id} project={project} index={i} />
              ))}
            </div>
          </motion.div>

          {/* RIGHT — Metrics + Calendar */}
          <div className="col-span-5 space-y-4">

            {/* Catalog quick stats */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl bg-[#0f0f10] border border-white/[0.07] p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <Music2 className="w-3.5 h-3.5 text-white/25" />
                <span className="text-[11px] font-semibold text-white/35 uppercase tracking-widest">Catálogo</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Tracks", value: "16" },
                  { label: "Proyectos", value: "5" },
                  { label: "Studio hrs", value: "156" }
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                    className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center"
                  >
                    <div className="text-xl font-black text-white/70">{s.value}</div>
                    <div className="text-[9px] text-white/25 uppercase tracking-wider mt-0.5">{s.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl bg-[#0f0f10] border border-white/[0.07] p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-3.5 h-3.5 text-white/25" />
                <span className="text-[11px] font-semibold text-white/35 uppercase tracking-widest">Analíticas</span>
              </div>
              <div className="space-y-2">
                {mockMetrics.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.07 }}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/[0.04] group hover:border-white/[0.08] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <m.icon className="w-3 h-3 text-white/20" />
                      <span className="text-[10px] text-white/35">{m.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-white/60">{m.value}</span>
                      <span className="text-[8px] text-[#ff5833]/60 font-medium">{m.change}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Agenda */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl bg-[#0f0f10] border border-white/[0.07] p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-3.5 h-3.5 text-white/25" />
                <span className="text-[11px] font-semibold text-white/35 uppercase tracking-widest">Agenda</span>
              </div>
              <div className="space-y-2">
                {mockSessions.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.07 }}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] hover:border-white/[0.08] transition-colors"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ff5833]/40 flex-shrink-0 mt-1.5" />
                    <div>
                      <div className="text-[9px] text-white/25 mb-0.5">{s.day}</div>
                      <div className="text-[11px] text-white/55 font-medium">{s.task}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Mobile layout */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="lg:hidden space-y-4"
        >
          {/* Projects */}
          <div className="rounded-2xl bg-[#0f0f10] border border-white/[0.07] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-3.5 h-3.5 text-white/25" />
              <span className="text-[10px] text-white/25 uppercase tracking-widest">Proyectos</span>
            </div>
            {mockProjects.slice(0, 2).map((project, i) => (
              <ProjectRow key={project.id} project={project} index={i} />
            ))}
          </div>

          {/* Stats + Agenda */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[#0f0f10] border border-white/[0.07] p-4">
              <div className="text-[10px] text-white/25 uppercase tracking-widest mb-3">Catálogo</div>
              <div className="space-y-2">
                {[{ label: "Tracks", value: "16" }, { label: "Proyectos", value: "5" }].map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[10px] text-white/30">{s.label}</span>
                    <span className="text-sm font-black text-white/60">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-[#0f0f10] border border-white/[0.07] p-4">
              <div className="text-[10px] text-white/25 uppercase tracking-widest mb-3">Agenda</div>
              <div className="space-y-1.5">
                {mockSessions.slice(0, 2).map((s, i) => (
                  <div key={i} className="text-[10px]">
                    <div className="text-white/20">{s.day}</div>
                    <div className="text-white/50 font-medium truncate">{s.task}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex justify-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-10 py-4 rounded-2xl bg-white text-black font-bold text-sm tracking-wide hover:bg-white/90 transition-all"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            Empieza hoy
          </motion.button>
        </motion.div>

      </div>

      {/* Bottom separator */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </section>
  );
}