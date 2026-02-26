import React, { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Sparkles, Film, Music, Target, Megaphone, Palette, TrendingUp, Eye, MessageSquare, Network, FolderKanban, Award, DollarSign } from "lucide-react";

const services = [
  {
    title: "Dirección Creativa",
    icon: Eye,
    description: "Visión estratégica y dirección de proyectos creativos de principio a fin",
    color: "from-purple-500 to-pink-500"
  },
  {
    title: "Producción Musical",
    icon: Music,
    description: "Creación, grabación y producción de música de alta calidad",
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: "Construcción de Catálogo",
    icon: FolderKanban,
    description: "Desarrollo y estructuración de tu repertorio musical",
    color: "from-emerald-500 to-teal-500"
  },
  {
    title: "Producción Audiovisual",
    icon: Film,
    description: "Creación de contenido visual cinematográfico y estrategia de medios",
    color: "from-orange-500 to-red-500"
  },
  {
    title: "Producción Digital",
    icon: Sparkles,
    description: "Contenido digital optimizado para plataformas y redes sociales",
    color: "from-pink-500 to-rose-500"
  },
  {
    title: "Posicionamiento",
    icon: Target,
    description: "Estrategia de marca y posicionamiento en el mercado",
    color: "from-violet-500 to-purple-500"
  },
  {
    title: "Desarrollo de Proyecto Artístico",
    icon: Award,
    description: "Acompañamiento integral en el crecimiento de tu carrera artística",
    color: "from-indigo-500 to-blue-500"
  },
  {
    title: "Supervisión Creativa",
    icon: Eye,
    description: "Supervisión experta de procesos creativos y artísticos",
    color: "from-cyan-500 to-teal-500"
  },
  {
    title: "Narrativa & Comunicación",
    icon: MessageSquare,
    description: "Construcción de storytelling y estrategia comunicacional",
    color: "from-amber-500 to-orange-500"
  },
  {
    title: "Ecosistema Artístico",
    icon: Network,
    description: "Creación de redes y comunidad alrededor de tu proyecto",
    color: "from-green-500 to-emerald-500"
  },
  {
    title: "Gestión de Catálogo",
    icon: FolderKanban,
    description: "Administración profesional de tu repertorio y derechos",
    color: "from-lime-500 to-green-500"
  },
  {
    title: "Branding Artístico",
    icon: Palette,
    description: "Identidad visual y construcción de marca personal",
    color: "from-fuchsia-500 to-pink-500"
  },
  {
    title: "Marketing & Monetización",
    icon: DollarSign,
    description: "Estrategias de comercialización y generación de ingresos",
    color: "from-yellow-500 to-orange-500"
  }
];

