import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const DEFAULT = {
  cta_btn1_link: "https://calendly.com",
  cta_btn2_link: "mailto:hola@cabanacreative.es",
};

export default function StartCTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

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
        flexDirection: "column",
        justifyContent: "center",
        background: "#f0ede8",
        overflow: "hidden",
        padding: "clamp(80px, 15vw, 160px) clamp(24px, 8vw, 100px)",
      }}
    >
      {/* Subtle grain texture overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
          pointerEvents: "none",
          opacity: 0.4,
        }}
      />

      <div style={{ maxWidth: "780px", position: "relative", zIndex: 1 }}>

        {/* Label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 700,
            fontSize: "10px",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "rgba(12,12,12,0.35)",
            marginBottom: "clamp(20px, 4vw, 36px)",
          }}
        >
          Siguiente paso
        </motion.p>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 36 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(2.8rem, 8vw, 7rem)",
            letterSpacing: "-0.045em",
            lineHeight: 0.88,
            color: "#0c0c0c",
            marginBottom: "clamp(24px, 5vw, 48px)",
            margin: "0 0 clamp(12px, 3vw, 24px)",
          }}
        >
          Let's make
          <br />
          <span style={{ color: "#ff5833" }}>something</span>
          <br />
          real.
        </motion.h2>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            height: "1px",
            background: "rgba(12,12,12,0.15)",
            transformOrigin: "left",
            maxWidth: "100%",
            marginBottom: "clamp(28px, 5vw, 52px)",
            marginTop: "clamp(20px, 4vw, 40px)",
          }}
        />

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.45 }}
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 300,
            fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
            color: "rgba(12,12,12,0.5)",
            lineHeight: 1.6,
            marginBottom: "clamp(36px, 7vw, 72px)",
            maxWidth: "420px",
          }}
        >
          Una videollamada. Sin compromiso.<br />Cuéntanos tu proyecto.
        </motion.p>

        {/* CTA actions — editorial text links */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.6 }}
          style={{ display: "flex", flexDirection: "column", gap: "0" }}
        >
          <a
            href={c.cta_btn1_link}
            target={c.cta_btn1_link?.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(1.5rem, 4.5vw, 3.2rem)",
              letterSpacing: "-0.035em",
              color: "#0c0c0c",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              paddingBottom: "clamp(10px, 2vw, 18px)",
              borderBottom: "1px solid rgba(12,12,12,0.12)",
              marginBottom: "clamp(10px, 2vw, 18px)",
              transition: "gap 0.25s ease, color 0.2s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.gap = "28px"; e.currentTarget.style.color = "#ff5833"; }}
            onMouseLeave={e => { e.currentTarget.style.gap = "16px"; e.currentTarget.style.color = "#0c0c0c"; }}
          >
            Agendar reunión
            <span style={{ fontSize: "0.7em", opacity: 0.6 }}>→</span>
          </a>
          <a
            href={c.cta_btn2_link}
            target={c.cta_btn2_link?.startsWith("http") ? "_blank" : undefined}
            style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(1.5rem, 4.5vw, 3.2rem)",
              letterSpacing: "-0.035em",
              color: "rgba(12,12,12,0.3)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              transition: "gap 0.25s ease, color 0.2s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.gap = "28px"; e.currentTarget.style.color = "#0c0c0c"; }}
            onMouseLeave={e => { e.currentTarget.style.gap = "16px"; e.currentTarget.style.color = "rgba(12,12,12,0.3)"; }}
          >
            Contactar
            <span style={{ fontSize: "0.7em", opacity: 0.5 }}>→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}