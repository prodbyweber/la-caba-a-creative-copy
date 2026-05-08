import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";

const PATHS = [
  {
    label: "Artista / Creador",
    tag: "Para ti",
    desc: "Producción musical, contenido y desarrollo creativo para proyectos con identidad.",
    cta: "Entrar como artista",
    href: "/artists",
    image: "https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?w=900&q=85",
  },
  {
    label: "Marca",
    tag: "Para tu empresa",
    desc: "Campañas y contenido visual para marcas que buscan conectar con cultura y audiencia moderna.",
    cta: "Entrar como marca",
    href: "/brands",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&q=85",
  },
];

export default function StartChoosePath() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 sm:py-36 px-6 sm:px-12 lg:px-20" style={{ background: "#0c0c0c" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-16 text-center">
          <motion.p
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="text-[10px] font-bold uppercase tracking-[0.3em] mb-5"
            style={{ color: "rgba(240,237,232,0.3)" }}
          >
            Elige tu camino
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-black"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)", letterSpacing: "-0.03em", color: "#f0ede8" }}
          >
            ¿Quién eres?
          </motion.h2>
        </div>

        {/* Two blocks */}
        <div className="grid sm:grid-cols-2 gap-3">
          {PATHS.map((path, i) => (
            <motion.a
              key={path.label}
              href={path.href}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-2xl group block"
              style={{ minHeight: 420 }}
            >
              {/* Background image */}
              <div className="absolute inset-0">
                <img
                  src={path.image}
                  alt={path.label}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  style={{ filter: "brightness(0.35) saturate(0.6)" }}
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(12,12,12,0.95) 30%, rgba(12,12,12,0.3) 100%)" }}
                />
              </div>

              {/* Content */}
              <div className="relative z-10 flex flex-col justify-end h-full p-8 sm:p-10">
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.3em] mb-4 block"
                  style={{ color: "rgba(240,237,232,0.35)" }}
                >
                  {path.tag}
                </span>
                <h3
                  className="font-black leading-tight mb-4"
                  style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", letterSpacing: "-0.03em", color: "#f0ede8" }}
                >
                  {path.label}
                </h3>
                <p
                  className="text-sm leading-relaxed mb-8 font-light max-w-xs"
                  style={{ color: "rgba(240,237,232,0.5)" }}
                >
                  {path.desc}
                </p>
                <div
                  className="inline-flex items-center gap-3 px-5 py-3 rounded-full text-xs font-bold uppercase tracking-widest border transition-all self-start"
                  style={{
                    borderColor: "rgba(240,237,232,0.3)",
                    color: "#f0ede8",
                    background: "rgba(240,237,232,0.05)",
                    letterSpacing: "0.14em",
                  }}
                >
                  {path.cta}
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>

              {/* Hover border effect */}
              <div
                className="absolute inset-0 rounded-2xl border opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                style={{ borderColor: "rgba(240,237,232,0.15)" }}
              />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}