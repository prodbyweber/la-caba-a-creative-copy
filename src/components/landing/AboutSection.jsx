import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Animation variants ────────────────────────────────────────────────────────

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

// ── Panel transition ──────────────────────────────────────────────────────────

const panelVariants = {
  enter: (dir) => ({
    opacity: 0,
    x: dir === "brands" ? 32 : -32,
  }),
  center: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (dir) => ({
    opacity: 0,
    x: dir === "brands" ? -32 : 32,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ── Thumbnails ────────────────────────────────────────────────────────────────

const artistThumbnails = [
  { label: "Producción", img: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&h=340&fit=crop" },
  { label: "Catálogo", img: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=340&fit=crop" },
  { label: "Branding", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=340&fit=crop" },
  { label: "Contenido", img: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&h=340&fit=crop" },
  { label: "Visual", img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=340&fit=crop" },
];

const brandThumbnails = [
  { label: "Estrategia", img: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=600&h=340&fit=crop" },
  { label: "Identidad", img: "https://images.unsplash.com/photo-1534670007418-fbb7f6cf32c3?w=600&h=340&fit=crop" },
  { label: "Cultura", img: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=600&h=340&fit=crop" },
  { label: "Campaña", img: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=340&fit=crop" },
  { label: "Sonido", img: "https://images.unsplash.com/photo-1504509546545-e000b4a62425?w=600&h=340&fit=crop" },
];

// ── Reusable block with scroll animation ─────────────────────────────────────

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

// ── Thumbnail strip ───────────────────────────────────────────────────────────

function ThumbStrip({ items }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-3 -mx-2 px-2 scrollbar-none">
      {items.map((t, i) => (
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
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-400" />
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
            <p className="text-[11px] font-semibold text-white/80 uppercase tracking-widest">{t.label}</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#ff5833] scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
        </motion.div>
      ))}
    </div>
  );
}

// ── View: Creadores ───────────────────────────────────────────────────────────

function ArtistView() {
  return (
    <div className="space-y-28 lg:space-y-40">

      {/* Bloque 1 — Apertura */}
      <Block>
        <h2
          className="text-5xl sm:text-6xl lg:text-8xl font-black leading-[0.92] tracking-tight text-white max-w-4xl"
          style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
        >
          Los creadores
          <span className="text-white/20"> son el centro.</span>
        </h2>
        <p className="mt-8 text-lg sm:text-xl text-white/50 font-light max-w-2xl leading-relaxed">
          Artistas, creadores de contenido, productores, directores… personas que no solo consumen cultura, la están construyendo.
        </p>
        <div className="mt-10 h-px bg-gradient-to-r from-[#ff5833]/40 via-[#ff5833]/10 to-transparent w-40" />
        <p className="mt-8 text-base text-white/35 max-w-xl leading-relaxed">
          Nuestro foco es claro: la música y los artistas. Pero todo forma parte de lo mismo: contenido, identidad y movimiento.
        </p>
      </Block>

      {/* Bloque 2 — Con quién trabajamos */}
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
        <Block delay={0}>
          <p className="text-[10px] font-bold text-[#ff5833]/60 uppercase tracking-[0.3em] mb-6">Con quién trabajamos</p>
          <h3
            className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight mb-8"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            Creadores que ya
            <br />han empezado.
          </h3>
          <p className="text-white/35 text-sm leading-relaxed">
            No desde cero, sino desde ese punto donde ya hay algo… pero todavía no está conectado.
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
            "Artistas con música publicada",
            "Proyectos en desarrollo",
            "Ideas que necesitan dirección",
            "Gente que ya está en movimiento, pero quiere hacerlo bien",
          ].map((item, i) => (
            <motion.li
              key={i}
              variants={bulletItem}
              className="group flex items-center gap-5 py-5 cursor-default"
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#ff5833]/40 group-hover:bg-[#ff5833] transition-colors duration-300" />
              <span className="text-base text-white/60 group-hover:text-white/90 transition-colors duration-300 font-light">
                {item}
              </span>
            </motion.li>
          ))}
        </motion.ul>
      </div>

      {/* Bloque 3 — Por qué */}
      <Block>
        <div className="max-w-3xl">
          <p className="text-[10px] font-bold text-[#ff5833]/60 uppercase tracking-[0.3em] mb-6">Por qué trabajamos con creadores</p>
          <h3
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            Porque hoy no basta
            <br />
            <span className="text-white/25">con crear.</span>
          </h3>
          <p className="mt-8 text-white/40 text-base leading-relaxed max-w-xl">
            Hay demasiada gente haciendo cosas. Lo que marca la diferencia es dirección, coherencia, identidad, contenido. Ahí es donde entramos.
          </p>
          <p className="mt-4 text-white/25 text-sm leading-relaxed max-w-xl">
            Para convertir lo que haces en algo que se entienda, se vea y tenga impacto.
          </p>
        </div>
      </Block>

      {/* Bloque 4 — Qué hacemos */}
      <Block>
        <div className="mb-10">
          <p className="text-[10px] font-bold text-[#ff5833]/60 uppercase tracking-[0.3em] mb-6">Qué hacemos</p>
          <h3
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-4"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            El proyecto de forma
            <br />
            <span className="text-white/25">integral.</span>
          </h3>
          <p className="text-white/40 text-base leading-relaxed max-w-2xl">
            Todo conectado. Nada aislado.
          </p>
        </div>
        <ThumbStrip items={artistThumbnails} />
      </Block>

      {/* Bloque 5 — Para artistas y creadores */}
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
        <Block delay={0}>
          <p className="text-[10px] font-bold text-[#ff5833]/60 uppercase tracking-[0.3em] mb-6">Para artistas</p>
          <motion.ul
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="space-y-0 divide-y divide-white/[0.05]"
          >
            {[
              "Producción musical con dirección",
              "Desarrollo de catálogo",
              "Construcción de identidad",
              "Contenido audiovisual estratégico",
            ].map((item, i) => (
              <motion.li key={i} variants={bulletItem} className="group flex items-center gap-5 py-5 cursor-default">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#ff5833]/40 group-hover:bg-[#ff5833] transition-colors duration-300" />
                <span className="text-base text-white/60 group-hover:text-white/90 transition-colors duration-300 font-light">{item}</span>
              </motion.li>
            ))}
          </motion.ul>
        </Block>

        <Block delay={0.1}>
          <p className="text-[10px] font-bold text-[#ff5833]/60 uppercase tracking-[0.3em] mb-6">Para creadores</p>
          <motion.ul
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="space-y-0 divide-y divide-white/[0.05]"
          >
            {[
              "Dirección estética",
              "Desarrollo de imagen",
              "Creación de contenido",
              "Construcción de presencia",
            ].map((item, i) => (
              <motion.li key={i} variants={bulletItem} className="group flex items-center gap-5 py-5 cursor-default">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#ff5833]/40 group-hover:bg-[#ff5833] transition-colors duration-300" />
                <span className="text-base text-white/60 group-hover:text-white/90 transition-colors duration-300 font-light">{item}</span>
              </motion.li>
            ))}
          </motion.ul>
        </Block>
      </div>

      {/* Bloque 6 — Catálogo y Contenido */}
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
        <Block delay={0}>
          <p className="text-[10px] font-bold text-[#ff5833]/60 uppercase tracking-[0.3em] mb-6">Catálogo</p>
          <h3
            className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight mb-6"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            El catálogo
            <br />es la base.
          </h3>
          <p className="text-white/40 text-base leading-relaxed">
            No son piezas sueltas. Es tu sonido, tu evolución, tu propuesta.
          </p>
          <p className="mt-4 text-white/25 text-sm leading-relaxed">
            Lo organizamos y desarrollamos para que tenga continuidad y dirección.
          </p>
        </Block>

        <Block delay={0.1}>
          <p className="text-[10px] font-bold text-[#ff5833]/60 uppercase tracking-[0.3em] mb-6">Contenido</p>
          <h3
            className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight mb-6"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            Todo se convierte
            <br />en contenido.
          </h3>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="space-y-0 divide-y divide-white/[0.05]"
          >
            {[
              { num: "01", label: "Sesiones" },
              { num: "02", label: "Visuales" },
              { num: "03", label: "Clips" },
              { num: "04", label: "Proyectos" },
            ].map((item, i) => (
              <motion.div key={i} variants={bulletItem} className="group flex items-start gap-6 py-5 cursor-default">
                <span className="text-[11px] font-bold text-[#ff5833]/40 group-hover:text-[#ff5833] transition-colors duration-300 mt-0.5 tabular-nums">{item.num}</span>
                <span className="text-base text-white/55 group-hover:text-white/90 transition-colors duration-300 font-light">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </Block>
      </div>

      {/* Bloque — Explorar */}
      <Block>
        <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-10 sm:p-14 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#ff5833]/[0.06] rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-[#ff5833] uppercase tracking-[0.35em] mb-6">Explorar</p>
            <h3
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-6"
              style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
            >
              Todo esto vive
              <br />
              <span className="text-white/25">dentro de Cabaña.</span>
            </h3>
            <p className="text-white/40 text-base leading-relaxed max-w-2xl">
              Un espacio donde se reúnen música, films y creadores. Inspirado en el lenguaje del cine independiente y en proyectos que tienen algo real detrás.
            </p>
            <div className="mt-8 h-px bg-gradient-to-r from-[#ff5833]/50 via-[#ff5833]/10 to-transparent w-32" />
            <p className="mt-6 text-white/20 text-sm">
              Cada pieza vive en tu canal.{" "}
              <span className="text-white/35">Nosotros seleccionamos, organizamos y mostramos.</span>
            </p>
          </div>
        </div>
      </Block>

      {/* Bloque final — Cierre */}
      <Block>
        <div className="max-w-3xl">
          <p className="text-[10px] font-bold text-[#ff5833]/60 uppercase tracking-[0.3em] mb-6">Objetivo</p>
          <h3
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            Convertir tu proceso creativo
            <br />
            <span className="text-white/25">en un proyecto real.</span>
          </h3>
          <p className="mt-8 text-white/35 text-base leading-relaxed max-w-xl">
            Con dirección. Con identidad. Y con recorrido.
          </p>
          <p className="mt-4 text-white/20 text-sm">
            Si estás creando en serio, esto tiene sentido.{" "}
            <span className="text-white/35">Si lo entiendes…</span>
          </p>
          <div className="mt-8">
            <a
              href="/Explorar"
              className="group/btn relative inline-flex items-center px-6 py-2.5 border border-white/40 rounded-full overflow-hidden transition-all duration-300 hover:border-white"
            >
              <span className="absolute inset-0 bg-white scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
              <span className="relative z-10 text-[11px] font-semibold text-white group-hover/btn:text-black uppercase tracking-widest transition-colors duration-300"
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                Entra y explora →
              </span>
            </a>
          </div>
        </div>
      </Block>

    </div>
  );
}

// ── View: Para Marcas ─────────────────────────────────────────────────────────

function BrandView() {
  return (
    <div className="space-y-28 lg:space-y-40">

      {/* Bloque 1: Apertura */}
      <Block>
        <h2
          className="text-5xl sm:text-6xl lg:text-8xl font-black leading-[0.92] tracking-tight text-white max-w-4xl"
          style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
        >
          No trabajamos con
          <span className="text-white/20"> cualquier marca.</span>
        </h2>
        <p className="mt-8 text-lg sm:text-xl text-white/50 font-light max-w-2xl leading-relaxed">
          Trabajamos con marcas que entienden que hoy no se trata de estar… sino de significar algo.
        </p>
        <div className="mt-10 h-px bg-gradient-to-r from-[#ff5833]/40 via-[#ff5833]/10 to-transparent w-40" />
        <p className="mt-8 text-base text-white/35 max-w-xl leading-relaxed">
          Marcas que ya tienen una base. Producto, intención y una dirección inicial. Y que saben que para crecer necesitan algo más que contenido.
        </p>
      </Block>

      {/* Bloque 2: Con quién trabajamos */}
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
        <Block delay={0}>
          <p className="text-[10px] font-bold text-[#ff5833]/60 uppercase tracking-[0.3em] mb-6">¿Con quién trabajamos?</p>
          <h3
            className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight mb-8"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            Marcas en fase
            <br />de crecimiento.
          </h3>
          <p className="text-white/35 text-sm leading-relaxed">
            Si solo buscas contenido rápido… no somos para ti.
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
            "Proyectos con identidad en desarrollo",
            "Marcas que ya venden pero no conectan",
            "Equipos que quieren elevar su imagen",
            "Marcas que entienden el valor de la creatividad",
          ].map((item, i) => (
            <motion.li
              key={i}
              variants={bulletItem}
              className="group flex items-center gap-5 py-5 cursor-default"
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#ff5833]/40 group-hover:bg-[#ff5833] transition-colors duration-300" />
              <span className="text-base text-white/60 group-hover:text-white/90 transition-colors duration-300 font-light">
                {item}
              </span>
            </motion.li>
          ))}
        </motion.ul>
      </div>

      {/* Bloque 3: Donde nos movemos */}
      <Block>
        <div className="max-w-3xl">
          <p className="text-[10px] font-bold text-[#ff5833]/60 uppercase tracking-[0.3em] mb-6">Donde nos movemos</p>
          <h3
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            La intersección entre
            <br />
            <span className="text-white/25">cultura, estética y digital.</span>
          </h3>
          <p className="mt-8 text-white/40 text-base leading-relaxed max-w-xl">
            Especialmente con marcas de moda, streetwear, lifestyle, proyectos creativos y productos digitales. En Europa y Estados Unidos, estas marcas no compiten por producto. Compiten por atención, identidad y experiencia.
          </p>
        </div>
      </Block>

      {/* Bloque 4: Campañas + grid visual */}
      <Block>
        <div className="mb-10">
          <p className="text-[10px] font-bold text-[#ff5833]/60 uppercase tracking-[0.3em] mb-6">Campañas que se sienten</p>
          <h3
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-4"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            Contenido que no parece
            <br />
            <span className="text-white/25">publicidad. Que se consume.</span>
          </h3>
          <p className="text-white/40 text-base leading-relaxed max-w-2xl">
            Creamos campañas audiovisuales pensadas para parar el scroll, generar conexión y quedarse en la cabeza.
          </p>
        </div>
        <ThumbStrip items={brandThumbnails} />
      </Block>

      {/* Bloque 5: Creatividad + Marketing */}
      <Block>
        <div className="max-w-3xl">
          <p className="text-[10px] font-bold text-[#ff5833]/60 uppercase tracking-[0.3em] mb-6">Creatividad + Marketing</p>
          <h3
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            No solo creamos.
            <br />
            <span className="text-white/25">Entendemos cómo convertir.</span>
          </h3>
          <p className="mt-8 text-white/40 text-base leading-relaxed max-w-xl">
            Sabemos qué funciona, cómo se consume y cómo convertir atención en resultado. Cada pieza tiene un objetivo claro.
          </p>
        </div>
      </Block>

      {/* Bloque 6: Web */}
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
        <Block delay={0}>
          <p className="text-[10px] font-bold text-[#ff5833]/60 uppercase tracking-[0.3em] mb-6">Desarrollo Web</p>
          <h3
            className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight mb-6"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            Web como experiencia,
            <br />no como escaparate.
          </h3>
          <p className="text-white/40 text-base leading-relaxed">
            Muchas marcas invierten en contenido… pero cuando alguien entra en su web, no pasa nada. Nosotros diseñamos plataformas que sí convierten.
          </p>
          <p className="mt-4 text-white/25 text-sm leading-relaxed">
            No hacemos webs "bonitas". Creamos espacios donde tu marca se entiende, se siente y se convierte.
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
            { num: "01", label: "Diseño web con dirección creativa" },
            { num: "02", label: "Estructura pensada para conversión" },
            { num: "03", label: "Experiencia clara y atractiva" },
            { num: "04", label: "Integración con contenido y campañas" },
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

      {/* Bloque final: Todo conectado */}
      <Block>
        <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-10 sm:p-14 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#ff5833]/[0.06] rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-[#ff5833] uppercase tracking-[0.35em] mb-6">Potenciamos creadores</p>
            <h3
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-6"
              style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
            >
              A través de contenido,
              <br />
              <span className="text-white/25">dirección y distribución.</span>
            </h3>
            <p className="text-white/40 text-base leading-relaxed max-w-2xl">
              Creamos, documentamos y damos visibilidad.
            </p>
            <div className="mt-8 h-px bg-gradient-to-r from-[#ff5833]/50 via-[#ff5833]/10 to-transparent w-32" />
            <p className="mt-6 text-white/20 text-sm">
              Esto no se explica.{" "}
              <span className="text-white/40">Se explora.</span>
            </p>
          </div>
        </div>
      </Block>

    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AboutSection() {
  const [view, setView] = useState("artists"); // "artists" | "brands"

  return (
    <section className="relative bg-[#080809] overflow-hidden">
      {/* Separators */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#ff5833]/[0.04] rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-28 lg:py-40">

        {/* ── Label + Toggle ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mb-20 lg:mb-28"
        >
          <div className="flex items-center gap-3 mb-10">
            <span className="text-[10px] font-bold text-[#ff5833] uppercase tracking-[0.35em]">Acerca de Nosotros</span>
            <div className="h-px bg-[#ff5833]/25 w-16" />
          </div>

          {/* Toggle */}
          <div className="relative inline-flex items-center bg-white/[0.03] border border-white/[0.08] rounded-full p-1 gap-0.5">
            {[
              { id: "artists", label: "Creadores" },
              { id: "brands",  label: "Para Marcas" },
            ].map((opt) => {
              const active = view === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setView(opt.id)}
                  className="relative px-5 sm:px-7 py-2.5 sm:py-3 rounded-full text-sm font-semibold transition-colors duration-300 min-h-[44px] focus:outline-none"
                  style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
                >
                  {/* Sliding pill */}
                  {active && (
                    <motion.span
                      layoutId="toggle-pill"
                      className="absolute inset-0 rounded-full bg-white/[0.08] border border-white/[0.12]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span
                    className="relative z-10 transition-colors duration-300"
                    style={{ color: active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.28)" }}
                  >
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Underline accent */}
          <div className="mt-6 flex gap-2 items-center">
            <motion.div
              className="h-px bg-[#ff5833]/50 transition-all duration-500"
              animate={{ width: view === "artists" ? "80px" : "64px" }}
            />
            <span className="text-[10px] text-white/20 font-light tracking-widest uppercase">
              {view === "artists" ? "universo creador" : "ecosistema de marcas"}
            </span>
          </div>
        </motion.div>

        {/* ── Animated content ─────────────────────────────────────────── */}
        <div className="relative">
          <AnimatePresence mode="wait" custom={view}>
            <motion.div
              key={view}
              custom={view}
              variants={panelVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {view === "artists" ? <ArtistView /> : <BrandView />}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}