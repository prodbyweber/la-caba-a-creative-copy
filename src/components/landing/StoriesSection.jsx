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
    <section className="relative py-20 sm:py-32 overflow-hidden bg-gradient-to-b from-zinc-100 to-zinc-50">
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 mb-4">
            Historias que hemos contado
          </h2>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative max-w-5xl mx-auto">
          {/* Navigation Arrows - Desktop */}
          <button
            onClick={prevSlide}
            className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 z-20 w-12 h-12 items-center justify-center rounded-full bg-white hover:bg-zinc-100 shadow-xl transition-all"
          >
            <ChevronLeft className="w-6 h-6 text-zinc-900" />
          </button>

          <button
            onClick={nextSlide}
            className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 z-20 w-12 h-12 items-center justify-center rounded-full bg-white hover:bg-zinc-100 shadow-xl transition-all"
          >
            <ChevronRight className="w-6 h-6 text-zinc-900" />
          </button>

          {/* Testimonials Carousel */}
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scroll-smooth px-4 sm:px-0"
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
                className="flex-shrink-0 w-[85vw] sm:w-[400px] snap-center"
              >
                <div className="h-full bg-white rounded-3xl overflow-hidden shadow-2xl hover:scale-[1.02] transition-all duration-300">
                  {/* Image */}
                  <div className="h-64 overflow-hidden">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="bg-zinc-900 p-8">
                    {/* Quote */}
                    <div className="mb-6 min-h-[180px]">
                      <p className="text-white/90 text-base leading-relaxed italic">
                        "{testimonial.quote}"
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="w-full h-px bg-white/20 mb-6" />

                    {/* Author */}
                    <div>
                      <h4 className="text-white font-bold text-lg mb-1">
                        {testimonial.name}
                      </h4>
                      <p className="text-white/60 text-sm">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile Navigation Arrows */}
          <div className="flex lg:hidden items-center justify-center gap-4 mt-6">
            <button
              onClick={prevSlide}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white hover:bg-zinc-100 shadow-lg transition-all"
            >
              <ChevronLeft className="w-6 h-6 text-zinc-900" />
            </button>

            <button
              onClick={nextSlide}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white hover:bg-zinc-100 shadow-lg transition-all"
            >
              <ChevronRight className="w-6 h-6 text-zinc-900" />
            </button>
          </div>
        </div>

        {/* Dots Indicators */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`transition-all ${
                index === currentIndex 
                  ? 'w-8 h-2 bg-zinc-900 rounded-full' 
                  : 'w-2 h-2 bg-zinc-400 rounded-full hover:bg-zinc-600'
              }`}
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