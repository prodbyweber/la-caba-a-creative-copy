import React from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function AboutSection() {
  const { data: config } = useQuery({
    queryKey: ['landingConfig'],
    queryFn: async () => {
      const configs = await base44.entities.LandingConfig.list();
      return configs.length > 0 ? configs[0] : null;
    }
  });

  const mainText = config?.about_main_text || 'La Cabaña Creative nace de la convicción de que <span class="text-[#e8c84a] font-semibold">cada artista merece un espacio donde su visión pueda materializarse sin límites</span>.';
  const secondaryText = config?.about_secondary_text || 'No somos un estudio tradicional. Somos un refugio creativo donde la autenticidad y la identidad artística se encuentran. <span class="text-white font-medium">Buscamos dirección, claridad y una propuesta única</span>.';

  const values = [
    {
      number: "01",
      title: config?.about_value1_title || "Enfoque Real",
      desc: config?.about_value1_desc || "Estrategia sin humo"
    },
    {
      number: "02",
      title: config?.about_value2_title || "Pasión",
      desc: config?.about_value2_desc || "Tu proyecto, nuestra misión"
    },
    {
      number: "03",
      title: config?.about_value3_title || "Innovación",
      desc: config?.about_value3_desc || "Sonido único"
    },
    {
      number: "04",
      title: config?.about_value4_title || "Autenticidad",
      desc: config?.about_value4_desc || "Tu identidad, amplificada"
    }
  ];

  return (
    <section className="relative pt-24 pb-8 lg:pt-32 lg:pb-4 overflow-hidden bg-[#080809]">
      {/* Minimal ambient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Subtle yellow glow — very restrained */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#e8c84a]/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 lg:px-16">

        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 lg:mb-24"
        >
          <div className="flex items-center gap-3 mb-8">
            <span className="text-[10px] font-bold text-[#e8c84a] uppercase tracking-[0.35em]">Nuestra Esencia</span>
            <div className="flex-1 h-px bg-[#e8c84a]/20 max-w-[80px]" />
          </div>

          {/* Big heading */}
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[0.95] max-w-2xl">
            Acerca<br />
            <span className="text-white/20">de nosotros</span>
          </h2>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start mb-20 lg:mb-28">

          {/* Left — main text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-5"
          >
            <p
              className="text-lg sm:text-xl text-white/70 leading-relaxed font-light"
              dangerouslySetInnerHTML={{ __html: mainText }}
            />
            <p
              className="text-sm sm:text-base text-white/35 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: secondaryText }}
            />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const section = document.getElementById('offers');
                if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="mt-4 inline-flex items-center gap-3 text-sm font-semibold text-white border border-white/20 px-7 py-3.5 rounded-full hover:bg-white hover:text-black transition-all duration-300"
            >
              Aplicar a La Cabaña
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.button>
          </motion.div>

          {/* Right — values list */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-0 divide-y divide-white/[0.05]"
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + index * 0.07 }}
                className="group flex items-start gap-6 py-6 cursor-default"
              >
                <span className="text-[11px] font-bold text-[#e8c84a]/50 tracking-widest mt-1 group-hover:text-[#e8c84a] transition-colors duration-300">
                  {value.number}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-bold text-white/80 mb-0.5 group-hover:text-white transition-colors duration-300">
                    {value.title}
                  </h4>
                  <p className="text-sm text-white/30 leading-relaxed">
                    {value.desc}
                  </p>
                </div>
                <div className="w-4 h-px bg-[#e8c84a]/0 group-hover:bg-[#e8c84a]/40 group-hover:w-8 transition-all duration-500 mt-3 flex-shrink-0" />
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}