import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

// Cinematic editorial showcase items — real Unsplash images
const ITEMS = [
  { src: "https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?w=900&q=85", label: "Recording Session", span: "col-span-2 row-span-2" },
  { src: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=700&q=85", label: "Visual Direction" },
  { src: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=700&q=85", label: "Live Performance" },
  { src: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=700&q=85", label: "Brand Campaign" },
  { src: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=700&q=85", label: "Creator Content" },
  { src: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=900&q=85", label: "Music Production", span: "col-span-2" },
  { src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=85", label: "Visual Story" },
];

function ShowcaseItem({ item, index, inView }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden rounded-lg group cursor-default ${item.span || ""}`}
      style={{ aspectRatio: item.span?.includes("row-span-2") ? "auto" : "1/1", minHeight: item.span?.includes("row-span-2") ? 360 : 180 }}
    >
      <img
        src={item.src}
        alt={item.label}
        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
        style={{ filter: "brightness(0.65) saturate(0.7)", transition: "transform 0.7s ease, filter 0.5s ease" }}
        onMouseEnter={e => e.currentTarget.style.filter = "brightness(0.8) saturate(0.85)"}
        onMouseLeave={e => e.currentTarget.style.filter = "brightness(0.65) saturate(0.7)"}
      />
      <div
        className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
        style={{ background: "linear-gradient(to top, rgba(12,12,12,0.7) 0%, transparent 60%)" }}
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "rgba(240,237,232,0.6)" }}>
          {item.label}
        </span>
      </div>
    </motion.div>
  );
}

export default function StartShowcase() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="py-24 sm:py-36 px-6 sm:px-12 lg:px-20" style={{ background: "#111110" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <motion.p
              initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6 }}
              className="text-[10px] font-bold uppercase tracking-[0.3em] mb-4"
              style={{ color: "rgba(240,237,232,0.3)" }}
            >
              Showcase
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="font-black"
              style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", letterSpacing: "-0.03em", color: "#f0ede8" }}
            >
              Proyectos recientes.
            </motion.h2>
          </div>
          <motion.a
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            href="/Explorar"
            className="hidden sm:inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-60"
            style={{ color: "rgba(240,237,232,0.5)", letterSpacing: "0.15em" }}
          >
            Ver todo →
          </motion.a>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 auto-rows-[180px]">
          {ITEMS.map((item, i) => (
            <ShowcaseItem key={i} item={item} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}