import React, { useState } from "react";
import { motion } from "framer-motion";
import { Music2, Calendar, Clock, Verified, Play, TrendingUp, Zap, Award, BarChart3, Users, Eye, Heart, MessageCircle, Share2, Sparkles, Flame } from "lucide-react";

const mockArtist = {
  name: "SOPHY",
  genre: "Trap / Electrónica",
  location: "Madrid, España",
  score: 87,
  avatar: "https://images.unsplash.com/photo-1611339555312-e607c25352ca?w=500&h=500&fit=crop",
  stats: [
    { icon: Music2, label: "Tracks", value: "16", color: "emerald" },
    { icon: Award, label: "Proyectos", value: "5", color: "purple" },
    { icon: TrendingUp, label: "Horas Studio", value: "156h", color: "orange" }
  ],
  tracks: [
    { name: "Neon Nights", cover: "from-pink-500 to-purple-500" },
    { name: "Echoes", cover: "from-blue-500 to-cyan-500" },
    { name: "Velocity", cover: "from-emerald-500 to-teal-500" },
    { name: "Cipher", cover: "from-orange-500 to-red-500" }
  ],
  projects: [
    { title: "EP Distopia", status: "Mixing", progress: 70, color: "emerald" },
    { title: "Album Resonance", status: "Production", progress: 45, color: "purple" },
    { title: "Collab Project", status: "Preproduction", progress: 20, color: "blue" }
  ],
  metrics: [
    { icon: Eye, label: "Vistas", value: "128.4K", change: "+32%", color: "blue" },
    { icon: Heart, label: "Likes", value: "24.8K", change: "+47%", color: "pink" },
    { icon: Users, label: "Seguidores", value: "34.2K", change: "+28%", color: "purple" },
    { icon: Share2, label: "Shares", value: "3.6K", change: "+56%", color: "emerald" }
  ],
  sessions: [
    { day: "Lun 14:00", task: "Grabación Vocal", color: "emerald" },
    { day: "Mié 19:00", task: "Mezcla Pistas", color: "purple" },
    { day: "Vie 16:00", task: "Masterización", color: "orange" }
  ]
};

