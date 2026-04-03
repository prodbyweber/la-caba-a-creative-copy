import React from "react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const bulletItem = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// Placeholder thumbnails Netflix-style
const thumbnails = [
  { label: "Producción", img: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&h=340&fit=crop" },
  { label: "Catálogo", img: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=340&fit=crop" },
  { label: "Branding", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=340&fit=crop" },
  { label: "Contenido", img: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&h=340&fit=crop" },
  { label: "Visual", img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=340&fit=crop" },
];

function Block({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      custom={delay}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function AboutSection() {
  return (
    <section className="relative bg-[#080809] overflow-hidden">
      {/* Top separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#ff5833]/[0.04] rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-28 lg:py-40 space-y-28 lg:space-y-40">

        {/* ── BLOQUE 1: Label + Titular principal ── */}
        <Block>
          <div className="flex items-center gap-3 mb-10">
            <span className="text-[10px] font-bold text-[#ff5833] uppercase tracking-[0.35em]">Acerca de Nosotros</span>
            <div className="h-px bg-[#ff5833]/25 w-16" />
          </div>
          <h2
            className="text-5xl sm:text-6xl lg:text-8xl font-black leading-[0.92] tracking-tight text-white max-w-4xl"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            Trabajamos con artistas que ya tienen
            <span className="text-white/20"> una base.</span>
          </h2>
          <p className="mt-8 text-lg sm:text-xl text-white/50 font-light max-w-2xl leading-relaxed">
            Música lanzada, una identidad en desarrollo y la intención de entrar en una nueva fase de exploración dentro de su proyecto.
          </p>
          <div className="mt-10 h-px bg-gradient-to-r from-[#ff5833]/40 via-[#ff5833]/10 to-transparent w-40" />
          <p className="mt-8 text-base text-white/35 max-w-xl leading-relaxed">
            Nuestro enfoque es claro: dar estructura, dirección y coherencia a ese proceso.
          </p>
        </Block>

        {/* ── BLOQUE 2: Servicios integrales ── */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
          <Block delay={0}>
            <p className="text-[10px] font-bold text-[#ff5833]/60 uppercase tracking-[0.3em] mb-6">Enfoque integral</p>
            <h3
              className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight mb-8"
              style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
            >
              Construimos el proyecto de forma integral.
            </h3>
            <p className="text-white/35 text-sm leading-relaxed">
              Todo conectado y alineado con lo que eres como artista.
            </p>
          </Block>

          <motion.ul
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="space-y-0 divide-y divide-white/[0.05]"
          >
            {[
              "Producción musical con dirección creativa",
              "Desarrollo de catálogo con visión",
              "Branding e identidad visual",
              "Contenido audiovisual estratégico",
            ].map((item, i) => (
              <motion.li
                key={i}
                variants={bulletItem}
                className="group flex items-center gap-5 py-5 cursor-default"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#ff5833]/40 group-hover:bg-[#ff5833] transition-colors duration-300"
                />
                <span className="text-base text-white/60 group-hover:text-white/90 transition-colors duration-300 font-light">
                  {item}
                </span>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        {/* ── BLOQUE 3: Intención ── */}
        <Block>
          <div className="max-w-3xl">
            <p className="text-[10px] font-bold text-[#ff5833]/60 uppercase tracking-[0.3em] mb-6">Con propósito</p>
            <h3
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight"
              style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
            >
              No hacemos música por hacer.
              <br />
              <span className="text-white/25">Cada lanzamiento tiene un porqué.</span>
            </h3>
            <p className="mt-8 text-white/40 text-base leading-relaxed max-w-xl">
              Definimos el punto en el que estás, trazamos el camino y ejecutamos con intención. Después medimos, ajustamos y seguimos avanzando.
            </p>
          </div>
        </Block>

        {/* ── BLOQUE 4: Netflix style ── */}
        <Block>
          <div className="mb-10">
            <p className="text-[10px] font-bold text-[#ff5833]/60 uppercase tracking-[0.3em] mb-6">Narrativa continua</p>
            <h3
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-4"
              style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
            >
              Pensamos el contenido
              <br />
              <span className="text-white/25">como una serie.</span>
            </h3>
            <p className="text-white/40 text-base leading-relaxed max-w-2xl">
              Cada tema, cada visual y cada pieza suma a una narrativa. No se trata solo de lanzar canciones, sino de construir un universo que evoluciona y conecta.
            </p>
          </div>

          {/* Grid Netflix */}
          <div className="flex gap-3 overflow-x-auto pb-3 -mx-2 px-2 scrollbar-none">
            {thumbnails.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.55, ease: "easeOut" }}
                className="group relative flex-shrink-0 w-48 sm:w-60 rounded-xl overflow-hidden cursor-pointer"
                style={{ aspectRatio: "16/9" }}
              >
                <img
                  src={t.img}
                  alt={t.label}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-400" />
                {/* Bottom label */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-[11px] font-semibold text-white/80 uppercase tracking-widest">{t.label}</p>
                </div>
                {/* Orange accent line on hover */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#ff5833] scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
              </motion.div>
            ))}
          </div>
        </Block>

        {/* ── BLOQUE 5: Objetivo ── */}
        <Block>
          <div className="max-w-3xl">
            <p className="text-[10px] font-bold text-[#ff5833]/60 uppercase tracking-[0.3em] mb-6">Objetivo</p>
            <h3
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight"
              style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
            >
              Convertir tu proceso creativo
              <br />
              <span className="text-white/25">en un proyecto sólido con identidad real.</span>
            </h3>
          </div>
        </Block>

        {/* ── BLOQUE 6: Plataforma ── */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
          <Block delay={0}>
            <p className="text-[10px] font-bold text-[#ff5833]/60 uppercase tracking-[0.3em] mb-6">Plataforma</p>
            <h3
              className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight mb-6"
              style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
            >
              Todo en un solo lugar.
            </h3>
            <p className="text-white/40 text-base leading-relaxed">
              Tendrás acceso a una plataforma donde podrás organizar tu catálogo por proyectos, seguir la evolución de cada track —desde la demo hasta el máster final— y centralizar todo tu contenido audiovisual.
            </p>
            <p className="mt-4 text-white/25 text-sm leading-relaxed">
              Clips, piezas de contenido, visuales y lanzamientos. Con orden y visión.
            </p>
          </Block>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="space-y-0 divide-y divide-white/[0.05]"
          >
            {[
              { num: "01", label: "Catálogo organizado por proyectos" },
              { num: "02", label: "Evolución de cada track visible" },
              { num: "03", label: "Contenido audiovisual centralizado" },
              { num: "04", label: "Lanzamientos con orden y visión" },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={bulletItem}
                className="group flex items-start gap-6 py-5 cursor-default"
              >
                <span className="text-[11px] font-bold text-[#ff5833]/40 group-hover:text-[#ff5833] transition-colors duration-300 mt-0.5 tabular-nums">
                  {item.num}
                </span>
                <span className="text-base text-white/55 group-hover:text-white/90 transition-colors duration-300 font-light">
                  {item.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── BLOQUE FINAL: Netflix statement ── */}
        <Block>
          <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-10 sm:p-14 overflow-hidden">
            {/* Accent glow */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#ff5833]/[0.06] rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-[#ff5833] uppercase tracking-[0.35em] mb-6">Visión</p>
              <h3
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-6"
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
              >
                Somos el Netflix de la música urbana.
              </h3>
              <p className="text-white/40 text-base leading-relaxed max-w-2xl">
                Un espacio donde cada lanzamiento forma parte de algo más grande, donde el contenido tiene continuidad, y donde tu proyecto se desarrolla con visión.
              </p>
              <div className="mt-8 h-px bg-gradient-to-r from-[#ff5833]/50 via-[#ff5833]/10 to-transparent w-32" />
              <p className="mt-6 text-white/20 text-sm">
                Porque no solo producimos música.{" "}
                <span className="text-white/40">Diseñamos proyectos que se pueden construir, medir y escalar.</span>
              </p>
            </div>
          </div>
        </Block>

      </div>

      {/* Bottom separator */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
    </section>
  );
}