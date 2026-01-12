import React from "react";
import { motion } from "framer-motion";
import { Music, Upload, BarChart3, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Music,
    number: "01",
    title: "Crea Música",
    description: "Graba, produce y perfecciona tu sonido con nuestras instalaciones de clase mundial y orientación experta.",
    color: "emerald",
    gradient: "from-emerald-500 to-emerald-600"
  },
  {
    icon: Upload,
    number: "02",
    title: "Distribuye Contenido",
    description: "Envía tu música y clips a todas las plataformas principales con un clic. Automatizado, optimizado, rastreado.",
    color: "purple",
    gradient: "from-purple-500 to-purple-600"
  },
  {
    icon: BarChart3,
    number: "03",
    title: "Rastrea y Monetiza",
    description: "Observa tu crecimiento en tiempo real. Entiende qué funciona. Maximiza tus flujos de ingresos.",
    color: "orange",
    gradient: "from-orange-500 to-orange-600"
  }
];

export default function HowItWorks() {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#111113]/50 to-transparent" />
      
      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-emerald-400 text-sm font-medium tracking-wider uppercase mb-4 block">
            Proceso Simple
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Cómo <span className="text-purple-400">funciona</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Tres pasos para transformar tu carrera creativa. Sin complejidad, solo resultados.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection Lines */}
          <div className="absolute top-20 left-1/4 right-1/4 h-px bg-gradient-to-r from-emerald-500/50 via-purple-500/50 to-orange-500/50 hidden md:block" />
          
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="relative group"
            >
              <div className="bg-[#111113] rounded-3xl p-8 border border-white/5 hover:border-white/10 transition-all duration-500 h-full">
                {/* Step Number */}
                <div className={`absolute -top-4 right-8 px-3 py-1 rounded-full bg-gradient-to-r ${step.gradient} text-xs font-bold`}>
                  {step.number}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.description}</p>

                {/* Hover Arrow */}
                <div className="mt-6 flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className={`text-${step.color}-400`}>Saber más</span>
                  <ArrowRight className={`w-4 h-4 text-${step.color}-400 group-hover:translate-x-1 transition-transform`} />
                </div>
              </div>

              {/* Background Glow on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-r ${step.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 -z-10`} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}