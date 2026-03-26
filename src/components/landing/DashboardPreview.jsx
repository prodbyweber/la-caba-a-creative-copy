import React from "react";
import { motion } from "framer-motion";
import { Music2, Calendar, Clock, Play, TrendingUp, Award, BarChart3, Users, Eye, Heart, Share2, Verified, UserCircle2 } from "lucide-react";

const mockArtist = {
  name: "SOPHY",
  genre: "Trap / Electrónica",
  location: "Madrid, España",
  score: 87,
  avatar: "https://images.unsplash.com/photo-1611339555312-e607c25352ca?w=500&h=500&fit=crop",
  stats: [
    { icon: Music2, label: "Tracks", value: "16" },
    { icon: Award, label: "Proyectos", value: "5" },
    { icon: TrendingUp, label: "Horas Studio", value: "156h" }
  ],
  tracks: [
    { name: "Neon Nights", status: "Mastered" },
    { name: "Echoes", status: "Mixing" },
    { name: "Velocity", status: "Production" },
    { name: "Cipher", status: "Demo" }
  ],
  projects: [
    { title: "EP Distopia", status: "Mixing", progress: 70 },
    { title: "Album Resonance", status: "Production", progress: 45 }
  ],
  metrics: [
    { icon: Eye, label: "Vistas", value: "128.4K", change: "+32%" },
    { icon: Heart, label: "Likes", value: "24.8K", change: "+47%" },
    { icon: Users, label: "Seguidores", value: "34.2K", change: "+28%" },
    { icon: Share2, label: "Shares", value: "3.6K", change: "+56%" }
  ],
  sessions: [
    { day: "Lun 14:00", task: "Grabación Vocal" },
    { day: "Mié 19:00", task: "Mezcla Pistas" },
    { day: "Vie 16:00", task: "Masterización" }
  ]
};

const Card = ({ children, className = "", ...props }) => (
  <motion.div
    whileHover={{ y: -3 }}
    transition={{ duration: 0.25 }}
    className={`rounded-2xl bg-[#0f0f10] border border-white/[0.07] ${className}`}
    {...props}
  >
    {children}
  </motion.div>
);

const CardHeader = ({ icon: Icon, title, meta }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 text-white/30" />
      <span className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">{title}</span>
    </div>
    {meta && <span className="text-[10px] text-white/20">{meta}</span>}
  </div>
);

