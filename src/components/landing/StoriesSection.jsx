import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Music, Film, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const defaultTestimonials = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=600&h=400&fit=crop&q=80",
    quote: "Trabajar con La Cabaña Creative transformó completamente mi proyecto. No solo produjimos música de calidad, sino que encontramos la identidad que le faltaba a mi propuesta artística.",
    name: "Carlos Mendoza",
    role: "Artista Urbano"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop&q=80",
    quote: "La dirección creativa que recibí me ayudó a ver mi música desde otra perspectiva. Pasé de tener canciones sueltas a construir un proyecto coherente con narrativa visual.",
    name: "Ana Martínez",
    role: "Cantautora"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1516575150278-77136aed6920?w=600&h=400&fit=crop&q=80",
    quote: "El proceso fue profesional de principio a fin. Me enseñaron a trabajar por horas, no por canciones sueltas, y eso cambió completamente mi enfoque como artista independiente.",
    name: "Miguel Ángel Torres",
    role: "Productor & Artista"
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=600&h=400&fit=crop&q=80",
    quote: "Lo que más valoro es la honestidad. Nada de promesas vacías, solo trabajo real y resultados tangibles. Mi música ahora suena a lo que siempre quise transmitir.",
    name: "Laura Sánchez",
    role: "Artista Pop"
  }
];

