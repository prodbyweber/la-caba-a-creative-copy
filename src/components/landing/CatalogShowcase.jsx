import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Play, ChevronLeft, ChevronRight } from "lucide-react";

export default function CatalogShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Catálogo de ejemplo con portadas y datos
  const catalog = [
    {
      id: 1,
      cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&h=800&fit=crop",
      title: "Urban Dreams",
      artist: "J.Vega",
      genre: "Trap Latino",
      year: "2025",
      tracks: 12,
      brief: "Un viaje sonoro por las calles nocturnas"
    },
    {
      id: 2,
      cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=800&fit=crop",
      title: "Neon Nights",
      artist: "Luna Martinez",
      genre: "Reggaetón",
      year: "2025",
      tracks: 10,
      brief: "Ritmos urbanos con alma latina"
    },
    {
      id: 3,
      cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=800&fit=crop",
      title: "Echoes",
      artist: "Various Artists",
      genre: "Hip-Hop",
      year: "2024",
      tracks: 15,
      brief: "Colección de beats cinematográficos"
    },
    {
      id: 4,
      cover: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=800&h=800&fit=crop",
      title: "Frequencies",
      artist: "DJ Karma",
      genre: "Electronic",
      year: "2024",
      tracks: 8,
      brief: "Texturas electrónicas y ambientes oscuros"
    }
  ];

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % catalog.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + catalog.length) % catalog.length);
  };

  const currentAlbum = catalog[activeIndex];
  const nextAlbum = catalog[(activeIndex + 1) % catalog.length];

  return (
    <section className="lg:hidden relative w-full bg-black overflow-hidden py-8">
      {/* Textura de terciopelo oscuro */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-black to-zinc-900 opacity-90" />
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      <div className="relative z-10 px-4">
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-3"
          >
            <Music className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">Catálogo Musical</span>
          </motion.div>
          <h3 className="text-xl font-bold text-white mb-1">Proyectos Destacados</h3>
          <p className="text-xs text-gray-400">Desliza para explorar</p>
        </div>

        {/* Main Showcase - Stack de portadas con efecto de profundidad */}
        <div className="relative h-[480px] flex items-center justify-center">
          
          {/* Portada secundaria (siguiente) - más atrás */}
          <motion.div
            key={`next-${nextAlbum.id}`}
            initial={{ scale: 0.85, opacity: 0.3, x: 50 }}
            animate={{ scale: 0.85, opacity: 0.3, x: 50 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="relative w-64 h-80 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={nextAlbum.cover}
                alt={nextAlbum.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>
          </motion.div>

          {/* Portada principal */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAlbum.id}
              initial={{ scale: 0.9, opacity: 0, rotateY: -15 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.9, opacity: 0, rotateY: 15 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="relative w-72 h-96 perspective-1000"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Card principal con sombra cinematográfica */}
              <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-white/10">
                {/* Imagen de portada */}
                <img
                  src={currentAlbum.cover}
                  alt={currentAlbum.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay con gradiente */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                
                {/* Brillo sutil superior */}
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/5 to-transparent" />

                {/* Información del álbum */}
                <div className="absolute inset-x-0 bottom-0 p-6 space-y-3">
                  {/* Play button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-colors"
                  >
                    <Play className="w-5 h-5 text-black ml-0.5" fill="currentColor" />
                  </motion.button>

                  {/* Título y artista */}
                  <div>
                    <h4 className="text-2xl font-bold text-white mb-1 leading-tight">
                      {currentAlbum.title}
                    </h4>
                    <p className="text-sm text-gray-300 font-medium">
                      {currentAlbum.artist}
                    </p>
                  </div>

                  {/* Brief */}
                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                    {currentAlbum.brief}
                  </p>

                  {/* Metadatos */}
                  <div className="flex items-center gap-3 pt-2">
                    <span className="px-2 py-1 rounded-md bg-white/10 backdrop-blur-sm text-[10px] font-medium text-gray-300 border border-white/10">
                      {currentAlbum.genre}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {currentAlbum.tracks} tracks
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {currentAlbum.year}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controles de navegación */}
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-lg active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-lg active:scale-95"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Indicadores */}
        <div className="flex justify-center gap-2 mt-6">
          {catalog.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? "w-8 bg-emerald-500"
                  : "w-1.5 bg-white/20 hover:bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}