import React, { useState } from "react";
import { motion } from "framer-motion";
import { Music2, Calendar, Clock, Verified, Play, TrendingUp, Zap, Award } from "lucide-react";

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
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Tu Dashboard Artístico
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Gestiona tus proyectos, tracks, sesiones y visualiza tu crecimiento en tiempo real
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
            <div className="grid grid-cols-3 gap-6">
              
              {/* Left Panel - Artist Profile & Stats */}
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
                className="col-span-1 rounded-2xl overflow-hidden border border-emerald-500/20 bg-gradient-to-b from-[#141414] to-black shadow-2xl shadow-emerald-500/10"
              >
                <div className="p-4 space-y-4">
                  {/* Artist Card */}
                  <div className="space-y-3">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="w-16 h-16 rounded-xl overflow-hidden border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-500 to-emerald-700 mx-auto shadow-xl"
                    >
                      <img 
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6965118e2b17684fa124077e/5cdacd140_jlytransparente.png"
                        alt="JLY"
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1.5 mb-0.5">
                        <h3 className="text-xl font-black text-white uppercase">JLY</h3>
                        <Verified className="w-4 h-4 text-emerald-500" />
                      </div>
                      <p className="text-xs text-gray-400">Urban / Catalan Trap</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Barcelona, España</p>
                    </div>
                  </div>

                  {/* Score Card */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-3 rounded-xl bg-gradient-to-b from-emerald-600/20 to-emerald-800/20 border border-emerald-500/30"
                  >
                    <div className="text-center">
                      <div className="text-3xl font-black text-emerald-400 mb-0.5">92</div>
                      <div className="text-[10px] font-bold text-emerald-200 uppercase tracking-wide">Artist Score</div>
                    </div>
                  </motion.div>

                  {/* Key Stats */}
                  <div className="space-y-1.5">
                    <motion.div
                      whileHover={{ x: 3 }}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors cursor-default"
                    >
                      <div className="flex items-center gap-2">
                        <Music2 className="w-3 h-3 text-emerald-400" />
                        <span className="text-xs text-gray-300">Tracks</span>
                      </div>
                      <span className="font-bold text-emerald-400 text-xs">12</span>
                    </motion.div>
                    <motion.div
                      whileHover={{ x: 3 }}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors cursor-default"
                    >
                      <div className="flex items-center gap-2">
                        <Award className="w-3 h-3 text-purple-400" />
                        <span className="text-xs text-gray-300">Proyectos</span>
                      </div>
                      <span className="font-bold text-purple-400 text-xs">3</span>
                    </motion.div>
                    <motion.div
                      whileHover={{ x: 3 }}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors cursor-default"
                    >
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-3 h-3 text-orange-400" />
                        <span className="text-xs text-gray-300">Horas Studio</span>
                      </div>
                      <span className="font-bold text-orange-400 text-xs">48h</span>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Center Panel - Tracks */}
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
                className="col-span-1 rounded-2xl overflow-hidden border border-purple-500/20 bg-gradient-to-b from-[#141414] to-black shadow-2xl shadow-purple-500/10"
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Music2 className="w-4 h-4 text-purple-400" />
                    <h3 className="text-base font-bold text-white">Tracks Recientes</h3>
                  </div>

                  <div className="space-y-1.5">
                    {[
                      { name: "Amanecer", badge: "Atmos", color: "from-purple-500/20 to-pink-500/20", textColor: "text-purple-400", badgeColor: "bg-orange-500/10 text-orange-400" },
                      { name: "Noctámbulo", badge: "Master", color: "from-emerald-500/20 to-blue-500/20", textColor: "text-emerald-400", badgeColor: "bg-emerald-500/10 text-emerald-400" },
                      { name: "Eclipse", badge: "Mix", color: "from-blue-500/20 to-purple-500/20", textColor: "text-blue-400", badgeColor: "bg-blue-500/10 text-blue-400" },
                      { name: "Vértigo", badge: "Demo", color: "from-yellow-500/20 to-orange-500/20", textColor: "text-yellow-400", badgeColor: "bg-yellow-500/10 text-yellow-400" }
                    ].map((track, idx) => (
                      <motion.div
                        key={idx}
                        onMouseEnter={() => setHoveredTrack(idx)}
                        onMouseLeave={() => setHoveredTrack(null)}
                        whileHover={{ x: 3, scale: 1.01 }}
                        className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/30 hover:bg-white/10 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={hoveredTrack === idx ? { scale: 1.1 } : { scale: 1 }}
                            className={`w-6 h-6 rounded bg-gradient-to-br ${track.color} flex items-center justify-center flex-shrink-0`}
                          >
                            <Play className={`w-2.5 h-2.5 ${track.textColor}`} />
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-white font-medium truncate group-hover:text-purple-300 transition-colors">{track.name}</div>
                          </div>
                          <motion.div
                            animate={hoveredTrack === idx ? { opacity: 1, x: 0 } : { opacity: 0.6, x: -4 }}
                            className={`text-[10px] px-1.5 py-0.5 rounded ${track.badgeColor} font-bold whitespace-nowrap`}
                          >
                            {track.badge}
                          </motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Right Panel - Sessions & Activity */}
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
                className="col-span-1 rounded-2xl overflow-hidden border border-orange-500/20 bg-gradient-to-b from-[#141414] to-black shadow-2xl shadow-orange-500/10"
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-400" />
                    <h3 className="text-base font-bold text-white">Próximas Sesiones</h3>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full bg-orange-400 ml-auto"
                    />
                  </div>

                  <div className="space-y-2">
                    {[
                      { day: "Lun 20:00", task: "Grabación", icon: "🎤", color: "emerald" },
                      { day: "Mié 18:00", task: "Mix", icon: "🎛️", color: "purple" },
                      { day: "Vie 15:00", task: "Master", icon: "✨", color: "orange" }
                    ].map((session, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ x: 3, scale: 1.01 }}
                        className="p-2 rounded-lg bg-gradient-to-r from-white/5 to-white/0 border border-white/10 hover:border-orange-500/30 hover:bg-white/10 transition-all group"
                      >
                        <div className="flex items-center gap-2">
                          <div className="text-lg flex-shrink-0">{session.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-[10px] font-bold text-${session.color}-400 uppercase tracking-wide`}>{session.day}</div>
                            <div className="text-xs text-white font-medium group-hover:text-orange-300 transition-colors">{session.task}</div>
                          </div>
                          <motion.div
                            animate={{ x: [0, 3, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-orange-400 text-sm"
                          >
                            →
                          </motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Quick Stats */}
                  <motion.div
                    className="pt-2 border-t border-white/10"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="p-2 rounded-lg bg-white/5 border border-white/10 text-center hover:bg-white/10 transition-colors"
                      >
                        <Zap className="w-3 h-3 text-yellow-400 mx-auto mb-1" />
                        <div className="text-xs font-bold text-white">85%</div>
                        <div className="text-[9px] text-gray-500">Productividad</div>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="p-2 rounded-lg bg-white/5 border border-white/10 text-center hover:bg-white/10 transition-colors"
                      >
                        <TrendingUp className="w-3 h-3 text-emerald-400 mx-auto mb-1" />
                        <div className="text-xs font-bold text-white">+12%</div>
                        <div className="text-[9px] text-gray-500">Este Mes</div>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
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
                🎯 Acceder al Dashboard
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
                🎯 Obtener Acceso
              </motion.button>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}