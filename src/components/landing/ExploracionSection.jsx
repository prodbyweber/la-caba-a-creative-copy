import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function ExploracionSection() {
  return (
    <section className="relative py-20 sm:py-32 overflow-hidden bg-zinc-950">
      <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Título */}
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-8">
            Exploración con Prod. by Weber
          </h2>

          {/* Card Central */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-3xl p-8 sm:p-12 max-w-2xl mx-auto">
            {/* Precio Destacado */}
            <div className="mb-6">
              <div className="text-6xl sm:text-7xl font-black text-white mb-2">600 €</div>
              <div className="text-lg text-gray-400 font-medium">Sesión privada 1 a 1</div>
            </div>

            {/* Subtítulo */}
            <p className="text-xl sm:text-2xl text-white font-semibold mb-8 leading-relaxed">
              No es una llamada informativa.<br />
              Es una sesión privada para entender tu proyecto y decidir cómo llevarlo al siguiente nivel.
            </p>

            {/* Descripción Principal */}
            <div className="text-left mb-8 space-y-4 text-gray-300 leading-relaxed">
              <p>
                La <span className="text-white font-semibold">Exploración con Prod. by Weber</span> es una sesión privada 1 a 1 donde analizamos tu proyecto artístico, tu música y tu dirección creativa actual.
              </p>

              <div className="space-y-2 py-4">
                <p className="text-white font-semibold">Durante la sesión:</p>
                <ul className="space-y-2 pl-4">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Detectamos qué está funcionando y qué no</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Identificamos bloqueos creativos o estratégicos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Definimos si tu proyecto necesita producción, dirección creativa o estructura</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Trazamos el siguiente paso lógico para que avances con claridad</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4">
                <p className="text-white font-semibold mb-2">Sales con:</p>
                <ul className="space-y-2 pl-4">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">•</span>
                    <span>Una visión clara de tu proyecto</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">•</span>
                    <span>Dirección concreta</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">•</span>
                    <span>Criterio profesional para tomar decisiones</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Detalles de la Sesión */}
            <div className="grid grid-cols-2 gap-3 mb-8 text-sm">
              <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
                <div className="text-gray-400 mb-1">Duración</div>
                <div className="text-white font-semibold">40 minutos</div>
              </div>
              <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
                <div className="text-gray-400 mb-1">Modalidad</div>
                <div className="text-white font-semibold">Online</div>
              </div>
            </div>

            {/* Valores */}
            <div className="flex flex-wrap justify-center gap-3 mb-8 text-xs text-gray-400">
              <span className="px-3 py-1 bg-zinc-800/50 rounded-full">Sin promesas vacías</span>
              <span className="px-3 py-1 bg-zinc-800/50 rounded-full">Sin plantillas genéricas</span>
              <span className="px-3 py-1 bg-zinc-800/50 rounded-full">Exploración real</span>
            </div>

            {/* CTA */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 px-8 bg-white hover:bg-gray-100 text-black font-bold text-lg rounded-xl transition-all shadow-xl"
            >
              Reservar Exploración – 600 €
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}