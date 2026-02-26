import React, { useState } from "react";
import { motion } from "framer-motion";
import { Music2, Calendar, Clock, Verified, Play, TrendingUp, Zap, Award, BarChart3, Users, Eye, Heart, MessageCircle, Share2, Sparkles } from "lucide-react";

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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">Dashboard Premium</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Tu Dashboard Artístico
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Gestiona proyectos, catálogo, métricas y visualiza tu crecimiento en tiempo real con análisis detallado
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
                className="col-span-3 rounded-xl overflow-hidden border border-emerald-500/20 bg-gradient-to-b from-[#0f0f10] to-[#0a0a0b] shadow-2xl"
              >
                <div className="p-4 space-y-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-full aspect-square rounded-lg overflow-hidden border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-emerald-700/20 shadow-xl"
                  >
                    <img 
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6965118e2b17684fa124077e/5cdacd140_jlytransparente.png"
                      alt="JLY"
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  <div className="text-center space-y-1">
                    <div className="flex items-center justify-center gap-1.5">
                      <h3 className="text-lg font-black text-white uppercase">JLY</h3>
                      <Verified className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-xs text-gray-400">Urban / Catalan Trap</p>
                    <p className="text-[10px] text-gray-500">Barcelona, España</p>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="p-3 rounded-lg bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 border border-emerald-500/30"
                  >
                    <div className="text-center">
                      <div className="text-2xl font-black text-emerald-400">92</div>
                      <div className="text-[9px] font-bold text-emerald-200 uppercase tracking-wider">Artist Score</div>
                    </div>
                  </motion.div>

                  <div className="space-y-1">
                    {[
                      { icon: Music2, label: "Tracks", value: "12", color: "emerald" },
                      { icon: Award, label: "Proyectos", value: "3", color: "purple" },
                      { icon: TrendingUp, label: "Horas Studio", value: "48h", color: "orange" }
                    ].map((stat, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ x: 2 }}
                        className="p-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <stat.icon className={`w-3 h-3 text-${stat.color}-400`} />
                          <span className="text-[10px] text-gray-300">{stat.label}</span>
                        </div>
                        <span className={`font-bold text-${stat.color}-400 text-[10px]`}>{stat.value}</span>
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
                      {[
                        { name: "Amanecer", cover: "from-purple-500 to-pink-500" },
                        { name: "Noctámbulo", cover: "from-emerald-500 to-blue-500" },
                        { name: "Eclipse", cover: "from-blue-500 to-purple-500" },
                        { name: "Vértigo", cover: "from-yellow-500 to-orange-500" }
                      ].map((track, idx) => (
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
                      {[
                        { title: "Nuevo EP", status: "Mixing", progress: 75, color: "emerald" },
                        { title: "Single Verano", status: "Master", progress: 90, color: "purple" }
                      ].map((project, i) => (
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
                      {[
                        { icon: Eye, label: "Vistas", value: "45.2K", change: "+18%", color: "blue" },
                        { icon: Heart, label: "Likes", value: "8.5K", change: "+24%", color: "pink" },
                        { icon: Users, label: "Seguidores", value: "12.3K", change: "+15%", color: "purple" },
                        { icon: Share2, label: "Shares", value: "1.2K", change: "+32%", color: "emerald" }
                      ].map((metric, i) => (
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
                      {[
                        { day: "Lun 20:00", task: "Grabación", color: "emerald" },
                        { day: "Mié 18:00", task: "Mix", color: "purple" },
                        { day: "Vie 15:00", task: "Master", color: "orange" }
                      ].map((session, i) => (
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
              className="flex justify-center mt-8"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-lg shadow-lg shadow-emerald-500/40 transition-all"
              >
                Acceder al Dashboard
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
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-14 h-14 rounded-xl overflow-hidden border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-xl flex-shrink-0"
                >
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6965118e2b17684fa124077e/5cdacd140_jlytransparente.png"
                    alt="JLY"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <h3 className="text-white font-black text-base uppercase">JLY</h3>
                    <Verified className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <p className="text-xs text-gray-500">Urban / Catalan Trap</p>
                </div>
                <div className="flex flex-col items-center justify-center w-11 h-12 bg-gradient-to-b from-emerald-600 to-emerald-800 rounded-lg border border-emerald-500/50 shadow-lg">
                  <div className="text-lg font-black text-white">92</div>
                  <div className="text-[8px] font-bold text-emerald-200 uppercase">Score</div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="p-2 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="text-emerald-400 text-sm font-bold">12</div>
                  <div className="text-[10px] text-gray-500">Tracks</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.35 }}
                  className="p-2 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="text-purple-400 text-sm font-bold">3</div>
                  <div className="text-[10px] text-gray-500">Proyectos</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="p-2 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="text-orange-400 text-sm font-bold">48h</div>
                  <div className="text-[10px] text-gray-500">Studio</div>
                </motion.div>
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
                
                {/* Track 1 - Dolby Atmos */}
                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white/5 border border-white/10">
                  <div className="w-7 h-7 rounded bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                    <Play className="w-2.5 h-2.5 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white font-medium truncate">Amanecer</div>
                  </div>
                  <div className="text-[8px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 font-bold">
                    Dolby Atmos
                  </div>
                </div>

                {/* Track 2 - Master */}
                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white/5 border border-white/10">
                  <div className="w-7 h-7 rounded bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Play className="w-2.5 h-2.5 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white font-medium truncate">Noctámbulo</div>
                  </div>
                  <div className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                    Master
                  </div>
                </div>

                {/* Track 3 - Mix */}
                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white/5 border border-white/10">
                  <div className="w-7 h-7 rounded bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Play className="w-2.5 h-2.5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white font-medium truncate">Eclipse</div>
                  </div>
                  <div className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold">
                    Mix
                  </div>
                </div>

                {/* Track 4 - Demo */}
                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white/5 border border-white/10">
                  <div className="w-7 h-7 rounded bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <Play className="w-2.5 h-2.5 text-yellow-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white font-medium truncate">Vértigo</div>
                  </div>
                  <div className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 font-bold">
                    Demo
                  </div>
                </div>
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
                  <div className="flex items-center gap-2 text-[11px]">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    <span className="text-white">Lun 20:00 - Grabación</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <Clock className="w-3 h-3 text-purple-400" />
                    <span className="text-white">Mié 18:00 - Mix</span>
                  </div>
                </div>
              </motion.div>

              {/* CTA Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.55 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all"
              >
                Obtener Acceso
              </motion.button>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}