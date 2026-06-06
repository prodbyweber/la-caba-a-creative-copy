import React from "react";
import { motion } from "framer-motion";
import { Music, Play, Zap, Target, ArrowRight } from "lucide-react";

const SECTORES = [
  "Moda y Streetwear",
  "Calzado",
  "Bebidas",
  "Belleza y Cosmética",
  "Audio y Tecnología",
  "Eventos y Conciertos",
  "Hostelería",
];

const SERVICIOS = [
  {
    title: "Música para Marcas",
    desc: "Jingles, identidad sonora y música original para campañas. El diferencial que ninguna otra agencia te ofrece.",
    icon: Music,
  },
  {
    title: "Contenido UGC y Orgánico",
    desc: "Creadores reales, situaciones reales. Contenido que conecta con la Gen Z porque no parece publicidad.",
    icon: Play,
  },
  {
    title: "Paid Media",
    desc: "Campañas en Meta y YouTube Ads con estrategia, segmentación y creatividades que convierten. Sin quemar presupuesto.",
    icon: Target,
  },
  {
    title: "Branding y Estrategia",
    desc: "Identidad de marca, landing pages, estrategia de contenido y posicionamiento en el mercado europeo.",
    icon: Zap,
  },
];

export default function Marcas() {
  const handleCTA = () => {
    window.dispatchEvent(new CustomEvent("open-application-modal"));
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden">
      {/* SECCIÓN 1 — HERO */}
      <section className="relative px-6 py-20 md:py-32 max-w-[1200px] mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xs font-bold text-[#FF5833] uppercase tracking-widest mb-4"
          style={{ fontFamily: "Arial Black, sans-serif" }}
        >
          LA AGENCIA
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight"
          style={{ fontFamily: "Arial Black, sans-serif", letterSpacing: "-0.04em" }}
        >
          Tu marca necesita hablarle a la Gen Z.
          <br />
          Nosotros sabemos cómo.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base md:text-lg text-white/60 max-w-3xl mb-10 leading-relaxed"
          style={{ fontFamily: "Arial, sans-serif" }}
        >
          Contenido que no parece publicidad. Música que mueve emociones. Estrategia que convierte. Somos la única agencia creativa que también produce música para tu marca.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          onClick={handleCTA}
          className="inline-flex items-center gap-3 px-8 py-4 bg-[#FF5833] text-white font-bold text-sm md:text-base rounded-xl hover:bg-[#e04a28] transition-all hover:scale-105"
          style={{ fontFamily: "Arial Black, sans-serif" }}
        >
          Quiero trabajar con Cabaña
          <ArrowRight className="w-5 h-5" />
        </motion.button>

        {/* Cards de datos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16"
        >
          {[
            { label: "Método de trabajo", value: "Presencial · Online" },
            { label: "Audiencia", value: "Gen Z · 1997–2012" },
            { label: "Mercado", value: "Europa" },
            { label: "Sectores", value: "Moda · Belleza · Bebidas · Eventos · Audio · Streetwear" },
          ].map((card, i) => (
            <div
              key={i}
              className="bg-[#141414] rounded-xl p-5 border-l-2 border-[#FF5833]"
            >
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2" style={{ fontFamily: "Arial Black, sans-serif" }}>
                {card.label}
              </p>
              <p className="text-sm md:text-base font-bold text-white" style={{ fontFamily: "Arial Black, sans-serif" }}>
                {card.value}
              </p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* SECCIÓN 2 — GANCHO DIFERENCIADOR */}
      <section className="relative px-6 py-20 md:py-32 max-w-[1200px] mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-xs font-bold text-[#FF5833] uppercase tracking-widest mb-4"
          style={{ fontFamily: "Arial Black, sans-serif" }}
        >
          LO QUE NOS HACE DISTINTOS
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl md:text-5xl font-black text-white mb-6"
          style={{ fontFamily: "Arial Black, sans-serif", letterSpacing: "-0.04em" }}
        >
          Somos la única agencia creativa que produce música para tu marca.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base md:text-lg text-white/60 max-w-4xl mb-12 leading-relaxed"
          style={{ fontFamily: "Arial, sans-serif" }}
        >
          Las grandes marcas lo saben desde siempre — la música mueve emociones, genera recuerdo y vende. Nosotros lo llevamos al siguiente nivel: componemos el jingle, el sonido y la identidad sonora que tu marca necesita para conectar de verdad.
        </motion.p>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Music,
              title: "Música que vende",
              desc: "Producimos el sonido de tu marca — jingles, identidad sonora y música original para campañas. Comunicamos a través del audio como lo hacen las grandes.",
            },
            {
              icon: Play,
              title: "Publicidad que no parece publicidad",
              desc: "Los jóvenes odian los anuncios. Nosotros creamos contenido orgánico, UGC y paid media que se consume como entretenimiento y convierte como publicidad.",
            },
            {
              icon: Zap,
              title: "Talento joven para marcas con trayectoria",
              desc: "Contamos con creadores, modelos y artistas dispuestos a posicionar tu producto. Energía nueva para marcas que quieren llegar más lejos.",
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 * (i + 3) }}
              className="bg-[#141414] rounded-xl p-6 border-l-2 border-[#FF5833]"
            >
              <card.icon className="w-8 h-8 text-[#FF5833] mb-4" strokeWidth={1.5} />
              <h3 className="text-lg font-bold text-white mb-3" style={{ fontFamily: "Arial Black, sans-serif" }}>
                {card.title}
              </h3>
              <p className="text-sm text-white/60 leading-relaxed" style={{ fontFamily: "Arial, sans-serif" }}>
                {card.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECCIÓN 3 — LO QUE HACEMOS */}
      <section className="relative px-6 py-20 md:py-32 max-w-[1200px] mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-xs font-bold text-[#FF5833] uppercase tracking-widest mb-4"
          style={{ fontFamily: "Arial Black, sans-serif" }}
        >
          NUESTROS SERVICIOS
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl md:text-5xl font-black text-white mb-6"
          style={{ fontFamily: "Arial Black, sans-serif", letterSpacing: "-0.04em" }}
        >
          Todo lo que tu marca necesita para dominar el mercado joven.
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {SERVICIOS.map((servicio, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 * (i + 3) }}
              className="bg-[#141414] rounded-xl p-6 border-l-2 border-[#FF5833]"
            >
              <servicio.icon className="w-8 h-8 text-[#FF5833] mb-4" strokeWidth={1.5} />
              <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "Arial Black, sans-serif" }}>
                {servicio.title}
              </h3>
              <p className="text-sm text-white/60 leading-relaxed" style={{ fontFamily: "Arial, sans-serif" }}>
                {servicio.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECCIÓN 4 — SECTORES */}
      <section className="relative px-6 py-20 md:py-32 max-w-[1200px] mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-xs font-bold text-[#FF5833] uppercase tracking-widest mb-4"
          style={{ fontFamily: "Arial Black, sans-serif" }}
        >
          CON QUIÉN TRABAJAMOS
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl md:text-5xl font-black text-white mb-12"
          style={{ fontFamily: "Arial Black, sans-serif", letterSpacing: "-0.04em" }}
        >
          Marcas que quieren conectar con la generación más influyente del mercado.
        </motion.h2>

        <div className="flex flex-wrap gap-4">
          {SECTORES.map((sector, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.05 * i }}
              className="px-6 py-3 rounded-2xl text-sm font-bold"
              style={{
                fontFamily: "Arial Black, sans-serif",
                border: "2px solid #FF5833",
                color: "#FF5833",
                background: "rgba(255,88,51,0.08)",
              }}
            >
              {sector}
            </motion.span>
          ))}
        </div>
      </section>

      {/* SECCIÓN 5 — MANIFIESTO */}
      <section className="relative px-6 py-20 md:py-32 bg-[#FF5833]">
        <div className="max-w-[1200px] mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight"
            style={{ fontFamily: "Arial Black, sans-serif", letterSpacing: "-0.04em" }}
          >
            Revoluciona en el mercado europeo.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-base md:text-lg text-white/90 max-w-3xl mx-auto mb-10 leading-relaxed"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            Hoy cualquier marca debería crear contenido artístico para ir más allá. Nosotros lo entendemos. Conocemos las claves. Únete a esta nueva etapa.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onClick={handleCTA}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#FF5833] font-bold text-sm md:text-base rounded-xl hover:bg-white/90 transition-all hover:scale-105"
            style={{ fontFamily: "Arial Black, sans-serif" }}
          >
            Hablemos
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </section>

      {/* SECCIÓN 6 — CTA FINAL */}
      <section className="relative px-6 py-20 md:py-32 max-w-[1200px] mx-auto">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl font-black text-white mb-6"
            style={{ fontFamily: "Arial Black, sans-serif", letterSpacing: "-0.04em" }}
          >
            ¿Lista para conectar con la Gen Z?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-base md:text-lg text-white/60 max-w-2xl mx-auto mb-8"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            Una videollamada con nuestro equipo para aterrizar tu proyecto. Sin compromiso.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onClick={handleCTA}
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#FF5833] text-white font-bold text-sm md:text-base rounded-xl hover:bg-[#e04a28] transition-all hover:scale-105 mb-6"
            style={{ fontFamily: "Arial Black, sans-serif" }}
          >
            Solicitar reunión
            <ArrowRight className="w-5 h-5" />
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xs text-white/40"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            Respuesta en menos de 24h · Plazas limitadas
          </motion.p>
        </div>
      </section>
    </div>
  );
}