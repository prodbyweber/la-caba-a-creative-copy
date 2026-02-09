import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import BrandsCarousel from "./BrandsCarousel";

export default function Hero({ config }) {
  const heroTitle = config?.hero_title || "El estudio creativo definitivo para artistas que buscan conectar";
  const heroSubtitle = config?.hero_subtitle || "Producción por horas, visuales cinematográficos y digitalización artística para proyectos que van en serio.";
  const heroCTA = config?.hero_cta_text || "Aplicar a La Cabaña Creative";
  const heroImage = config?.hero_image_url || "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800";

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-black">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-black to-black" />
      
      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-20 flex flex-col items-center text-center gap-12">
        
        {/* Top: Text Content */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 lg:mb-8">
            {heroTitle}
          </h1>
          
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 leading-relaxed mb-8 lg:mb-10 max-w-3xl mx-auto">
            {heroSubtitle}
          </p>
          
          <a href="#ofertas">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-white text-black rounded-full font-semibold text-base sm:text-lg hover:bg-gray-100 transition-all shadow-lg inline-flex items-center gap-2"
            >
              {heroCTA}
            </motion.button>
          </a>
        </motion.div>

        {/* Bottom: Artist Image */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative w-full max-w-3xl"
        >
          <div className="relative w-full aspect-video">
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-purple-500/20 rounded-3xl blur-3xl" />
            
            {/* Image container */}
            <div className="relative h-full rounded-3xl overflow-hidden">
              <img
                src={heroImage}
                alt="Artist"
                className="w-full h-full object-cover object-center"
              />
              
              {/* Gradient overlay at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom bar with tags - visible on desktop */}
      <div className="hidden lg:block absolute bottom-0 left-0 right-0 z-20">
        <div className="max-w-[1400px] mx-auto px-12 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl px-8 py-4"
          >
            <div className="flex items-center gap-6 justify-center flex-wrap">
              <span className="text-sm text-gray-400">Hemos ayudado a:</span>
              <div className="flex items-center gap-4 flex-wrap">
                {['Artistas Emergentes', 'Productores', 'Creadores de Contenido', 'Estudios'].map((tag, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-sm text-gray-300 transition-colors cursor-default border border-white/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Brands Carousel */}
      <BrandsCarousel logos={config?.brand_logos} />
    </section>
  );
}