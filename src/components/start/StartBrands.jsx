import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";

const SERVICES = [
  "Campañas creativas",
  "Producción audiovisual",
  "Creator marketing",
  "Brand content",
  "Social media y ads",
  "Estrategia digital",
];

const IMAGES = [
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
];

export default function StartBrands() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="brands" ref={ref} className="py-24 sm:py-36 px-6 sm:px-12 lg:px-20" style={{ background: "#0c0c0c" }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left — image grid (reversed on desktop) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-2 gap-2.5 order-2 lg:order-1"
          >
            {IMAGES.map((src, i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-lg"
                style={{ aspectRatio: i === 1 ? "3/4" : i === 2 ? "3/4" : "1/1" }}
              >
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  style={{ filter: "brightness(0.7) saturate(0.75)" }}
                />
              </div>
            ))}
          </motion.div>

          {/* Right — text */}
          <div className="order-1 lg:order-2">
            <motion.p
              initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6 }}
              className="text-[10px] font-bold uppercase tracking-[0.3em] mb-6"
              style={{ color: "rgba(240,237,232,0.3)" }}
            >
              Para marcas
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="font-black leading-[0.88] mb-6"
              style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", letterSpacing: "-0.03em", color: "#f0ede8" }}
            >
              Producción creativa para marcas modernas.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-sm leading-relaxed mb-10 font-light"
              style={{ color: "rgba(240,237,232,0.45)" }}
            >
              Creamos campañas, contenido y experiencias visuales diseñadas para conectar con cultura y audiencia real.
            </motion.p>

            {/* Services */}
            <div className="space-y-0 mb-12">
              {SERVICES.map((s, i) => (
                <motion.div
                  key={s}
                  initial={{ opacity: 0, x: 16 }} animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.25 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center justify-between py-3.5"
                  style={{ borderBottom: "1px solid rgba(240,237,232,0.07)" }}
                >
                  <span className="text-sm font-medium" style={{ color: "rgba(240,237,232,0.7)" }}>{s}</span>
                  <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "rgba(240,237,232,0.2)" }} />
                </motion.div>
              ))}
            </div>

            <motion.a
              initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.7 }}
              href="#cta"
              onClick={e => { e.preventDefault(); document.querySelector("#cta")?.scrollIntoView({ behavior: "smooth" }); }}
              className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all group border"
              style={{ borderColor: "rgba(240,237,232,0.25)", color: "#f0ede8", background: "transparent", letterSpacing: "0.14em" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(240,237,232,0.07)"; e.currentTarget.style.borderColor = "rgba(240,237,232,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(240,237,232,0.25)"; }}
            >
              Agenda una reunión estratégica
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </motion.a>
          </div>
        </div>
      </div>
    </section>
  );
}