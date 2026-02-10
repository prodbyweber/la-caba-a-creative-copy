import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const milestones = [
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef(null);

  const scrollToIndex = (index) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = 320; // Approximate card width + gap
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
      const cardWidth = 320;
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
    <section className="relative py-20 sm:py-32 overflow-hidden bg-black">
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Profile Image & Bio */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative">
              {/* Main Profile Image */}
              <div className="relative w-full max-w-md mx-auto lg:mx-0">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=600&h=800&fit=crop&q=80"
                    alt="Prod. by Weber"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Gradient Overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
              </div>

              {/* Bio Text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mt-8 space-y-4"
              >
                <h3 className="text-2xl sm:text-3xl font-bold text-white">
                  Prod. by Weber
                </h3>
                <p className="text-white/70 leading-relaxed text-base sm:text-lg">
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
            className="relative"
          >
            <div className="relative">
              {/* Navigation Arrows */}
              <div className="flex items-center justify-end gap-3 mb-6">
                <button
                  onClick={prevSlide}
                  disabled={currentIndex === 0}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    currentIndex === 0 
                      ? 'bg-white/5 text-white/30 cursor-not-allowed' 
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextSlide}
                  disabled={currentIndex === milestones.length - 1}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    currentIndex === milestones.length - 1
                      ? 'bg-white/5 text-white/30 cursor-not-allowed' 
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Timeline Cards */}
              <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="flex-shrink-0 w-[280px] snap-start"
                  >
                    <div className="relative rounded-2xl overflow-hidden group cursor-pointer">
                      {/* Image */}
                      <div className="aspect-[3/4] overflow-hidden">
                        <img 
                          src={milestone.image}
                          alt={milestone.year}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="text-emerald-400 text-5xl font-bold mb-2">
                          {milestone.year}
                        </div>
                        <h4 className="text-white font-bold text-lg mb-2">
                          {milestone.title}
                        </h4>
                        <p className="text-white/70 text-sm leading-relaxed">
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
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