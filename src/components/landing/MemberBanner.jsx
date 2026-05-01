import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight } from "lucide-react";

export default function MemberBanner() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1920&h=600&fit=crop&q=80"
          alt="La Cabaña Creative Community"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Icon */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full border-2 border-white/30 flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", letterSpacing: "-0.02em" }}>
            Explorar
          </h2>

          {/* Description */}
          <p className="text-white/60 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-light">
            Descubre proyectos, creadores y contenido en movimiento.
          </p>

          {/* CTA Button */}
          <Link
            to="/Explorar"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-100 text-black font-semibold rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
          >
            Entrar y ver más
            <ArrowRight className="w-5 h-5" />
          </Link>

          {/* Footer Text */}
          <p className="text-white/30 text-sm mt-6 italic">
            Música · Films · Creadoras
          </p>
        </motion.div>
      </div>
    </section>
  );
}