import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight } from "lucide-react";

export default function Hero({ config }) {
  return (
    <section className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-black">
      {/* Dark textured background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black opacity-60" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiMwMDAwMDAiIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNNjAgMEgwdjYwaDYwVjB6TTU5IDFIMXY1OGg1OFYxeiIgZmlsbD0iIzFhMWExYSIgZmlsbC1vcGFjaXR5PSIuMSIvPjwvZz48L3N2Zz4=')] opacity-30" />

      {/* Content Container */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 sm:px-8 lg:px-12 pt-24 pb-8">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-left max-w-2xl"
          >
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 sm:mb-8 leading-[1.1]">
              <span className="block text-white">
                {config?.hero_title || "El estudio creativo definitivo para artistas que buscan conectar"}
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 sm:mb-12 leading-relaxed max-w-xl">
              {config?.hero_subtitle || "Producción por horas, visuales cinematográficos y digitalización artística para proyectos que van en serio."}
            </p>

            {/* CTA Button */}
            <a href="#ofertas">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group px-8 py-4 sm:px-10 sm:py-5 rounded-full bg-gradient-to-r from-white to-gray-200 text-black font-semibold text-base sm:text-lg flex items-center gap-3 shadow-2xl shadow-white/10 hover:shadow-white/20 transition-all duration-300 w-full sm:w-auto justify-center"
              >
                {config?.hero_cta_text || "Aplicar a La Cabaña Creative"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </a>
          </motion.div>
        </div>
      </div>

      {/* Hero Image - Artist (Smaller) */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="relative z-20 w-full flex justify-center items-end pb-12"
      >
        <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto">
          {/* Large Background Text - 2026 */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none -top-8">
            <span className="text-[120px] sm:text-[160px] md:text-[200px] font-black text-white/5 select-none leading-none">
              2026
            </span>
          </div>

          {/* Artist Image */}
          <img
            src={config?.hero_image_url || "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&h=800&fit=crop&q=80"}
            alt="Artist in studio"
            className="relative w-full h-auto object-contain mix-blend-lighten opacity-80"
            style={{ maxHeight: '45vh' }}
          />
        </div>
      </motion.div>
    </section>
  );
}