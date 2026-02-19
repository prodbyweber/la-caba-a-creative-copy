import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Hero({ config }) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const heroTitle = config?.hero_title || "El estudio creativo definitivo para artistas que buscan conectar";
  const heroSubtitle = config?.hero_subtitle || "Producción por horas, visuales cinematográficos y digitalización artística para proyectos que van en serio.";
  const heroCTA = config?.hero_cta_text || "Aplicar a La Cabaña Creative";
  const heroImage = config?.hero_image_url || "";

  return (
    <section className="relative h-screen flex items-center overflow-hidden bg-black pt-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-black to-black" />
      
      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-8 flex flex-col items-center text-center justify-center gap-6">
        
        {/* Top: Title Only */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            {heroTitle}
          </h1>
        </motion.div>

        {/* Center: Artist Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative w-full max-w-2xl lg:max-w-3xl"
        >
          <div className="relative w-full aspect-video">
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-purple-500/20 rounded-2xl blur-2xl" />
            
            {/* Image container */}
            <div className="relative h-full rounded-2xl overflow-hidden bg-black">
              {heroImage && (
                <img
                  src={heroImage}
                  alt="Artist"
                  className={`w-full h-full object-cover object-center transition-opacity duration-500 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                />
              )}
              
              {/* Gradient overlay at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          </div>
        </motion.div>

        {/* Bottom: Subtitle + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="max-w-2xl space-y-5"
        >
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 leading-relaxed">
            {heroSubtitle}
          </p>
          
          <a href="#ofertas">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-white text-black rounded-full font-semibold text-sm sm:text-base hover:bg-gray-100 transition-all shadow-lg inline-flex items-center gap-2"
            >
              {heroCTA}
            </motion.button>
          </a>
        </motion.div>
      </div>

      {/* Bottom bar with tags - visible on desktop */}
      <div className="hidden lg:block absolute bottom-4 left-0 right-0 z-20">
        <div className="max-w-[1400px] mx-auto px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-xl px-6 py-3"
          >
            <div className="flex items-center gap-4 justify-center flex-wrap">
              <span className="text-xs text-gray-400">Hemos ayudado a:</span>
              <div className="flex items-center gap-3 flex-wrap">
                {['Artistas Emergentes', 'Productores', 'Creadores de Contenido', 'Estudios'].map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs text-gray-300 transition-colors cursor-default border border-white/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

    </section>
  );
}