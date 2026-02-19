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

          {/* Right: Compact Visual Element */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="relative aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden border border-emerald-500/20 bg-gradient-to-br from-emerald-900/30 via-zinc-900 to-emerald-950/30 flex items-center justify-center">
              
              {/* Rotating pattern */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 opacity-10"
              >
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-emerald-500" />
                  <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-emerald-400" />
                </svg>
              </motion.div>

              {/* Center cabin icon */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="relative z-10"
              >
                <div className="w-24 h-24 rounded-full bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/30 flex items-center justify-center">
                  <svg width="45" height="45" viewBox="0 0 100 100" fill="none" className="text-emerald-400">
                    <path d="M50 10 L20 40 L30 40 L30 80 L70 80 L70 40 L80 40 Z" fill="currentColor" opacity="0.9"/>
                    <path d="M35 50 L45 50 L45 75 L35 75 Z" fill="currentColor" opacity="0.7"/>
                    <path d="M55 50 L65 50 L65 75 L55 75 Z" fill="currentColor" opacity="0.7"/>
                  </svg>
                </div>
              </motion.div>

              {/* Minimal particles */}
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -20, 0], opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, delay: i * 0.2 }}
                  className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400"
                  style={{ left: `${30 + i * 15}%`, top: `${40 + (i % 2) * 20}%` }}
                />
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}