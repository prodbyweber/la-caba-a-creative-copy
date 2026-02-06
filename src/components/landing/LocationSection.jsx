import React from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

export default function LocationSection() {
  return (
    <section className="relative py-20 sm:py-32 overflow-hidden bg-black">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-black to-zinc-950 opacity-60" />
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-purple-500/20 border border-emerald-500/30 flex items-center justify-center">
              <MapPin className="w-10 h-10 text-emerald-400" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Madrid
          </h2>

          {/* Description */}
          <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            Los servicios de acompañamiento presencial y high ticket se realizan exclusivamente en Madrid.
          </p>

          {/* Address detail */}
          <div className="inline-block px-6 py-3 rounded-full bg-white/5 border border-white/10">
            <p className="text-gray-300 text-sm font-medium">
              Calle de Rufino González 14, Madrid
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}