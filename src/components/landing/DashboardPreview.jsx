import React from "react";
import { motion } from "framer-motion";
import { Music2, Calendar, Clock, Verified, Play, TrendingUp, Award, BarChart3, Users, Eye, Heart, Share2, DollarSign, ArrowUpRight, Layers } from "lucide-react";

const artist = {
  name: "SOPHY",
  genre: "Trap / Electrónica",
  location: "Madrid, España",
  avatar: "https://images.unsplash.com/photo-1611339555312-e607c25352ca?w=500&h=500&fit=crop",
  stats: [
    { label: "Tracks", value: "16", icon: Music2 },
    { label: "Proyectos", value: "5", icon: Layers },
    { label: "Horas Studio", value: "156h", icon: TrendingUp }
  ],
  tracks: [
    { name: "Neon Nights", status: "Master" },
    { name: "Echoes", status: "Mix" },
    { name: "Velocity", status: "Dolby Atmos" },
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
  wallet: {
    balance: "€2,840",
    pending: "€640",
    last: [
      { label: "Royalties Q1", amount: "+€1,200" },
      { label: "Sync License", amount: "+€840" },
      { label: "Live Session", amount: "+€800" }
    ]
  },
  sessions: [
    { day: "Lun 14:00", task: "Grabación Vocal" },
    { day: "Mié 19:00", task: "Mezcla Pistas" },
    { day: "Vie 16:00", task: "Masterización" }
  ]
};

const Card = ({ children, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className={`rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-sm ${className}`}
  >
    {children}
  </motion.div>
);

const Label = ({ children }) => (
  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/25 mb-3">{children}</p>
);

export default function DashboardPreview() {
  return (
    <section className="relative py-28 overflow-hidden bg-[#09090b]">
      {/* Subtle ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-white/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold text-white/30 uppercase tracking-[0.2em] mb-4">
            Tu panel profesional
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
            Todo tu proyecto.<br />En un solo lugar.
          </h2>
          <p className="text-base text-white/35 max-w-xl mx-auto">
            Catálogo, analíticas, wallet y agenda en una plataforma diseñada para artistas serios.
          </p>
        </motion.div>

        {/* DESKTOP GRID */}
        <div className="hidden lg:grid grid-cols-12 gap-3">

          {/* Artist Profile */}
          <Card delay={0.1} className="col-span-3 p-5 flex flex-col gap-5">
            <div>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="w-full aspect-square rounded-xl overflow-hidden mb-4"
              >
                <img src={artist.avatar} alt={artist.name} className="w-full h-full object-cover" />
              </motion.div>
              <div className="flex items-center gap-1.5 mb-1">
                <h3 className="text-base font-black text-white uppercase tracking-wide">{artist.name}</h3>
                <Verified className="w-4 h-4 text-white/50 flex-shrink-0" />
              </div>
              <p className="text-xs text-white/35">{artist.genre}</p>
              <p className="text-[11px] text-white/20 mt-0.5">{artist.location}</p>
            </div>

            <div className="border-t border-white/[0.06]" />

            <div className="space-y-2">
              {artist.stats.map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <s.icon className="w-3.5 h-3.5 text-white/25" />
                    <span className="text-[11px] text-white/40">{s.label}</span>
                  </div>
                  <span className="text-sm font-bold text-white/80">{s.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Center: Tracks + Projects */}
          <div className="col-span-6 flex flex-col gap-3">

            {/* Tracks */}
            <Card delay={0.15} className="p-5">
              <Label>Catálogo</Label>
              <div className="space-y-2">
                {artist.tracks.map((t, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ x: 3 }}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] transition-all cursor-default"
                  >
                    <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                      <Play className="w-3 h-3 text-white/40" />
                    </div>
                    <span className="flex-1 text-xs font-medium text-white/70 truncate">{t.name}</span>
                    <span className="text-[10px] text-white/25 font-medium">{t.status}</span>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Projects */}
            <Card delay={0.2} className="p-5">
              <Label>Proyectos Activos</Label>
              <div className="space-y-3">
                {artist.projects.map((p, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-white/70">{p.title}</span>
                      <span className="text-[10px] text-white/30">{p.status} · {p.progress}%</span>
                    </div>
                    <div className="h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${p.progress}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 + i * 0.1, duration: 1, ease: "easeOut" }}
                        className="h-full bg-white/40 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right: Analytics + Wallet */}
          <div className="col-span-3 flex flex-col gap-3">

            {/* Analytics */}
            <Card delay={0.25} className="p-5">
              <Label>Analíticas</Label>
              <div className="space-y-2.5">
                {artist.metrics.map((m, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <m.icon className="w-3.5 h-3.5 text-white/25" />
                      <span className="text-[11px] text-white/40">{m.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white/70">{m.value}</span>
                      <span className="text-[9px] text-emerald-400/70 font-semibold">{m.change}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Wallet */}
            <Card delay={0.3} className="p-5">
              <Label>Wallet</Label>
              <div className="mb-4">
                <p className="text-2xl font-black text-white tracking-tight">{artist.wallet.balance}</p>
                <p className="text-[11px] text-white/30 mt-0.5">Pendiente: {artist.wallet.pending}</p>
              </div>
              <div className="space-y-2">
                {artist.wallet.last.map((tx, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[11px] text-white/35 truncate">{tx.label}</span>
                    <span className="text-[11px] font-semibold text-emerald-400/70 whitespace-nowrap ml-2">{tx.amount}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Sessions */}
            <Card delay={0.35} className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Label>Agenda</Label>
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 ml-auto mb-3"
                />
              </div>
              <div className="space-y-2">
                {artist.sessions.map((s, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <Clock className="w-3 h-3 text-white/20 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-white/25">{s.day}</p>
                      <p className="text-[11px] font-medium text-white/60">{s.task}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* MOBILE */}
        <div className="lg:hidden space-y-3">
          <Card delay={0.1} className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                <img src={artist.avatar} alt={artist.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-white uppercase tracking-wide">{artist.name}</h3>
                  <Verified className="w-3.5 h-3.5 text-white/40" />
                </div>
                <p className="text-xs text-white/35">{artist.genre}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {artist.stats.map((s, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                  <p className="text-sm font-bold text-white/80">{s.value}</p>
                  <p className="text-[10px] text-white/30">{s.label}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card delay={0.15} className="p-5">
            <Label>Analíticas</Label>
            <div className="grid grid-cols-2 gap-2">
              {artist.metrics.map((m, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-sm font-bold text-white/80">{m.value}</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-[10px] text-white/30">{m.label}</p>
                    <p className="text-[10px] text-emerald-400/70">{m.change}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card delay={0.2} className="p-5">
            <Label>Wallet</Label>
            <p className="text-2xl font-black text-white">{artist.wallet.balance}</p>
            <p className="text-xs text-white/30 mb-3">Pendiente: {artist.wallet.pending}</p>
            {artist.wallet.last.map((tx, i) => (
              <div key={i} className="flex justify-between py-1.5 border-b border-white/[0.04] last:border-0">
                <span className="text-xs text-white/40">{tx.label}</span>
                <span className="text-xs font-semibold text-emerald-400/70">{tx.amount}</span>
              </div>
            ))}
          </Card>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex justify-center mt-12"
        >
          <button className="px-8 py-3.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-all hover:scale-[1.02]">
            Ver tu Dashboard
          </button>
        </motion.div>
      </div>
    </section>
  );
}