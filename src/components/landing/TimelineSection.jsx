import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Music, Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const defaultMilestones = [
  {
    year: "2016",
    title: "Los inicios",
    description: "Comenzó produciendo desde una habitación, aprendiendo el oficio desde cero",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=500&fit=crop&q=80"
  },
  {
    year: "2018",
    title: "Primeros clientes",
    description: "Empezó a trabajar con artistas locales, construyendo su reputación",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=500&fit=crop&q=80"
  },
  {
    year: "2020",
    title: "Fundación del estudio",
    description: "Creó La Cabaña Creative, un espacio profesional para artistas serios",
    image: "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=400&h=500&fit=crop&q=80"
  },
  {
    year: "2022",
    title: "Expansión digital",
    description: "Lanzó servicios de digitalización artística y dirección creativa",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=500&fit=crop&q=80"
  },
  {
    year: "2024",
    title: "Impacto internacional",
    description: "Trabajando con artistas de toda Latinoamérica y España",
    image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=500&fit=crop&q=80"
  }
];

export default function TimelineSection() {
  const { data: config } = useQuery({
    queryKey: ['landingConfig'],
    queryFn: async () => {
      const configs = await base44.entities.LandingConfig.list();
      return configs.length > 0 ? configs[0] : null;
    }
  });

  const milestones = config?.timeline_milestones || defaultMilestones;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);
  const scrollContainerRef = useRef(null);

  const scrollToIndex = (index) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const isMobile = window.innerWidth < 1024;
      const gap = isMobile ? 8 : 24;
      const cardWidth = isMobile ? (window.innerWidth * 0.45) : 280;
      const scrollPosition = (cardWidth + gap) * index;
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
      setCurrentIndex(index);
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const isMobile = window.innerWidth < 1024;
      const gap = isMobile ? 8 : 24;
      const cardWidth = isMobile ? (window.innerWidth * 0.45) : 280;
      const newIndex = Math.round(container.scrollLeft / (cardWidth + gap));
      setCurrentIndex(Math.min(newIndex, milestones.length - 1));
    }
  };

  const nextSlide = () => {
    const newIndex = Math.min(currentIndex + 1, milestones.length - 1);
    scrollToIndex(newIndex);
  };

  const prevSlide = () => {
    const newIndex = Math.max(currentIndex - 1, 0);
    scrollToIndex(newIndex);
  };

  return (
    <section className="relative py-12 sm:py-20 lg:py-32 overflow-hidden bg-black">
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-0 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start lg:items-center">
          {/* Left Side - Profile Image & Bio - Hidden on mobile */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="hidden lg:block relative order-2 lg:order-1 px-4 sm:px-0"
          >
            <div className="relative">
              {/* Main Profile Image */}
              <div className="relative w-full max-w-md mx-auto lg:mx-0">
                <div className="aspect-[3/4] rounded-xl lg:rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=600&h=800&fit=crop&q=80"
                    alt="Prod. by Weber"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Gradient Overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-24 lg:h-32 bg-gradient-to-t from-black to-transparent" />
              </div>

              {/* Bio Text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mt-6 lg:mt-8 space-y-2 lg:space-y-4 text-left px-4 lg:px-0 lg:text-left"
              >
                <h3 className="text-base lg:text-3xl font-bold text-white">
                  Prod. by Weber
                </h3>
                <p className="text-white/70 leading-relaxed text-sm lg:text-lg pr-4 lg:pr-0 lg:max-w-md">
                  Más de 8 años ayudando a artistas a construir proyectos coherentes. 
                  Los sistemas que enseño han sido utilizados por empresas y profesionales 
                  de la industria. Mi mensaje no es para todos, pero si estás aquí, 
                  probablemente sea para ti.
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Side - Timeline Carousel - Full width on mobile */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative order-1 lg:order-2 lg:col-span-1 col-span-full"
          >
            <div className="relative">
              {/* Title - Mobile */}
              <div className="mb-4 lg:hidden px-4">
                <h2 className="text-2xl font-bold text-white mb-1">
                  Mi Trayectoria
                </h2>
              </div>

              {/* Carousel Container */}
              <div className="relative max-w-4xl mx-auto lg:mx-0">
                {/* Navigation Arrows - Desktop only on sides */}
                <button
                  onClick={prevSlide}
                  className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 z-20 w-10 h-10 items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-lg transition-all"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>

                <button
                  onClick={nextSlide}
                  className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 z-20 w-10 h-10 items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-lg transition-all"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>

                {/* Timeline Cards */}
                <div 
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                  className="flex gap-2 lg:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth pl-4 pr-4 lg:px-0"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  {milestones.map((milestone, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      onMouseEnter={() => setHoveredCard(index)}
                      onMouseLeave={() => setHoveredCard(null)}
                      className="flex-shrink-0 w-[45vw] snap-start lg:w-[280px]"
                    >
                      <motion.div 
                        className="relative rounded-lg lg:rounded-2xl overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-300 h-full"
                        animate={{ 
                          scale: hoveredCard === index ? 1.05 : 1,
                          zIndex: hoveredCard === index ? 20 : 1
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Image */}
                        <div className="aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-900 to-black">
                          <motion.img 
                            src={milestone.image}
                            alt={milestone.year}
                            className="w-full h-full object-cover"
                            animate={{ scale: hoveredCard === index ? 1.1 : 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-2.5 lg:p-6">
                          <div className="text-emerald-400 text-xl lg:text-5xl font-bold mb-0.5 lg:mb-2">
                            {milestone.year}
                          </div>
                          <h4 className="text-white font-bold text-xs lg:text-lg mb-0.5 lg:mb-2">
                            {milestone.title}
                          </h4>
                          <p className="text-white/70 text-[10px] lg:text-sm leading-tight line-clamp-4">
                            {milestone.description}
                          </p>
                        </div>

                        {/* Playlist Overlay - Shows on Hover */}
                        <AnimatePresence>
                          {hoveredCard === index && milestone.playlist && milestone.playlist.songs?.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 20 }}
                              transition={{ duration: 0.2 }}
                              className="absolute inset-0 bg-black/95 backdrop-blur-sm flex flex-col p-3 lg:p-6"
                            >
                              {/* Playlist Header */}
                              <div className="flex items-center gap-2 mb-3 lg:mb-4">
                                <Music className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-400" />
                                <h5 className="text-white font-bold text-xs lg:text-lg">
                                  {milestone.playlist.title || "Playlist"}
                                </h5>
                              </div>

                              {/* Songs List */}
                              <div className="flex-1 overflow-y-auto space-y-1.5 lg:space-y-2 custom-scrollbar">
                                {milestone.playlist.songs.map((song, songIndex) => (
                                  <a
                                    key={songIndex}
                                    href={song.youtube_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block p-2 lg:p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                                  >
                                    <div className="flex items-start gap-2 lg:gap-3">
                                      <div className="flex-shrink-0 w-6 h-6 lg:w-8 lg:h-8 rounded bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                                        <Play className="w-3 h-3 lg:w-4 lg:h-4 text-emerald-400" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-white text-[10px] lg:text-sm font-medium truncate">
                                          {song.title}
                                        </p>
                                        <p className="text-gray-400 text-[8px] lg:text-xs truncate">
                                          {song.artist}
                                        </p>
                                      </div>
                                    </div>
                                  </a>
                                ))}
                              </div>

                              {/* Footer Info */}
                              <div className="mt-2 lg:mt-3 pt-2 lg:pt-3 border-t border-white/10">
                                <p className="text-gray-500 text-[8px] lg:text-xs text-center">
                                  {milestone.playlist.songs.length} {milestone.playlist.songs.length === 1 ? 'canción' : 'canciones'}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>

                {/* Mobile Navigation Controls - Below Cards */}
                <div className="lg:hidden mt-4 space-y-3 px-4">
                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-start gap-3 pl-2">
                    <button
                      onClick={prevSlide}
                      disabled={currentIndex === 0}
                      className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ backgroundColor: '#1a1a1a' }}
                    >
                      <ChevronLeft className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </button>

                    <button
                      onClick={nextSlide}
                      disabled={currentIndex === milestones.length - 1}
                      className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ backgroundColor: '#1a1a1a' }}
                    >
                      <ChevronRight className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </button>
                  </div>

                  {/* Dots Indicator Mobile */}
                  <div className="flex items-center justify-start gap-2 pl-2">
                    {milestones.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => scrollToIndex(index)}
                        className={`h-2 rounded-full transition-all ${
                          currentIndex === index 
                            ? 'w-8 bg-emerald-400' 
                            : 'w-2 bg-white/30 hover:bg-white/50'
                        }`}
                        aria-label={`Ver hito ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Desktop Dots Indicator */}
              <div className="hidden lg:flex items-center justify-center gap-2 mt-8">
                {milestones.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      currentIndex === index 
                        ? 'w-8 bg-emerald-400' 
                        : 'w-2 bg-white/30 hover:bg-white/50'
                    }`}
                    aria-label={`Ver hito ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Mobile Biography Section - Only visible on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:hidden mt-6 px-4"
        >
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-3">
              Prod. by Weber
            </h3>
            <p className="text-white/70 leading-relaxed text-sm">
              Más de 8 años ayudando a artistas a construir proyectos coherentes. 
              Los sistemas que enseño han sido utilizados por empresas y profesionales 
              de la industria. Mi mensaje no es para todos, pero si estás aquí, 
              probablemente sea para ti.
            </p>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          display: block;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.5);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.7);
        }
      `}</style>
    </section>
  );
}