import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Hero({ config }) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [currentTagIndex, setCurrentTagIndex] = React.useState(0);
  
  const heroTitle = config?.hero_title || "El estudio creativo definitivo para artistas que buscan conectar";
  const heroSubtitle = config?.hero_subtitle || "Producción por horas, visuales cinematográficos y digitalización artística para proyectos que van en serio.";
  const heroCTA = config?.hero_cta_text || "Aplicar a La Cabaña Creative";
  const heroImage = config?.hero_image_url || "";

  const tags = ['Artistas Emergentes', 'Productores', 'Creadores de Contenido', 'Estudios'];

  // Auto-scroll carrusel
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTagIndex((prev) => (prev + 1) % tags.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [tags.length]);

  return (
    <section className="relative min-h-screen flex items-start lg:items-center overflow-hidden bg-black pt-16 pb-0 lg:pt-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-black to-black" />
      
      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-4 lg:py-8 flex flex-col items-center text-center justify-start lg:justify-center gap-3 lg:gap-6">
        
        {/* Top: Title Only */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl w-full"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight px-2">
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
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-purple-500/20 rounded-xl lg:rounded-2xl blur-2xl" />
            
            {/* Image container */}
            <div className="relative h-full rounded-xl lg:rounded-2xl overflow-hidden bg-black">
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

        {/* Bottom: Subtitle + Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="max-w-2xl w-full px-2 pb-0 lg:pb-20 space-y-2 lg:space-y-4"
        >
          <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-300 leading-relaxed">
            {heroSubtitle}
          </p>

          {/* Bar "Hemos ayudado a" - carrusel automático */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-lg lg:rounded-xl px-3 py-2 lg:px-6 lg:py-3"
          >
            <div className="flex items-center gap-2 lg:gap-4 justify-center">
              <span className="text-[10px] sm:text-xs text-gray-400 font-medium whitespace-nowrap">Hemos ayudado a:</span>
              
              {/* Desktop - todos visibles */}
              <div className="hidden lg:flex lg:items-center lg:gap-3">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs text-gray-300 transition-colors cursor-default border border-white/5 whitespace-nowrap"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Móvil - carrusel automático */}
              <div className="lg:hidden overflow-hidden h-6 flex items-center">
                <motion.span
                  key={currentTagIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="px-2 py-1 rounded-full bg-white/5 text-[10px] sm:text-xs text-gray-300 border border-white/5 whitespace-nowrap inline-block"
                >
                  {tags[currentTagIndex]}
                </motion.span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}