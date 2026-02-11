import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const scrollContainerRef = useRef(null);

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

  return (
    <section className="relative py-12 sm:py-20 lg:py-32 overflow-hidden bg-gradient-to-b from-zinc-100 to-zinc-50">
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 mb-2">
            Historias que hemos contado
          </h2>
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
                className="flex-shrink-0 w-[75vw] sm:w-[320px] lg:w-[340px] snap-center"
              >
                <div className="h-full bg-zinc-900 rounded-2xl lg:rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
                  {/* Image - Más pequeña */}
                  <div className="h-48 sm:h-52 lg:h-56 overflow-hidden">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content - Fondo oscuro */}
                  <div className="p-5 sm:p-6">
                    {/* Quote - Más compacta */}
                    <div className="mb-5">
                      <p className="text-white/90 text-sm sm:text-base leading-relaxed italic line-clamp-6">
                        "{testimonial.quote}"
                      </p>
                    </div>

                    {/* Divider más sutil */}
                    <div className="w-full h-px bg-white/10 mb-4" />

                    {/* Author */}
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
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`h-1.5 sm:h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'w-6 sm:w-8 bg-zinc-900' 
                  : 'w-1.5 sm:w-2 bg-zinc-400 hover:bg-zinc-600'
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
    </section>
  );
}