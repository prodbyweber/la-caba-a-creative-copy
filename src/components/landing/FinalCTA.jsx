import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function FinalCTA() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Sparkle Icon */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-purple-500/20 border border-white/10 mb-8"
          >
            <Sparkles className="w-10 h-10 text-emerald-400" />
          </motion.div>

          {/* Headline */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Construye tu carrera
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
              con estructura
            </span>
          </h2>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
            Deja de trabajar duro sin dirección. Únete al sistema creativo que transforma artistas en negocios sostenibles.
          </p>

          {/* CTA Button */}
          <Link to={createPageUrl("Dashboard")}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 bg-[length:200%_100%] text-lg font-medium shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:bg-right transition-all duration-500"
            >
              Solicitar Membresía
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>

          {/* Trust Indicators */}
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Sin compromiso</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-400" />
              <span>Cancela en cualquier momento</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-400" />
              <span>Resultados garantizados</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}