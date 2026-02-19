import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Target, Heart, Zap } from "lucide-react";

export default function AboutSection() {
  return (
    <section className="relative py-16 overflow-hidden bg-zinc-950/50">
      {/* Subtle decorative elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 3, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 left-10 text-emerald-500/30"
        >
          <svg width="40" height="40" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 10 Q20 30 25 60 Q30 50 50 55 Q70 50 75 60 Q80 30 50 10Z" />
          </svg>
        </motion.div>
        <motion.div
          animate={{ y: [0, 10, 0], rotate: [0, -3, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-10 right-10 text-emerald-500/20"
        >
          <svg width="35" height="35" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 15 Q25 35 30 65 Q35 55 50 58 Q65 55 70 65 Q75 35 50 15Z" />
          </svg>
        </motion.div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8">
        {/* Compact Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, type: "spring" }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400">Nuestra Esencia</span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Acerca de nosotros
          </h2>
        </motion.div>

        {/* Compact Grid Layout */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <p className="text-base text-gray-300 leading-relaxed">
              La Cabaña Creative nace de la convicción de que <span className="text-emerald-400 font-semibold">cada artista merece un espacio donde su visión pueda materializarse sin límites</span>.
            </p>
            
            <p className="text-sm text-gray-400 leading-relaxed">
              No somos un estudio tradicional. Somos un refugio creativo donde la autenticidad y la identidad artística se encuentran. <span className="text-white font-medium">Buscamos dirección, claridad y una propuesta única</span>.
            </p>

            {/* Compact Key Values */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="p-3 rounded-lg bg-white/5 border border-white/10"
              >
                <Target className="w-6 h-6 text-emerald-400 mb-1.5" />
                <h4 className="text-white font-semibold text-sm mb-0.5">Enfoque Real</h4>
                <p className="text-xs text-gray-400">Estrategia sin humo</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
                className="p-3 rounded-lg bg-white/5 border border-white/10"
              >
                <Heart className="w-6 h-6 text-emerald-400 mb-1.5" />
                <h4 className="text-white font-semibold text-sm mb-0.5">Pasión</h4>
                <p className="text-xs text-gray-400">Tu proyecto, nuestra misión</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="p-3 rounded-lg bg-white/5 border border-white/10"
              >
                <Zap className="w-6 h-6 text-emerald-400 mb-1.5" />
                <h4 className="text-white font-semibold text-sm mb-0.5">Innovación</h4>
                <p className="text-xs text-gray-400">Sonido único</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25 }}
                className="p-3 rounded-lg bg-white/5 border border-white/10"
              >
                <Sparkles className="w-6 h-6 text-emerald-400 mb-1.5" />
                <h4 className="text-white font-semibold text-sm mb-0.5">Autenticidad</h4>
                <p className="text-xs text-gray-400">Tu identidad, amplificada</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="relative max-w-sm mx-auto rounded-2xl overflow-hidden border border-emerald-500/20 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 shadow-2xl shadow-emerald-500/10">
              
              {/* Dashboard Header */}
              <div className="p-4 border-b border-white/5 bg-gradient-to-r from-emerald-500/10 to-purple-500/10">
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 border-2 border-emerald-400/50 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/30"
                  >
                    AK
                  </motion.div>
                  <div>
                    <h3 className="text-white font-bold text-sm">Artist Name</h3>
                    <p className="text-xs text-gray-400">Dashboard</p>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="p-4 space-y-3">
                {/* Tracks & Albums */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="grid grid-cols-2 gap-2"
                >
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-emerald-400 text-xl font-bold">12</div>
                    <div className="text-xs text-gray-400">Tracks</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-purple-400 text-xl font-bold">3</div>
                    <div className="text-xs text-gray-400">Albums</div>
                  </div>
                </motion.div>

                {/* Dolby Atmos Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-blue-400 text-xs font-bold mb-1">DOLBY ATMOS</div>
                      <div className="text-white text-sm font-semibold">Spatial Audio</div>
                    </div>
                    <div className="text-2xl">🎵</div>
                  </div>
                </motion.div>

                {/* Studio Hours */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Horas de Estudio</div>
                      <div className="text-white text-lg font-bold">48h</div>
                    </div>
                    <div className="text-emerald-400">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </motion.div>

                {/* Upcoming Sessions */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                  className="p-3 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-gray-400">Próximas Sesiones</div>
                    <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                      <span className="text-white">Lun 20:00 - Grabación</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                      <span className="text-white">Mié 18:00 - Mix</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Premium Badge */}
              <div className="px-4 pb-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7 }}
                  className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-center"
                >
                  <div className="text-xs font-bold text-white">✨ Premium Dashboard</div>
                </motion.div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}