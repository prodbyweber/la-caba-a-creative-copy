import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Target, Heart, Zap, Music2, Calendar, Clock, Verified, Play } from "lucide-react";

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

          {/* Right: Real Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="relative max-w-sm mx-auto rounded-2xl overflow-hidden border border-red-500/20 bg-gradient-to-b from-[#141414] to-black shadow-2xl">
              
              {/* Artist Info */}
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-14 h-14 rounded-xl overflow-hidden border-2 border-red-500/50 bg-gradient-to-br from-red-500 to-red-700 shadow-xl flex-shrink-0"
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
                      <Verified className="w-3.5 h-3.5 text-red-500" />
                    </div>
                    <p className="text-xs text-gray-500">Urban / Catalan Trap</p>
                  </div>
                  <div className="flex flex-col items-center justify-center w-11 h-12 bg-gradient-to-b from-red-600 to-red-800 rounded-lg border border-red-500/50 shadow-lg">
                    <div className="text-lg font-black text-white">92</div>
                    <div className="text-[8px] font-bold text-red-200 uppercase">Score</div>
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
                    <div className="text-[10px] text-gray-500">Albums</div>
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
                  {['Amanecer', 'Noctámbulo'].map((track, i) => (
                    <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg bg-white/5 border border-white/10">
                      <div className="w-7 h-7 rounded bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                        <Play className="w-2.5 h-2.5 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-white font-medium truncate">{track}</div>
                      </div>
                      <div className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                        ATMOS
                      </div>
                    </div>
                  ))}
                </motion.div>

                {/* Calendar Preview */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="p-2.5 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 mb-3"
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
      </div>
    </section>
  );
}