import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";

const SERVICES = [
  "Producción musical",
  "Grabación y vocal coaching",
  "Mixing y mastering",
  "Dirección creativa",
  "Videoclips y reels",
  "Marketing y estrategia",
];

const IMAGES = [
  "https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?w=800&q=80",
  "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800&q=80",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
];

export default function StartArtists() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="artists" ref={ref} className="py-24 sm:py-36 px-6 sm:px-12 lg:px-20" style={{ background: "#111110" }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left — text */}
          <div>
            <motion.p
              initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6 }}
              className="text-[10px] font-bold uppercase tracking-[0.3em] mb-6"
              style={{ color: "rgba(240,237,232,0.3)" }}
            >
              Para artistas y creadores
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="font-black leading-[0.88] mb-6"
              style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", letterSpacing: "-0.03em", color: "#f0ede8" }}
            >
              Servicios para artistas y creadores.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-sm leading-relaxed mb-10 font-light"
              style={{ color: "rgba(240,237,232,0.45)" }}
            >
              Desarrollamos proyectos musicales y visuales desde la identidad hasta el lanzamiento.
            </motion.p>

            {/* Services list */}
            <div className="space-y-0 mb-12">
              {SERVICES.map((s, i) => (
                <motion.div
                  key={s}
                  initial={{ opacity: 0, x: -16 }} animate={inView ? { opacity: 1, x: 0 } : {}}
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
              className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all group"
              style={{ background: "#f0ede8", color: "#0c0c0c", letterSpacing: "0.14em" }}
              onMouseEnter={e => e.currentTarget.style.background = "#fff"}
              onMouseLeave={e => e.currentTarget.style.background = "#f0ede8"}
            >
              Agenda un diagnóstico creativo
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </motion.a>
          </div>

          {/* Right — image grid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-2 gap-2.5"
          >
            {IMAGES.map((src, i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-lg"
                style={{ aspectRatio: i === 0 ? "3/4" : i === 3 ? "3/4" : "1/1" }}
              >
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  style={{ filter: "brightness(0.75) saturate(0.8)" }}
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}