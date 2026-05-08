import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const BG_IMAGE = "https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?w=1800&q=85";

const DEFAULT = {
  hero_headline: "Creamos música, contenido y experiencias visuales para marcas y artistas modernos.",
  hero_subtext: "Producción creativa, dirección visual y campañas diseñadas para proyectos con identidad.",
  hero_btn1_label: "Agendar videollamada", hero_btn1_link: "#cta",
  hero_btn2_label: "Explorar trabajos", hero_btn2_link: "/Explorar",
};

export default function StartHero() {
  const { data: cfg } = useQuery({
    queryKey: ["landingConfig"],
    queryFn: async () => { const c = await base44.entities.LandingConfig.list(); return c[0] || null; },
    staleTime: 30000,
  });
  const c = { ...DEFAULT, ...(cfg?.start_page_config || {}) };
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);

  const scrollDown = () => {
    const el = document.getElementById("what-we-do");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section ref={ref} className="relative w-full overflow-hidden" style={{ height: "100dvh", minHeight: 600 }}>
      {/* Background */}
      <motion.div className="absolute inset-0" style={{ y }}>
        <img
          src={BG_IMAGE}
          alt=""
          className="w-full h-full object-cover"
          style={{ filter: "brightness(0.45) saturate(0.85)" }}
        />
        {/* Cinematic grain overlay */}
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 120% 100% at 50% 0%, transparent 40%, rgba(12,12,12,0.6) 100%)"
        }} />
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to bottom, rgba(12,12,12,0.15) 0%, transparent 30%, rgba(12,12,12,0.7) 80%, #0c0c0c 100%)"
        }} />
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col justify-end h-full px-6 sm:px-12 lg:px-20 pb-20 sm:pb-24"
        style={{ opacity }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6"
        >
          <span
            className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] rounded-full border"
            style={{ borderColor: "rgba(240,237,232,0.18)", color: "rgba(240,237,232,0.55)", background: "rgba(240,237,232,0.04)" }}
          >
            Cabaña Creative Studio
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="font-black leading-[0.88] mb-6"
          style={{
            fontSize: "clamp(2.4rem, 6.5vw, 5.2rem)",
            letterSpacing: "-0.03em",
            color: "#f0ede8",
            maxWidth: "820px",
          }}
        >
          {c.hero_headline}
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-sm sm:text-base leading-relaxed mb-10 max-w-xl font-light"
          style={{ color: "rgba(240,237,232,0.5)" }}
        >
          {c.hero_subtext}
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap gap-3"
        >
          <a
            href={c.hero_btn1_link || "#cta"}
            onClick={e => { if ((c.hero_btn1_link || "#cta").startsWith("#")) { e.preventDefault(); document.querySelector(c.hero_btn1_link || "#cta")?.scrollIntoView({ behavior: "smooth" }); } }}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all"
            style={{ background: "#f0ede8", color: "#0c0c0c", letterSpacing: "0.16em" }}
            onMouseEnter={e => e.currentTarget.style.background = "#fff"}
            onMouseLeave={e => e.currentTarget.style.background = "#f0ede8"}
          >
            {c.hero_btn1_label}
          </a>
          <a
            href={c.hero_btn2_link || "/Explorar"}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest border transition-all"
            style={{ borderColor: "rgba(240,237,232,0.25)", color: "#f0ede8", background: "rgba(240,237,232,0.04)", letterSpacing: "0.16em" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(240,237,232,0.5)"; e.currentTarget.style.background = "rgba(240,237,232,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(240,237,232,0.25)"; e.currentTarget.style.background = "rgba(240,237,232,0.04)"; }}
          >
            {c.hero_btn2_label}
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <button
          onClick={scrollDown}
          className="absolute bottom-8 right-10 flex flex-col items-center gap-1 opacity-40 hover:opacity-70 transition-opacity"
        >
          <span className="text-[9px] font-semibold uppercase tracking-[0.25em]" style={{ color: "#f0ede8" }}>Scroll</span>
          <ChevronDown className="w-3.5 h-3.5" style={{ color: "#f0ede8" }} />
        </button>
      </motion.div>
    </section>
  );
}