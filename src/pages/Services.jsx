import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft } from "lucide-react";

const services = [
  {
    tag: "01 — Identidad",
    title: "Dirección\nCreativa",
    subtitle: "Visión estratégica y dirección de proyectos de principio a fin.",
    cta: "Explorar",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1800&h=1000&fit=crop&q=85",
  },
  {
    tag: "02 — Sonido",
    title: "Producción\nMusical",
    subtitle: "Creación, grabación y producción de música de alta calidad.",
    cta: "Descubrir",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1800&h=1000&fit=crop&q=85",
  },
  {
    tag: "03 — Catálogo",
    title: "Construcción\nde Catálogo",
    subtitle: "Desarrollo y estructuración de tu repertorio musical con visión.",
    cta: "Ver más",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1800&h=1000&fit=crop&q=85",
  },
  {
    tag: "04 — Visual",
    title: "Producción\nAudiovisual",
    subtitle: "Contenido visual cinematográfico y estrategia de medios.",
    cta: "Explorar",
    image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1800&h=1000&fit=crop&q=85",
  },
  {
    tag: "05 — Digital",
    title: "Producción\nDigital",
    subtitle: "Contenido digital optimizado para plataformas y redes sociales.",
    cta: "Descubrir",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1800&h=1000&fit=crop&q=85",
  },
  {
    tag: "06 — Marca",
    title: "Posicionamiento\nArtístico",
    subtitle: "Estrategia de marca y posicionamiento en el mercado.",
    cta: "Ver más",
    image: "https://images.unsplash.com/photo-1534670007418-fbb7f6cf32c3?w=1800&h=1000&fit=crop&q=85",
  },
  {
    tag: "07 — Proyecto",
    title: "Desarrollo\nArtístico",
    subtitle: "Acompañamiento integral en el crecimiento de tu carrera.",
    cta: "Explorar",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1800&h=1000&fit=crop&q=85",
  },
  {
    tag: "08 — Identidad",
    title: "Branding\nArtístico",
    subtitle: "Identidad visual y construcción de marca personal única.",
    cta: "Descubrir",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1800&h=1000&fit=crop&q=85",
  },
  {
    tag: "09 — Narrativa",
    title: "Comunicación\n& Storytelling",
    subtitle: "Construcción de narrativa y estrategia comunicacional.",
    cta: "Ver más",
    image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=1800&h=1000&fit=crop&q=85",
  },
  {
    tag: "10 — Ingresos",
    title: "Marketing\n& Monetización",
    subtitle: "Estrategias de comercialización y generación de ingresos.",
    cta: "Explorar",
    image: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=1800&h=1000&fit=crop&q=85",
  },
];

function ServiceBlock({ service, index }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden group cursor-pointer"
      style={{
        height: "100svh",
        width: "100vw",
        marginLeft: "calc(-50vw + 50%)",
      }}
    >
      {/* Background image */}
      <img
        src={service.image}
        alt={service.title}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-in-out group-hover:scale-[1.04]"
        style={{ objectPosition: "center center" }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/15 transition-colors duration-700" />

      {/* Bottom gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

      {/* Top-left index */}
      <div className="absolute top-8 left-8 sm:top-12 sm:left-12 lg:top-16 lg:left-16">
        <p
          className="text-[9px] sm:text-[10px] font-semibold text-white/30 uppercase tracking-[0.45em]"
          style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
        >
          Servicio {String(index + 1).padStart(2, "0")}
        </p>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 px-8 sm:px-12 lg:px-16 pb-12 sm:pb-14 lg:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 + index * 0.03, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Tag */}
          <p
            className="text-[9px] sm:text-[10px] font-semibold text-white/45 uppercase tracking-[0.4em] mb-3"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            {service.tag}
          </p>

          {/* Title */}
          <h2
            className="font-black text-white leading-[0.88] tracking-[-0.03em] mb-4"
            style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontSize: "clamp(2.6rem, 9vw, 5rem)",
              whiteSpace: "pre-line",
            }}
          >
            {service.title}
          </h2>

          {/* Subtitle */}
          <p
            className="text-white/55 text-sm sm:text-base font-light mb-8 max-w-md leading-relaxed"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            {service.subtitle}
          </p>

          {/* CTA pill */}
          <button className="group/btn relative inline-flex items-center px-5 py-2 border border-white/50 rounded-full overflow-hidden transition-all duration-300 hover:border-white">
            <span className="absolute inset-0 bg-white scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
            <span
              className="relative z-10 text-[10px] font-semibold text-white group-hover/btn:text-black uppercase tracking-widest transition-colors duration-300"
              style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
            >
              {service.cta}
            </span>
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function Services() {
  return (
    <div className="bg-[#0a0a0b] text-white overflow-x-hidden">
      <style>{`
        @media (min-width: 768px) {
          .service-block-desktop {
            height: clamp(420px, 65vw, 860px) !important;
          }
        }
      `}</style>

      {/* Hero header */}
      <div className="relative flex flex-col items-start justify-end min-h-[55vh] sm:min-h-[60vh] px-8 sm:px-12 lg:px-16 pb-16 overflow-hidden bg-[#0a0a0b]">
        {/* subtle ambient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

        <Link
          to={createPageUrl("Landing")}
          className="absolute top-8 left-8 sm:top-12 sm:left-12 flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm"
          style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-5xl"
        >
          <p
            className="text-[9px] sm:text-[10px] font-semibold text-white/30 uppercase tracking-[0.45em] mb-6"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            Cabaña® Creative — Servicios
          </p>

          <h1
            className="font-black text-white leading-[0.88] tracking-[-0.04em]"
            style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontSize: "clamp(3.5rem, 12vw, 8rem)",
            }}
          >
            Lo que<br />
            <span className="text-white/20">hacemos.</span>
          </h1>

          <p
            className="mt-8 text-white/45 font-light max-w-xl leading-relaxed"
            style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontSize: "clamp(0.95rem, 2vw, 1.15rem)",
            }}
          >
            Soluciones integrales para artistas y creadores que buscan elevar su proyecto al siguiente nivel.
          </p>
        </motion.div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-white/[0.06]" />

      {/* Service blocks */}
      <div className="w-full">
        {services.map((service, index) => (
          <div key={index} className="service-block-desktop">
            <ServiceBlock service={service} index={index} />
          </div>
        ))}
      </div>

      {/* Final CTA block */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-col items-start justify-end overflow-hidden bg-[#0a0a0b]"
        style={{
          height: "100svh",
          width: "100vw",
          marginLeft: "calc(-50vw + 50%)",
        }}
      >
        {/* bg image */}
        <img
          src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1800&h=1000&fit=crop&q=85"
          alt="CTA"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="relative z-10 px-8 sm:px-12 lg:px-16 pb-14 sm:pb-16 lg:pb-20">
          <p
            className="text-[9px] sm:text-[10px] font-semibold text-white/40 uppercase tracking-[0.45em] mb-4"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            Siguiente paso
          </p>
          <h2
            className="font-black text-white leading-[0.88] tracking-[-0.04em] mb-8"
            style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontSize: "clamp(2.8rem, 9vw, 5.5rem)",
            }}
          >
            ¿Listo para<br />comenzar?
          </h2>
          <Link to={createPageUrl("Landing")}>
            <button className="group/btn relative inline-flex items-center px-7 py-3 border border-white/60 rounded-full overflow-hidden transition-all duration-300 hover:border-white">
              <span className="absolute inset-0 bg-white scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
              <span
                className="relative z-10 text-[11px] font-semibold text-white group-hover/btn:text-black uppercase tracking-widest transition-colors duration-300"
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
              >
                Contactar
              </span>
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}