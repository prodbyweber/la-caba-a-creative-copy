import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const services = [
  {
    id: 1,
    title: "PRODUCCIÓN MUSICAL",
    subtitle: "Por Horas",
    price: "$80 USD / hora",
    description: "Trabajamos el tiempo que necesitas. Sin fórmulas ni atajos. Proceso claro, profesional y enfocado en lo que tu proyecto requiere.",
    gradient: "from-emerald-600 via-emerald-700 to-emerald-900",
    accentColor: "emerald"
  },
  {
    id: 2,
    title: "VISUALES CINEMATOGRÁFICOS",
    subtitle: "Identidad Visual",
    price: "$250 USD / sesión",
    description: "Look premium para destacar. Clips, films y contenido cinematográfico que construye tu imagen con coherencia y dirección.",
    gradient: "from-purple-600 via-purple-800 to-purple-900",
    accentColor: "purple"
  },
  {
    id: 3,
    title: "DIRECCIÓN CREATIVA",
    subtitle: "Estrategia y Concepto",
    price: "$150 USD / sesión",
    description: "Construimos tu universo artístico. Narrativa, branding y concepto. No hacemos canciones sueltas, creamos proyectos con identidad.",
    gradient: "from-orange-600 via-orange-700 to-orange-900",
    accentColor: "orange"
  },
  {
    id: 4,
    title: "DOLBY ATMOS",
    subtitle: "Audio Inmersivo",
    price: "$200 USD / track",
    description: "Adapta tu música a formatos inmersivos. Más profundidad, más calidad. Listo para Apple Music y plataformas premium.",
    gradient: "from-blue-600 via-blue-800 to-blue-900",
    accentColor: "blue"
  },
  {
    id: 5,
    title: "DASHBOARD ARTISTA",
    subtitle: "Plataforma Digital",
    price: "Incluido en membresía",
    description: "Control total de tu proyecto. Gestiona sesiones, clips, calendario, revisiones y estadísticas en un solo lugar.",
    gradient: "from-pink-600 via-pink-700 to-pink-900",
    accentColor: "pink"
  }
];

export default function ServicesCarousel({ config }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = services.length - 1;
      if (nextIndex >= services.length) nextIndex = 0;
      return nextIndex;
    });
  };

  return (
    <section className="relative py-20 sm:py-32 overflow-hidden bg-gradient-to-b from-transparent via-[#0a0a0b] to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            {config?.services_title || 'Formas de trabajar contigo'}
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto px-4">
            {config?.services_subtitle || 'Servicios diseñados para artistas que buscan profesionalismo y resultados reales.'}
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Desktop View */}
          <div className="hidden lg:block">
            <div className="relative h-[520px] flex items-center justify-center">
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={1}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipe = swipePower(offset.x, velocity.x);
                    if (swipe < -swipeConfidenceThreshold) {
                      paginate(1);
                    } else if (swipe > swipeConfidenceThreshold) {
                      paginate(-1);
                    }
                  }}
                  className="absolute w-full max-w-xl"
                >
                  <ServiceCard service={services[currentIndex]} />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Arrows */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => paginate(-1)}
                className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-2">
                {services.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setDirection(idx > currentIndex ? 1 : -1);
                      setCurrentIndex(idx);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentIndex 
                        ? 'w-8 bg-emerald-500' 
                        : 'w-2 bg-white/20 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => paginate(1)}
                className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Mobile View - Stack */}
          <div className="lg:hidden space-y-4 px-4">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ service }) {
  return (
    <div className={`relative bg-gradient-to-br ${service.gradient} rounded-3xl overflow-hidden border border-white/10`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiMwMDAwMDAiIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNNjAgMEgwdjYwaDYwVjB6TTU5IDFIMXY1OGg1OFYxeiIgZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIuMyIvPjwvZz48L3N2Zz4=')] opacity-30" />
      </div>

      <div className="relative p-8 sm:p-10">
        {/* Top Section */}
        <div className="mb-8 sm:mb-12">
          <div className="text-white/60 text-sm font-medium mb-2 tracking-wider">
            {service.subtitle}
          </div>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 leading-tight tracking-tight">
            {service.title}
          </h3>
        </div>

        {/* Bottom Section */}
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/10">
          <div className={`text-2xl sm:text-3xl font-bold text-${service.accentColor}-400 mb-4`}>
            {service.price}
          </div>
          <p className="text-white/80 text-base sm:text-lg leading-relaxed mb-6">
            {service.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex-1 px-6 py-3 bg-white text-black rounded-xl font-semibold hover:bg-white/90 transition-colors">
              Reservar ahora
            </button>
            <button className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold border border-white/20 transition-colors">
              Ver más
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}