import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Upload, BarChart3, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const steps = [
  {
    icon: Music,
    number: "01",
    title: "Producción musical por horas",
    description: "Trabajamos el tiempo que el proyecto necesita. Sin atajos ni fórmulas. Proceso claro y profesional.",
    price: "Desde €50/hora",
    gradient: "from-emerald-500 to-emerald-600"
  },
  {
    icon: Upload,
    number: "02",
    title: "Dirección creativa real",
    description: "No hacemos canciones sueltas. Construimos identidad, narrativa y coherencia visual para tu proyecto.",
    price: "Desde €300/mes",
    gradient: "from-purple-500 to-purple-600"
  },
  {
    icon: BarChart3,
    number: "03",
    title: "Flujo ordenado",
    description: "Sin improvisación. Enfoque en progreso constante, no en promesas vacías. Estructura que funciona.",
    price: "Consultoría personalizada",
    gradient: "from-orange-500 to-orange-600"
  }
];

export default function HowItWorks({ config }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const displaySteps = config?.how_it_works_steps && config.how_it_works_steps.length > 0 
    ? config.how_it_works_steps 
    : steps;

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % displaySteps.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + displaySteps.length) % displaySteps.length);
  };

  return (
    <section className="relative py-20 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#111113]/50 to-transparent" />
      
      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            {config?.how_it_works_title || 'Formas de trabajar conmigo'}
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            {config?.how_it_works_subtitle || 'Trabajamos por horas, no por canciones sueltas. Proceso claro, profesional y sostenible.'}
          </p>
        </motion.div>

        {/* Desktop Grid View */}
        <div className="hidden md:grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {displaySteps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative group"
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/10 hover:border-white/20 transition-all">
                {/* Top Section - Large Title Area */}
                <div className={`bg-gradient-to-br ${step.gradient} p-8 h-48 flex items-center justify-center`}>
                  <h3 className="text-2xl font-black text-white text-center leading-tight uppercase tracking-tight">
                    {step.title}
                  </h3>
                </div>

                {/* Bottom Section - Dark Card */}
                <div className="bg-[#0f1011] p-6">
                  <div className="text-emerald-400 font-bold text-xl mb-3">{step.price}</div>
                  <p className="text-white/70 text-sm leading-relaxed mb-6 min-h-[80px]">{step.description}</p>
                  
                  <div className="flex gap-2">
                    <button className="flex-1 bg-white text-black font-semibold py-3 px-4 rounded-xl hover:bg-white/90 transition-all text-sm">
                      Comprar ahora
                    </button>
                    <button className="flex-1 bg-white/5 text-white font-semibold py-3 px-4 rounded-xl hover:bg-white/10 transition-all text-sm border border-white/20">
                      Ver más
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden relative">
          <div className="overflow-hidden px-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-sm mx-auto"
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/10">
                  {/* Top Section - Large Title Area */}
                  <div className={`bg-gradient-to-br ${displaySteps[activeIndex].gradient} p-8 h-40 flex items-center justify-center`}>
                    <h3 className="text-xl font-black text-white text-center leading-tight uppercase tracking-tight">
                      {displaySteps[activeIndex].title}
                    </h3>
                  </div>

                  {/* Bottom Section - Dark Card */}
                  <div className="bg-[#0f1011] p-5">
                    <div className="text-emerald-400 font-bold text-lg mb-3">{displaySteps[activeIndex].price}</div>
                    <p className="text-white/70 text-sm leading-relaxed mb-5">{displaySteps[activeIndex].description}</p>
                    
                    <div className="flex flex-col gap-2">
                      <button className="w-full bg-white text-black font-semibold py-3 px-4 rounded-xl hover:bg-white/90 transition-all text-sm">
                        Comprar ahora
                      </button>
                      <button className="w-full bg-white/5 text-white font-semibold py-3 px-4 rounded-xl hover:bg-white/10 transition-all text-sm border border-white/20">
                        Ver más
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prevSlide}
              className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            {/* Dots Indicator */}
            <div className="flex gap-2">
              {displaySteps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === activeIndex ? 'w-8 bg-white' : 'w-2 bg-white/30'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}