import React from "react";
import { motion } from "framer-motion";
import { Shield, Target, Zap } from "lucide-react";

export default function ForSeriousArtists() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Dramatic Background */}
      <div className="absolute inset-0 bg-[#0a0a0b]">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-purple-500/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Icon Row */}
          <div className="flex items-center justify-center gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"
            >
              <Shield className="w-8 h-8 text-emerald-400" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center"
            >
              <Target className="w-10 h-10 text-purple-400" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center"
            >
              <Zap className="w-8 h-8 text-orange-400" />
            </motion.div>
          </div>

          {/* Main Statement */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 leading-tight">
            <span className="text-white">Esto no es para</span>{" "}
            <span className="text-gray-500">todo el mundo.</span>
          </h2>

          <p className="text-xl sm:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-8">
            La Cabaña Creative es para artistas que:
          </p>

          <div className="max-w-2xl mx-auto text-left space-y-3 mb-12">
            <p className="text-lg text-gray-300 flex items-start gap-3">
              <span className="text-emerald-400 font-bold">•</span>
              <span><span className="text-white font-medium">Invierten</span> en su proyecto</span>
            </p>
            <p className="text-lg text-gray-300 flex items-start gap-3">
              <span className="text-purple-400 font-bold">•</span>
              <span><span className="text-white font-medium">Valoran</span> el proceso</span>
            </p>
            <p className="text-lg text-gray-300 flex items-start gap-3">
              <span className="text-orange-400 font-bold">•</span>
              <span>Buscan algo <span className="text-white font-medium">único y profesional</span></span>
            </p>
            <p className="text-lg text-gray-300 flex items-start gap-3">
              <span className="text-emerald-400 font-bold">•</span>
              <span>Entienden que la <span className="text-white font-medium">constancia</span> supera al golpe de suerte</span>
            </p>
          </div>

          <p className="text-xl font-semibold text-white max-w-2xl mx-auto">
            Si buscas algo rápido y barato, este no es tu sitio.
          </p>

          {/* Separator Line */}
          <div className="flex items-center justify-center gap-4">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>


        </motion.div>
      </div>
    </section>
  );
}