import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const scrollContainerRef = useRef(null);

  const scrollToIndex = (index) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const isMobile = window.innerWidth < 1024;
      const cardWidth = isMobile ? window.innerWidth * 0.85 + 16 : 320;
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
      const isMobile = window.innerWidth < 1024;
      const cardWidth = isMobile ? window.innerWidth * 0.85 + 16 : 320;
      const newIndex = Math.round(container.scrollLeft / cardWidth);
      setCurrentIndex(newIndex);
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
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start lg:items-center">
          {/* Left Side - Profile Image & Bio */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative">
              {/* Main Profile Image */}
              <div className="relative w-full max-w-[280px] sm:max-w-sm lg:max-w-md mx-auto lg:mx-0">
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
                className="mt-6 lg:mt-8 space-y-3 lg:space-y-4 text-center lg:text-left"
              >
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                  Prod. by Weber
                </h3>
                <p className="text-white/70 leading-relaxed text-sm sm:text-base lg:text-lg max-w-md mx-auto lg:mx-0">
                  Más de 8 años ayudando a artistas a construir proyectos coherentes. 
                  Los sistemas que enseño han sido utilizados por empresas y profesionales 
                  de la industria. Mi mensaje no es para todos, pero si estás aquí, 
                  probablemente sea para ti.
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Side - Timeline Carousel */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative order-1 lg:order-2"
          >
            <div className="relative">
              {/* Title - Mobile */}
              <div className="mb-6 lg:hidden text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Mi Trayectoria
                </h2>
                <p className="text-white/60 text-sm">
                  Desliza para ver más
                </p>
              </div>

              {/* Navigation Arrows */}
              <div className="flex items-center justify-center lg:justify-end gap-3 mb-4 lg:mb-6">
                <button
                  onClick={prevSlide}
                  disabled={currentIndex === 0}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
                    currentIndex === 0 
                      ? 'bg-white/5 text-white/30 cursor-not-allowed' 
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  onClick={nextSlide}
                  disabled={currentIndex === milestones.length - 1}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
                    currentIndex === milestones.length - 1
                      ? 'bg-white/5 text-white/30 cursor-not-allowed' 
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  }`}
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Timeline Cards */}
              <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex gap-3 sm:gap-4 lg:gap-6 overflow-x-auto pb-2 lg:pb-4 snap-x snap-mandatory scroll-smooth px-2 sm:px-4 lg:px-0 -mx-2 sm:-mx-4 lg:mx-0"
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
                    className="flex-shrink-0 w-[80vw] sm:w-[300px] lg:w-[280px] snap-center lg:snap-start"
                  >
                    <div className="relative rounded-xl lg:rounded-2xl overflow-hidden group cursor-pointer shadow-xl hover:shadow-2xl transition-shadow duration-300">
                      {/* Image */}
                      <div className="aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-900 to-black">
                        <img 
                          src={milestone.image}
                          alt={milestone.year}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 lg:p-6">
                        <div className="text-emerald-400 text-3xl sm:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2">
                          {milestone.year}
                        </div>
                        <h4 className="text-white font-bold text-sm sm:text-base lg:text-lg mb-1 sm:mb-2">
                          {milestone.title}
                        </h4>
                        <p className="text-white/70 text-xs sm:text-sm leading-relaxed line-clamp-3">
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Dots Indicator - Mobile & Tablet */}
              <div className="flex items-center justify-center gap-2 mt-6 lg:mt-8">
                {milestones.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToIndex(index)}
                    className={`h-1.5 sm:h-2 rounded-full transition-all ${
                      currentIndex === index 
                        ? 'w-6 sm:w-8 bg-emerald-400 shadow-lg shadow-emerald-500/50' 
                        : 'w-1.5 sm:w-2 bg-white/30 hover:bg-white/50'
                    }`}
                    aria-label={`Ver hito ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
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