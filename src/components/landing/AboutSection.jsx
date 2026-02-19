import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Target, Heart, Zap } from "lucide-react";

export default function AboutSection() {
  return (
    <section className="relative py-32 overflow-hidden bg-gradient-to-b from-zinc-950 via-emerald-950/20 to-zinc-950">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Wooden cabin texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
        }} />
        
        {/* Floating leaves */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-10 text-emerald-500/20"
        >
          <svg width="80" height="80" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 10 Q20 30 25 60 Q30 50 50 55 Q70 50 75 60 Q80 30 50 10Z" />
          </svg>
        </motion.div>

        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute top-40 right-20 text-emerald-500/15"
        >
          <svg width="60" height="60" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 15 Q25 35 30 65 Q35 55 50 58 Q65 55 70 65 Q75 35 50 15Z" />
          </svg>
        </motion.div>

        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 3, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-32 left-1/4 text-emerald-500/10"
        >
          <svg width="100" height="100" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 5 Q15 25 20 70 Q25 60 50 65 Q75 60 80 70 Q85 25 50 5Z" />
          </svg>
        </motion.div>

        <motion.div
          animate={{
            y: [0, 25, 0],
            rotate: [0, -7, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
          className="absolute bottom-20 right-1/3 text-emerald-500/20"
        >
          <svg width="70" height="70" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 12 Q22 32 27 62 Q32 52 50 56 Q68 52 73 62 Q78 32 50 12Z" />
          </svg>
        </motion.div>

        {/* Cabin roof silhouette - subtle */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl opacity-5">
          <svg viewBox="0 0 800 200" fill="currentColor" className="text-emerald-900">
            <path d="M400 20 L100 180 L700 180 Z" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-400">Nuestra Esencia</span>
          </motion.div>
          
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Acerca de nosotros
          </h2>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <div className="prose prose-invert max-w-none">
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed">
                La Cabaña Creative nace de la convicción de que <span className="text-emerald-400 font-semibold">cada artista merece un espacio donde su visión pueda materializarse sin límites</span>.
              </p>
              
              <p className="text-base sm:text-lg text-gray-400 leading-relaxed">
                No somos un estudio tradicional. Somos un refugio creativo donde la autenticidad, 
                la experimentación sonora y la identidad artística se encuentran. Trabajamos codo a codo 
                con artistas emergentes que buscan algo más que producción técnica: 
                <span className="text-white font-medium"> buscan dirección, claridad y una propuesta única</span>.
              </p>

              <p className="text-base sm:text-lg text-gray-400 leading-relaxed">
                Creemos en proyectos que <span className="text-emerald-400 font-semibold">conectan de verdad</span>, 
                en música que trasciende géneros y en marcas artísticas que cuentan historias reales. 
                Nuestra misión es simple: <span className="text-white font-medium">ayudarte a construir tu sonido, 
                tu imagen y tu estrategia para que destaques en la industria</span>.
              </p>
            </div>

            {/* Key Values */}
            <div className="grid grid-cols-2 gap-4 pt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all"
              >
                <Target className="w-8 h-8 text-emerald-400 mb-2" />
                <h4 className="text-white font-semibold mb-1">Enfoque Real</h4>
                <p className="text-sm text-gray-400">Estrategia sin humo</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all"
              >
                <Heart className="w-8 h-8 text-emerald-400 mb-2" />
                <h4 className="text-white font-semibold mb-1">Pasión</h4>
                <p className="text-sm text-gray-400">Tu proyecto, nuestra misión</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all"
              >
                <Zap className="w-8 h-8 text-emerald-400 mb-2" />
                <h4 className="text-white font-semibold mb-1">Innovación</h4>
                <p className="text-sm text-gray-400">Sonido único</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all"
              >
                <Sparkles className="w-8 h-8 text-emerald-400 mb-2" />
                <h4 className="text-white font-semibold mb-1">Autenticidad</h4>
                <p className="text-sm text-gray-400">Tu identidad, amplificada</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Visual Element */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            {/* Cabin-inspired frame */}
            <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
              {/* Image placeholder with gradient */}
              <div className="aspect-square bg-gradient-to-br from-emerald-900/40 via-zinc-900 to-emerald-950/40 flex items-center justify-center">
                
                {/* Decorative geometric pattern */}
                <motion.div
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 40,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute inset-0 opacity-10"
                >
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-emerald-500" />
                    <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-emerald-400" />
                    <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-emerald-300" />
                  </svg>
                </motion.div>

                {/* Center icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    delay: 0.3,
                    type: "spring",
                    stiffness: 200
                  }}
                  className="relative z-10"
                >
                  <div className="w-32 h-32 rounded-full bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/30 flex items-center justify-center">
                    <svg width="60" height="60" viewBox="0 0 100 100" fill="none" className="text-emerald-400">
                      <path d="M50 10 L20 40 L30 40 L30 80 L70 80 L70 40 L80 40 Z" fill="currentColor" opacity="0.9"/>
                      <path d="M35 50 L45 50 L45 75 L35 75 Z" fill="currentColor" opacity="0.7"/>
                      <path d="M55 50 L65 50 L65 75 L55 75 Z" fill="currentColor" opacity="0.7"/>
                      <path d="M45 35 L55 35 L55 45 L45 45 Z" fill="currentColor" opacity="0.6"/>
                    </svg>
                  </div>
                </motion.div>

                {/* Floating particles */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -30, 0],
                      opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{
                      duration: 3 + i * 0.5,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                    className="absolute w-2 h-2 rounded-full bg-emerald-400"
                    style={{
                      left: `${20 + i * 10}%`,
                      top: `${30 + (i % 3) * 20}%`,
                    }}
                  />
                ))}
              </div>

              {/* Bottom accent */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-emerald-500/20 to-transparent" />
            </div>

            {/* Decorative corner leaves */}
            <motion.div
              animate={{
                rotate: [0, 5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-6 -right-6 text-emerald-500/40"
            >
              <svg width="120" height="120" viewBox="0 0 100 100" fill="currentColor">
                <path d="M50 10 Q20 30 25 60 Q30 50 50 55 Q70 50 75 60 Q80 30 50 10Z" />
              </svg>
            </motion.div>

            <motion.div
              animate={{
                rotate: [0, -5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute -bottom-6 -left-6 text-emerald-500/30"
            >
              <svg width="100" height="100" viewBox="0 0 100 100" fill="currentColor">
                <path d="M50 15 Q25 35 30 65 Q35 55 50 58 Q65 55 70 65 Q75 35 50 15Z" />
              </svg>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}