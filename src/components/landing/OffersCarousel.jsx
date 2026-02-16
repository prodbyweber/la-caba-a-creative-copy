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

  const { data: config } = useQuery({
    queryKey: ['landingConfig'],
    queryFn: async () => {
      const configs = await base44.entities.LandingConfig.list();
      return configs.length > 0 ? configs[0] : null;
    }
  });

  const offers = config?.offers && config.offers.length > 0 ? config.offers : defaultOffers;

  return (
    <section id="ofertas" className="relative py-20 sm:py-32 overflow-hidden bg-[#0B0B0D]">
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
            Formas de ayudarte
          </h2>
        </motion.div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer, index) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="flex"
            >
              <div className="group w-full bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col">
                {/* Card Content */}
                <div className="p-8 flex-1 flex flex-col">
                  {/* Title */}
                  <h3 className="text-2xl font-bold text-white mb-3 leading-tight">
                    {offer.title}
                  </h3>

                  {/* Price */}
                  {offer.price && (
                    <div className="text-3xl font-bold text-white mb-4">
                      {offer.price}
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    {offer.description}
                  </p>

                  {/* Divider */}
                  <div className="h-px bg-white/10 mb-6" />

                  {/* Bullet Points Section */}
                  <div className="mb-6 flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-4 font-medium">
                      Lo que incluye este plan
                    </p>
                    <ul className="space-y-3">
                      {(offer.highlights || []).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                          <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => setSelectedOffer(offer)}
                    className="w-full py-3 px-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 group-hover:bg-emerald-500 group-hover:border-emerald-500 group-hover:text-black"
                  >
                    {offer.cta || 'Ver más'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <OfferDetailPanel
        offer={selectedOffer}
        isOpen={!!selectedOffer}
        onClose={() => setSelectedOffer(null)}
      />
    </section>
  );
}