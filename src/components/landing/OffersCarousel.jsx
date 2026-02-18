import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import OfferDetailPanel from "./OfferDetailPanel";

const defaultOffers = [
  {
    id: 1,
    tag: "Gratis",
    title: "Empieza aquí",
    price: null,
    description: "Contenido educativo grabado para artistas que quieren entender la industria, la marca personal y el poder del sonido.",
    cta: "Acceder",
    color: "emerald",
    featured: false
  },
  {
    id: 2,
    title: "Marca Artística",
    price: "27,99 €",
    description: "Curso grabado paso a paso para definir tu identidad como artista, tu sonido, tu narrativa visual y producir música competitiva.",
    cta: "Ver curso",
    color: "purple",
    featured: false
  },
  {
    id: 3,
    title: "Plan de Acción Artístico",
    price: "99,99 €",
    description: "Videollamada estratégica para diagnosticar tu proyecto y salir con un plan claro de qué hacer y en qué orden.",
    cta: "Reservar sesión",
    color: "blue",
    featured: false
  },
  {
    id: 4,
    title: "Creación + Dirección",
    price: "750 €",
    description: "Programa híbrido donde creamos música contigo, te damos dirección creativa y construimos tu marca mientras produces.",
    highlights: ["10 horas de creación", "1 mix & master", "1 revisión de contenido"],
    cta: "Aplicar",
    color: "orange",
    featured: true
  },
  {
    id: 5,
    tag: "Solo Madrid · Cupos limitados",
    title: "Artista Pro – Madrid",
    price: "1.200 €",
    description: "Dirección creativa y producción total presencial en Madrid. Marca, música, contenido y estrategia para posicionarte a nivel profesional.",
    cta: "Aplicar",
    color: "red",
    featured: true
  },
  {
    id: 6,
    title: "Producción Técnica",
    price: null,
    description: "Mix, master y Dolby Atmos para artistas que ya han pasado por nuestros procesos creativos.",
    technical: ["Mix + Master 170 €", "Mix 120 €", "Dolby Atmos desde 450 €"],
    cta: "Ver condiciones",
    color: "zinc",
    featured: false
  },
  {
    id: 7,
    title: "Workshops Grabados",
    price: null,
    description: "Formación especializada bajo demanda sobre marca artística, frecuencias, producción, contenido y carrera musical.",
    cta: "Ver workshops",
    color: "teal",
    featured: false
  }
];

export default function OffersCarousel() {
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = React.useRef(null);

  const { data: config } = useQuery({
    queryKey: ['landingConfig'],
    queryFn: async () => {
      const configs = await base44.entities.LandingConfig.list();
      return configs.length > 0 ? configs[0] : null;
    }
  });

  const offers = config?.offers && config.offers.length > 0 ? config.offers : defaultOffers;

  const scrollToIndex = (index) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.scrollWidth / offers.length;
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
      const cardWidth = container.scrollWidth / offers.length;
      const newIndex = Math.round(container.scrollLeft / cardWidth);
      setCurrentIndex(newIndex);
    }
  };

  return (
    <section id="ofertas" className="relative py-20 sm:py-32 overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Formas de ayudarte
          </h2>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scrollToIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-20 w-12 h-12 items-center justify-center rounded-full bg-white hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl"
          >
            <ArrowRight className="w-5 h-5 text-black rotate-180" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scrollToIndex(Math.min(offers.length - 1, currentIndex + 1))}
            disabled={currentIndex === offers.length - 1}
            className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-20 w-12 h-12 items-center justify-center rounded-full bg-white hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl"
          >
            <ArrowRight className="w-5 h-5 text-black" />
          </button>

          {/* Horizontal Scroll Carousel */}
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto pb-8 snap-x snap-mandatory scroll-smooth px-4 sm:px-0"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {offers.map((offer, index) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex-shrink-0 w-[260px] sm:w-[300px] snap-center"
              >
                <div className="h-full bg-zinc-900/90 backdrop-blur-sm rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300 flex flex-col shadow-xl border border-zinc-800/50">
                  
                  {/* Top Section - Light background */}
                  <div className="bg-zinc-200 h-[200px] overflow-hidden flex items-center justify-center">
                    {offer.image_url ? (
                      <img 
                        src={offer.image_url} 
                        alt={offer.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <h3 className="text-xl sm:text-2xl font-black text-zinc-900 text-center leading-tight px-6">
                        {offer.title}
                      </h3>
                    )}
                  </div>

                  {/* Bottom Section - Dark background */}
                  <div className="bg-zinc-900 p-5 flex flex-col">
                    {/* Title (if image exists) */}
                    {offer.image_url && (
                      <h3 className="text-lg font-bold text-white mb-2 leading-tight">
                        {offer.title}
                      </h3>
                    )}

                    {/* Price */}
                    {offer.price && (
                      <div className="text-base font-semibold text-emerald-400 mb-3">
                        {offer.price}
                      </div>
                    )}

                    {/* Description */}
                    <div className="text-gray-400 text-sm leading-relaxed mb-4 whitespace-pre-line line-clamp-3">
                      {offer.description}
                    </div>

                    {/* CTA Buttons */}
                    <div className="space-y-2">
                      {offer.booking_link && (
                        <button
                          onClick={() => setSelectedOffer(offer)}
                          className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 font-semibold text-sm transition-all flex items-center justify-center gap-2"
                        >
                          📞 Agendar Videollamada
                        </button>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedOffer(offer)}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 font-semibold text-sm transition-all border border-zinc-700"
                        >
                          Ver más
                        </button>
                        <button
                          className="flex-1 py-2.5 px-4 rounded-xl bg-white text-black hover:bg-gray-100 font-semibold text-sm transition-all"
                        >
                          Comprar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Dots Indicators */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {offers.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`transition-all ${
                index === currentIndex 
                  ? 'w-8 h-2 bg-white rounded-full' 
                  : 'w-2 h-2 bg-gray-600 rounded-full hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
      </div>

      <OfferDetailPanel
        offer={selectedOffer}
        isOpen={!!selectedOffer}
        onClose={() => setSelectedOffer(null)}
      />

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}