export default function DashboardPreview() {
  return (
    <section className="relative py-24 overflow-hidden bg-[#080809]">
      {/* Subtle ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-white/[0.015] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-[11px] font-semibold text-white/25 uppercase tracking-[0.3em] mb-5">
            Infraestructura Artística
          </p>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[0.95] mb-5">
            Tu carrera.<br className="hidden lg:block" /> Centralizada.
          </h2>
          <p className="text-base text-white/30 max-w-lg mx-auto leading-relaxed">
            Proyectos, catálogo, métricas y agenda — todo en un solo lugar diseñado para artistas serios.
          </p>
        </motion.div>

        {/* Desktop Dashboard */}
        <div className="hidden lg:block">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="grid grid-cols-12 gap-3"
          >

            {/* LEFT — Artist */}
            <Card className="col-span-3 p-5">
              <div className="w-full aspect-square rounded-xl overflow-hidden mb-5 bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
                <UserCircle2 className="w-20 h-20 text-white/20" />
              </div>

              <div className="text-center mb-5">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <h3 className="text-base font-black text-white uppercase tracking-widest">{mockArtist.name}</h3>
                  <Verified className="w-4 h-4 text-white/30" />
                </div>
                <p className="text-[11px] text-white/30">{mockArtist.genre}</p>
              </div>

              {/* Score */}
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-center mb-4">
                <div className="text-3xl font-black text-white">{mockArtist.score}</div>
                <div className="text-[9px] font-bold text-white/25 uppercase tracking-widest mt-0.5">Artist Score</div>
              </div>

              {/* Stats */}
              <div className="space-y-1.5">
                {mockArtist.stats.map((stat, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                    <div className="flex items-center gap-2">
                      <stat.icon className="w-3 h-3 text-white/20" />
                      <span className="text-[10px] text-white/35">{stat.label}</span>
                    </div>
                    <span className="text-[11px] font-bold text-white/60">{stat.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* CENTER */}
            <div className="col-span-6 space-y-3">
              {/* Tracks */}
              <Card className="p-5">
                <CardHeader icon={Music2} title="Catálogo" meta="16 tracks" />
                <div className="grid grid-cols-4 gap-2.5">
                  {mockArtist.tracks.map((track, i) => (
                    <motion.div key={i} whileHover={{ scale: 1.04 }} className="group cursor-pointer">
                      <div className="aspect-square rounded-xl bg-white/[0.06] border border-white/[0.07] mb-2 relative overflow-hidden flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-white/[0.08] flex items-center justify-center group-hover:bg-white/20 transition-colors">
                          <Play className="w-2.5 h-2.5 text-white/50 group-hover:text-white/90 transition-colors" />
                        </div>
                      </div>
                      <p className="text-[9px] text-white/30 truncate text-center group-hover:text-white/60 transition-colors">{track.name}</p>
                    </motion.div>
                  ))}
                </div>
              </Card>

              {/* Projects */}
              <Card className="p-5">
                <CardHeader icon={Award} title="Proyectos" meta="3 activos" />
                <div className="space-y-2.5">
                  {mockArtist.projects.map((p, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-white/70">{p.title}</span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/[0.06] text-white/35 font-medium">{p.status}</span>
                      </div>
                      <div className="h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${p.progress}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.4 + i * 0.1, duration: 1, ease: "easeOut" }}
                          className="h-full bg-white/30 rounded-full"
                        />
                      </div>
                      <p className="text-[9px] text-white/20 mt-1.5">{p.progress}% completado</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* RIGHT */}
            <div className="col-span-3 space-y-3">
              {/* Analytics */}
              <Card className="p-5">
                <CardHeader icon={BarChart3} title="Analíticas" />
                <div className="space-y-2">
                  {mockArtist.metrics.map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                      <div className="flex items-center gap-2">
                        <m.icon className="w-3 h-3 text-white/20" />
                        <span className="text-[10px] text-white/35">{m.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-white/60">{m.value}</span>
                        <span className="text-[8px] text-white/25 font-medium">{m.change}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Calendar */}
              <Card className="p-5">
                <CardHeader icon={Calendar} title="Agenda" />
                <div className="space-y-2">
                  {mockArtist.sessions.map((s, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                      <Clock className="w-3 h-3 text-white/20 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[9px] text-white/25 mb-0.5">{s.day}</div>
                        <div className="text-[11px] text-white/55 font-medium">{s.task}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="flex justify-center mt-16"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-10 py-4 rounded-2xl bg-white text-black font-bold text-sm tracking-wide hover:bg-white/90 transition-all"
            >
              Empieza hoy
            </motion.button>
          </motion.div>
        </div>

        {/* Mobile */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="lg:hidden max-w-sm mx-auto"
        >
          <div className="rounded-2xl bg-[#0f0f10] border border-white/[0.07] overflow-hidden p-5 space-y-4">

            {/* Profile */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl flex-shrink-0 bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
                <UserCircle2 className="w-8 h-8 text-white/20" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">{mockArtist.name}</h3>
                  <Verified className="w-3 h-3 text-white/25" />
                </div>
                <p className="text-[11px] text-white/30">{mockArtist.genre}</p>
              </div>
              <div className="text-center px-3 py-2 bg-white/[0.05] border border-white/[0.07] rounded-xl">
                <div className="text-lg font-black text-white">{mockArtist.score}</div>
                <div className="text-[7px] text-white/25 uppercase tracking-wider">Score</div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2">
              {mockArtist.stats.map((s, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center">
                  <div className="text-sm font-bold text-white/70">{s.value}</div>
                  <div className="text-[9px] text-white/25">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Tracks */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Music2 className="w-3 h-3 text-white/20" />
                <span className="text-[10px] text-white/25 uppercase tracking-widest">Tracks</span>
              </div>
              <div className="space-y-1.5">
                {mockArtist.tracks.map((t, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                    <div className="w-6 h-6 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                      <Play className="w-2.5 h-2.5 text-white/30" />
                    </div>
                    <span className="flex-1 text-[11px] text-white/50 font-medium truncate">{t.name}</span>
                    <span className="text-[8px] text-white/20 font-medium">{t.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sessions */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-3 h-3 text-white/20" />
                <span className="text-[10px] text-white/25 uppercase tracking-widest">Agenda</span>
              </div>
              <div className="space-y-1.5">
                {mockArtist.sessions.slice(0, 2).map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                    <Clock className="w-3 h-3 text-white/20" />
                    <span className="text-white/40">{s.day}</span>
                    <span className="text-white/55 font-medium ml-auto truncate">{s.task}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm tracking-wide"
            >
              Empieza hoy
            </motion.button>
          </div>
        </motion.div>

      </div>
    </section>
  );
}