import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const defaultStartups = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop&q=80",
    name: "Urban League",
    description: "Plataforma digital para gestión de artistas urbanos y producción musical profesional.",
    category: "Music Tech",
    link: "#"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop&q=80",
    name: "Creative Hub",
    description: "Espacio colaborativo para creadores de contenido y artistas digitales.",
    category: "Co-working",
    link: "#"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop&q=80",
    name: "Sound Factory",
    description: "Estudio de producción musical con tecnología de última generación.",
    category: "Production",
    link: "#"
  }
];

export default function StartupsSection() {
  const { data: config } = useQuery({
    queryKey: ['landingConfig'],
    queryFn: async () => {
      const configs = await base44.entities.LandingConfig.list();
      return configs.length > 0 ? configs[0] : null;
    }
  });

  const startups = config?.startups || defaultStartups;
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef(null);

  const scrollToIndex = (index) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.scrollWidth / startups.length;
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
      const cardWidth = container.scrollWidth / startups.length;
      const newIndex = Math.round(container.scrollLeft / cardWidth);
      setCurrentIndex(newIndex);
    }
  };

  const nextSlide = () => {
    const newIndex = (currentIndex + 1) % startups.length;
    scrollToIndex(newIndex);
  };

  const prevSlide = () => {
    const newIndex = currentIndex === 0 ? startups.length - 1 : currentIndex - 1;
    scrollToIndex(newIndex);
  };

  return (
    <section className="relative py-8 sm:py-12 lg:py-20 overflow-hidden bg-gradient-to-b from-zinc-900 to-black">
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">
            Nuestras Startups
          </h2>
          <p className="text-white/60 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
            Proyectos y empresas que hemos creado para impulsar la industria
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative max-w-4xl mx-auto">
          {/* Navigation Arrows - Desktop */}
          <button
            onClick={prevSlide}
            className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 z-20 w-10 h-10 items-center justify-center rounded-full bg-white hover:bg-zinc-200 shadow-lg transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-zinc-900" />
          </button>

          <button
            onClick={nextSlide}
            className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 z-20 w-10 h-10 items-center justify-center rounded-full bg-white hover:bg-zinc-200 shadow-lg transition-all"
          >
            <ChevronRight className="w-5 h-5 text-zinc-900" />
          </button>

          {/* Startups Carousel */}
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-4 sm:gap-5 lg:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth px-4 sm:px-6 lg:px-0 -mx-4 sm:-mx-6 lg:mx-0"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {startups.map((startup, index) => (
              <motion.div
                key={startup.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex-shrink-0 w-[75vw] sm:w-[320px] lg:w-[340px] snap-center"
              >
                <div className="h-full bg-zinc-900 rounded-2xl lg:rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
                  {/* Image */}
                  <div className="h-48 sm:h-52 lg:h-56 overflow-hidden">
                    <img 
                      src={startup.image} 
                      alt={startup.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-5 sm:p-6">
                    {/* Category Badge */}
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                        {startup.category}
                      </span>
                    </div>

                    {/* Name */}
                    <h4 className="text-white font-bold text-base sm:text-lg mb-2">
                      {startup.name}
                    </h4>

                    {/* Description */}
                    <p className="text-white/70 text-sm sm:text-base leading-relaxed line-clamp-3 mb-4">
                      {startup.description}
                    </p>

                    {/* Link */}
                    {startup.link && startup.link !== "#" && (
                      <a 
                        href={startup.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors"
                      >
                        Ver proyecto →
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile Navigation Arrows */}
          <div className="flex lg:hidden items-center justify-center gap-3 mt-6">
            <button
              onClick={prevSlide}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={nextSlide}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dots Indicators */}
        <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8">
          {startups.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`h-1.5 sm:h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'w-6 sm:w-8 bg-emerald-400' 
                  : 'w-1.5 sm:w-2 bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Ver startup ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}