function ServiceSection({ service, index }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.8, 1, 1, 0.8]);

  const Icon = service.icon;
  const isEven = index % 2 === 0;

  return (
    <motion.section
      ref={ref}
      style={{ opacity }}
      className="relative min-h-screen flex items-center justify-center px-6 py-20"
    >
      {/* Film grain texture overlay */}
      <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px"
        }}
      />

      {/* Animated gradient blobs */}
      <motion.div
        style={{ y }}
        className={`absolute ${isEven ? '-left-1/4' : '-right-1/4'} top-1/4 w-96 h-96 bg-gradient-to-br ${service.color} rounded-full blur-3xl opacity-20`}
      />

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <motion.div
          style={{ scale }}
          className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-20`}
        >
          {/* Icon with 3D effect */}
          <motion.div
            whileInView={{ rotateY: 360 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            viewport={{ once: true }}
            className="relative flex-shrink-0"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className={`w-32 h-32 lg:w-48 lg:h-48 rounded-3xl bg-gradient-to-br ${service.color} flex items-center justify-center relative`}
              style={{
                boxShadow: `0 20px 60px -10px rgba(0,0,0,0.5), 0 0 100px rgba(255,255,255,0.1)`,
              }}
            >
              <Icon className="w-16 h-16 lg:w-24 lg:h-24 text-white" />
              
              {/* Retro scan lines */}
              <div className="absolute inset-0 rounded-3xl opacity-30"
                style={{
                  backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)"
                }}
              />
            </div>

            {/* Glow effect */}
            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${service.color} blur-2xl opacity-50 -z-10`} />
          </motion.div>

          {/* Content */}
          <div className={`flex-1 ${isEven ? 'lg:text-left' : 'lg:text-right'} text-center`}>
            <motion.div
              initial={{ opacity: 0, x: isEven ? -100 : 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              viewport={{ once: true }}
            >
              {/* Number */}
              <div className={`text-9xl lg:text-[12rem] font-black mb-4 leading-none bg-gradient-to-br ${service.color} bg-clip-text text-transparent opacity-20`}
                style={{
                  textShadow: "0 0 80px rgba(255,255,255,0.2)",
                  fontFamily: "'Impact', sans-serif",
                  letterSpacing: "-0.05em"
                }}
              >
                {String(index + 1).padStart(2, '0')}
              </div>

              {/* Title with texture */}
              <h2 
                className="text-5xl lg:text-8xl font-black mb-8 leading-none"
                style={{
                  background: `linear-gradient(135deg, #fff 0%, #ddd 50%, #fff 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  textShadow: "0 2px 20px rgba(255,255,255,0.1)",
                  fontFamily: "'Impact', 'Arial Black', sans-serif",
                  letterSpacing: "-0.02em",
                  filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))"
                }}
              >
                {service.title}
              </h2>

              {/* Description */}
              <p className="text-xl lg:text-2xl text-gray-400 font-light leading-relaxed max-w-2xl mx-auto lg:mx-0"
                style={{
                  fontFamily: "'Helvetica Neue', sans-serif",
                  letterSpacing: "0.02em"
                }}
              >
                {service.description}
              </p>

              {/* Decorative line */}
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 1, delay: 0.5 }}
                viewport={{ once: true }}
                className={`h-px bg-gradient-to-r ${isEven ? 'from-white/50 to-transparent' : 'from-transparent to-white/50'} mt-8 max-w-md mx-auto lg:mx-0`}
              />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Vignette effect */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.5) 100%)"
        }}
      />
    </motion.section>
  );
}

export default function Services() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.2], [0, -100]);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0b] text-white overflow-hidden">
      {/* Hero Section */}
      <motion.section 
        className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden"
        style={{ opacity, scale }}
      >
        {/* Animated background */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <Link to={createPageUrl("Landing")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-12">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <motion.h1 
              className="text-7xl md:text-9xl font-black mb-8 leading-none"
              style={{
                background: "linear-gradient(to right, #fff, #aaa, #fff)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
              animate={{
                backgroundPosition: ["0% center", "200% center", "0% center"],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              SERVICIOS
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto font-light"
            >
              Soluciones integrales para artistas y creadores que buscan elevar su proyecto al siguiente nivel
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.6, type: "spring" }}
            className="mt-16"
          >
            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 mx-auto border-2 border-white/20 rounded-full flex items-center justify-center"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                ↓
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Services Sections */}
      <div className="relative">
        {services.map((service, index) => (
          <ServiceSection key={index} service={service} index={index} />
        ))}

        {/* Bottom CTA */}
        <section className="relative min-h-screen flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center relative z-10"
          >
            <h3 className="text-6xl md:text-8xl font-black mb-6"
              style={{
                background: "linear-gradient(135deg, #fff 0%, #aaa 50%, #fff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontFamily: "'Impact', sans-serif",
                letterSpacing: "-0.02em"
              }}
            >
              ¿Listo para comenzar?
            </h3>
            <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto font-light">
              Agenda una consulta gratuita y descubre cómo podemos ayudarte a alcanzar tus objetivos
            </p>
            <Link to={createPageUrl("Landing")}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-lg font-semibold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all"
              >
                Contactar
              </motion.button>
            </Link>
          </motion.div>

          {/* Background elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl"
            />
          </div>
        </section>
      </div>

      {/* Footer gradient */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}