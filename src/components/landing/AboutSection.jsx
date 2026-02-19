import React from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Sparkles, Target, Heart, Zap } from "lucide-react";

export default function AboutSection() {
  const { data: config } = useQuery({
    queryKey: ['landingConfig'],
    queryFn: async () => {
      const configs = await base44.entities.LandingConfig.list();
      return configs.length > 0 ? configs[0] : null;
    }
  });

  const mainText = config?.about_main_text || 'La Cabaña Creative nace de la convicción de que <span class="text-emerald-400 font-semibold">cada artista merece un espacio donde su visión pueda materializarse sin límites</span>.';
  const secondaryText = config?.about_secondary_text || 'No somos un estudio tradicional. Somos un refugio creativo donde la autenticidad y la identidad artística se encuentran. <span class="text-white font-medium">Buscamos dirección, claridad y una propuesta única</span>.';
  
  const values = [
    {
      icon: Target,
      title: config?.about_value1_title || "Enfoque Real",
      desc: config?.about_value1_desc || "Estrategia sin humo"
    },
    {
      icon: Heart,
      title: config?.about_value2_title || "Pasión",
      desc: config?.about_value2_desc || "Tu proyecto, nuestra misión"
    },
    {
      icon: Zap,
      title: config?.about_value3_title || "Innovación",
      desc: config?.about_value3_desc || "Sonido único"
    },
    {
      icon: Sparkles,
      title: config?.about_value4_title || "Autenticidad",
      desc: config?.about_value4_desc || "Tu identidad, amplificada"
    }
  ];

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

        {/* Content centered */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto space-y-4"
        >
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed text-center px-4" dangerouslySetInnerHTML={{ __html: mainText }} />
          
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed text-center px-4" dangerouslySetInnerHTML={{ __html: secondaryText }} />

          {/* Key Values */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 pt-6 max-w-4xl mx-auto px-2">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + (index * 0.05) }}
                className="p-2 sm:p-3 rounded-lg bg-white/5 border border-white/10 text-center"
              >
                <value.icon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 mb-1 sm:mb-1.5 mx-auto" />
                <h4 className="text-white font-semibold text-xs sm:text-sm mb-0.5 leading-tight">{value.title}</h4>
                <p className="text-[10px] sm:text-xs text-gray-400 leading-tight">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Cinematic CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6, type: "spring" }}
          className="text-center mt-12"
        >
          <button
            onClick={() => {
              const section = document.getElementById('offers');
              if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className="relative group"
          >
            {/* Glow effect */}
            <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 via-orange-500 to-emerald-500 rounded-full opacity-75 group-hover:opacity-100 blur-xl transition-all duration-500 animate-pulse" />
            
            {/* Button */}
            <div className="relative px-10 py-5 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-2xl flex items-center gap-3">
              <span>Aplicar a La Cabaña</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </button>
        </motion.div>
      </div>
    </section>
  );
}