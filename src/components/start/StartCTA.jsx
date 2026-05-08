import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";

const BG = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1600&q=80";

export default function StartCTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="cta" ref={ref} className="relative overflow-hidden" style={{ background: "#111110" }}>
      {/* Subtle background texture */}
      <div className="absolute inset-0">
        <img src={BG} alt="" className="w-full h-full object-cover" style={{ filter: "brightness(0.08) saturate(0)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(12,12,12,0.95) 0%, rgba(30,28,24,0.98) 100%)" }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-12 lg:px-20 py-32 sm:py-44 text-center">
        <motion.p
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-[10px] font-bold uppercase tracking-[0.35em] mb-8"
          style={{ color: "rgba(240,237,232,0.3)" }}
        >
          Empecemos
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-black leading-[0.88] mb-8"
          style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)", letterSpacing: "-0.035em", color: "#f0ede8" }}
        >
          Construyamos algo con identidad.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="text-sm sm:text-base leading-relaxed mb-14 font-light max-w-xl mx-auto"
          style={{ color: "rgba(240,237,232,0.45)" }}
        >
          Agenda una videollamada y conversemos sobre tu proyecto, marca o idea creativa.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <a
            href="https://calendly.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all group"
            style={{ background: "#f0ede8", color: "#0c0c0c", letterSpacing: "0.16em" }}
            onMouseEnter={e => e.currentTarget.style.background = "#fff"}
            onMouseLeave={e => e.currentTarget.style.background = "#f0ede8"}
          >
            Agendar reunión
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="mailto:hola@cabanacreative.es"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest border transition-all"
            style={{ borderColor: "rgba(240,237,232,0.22)", color: "#f0ede8", background: "transparent", letterSpacing: "0.16em" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(240,237,232,0.45)"; e.currentTarget.style.background = "rgba(240,237,232,0.05)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(240,237,232,0.22)"; e.currentTarget.style.background = "transparent"; }}
          >
            Contactar
          </a>
        </motion.div>

        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-24 h-px origin-left"
          style={{ background: "linear-gradient(to right, transparent, rgba(240,237,232,0.12), transparent)" }}
        />
      </div>
    </section>
  );
}