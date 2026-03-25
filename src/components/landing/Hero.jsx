import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Globe } from "lucide-react";
import ScratchReveal from "./ScratchReveal";

export default function Hero({ config }) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  
  const heroTitle = config?.hero_title || "El estudio creativo definitivo para artistas que buscan conectar";
  const heroSubtitle = config?.hero_subtitle || "Producción por horas, visuales cinematográficos y digitalización artística para proyectos que van en serio.";
  const heroCTA = config?.hero_cta_text || "Aplicar a La Cabaña Creative";
  const heroImage = config?.hero_image_url || "";
  const heroRevealImage = config?.hero_reveal_image_url || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6966ddf48947f217e81ea27c/93423d3b8_image.png";
  const heroAudioUrl = config?.hero_audio_url || "";
  const heroYoutubeLink = config?.hero_youtube_music_link || "";

  const tags = ['Artistas', 'Productores', 'Creadores de Contenido', 'Estudios'];

  return (
    <section className="relative min-h-screen flex items-start lg:items-center overflow-hidden bg-black pt-28 pb-0 sm:pt-20 sm:pb-0 lg:pt-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-black to-black" />
      
      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-0 sm:py-4 lg:py-8 flex flex-col items-center text-center justify-start lg:justify-center gap-2 sm:gap-3 lg:gap-6">
        
        {/* Top: Title Only */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl w-full space-y-1 sm:space-y-3 lg:space-y-4"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] px-2 line-clamp-2">
            {heroTitle}
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-400 leading-relaxed px-2 line-clamp-3">
            Un lugar para crear y saber hacia dónde va tu música.
          </p>
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
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 rounded-xl lg:rounded-2xl blur-2xl" />
            
            {/* Image container with Scratch Reveal */}
            <div className="relative h-full rounded-xl lg:rounded-2xl overflow-hidden bg-black">
              {heroImage && heroRevealImage ? (
                <ScratchReveal 
                  topImage={heroImage}
                  revealImage={heroRevealImage}
                  audioUrl={heroAudioUrl}
                  youtubeLink={heroYoutubeLink}
                />
              ) : heroImage ? (
                <>
                  <img
                    src={heroImage}
                    alt="Artist"
                    className={`w-full h-full object-cover object-center transition-opacity duration-500 ${
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => setImageLoaded(true)}
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
                </>
              ) : null}
            </div>
          </div>
        </motion.div>

        {/* Bottom: Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="max-w-2xl w-full px-2 pb-0 sm:pb-0 lg:pb-8"
        >
          {/* Bar "Hemos ayudado a" - carrusel horizontal automático */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-lg lg:rounded-xl px-3 py-2 lg:px-6 lg:py-3 overflow-hidden"
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

              {/* Móvil - carrusel horizontal infinito */}
              <div className="lg:hidden relative overflow-hidden flex-1">
                <motion.div
                  className="flex items-center gap-2"
                  animate={{
                    x: [0, -100 * tags.length],
                  }}
                  transition={{
                    x: {
                      repeat: Infinity,
                      repeatType: "loop",
                      duration: tags.length * 3,
                      ease: "linear",
                    },
                  }}
                >
                  {[...tags, ...tags, ...tags].map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-full bg-white/5 text-[10px] sm:text-xs text-gray-300 border border-white/5 whitespace-nowrap inline-block"
                    >
                      {tag}
                    </span>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Mobile Divider - Global Symbol */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="lg:hidden flex justify-center py-0"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 rounded-full border-2 border-white/10 flex items-center justify-center"
          >
            <Globe className="w-5 h-5 text-white/25" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}