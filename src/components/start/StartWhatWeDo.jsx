import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

const PILLARS = [
  {
    number: "01",
    title: "Producción Musical",
    desc: "Beats, composición, arreglos, recording. Desde el concepto hasta el master final.",
  },
  {
    number: "02",
    title: "Dirección Creativa",
    desc: "Identidad visual, brand DNA, dirección de arte para artistas y marcas.",
  },
  {
    number: "03",
    title: "Contenido y Visuales",
    desc: "Videoclips, reels, fotografía, mini films, visualizers y contenido editorial.",
  },
  {
    number: "04",
    title: "Campañas y Marketing",
    desc: "Estrategia digital, creator marketing, ads y lanzamientos con impacto cultural.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function StartWhatWeDo() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="what-we-do" ref={ref} className="py-24 sm:py-36 px-6 sm:px-12 lg:px-20" style={{ background: "#0c0c0c" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-20 max-w-2xl">
          <motion.p
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="text-[10px] font-bold uppercase tracking-[0.3em] mb-5"
            style={{ color: "rgba(240,237,232,0.35)" }}
          >
            Lo que hacemos
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-black leading-[0.9] mb-6"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)", letterSpacing: "-0.03em", color: "#f0ede8" }}
          >
            Producción creativa con enfoque visual y cultural.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-sm leading-relaxed font-light"
            style={{ color: "rgba(240,237,232,0.45)" }}
          >
            Desarrollamos proyectos musicales, contenido y campañas desde la idea hasta la ejecución.
          </motion.p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.number}
              custom={i}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={fadeUp}
              className="group py-10 pr-8"
              style={{
                borderTop: "1px solid rgba(240,237,232,0.08)",
                borderRight: i < 3 ? "1px solid rgba(240,237,232,0.06)" : "none",
              }}
            >
              <span
                className="block font-mono text-xs mb-6"
                style={{ color: "rgba(240,237,232,0.2)", letterSpacing: "0.1em" }}
              >
                {p.number}
              </span>
              <h3
                className="font-black mb-3 leading-tight"
                style={{ fontSize: "1.05rem", letterSpacing: "-0.02em", color: "#f0ede8" }}
              >
                {p.title}
              </h3>
              <p className="text-xs leading-relaxed font-light" style={{ color: "rgba(240,237,232,0.4)" }}>
                {p.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}