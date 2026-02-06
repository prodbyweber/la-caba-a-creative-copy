import React from "react";
import { motion } from "framer-motion";
import { Shield, Target, TrendingUp } from "lucide-react";

export default function FilterSection() {
  return (
    <section className="relative py-20 sm:py-32 overflow-hidden bg-zinc-950">
      <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 flex items-center justify-center">
              <Shield className="w-8 h-8 text-orange-400" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            No trabajamos con todo el mundo
          </h2>

          {/* Description */}
          <p className="text-gray-400 text-base sm:text-lg leading-relaxed mb-12 max-w-2xl mx-auto">
            Nuestros servicios están diseñados para artistas comprometidos, con mentalidad de crecimiento y visión a largo plazo.
          </p>

          {/* Key Points */}
          <div className="grid sm:grid-cols-3 gap-8 sm:gap-6 mt-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-center"
            >
              <Target className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Mentalidad profesional</h3>
              <p className="text-gray-500 text-sm">Compromiso real con tu proyecto musical</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center"
            >
              <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Visión a largo plazo</h3>
              <p className="text-gray-500 text-sm">No buscas atajos ni soluciones mágicas</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center"
            >
              <Shield className="w-8 h-8 text-orange-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Validación previa</h3>
              <p className="text-gray-500 text-sm">Algunos servicios requieren formación inicial</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}