export default function StoriesSection() {
  const { data: config } = useQuery({
    queryKey: ['landingConfig'],
    queryFn: async () => {
      const configs = await base44.entities.LandingConfig.list();
      return configs.length > 0 ? configs[0] : null;
    }
  });

  const testimonials = config?.testimonials || defaultTestimonials;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [expandedMobile, setExpandedMobile] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const scrollContainerRef = useRef(null);
  const audioRef = useRef(null);

  const scrollToIndex = (index) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.scrollWidth / testimonials.length;
      container.scrollTo({
        left: cardWidth * index,
        behavior: 'smooth'
      });
      setCurrentIndex(index);
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.scrollWidth / testimonials.length;
      const newIndex = Math.round(container.scrollLeft / cardWidth);
      setCurrentIndex(newIndex);
    }
  };

  const nextSlide = () => {
    const newIndex = (currentIndex + 1) % testimonials.length;
    scrollToIndex(newIndex);
  };

  const prevSlide = () => {
    const newIndex = currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1;
    scrollToIndex(newIndex);
  };

  const handlePlayTrack = (trackUrl) => {
    if (playingAudio === trackUrl) {
      audioRef.current?.pause();
      setPlayingAudio(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = trackUrl;
        audioRef.current.play();
        setPlayingAudio(trackUrl);
      }
    }
  };

  return (
    <section className="relative py-8 sm:py-12 lg:py-20 overflow-hidden bg-[#e8c84a]">
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-black tracking-tight leading-[0.95] mb-2">
            Historias que hemos contado
          </h2>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative max-w-4xl mx-auto">
          {/* Navigation Arrows - Desktop */}
          <button
            onClick={prevSlide}
            className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 z-20 w-10 h-10 items-center justify-center rounded-full bg-black/10 hover:bg-black/20 shadow-lg transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-zinc-900" />
          </button>

          <button
            onClick={nextSlide}
            className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 z-20 w-10 h-10 items-center justify-center rounded-full bg-black/10 hover:bg-black/20 shadow-lg transition-all"
          >
            <ChevronRight className="w-5 h-5 text-zinc-900" />
          </button>

          {/* Testimonials Carousel */}
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-4 sm:gap-5 lg:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth px-4 sm:px-6 lg:px-0 -mx-4 sm:-mx-6 lg:mx-0"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex-shrink-0 w-[75vw] sm:w-[320px] lg:w-[340px] snap-center group"
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="relative h-full bg-zinc-900 rounded-2xl lg:rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500">
                  {/* Tarjeta Normal */}
                  <div className={`transition-all duration-500 ${hoveredCard === index ? 'lg:scale-110 lg:z-50' : ''}`}>
                    {/* Image */}
                    <div className="h-48 sm:h-52 lg:h-56 overflow-hidden relative">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                      {/* Mobile Preview Button */}
                      {(testimonial.tracks?.length > 0 || testimonial.clips?.length > 0) && (
                        <button
                          onClick={() => setExpandedMobile(expandedMobile === index ? null : index)}
                          className="lg:hidden absolute bottom-3 right-3 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-full text-white text-sm font-medium shadow-lg flex items-center gap-2 transition-all"
                        >
                          <Eye className="w-4 h-4" />
                          Ver contenido
                        </button>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 sm:p-6">
                      <div className="mb-5">
                        <p className="text-white/90 text-sm sm:text-base leading-relaxed italic line-clamp-6">
                          "{testimonial.quote}"
                        </p>
                      </div>

                      <div className="w-full h-px bg-white/10 mb-4" />

                      <div>
                        <h4 className="text-white font-bold text-base sm:text-lg mb-0.5">
                          {testimonial.name}
                        </h4>
                        <p className="text-white/50 text-xs sm:text-sm">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Panel Interior - Desktop Hover */}
                  <AnimatePresence>
                    {hoveredCard === index && (testimonial.tracks?.length > 0 || testimonial.clips?.length > 0) && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hidden lg:block absolute inset-0 bg-black/95 backdrop-blur-xl overflow-y-auto"
                      >
                        <div className="p-6 space-y-6">
                          {/* Header */}
                          <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                            <div className="w-16 h-16 rounded-full overflow-hidden">
                              <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <h3 className="text-white font-bold text-lg">{testimonial.name}</h3>
                              <p className="text-white/50 text-sm">{testimonial.role}</p>
                            </div>
                          </div>

                          {/* Tracks */}
                          {testimonial.tracks?.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <Music className="w-4 h-4 text-emerald-400" />
                                <h4 className="text-white font-semibold text-sm">Tracks & Álbumes</h4>
                              </div>
                              <div className="space-y-2">
                                {testimonial.tracks.map((track, idx) => (
                                  <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all group/track">
                                    <button
                                      onClick={() => track.audio_url && handlePlayTrack(track.audio_url)}
                                      className="w-10 h-10 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 rounded-full transition-all"
                                      disabled={!track.audio_url}
                                    >
                                      <Play className="w-4 h-4 text-white ml-0.5" />
                                    </button>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-white text-sm font-medium truncate">{track.title}</p>
                                      {track.album && (
                                        <p className="text-white/40 text-xs truncate">{track.album}</p>
                                      )}
                                    </div>
                                    {track.duration && (
                                      <span className="text-white/40 text-xs">{track.duration}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Clips */}
                          {testimonial.clips?.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <Film className="w-4 h-4 text-purple-400" />
                                <h4 className="text-white font-semibold text-sm">Video Clips</h4>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {testimonial.clips.map((clip, idx) => (
                                  <div key={idx} className="relative aspect-video bg-white/5 rounded-lg overflow-hidden group/clip cursor-pointer">
                                    {clip.thumbnail_url ? (
                                      <img src={clip.thumbnail_url} alt={clip.title} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Film className="w-8 h-8 text-white/30" />
                                      </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/clip:opacity-100 transition-opacity flex items-center justify-center">
                                      <Play className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                      <p className="text-white text-xs font-medium truncate">{clip.title}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile Navigation Arrows */}
          <div className="flex lg:hidden items-center justify-center gap-3 mt-6">
            <button
              onClick={prevSlide}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/30 text-black shadow-lg transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={nextSlide}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/30 text-black shadow-lg transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dots Indicators */}
        <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`h-1.5 sm:h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'w-6 sm:w-8 bg-black' 
                  : 'w-1.5 sm:w-2 bg-black/30 hover:bg-black/50'
              }`}
              aria-label={`Ver testimonio ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Audio Element */}
      <audio ref={audioRef} onEnded={() => setPlayingAudio(null)} />

      {/* Mobile Expanded Panel */}
      <AnimatePresence>
        {expandedMobile !== null && testimonials[expandedMobile] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/95 backdrop-blur-xl z-50 overflow-y-auto"
            onClick={() => setExpandedMobile(null)}
          >
            <div className="min-h-screen p-4" onClick={(e) => e.stopPropagation()}>
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="bg-zinc-900 rounded-2xl overflow-hidden"
              >
                {/* Close Button */}
                <div className="sticky top-0 bg-zinc-900/95 backdrop-blur-lg z-10 p-4 border-b border-white/10">
                  <button
                    onClick={() => setExpandedMobile(null)}
                    className="ml-auto block px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-all"
                  >
                    Cerrar
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Header */}
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden">
                      <img src={testimonials[expandedMobile].image} alt={testimonials[expandedMobile].name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-xl">{testimonials[expandedMobile].name}</h3>
                      <p className="text-white/50">{testimonials[expandedMobile].role}</p>
                    </div>
                  </div>

                  {/* Tracks */}
                  {testimonials[expandedMobile].tracks?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Music className="w-5 h-5 text-emerald-400" />
                        <h4 className="text-white font-semibold">Tracks & Álbumes</h4>
                      </div>
                      <div className="space-y-3">
                        {testimonials[expandedMobile].tracks.map((track, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
                            <button
                              onClick={() => track.audio_url && handlePlayTrack(track.audio_url)}
                              className="w-12 h-12 flex items-center justify-center bg-emerald-500 rounded-full"
                              disabled={!track.audio_url}
                            >
                              <Play className="w-5 h-5 text-white ml-0.5" />
                            </button>
                            <div className="flex-1">
                              <p className="text-white font-medium">{track.title}</p>
                              {track.album && <p className="text-white/40 text-sm">{track.album}</p>}
                            </div>
                            {track.duration && <span className="text-white/40 text-sm">{track.duration}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Clips */}
                  {testimonials[expandedMobile].clips?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Film className="w-5 h-5 text-purple-400" />
                        <h4 className="text-white font-semibold">Video Clips</h4>
                      </div>
                      <div className="space-y-3">
                        {testimonials[expandedMobile].clips.map((clip, idx) => (
                          <div key={idx} className="relative aspect-video bg-white/5 rounded-xl overflow-hidden">
                            {clip.thumbnail_url ? (
                              <img src={clip.thumbnail_url} alt={clip.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Film className="w-12 h-12 text-white/30" />
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                              <Play className="w-12 h-12 text-white" />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                              <p className="text-white font-medium">{clip.title}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}