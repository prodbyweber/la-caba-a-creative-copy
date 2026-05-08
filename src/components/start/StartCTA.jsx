import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const DEFAULT = {
  cta_headline: "Construyamos algo con identidad.",
  cta_subtext: "Agenda una videollamada y conversemos sobre tu proyecto, marca o idea creativa.",
  cta_btn1_label: "Agendar reunión", cta_btn1_link: "https://calendly.com",
  cta_btn2_label: "Contactar", cta_btn2_link: "mailto:hola@cabanacreative.es",
};

export default function StartCTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const { data: cfg } = useQuery({
    queryKey: ["landingConfig"],
    queryFn: async () => { const c = await base44.entities.LandingConfig.list(); return c[0] || null; },
    staleTime: 30000,
  });
  const c = { ...DEFAULT, ...(cfg?.start_page_config || {}) };

  return (
    <section
      id="cta"
      ref={ref}
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        background: "#0c0c0c",
        padding: "clamp(80px, 15vw, 160px) clamp(24px, 8vw, 100px)",
        overflow: "hidden",
      }}
    >
      {/* Subtle texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 70% 50% at 20% 50%, rgba(240,237,232,0.02) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "680px", position: "relative", zIndex: 1 }}>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 700,
            fontSize: "10px",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "rgba(240,237,232,0.3)",
            marginBottom: "clamp(20px, 4vw, 40px)",
          }}
        >
          Empecemos
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(2.2rem, 6vw, 5rem)",
            letterSpacing: "-0.04em",
            lineHeight: 0.92,
            color: "#f0ede8",
            marginBottom: "clamp(20px, 4vw, 36px)",
          }}
        >
          {c.cta_headline}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.35 }}
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 300,
            fontSize: "clamp(0.85rem, 1.8vw, 1.05rem)",
            color: "rgba(240,237,232,0.45)",
            lineHeight: 1.6,
            marginBottom: "clamp(32px, 6vw, 60px)",
            maxWidth: "440px",
          }}
        >
          {c.cta_subtext}
        </motion.p>

        {/* Links — editorial style, no buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
          style={{ display: "flex", flexDirection: "column", gap: "0" }}
        >
          <a
            href={c.cta_btn1_link}
            target={c.cta_btn1_link?.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(1.6rem, 4vw, 3rem)",
              letterSpacing: "-0.03em",
              color: "#f0ede8",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              paddingBottom: "clamp(10px, 2vw, 16px)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              marginBottom: "clamp(10px, 2vw, 16px)",
              transition: "color 0.25s ease, gap 0.25s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.gap = "24px"; }}
            onMouseLeave={e => { e.currentTarget.style.gap = "16px"; }}
          >
            {c.cta_btn1_label}
            <span style={{ opacity: 0.5 }}>→</span>
          </a>
          <a
            href={c.cta_btn2_link}
            target={c.cta_btn2_link?.startsWith("http") ? "_blank" : undefined}
            style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(1.6rem, 4vw, 3rem)",
              letterSpacing: "-0.03em",
              color: "rgba(240,237,232,0.35)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              transition: "color 0.25s ease, gap 0.25s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "#f0ede8"; e.currentTarget.style.gap = "24px"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(240,237,232,0.35)"; e.currentTarget.style.gap = "16px"; }}
          >
            {c.cta_btn2_label}
            <span style={{ opacity: 0.4 }}>→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}