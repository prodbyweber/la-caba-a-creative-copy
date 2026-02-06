import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

const offers = [
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
  return (
    <section id="ofertas" className="relative py-20 sm:py-32 overflow-hidden bg-black">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black opacity-80" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Formas de ayudarte
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
            Elige el nivel de acompañamiento que necesitas
          </p>
        </motion.div>

        {/* Horizontal Scroll Carousel */}
        <div className="relative">
          <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide">
            {offers.map((offer, index) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`flex-shrink-0 w-[85vw] sm:w-96 snap-center ${
                  offer.featured ? 'ring-2 ring-emerald-500/30' : ''
                }`}
              >
                <div className={`h-full bg-zinc-900 rounded-2xl border ${
                  offer.featured ? 'border-emerald-500/30' : 'border-zinc-800'
                } p-6 sm:p-8 flex flex-col hover:border-zinc-700 transition-all duration-300`}>
                  
                  {/* Tag */}
                  {offer.tag && (
                    <span className={`inline-block mb-4 px-3 py-1 rounded-full text-xs font-semibold ${
                      offer.tag === "Gratis" 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-zinc-800 text-gray-400'
                    }`}>
                      {offer.tag}
                    </span>
                  )}

                  {/* Title & Price */}
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    {offer.title}
                  </h3>
                  {offer.price && (
                    <div className="text-3xl sm:text-4xl font-bold text-white mb-4">
                      {offer.price}
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-6 flex-1">
                    {offer.description}
                  </p>

                  {/* Highlights */}
                  {offer.highlights && (
                    <div className="space-y-2 mb-6">
                      {offer.highlights.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Technical details */}
                  {offer.technical && (
                    <div className="space-y-1 mb-6">
                      {offer.technical.map((item, i) => (
                        <div key={i} className="text-xs text-gray-500">
                          • {item}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CTA */}
                  <button className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                    offer.featured
                      ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                  }`}>
                    {offer.cta}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-600">← Desliza para ver todas las opciones →</p>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}