export default function DashboardPreview() {
  const [hoveredTrack, setHoveredTrack] = useState(null);

  return (
    <section className="relative py-20 overflow-hidden bg-zinc-950">
      <div className="absolute inset-0 hidden lg:block">
        <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-purple-500/10 border border-emerald-500/20 mb-4">
            <Flame className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">Dashboard Pro</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Control Total de tu Carrera
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Administra proyectos, catálogo, métricas y crecimiento con herramientas profesionales en tiempo real
          </p>
        </motion.div>

        {/* Desktop View */}
        <div className="hidden lg:block">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Main Dashboard Container */}
            <div className="grid grid-cols-12 gap-4">
              
              {/* Left Sidebar - Artist Profile */}
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
                className="col-span-3 rounded-2xl overflow-hidden border border-purple-500/30 bg-gradient-to-b from-[#0f0f10] to-[#0a0a0b] shadow-2xl"
              >
                <div className="p-4 space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-full aspect-square rounded-xl overflow-hidden border-2 border-purple-500/40 shadow-xl"
                  >
                    <img 
                      src={mockArtist.avatar}
                      alt={mockArtist.name}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>

                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <h3 className="text-xl font-black text-white uppercase tracking-wide">{mockArtist.name}</h3>
                      <Verified className="w-5 h-5 text-purple-500" />
                    </div>
                    <p className="text-xs text-gray-300 font-medium">{mockArtist.genre}</p>
                    <p className="text-[11px] text-gray-500 flex items-center justify-center gap-1">
                      📍 {mockArtist.location}
                    </p>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-3.5 rounded-xl bg-gradient-to-br from-purple-600/25 to-purple-800/25 border border-purple-500/40 shadow-lg"
                  >
                    <div className="text-center">
                      <div className="text-3xl font-black text-purple-400">{mockArtist.score}</div>
                      <div className="text-[9px] font-bold text-purple-200 uppercase tracking-wider mt-0.5">Artist Score</div>
                    </div>
                  </motion.div>

                  <div className="space-y-1.5">
                    {mockArtist.stats.map((stat, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ x: 3, backgroundColor: "rgba(255,255,255,0.08)" }}
                        className="p-2 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <stat.icon className={`w-3.5 h-3.5 text-${stat.color}-400`} />
                          <span className="text-[10px] text-gray-300 font-medium">{stat.label}</span>
                        </div>
                        <span className={`font-bold text-${stat.color}-400 text-xs`}>{stat.value}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Main Content Area */}
              <div className="col-span-6 space-y-3">
                {/* Catálogo de Tracks */}
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-xl overflow-hidden border border-purple-500/20 bg-gradient-to-b from-[#0f0f10] to-[#0a0a0b] shadow-2xl"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Music2 className="w-4 h-4 text-purple-400" />
                        <h3 className="text-sm font-bold text-white">Catálogo</h3>
                      </div>
                      <span className="text-[10px] text-gray-500">12 tracks</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                       {mockArtist.tracks.map((track, idx) => (
                        <motion.div
                          key={idx}
                          whileHover={{ scale: 1.05, y: -2 }}
                          className="group cursor-pointer"
                        >
                          <div className={`aspect-square rounded-lg bg-gradient-to-br ${track.cover} mb-1.5 relative overflow-hidden`}>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                              <Play className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                          <p className="text-[9px] text-gray-400 truncate group-hover:text-white transition-colors">{track.name}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Proyectos Activos */}
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-xl overflow-hidden border border-emerald-500/20 bg-gradient-to-b from-[#0f0f10] to-[#0a0a0b] shadow-2xl"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-sm font-bold text-white">Proyectos</h3>
                      </div>
                      <span className="text-[10px] text-gray-500">3 activos</span>
                    </div>

                    <div className="space-y-2">
                       {mockArtist.projects.slice(0, 2).map((project, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ x: 2 }}
                          className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-semibold text-white">{project.title}</span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full bg-${project.color}-500/10 text-${project.color}-400`}>
                              {project.status}
                            </span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${project.progress}%` }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                              className={`h-full bg-gradient-to-r from-${project.color}-400 to-${project.color}-500`}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Right Sidebar - Analytics & Calendar */}
              <div className="col-span-3 space-y-3">
                {/* Analytics Card */}
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-xl overflow-hidden border border-blue-500/20 bg-gradient-to-b from-[#0f0f10] to-[#0a0a0b] shadow-2xl"
                >
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 className="w-4 h-4 text-blue-400" />
                      <h3 className="text-sm font-bold text-white">Análisis</h3>
                    </div>

                    <div className="space-y-2">
                       {mockArtist.metrics.map((metric, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ x: 2 }}
                          className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <metric.icon className={`w-3 h-3 text-${metric.color}-400`} />
                              <span className="text-[10px] text-gray-400">{metric.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{metric.value}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400`}>
                                {metric.change}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Calendar Card */}
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-xl overflow-hidden border border-orange-500/20 bg-gradient-to-b from-[#0f0f10] to-[#0a0a0b] shadow-2xl"
                >
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-orange-400" />
                      <h3 className="text-sm font-bold text-white">Calendario</h3>
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-1.5 h-1.5 rounded-full bg-orange-400 ml-auto"
                      />
                    </div>

                    <div className="space-y-1.5">
                       {mockArtist.sessions.map((session, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ x: 2 }}
                          className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-orange-500/30 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <Clock className={`w-3 h-3 text-${session.color}-400 flex-shrink-0`} />
                            <div className="flex-1 min-w-0">
                              <div className="text-[9px] text-gray-500">{session.day}</div>
                              <div className="text-xs text-white font-medium truncate">{session.task}</div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* CTA Button */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.7 }}
               className="flex justify-center mt-12"
             >
               <motion.button
                 whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(139, 92, 246, 0.4)" }}
                 whileTap={{ scale: 0.95 }}
                 className="px-10 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold text-lg shadow-lg shadow-purple-500/40 transition-all"
               >
                 Inicia tu Dashboard
               </motion.button>
             </motion.div>
          </motion.div>
        </div>

        {/* Mobile View - Compact Version */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="lg:hidden relative max-w-md mx-auto"
        >
          <div className="relative rounded-2xl overflow-hidden border border-emerald-500/20 bg-gradient-to-b from-[#141414] to-black shadow-2xl">
            
            {/* Artist Info */}
             <div className="p-5">
               <div className="flex items-center gap-3 mb-4">
                 <motion.div
                   initial={{ scale: 0 }}
                   whileInView={{ scale: 1 }}
                   viewport={{ once: true }}
                   transition={{ delay: 0.2, type: "spring" }}
                   className="w-16 h-16 rounded-xl overflow-hidden border-2 border-purple-500/60 shadow-lg flex-shrink-0"
                 >
                   <img 
                     src={mockArtist.avatar}
                     alt={mockArtist.name}
                     className="w-full h-full object-cover"
                   />
                 </motion.div>
                 <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-1.5 mb-0.5">
                     <h3 className="text-white font-black text-base uppercase tracking-wide">{mockArtist.name}</h3>
                     <Verified className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                   </div>
                   <p className="text-xs text-gray-400 font-medium">{mockArtist.genre}</p>
                 </div>
                 <div className="flex flex-col items-center justify-center px-3 py-2 bg-gradient-to-b from-purple-600/60 to-purple-800/60 rounded-lg border border-purple-500/50 shadow-lg flex-shrink-0">
                   <div className="text-xl font-black text-white">{mockArtist.score}</div>
                   <div className="text-[8px] font-bold text-purple-200 uppercase tracking-wider">Score</div>
                 </div>
               </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {mockArtist.stats.map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="p-2.5 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className={`text-${stat.color}-400 text-sm font-bold`}>{stat.value}</div>
                    <div className="text-[10px] text-gray-500">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Tracks List Preview */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.45 }}
                className="space-y-1.5 mb-3"
              >
                <div className="text-xs text-gray-500 mb-1.5 flex items-center gap-2">
                  <Music2 className="w-3 h-3" />
                  <span>Tracks Recientes</span>
                </div>
                
                {mockArtist.tracks.map((track, idx) => {
                  const trackStatuses = ["Dolby Atmos", "Master", "Mix", "Demo"];
                  const statusColors = ["orange", "emerald", "blue", "yellow"];
                  return (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                      <div className={`w-7 h-7 rounded bg-gradient-to-br ${track.cover} opacity-40 flex items-center justify-center flex-shrink-0`}>
                        <Play className="w-2.5 h-2.5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-white font-medium truncate">{track.name}</div>
                      </div>
                      <div className={`text-[8px] px-2 py-0.5 rounded bg-${statusColors[idx]}-500/10 text-${statusColors[idx]}-400 font-bold whitespace-nowrap`}>
                        {trackStatuses[idx]}
                      </div>
                    </div>
                  );
                })}
              </motion.div>

              {/* Calendar Preview */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="p-2.5 rounded-lg bg-gradient-to-r from-orange-500/10 to-emerald-500/10 border border-orange-500/20 mb-3"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Calendar className="w-3 h-3 text-orange-400" />
                  <span className="text-xs text-gray-400">Próximas Sesiones</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse ml-auto"></div>
                </div>
                <div className="space-y-1">
                  {mockArtist.sessions.slice(0, 2).map((session, i) => {
                    const sessionColors = ["emerald", "purple", "orange"];
                    return (
                      <div key={i} className="flex items-center gap-2 text-[11px]">
                        <Clock className={`w-3 h-3 text-${sessionColors[i]}-400`} />
                        <span className="text-white">{session.day} - {session.task}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* CTA Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.55 }}
                whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)" }}
                whileTap={{ scale: 0.97 }}
                className="w-full p-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold text-sm shadow-lg shadow-purple-500/30 transition-all"
              >
                Inicia tu Dashboard
              </motion.button>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}