import React from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ExploracionSection() {
  const { data: config } = useQuery({
    queryKey: ['landingConfig'],
    queryFn: async () => {
      const configs = await base44.entities.LandingConfig.list();
      return configs.length > 0 ? configs[0] : null;
    }
  });

  const title = config?.exploracion_title || "EXPLORACIÓN";
  const subtitle = config?.exploracion_subtitle || "con Prod. by Weber";
  const description = config?.exploracion_description || "Incluye 2 horas en estudio junto a Prod. by Weber para producir un tema desde cero y comenzar a construir un catálogo sólido y profesional.\n\nAntes de entrar al estudio, realizamos una sesión estratégica donde revisamos tu voz, contenido, estética, branding, sonido y calidad de audio. Analizamos tus perfiles, escuchamos tu música y te entregamos un plan claro para definir tu estilo y dirección creativa.";
  const imageUrl = config?.exploracion_image_url || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&h=400&fit=crop&q=80";
  const formLink = config?.exploracion_form_link || createPageUrl("ExploracionForm");

  return (
    <section className="relative min-h-screen py-12 sm:py-16 lg:py-20 overflow-hidden bg-black">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-emerald-950/20 to-black" />
      
      <div className="relative z-10 max-w-3xl mx-auto px-6 flex flex-col items-center justify-center min-h-screen text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-8 sm:space-y-12"
        >
          {/* Título Principal */}
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-[0.2em] text-white/90 uppercase">
              {title}
            </h2>
            <p className="text-lg sm:text-xl text-white/80 font-light tracking-wide">
              {subtitle}
            </p>
          </div>

          {/* Descripción Principal */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="space-y-4 max-w-2xl mx-auto px-4"
          >
            {description.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-xs sm:text-sm md:text-base text-white/70 leading-relaxed font-light text-left">
                {paragraph}
              </p>
            ))}
          </motion.div>

          {/* Imagen */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="w-48 h-48 sm:w-64 sm:h-64 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10"
          >
            <img 
              src={imageUrl}
              alt="Prod. by Weber"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Botón Agendar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Link to={formLink}>
              <button className="px-8 sm:px-10 py-3 sm:py-4 bg-white text-black hover:bg-white/90 font-semibold rounded-full transition-all text-sm sm:text-base md:text-lg shadow-xl hover:scale-105">
                AGENDAR
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}