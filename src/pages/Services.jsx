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
    accentColor: "#FF6B35",
    bgGradient: "from-orange-500/5 to-red-500/5"
  },
  {
    title: "Producción Musical",
    icon: Music,
    description: "Creación, grabación y producción de música de alta calidad",
    accentColor: "#00D9FF",
    bgGradient: "from-cyan-500/5 to-blue-500/5"
  },
  {
    title: "Construcción de Catálogo",
    icon: FolderKanban,
    description: "Desarrollo y estructuración de tu repertorio musical",
    accentColor: "#10B981",
    bgGradient: "from-emerald-500/5 to-green-500/5"
  },
  {
    title: "Producción Audiovisual",
    icon: Film,
    description: "Creación de contenido visual cinematográfico y estrategia de medios",
    accentColor: "#F59E0B",
    bgGradient: "from-amber-500/5 to-orange-500/5"
  },
  {
    title: "Producción Digital",
    icon: Sparkles,
    description: "Contenido digital optimizado para plataformas y redes sociales",
    accentColor: "#EC4899",
    bgGradient: "from-pink-500/5 to-rose-500/5"
  },
  {
    title: "Posicionamiento",
    icon: Target,
    description: "Estrategia de marca y posicionamiento en el mercado",
    accentColor: "#8B5CF6",
    bgGradient: "from-violet-500/5 to-purple-500/5"
  },
  {
    title: "Desarrollo de Proyecto Artístico",
    icon: Award,
    description: "Acompañamiento integral en el crecimiento de tu carrera artística",
    accentColor: "#3B82F6",
    bgGradient: "from-blue-500/5 to-indigo-500/5"
  },
  {
    title: "Supervisión Creativa",
    icon: Eye,
    description: "Supervisión experta de procesos creativos y artísticos",
    accentColor: "#14B8A6",
    bgGradient: "from-teal-500/5 to-cyan-500/5"
  },
  {
    title: "Narrativa & Comunicación",
    icon: MessageSquare,
    description: "Construcción de storytelling y estrategia comunicacional",
    accentColor: "#F97316",
    bgGradient: "from-orange-500/5 to-amber-500/5"
  },
  {
    title: "Ecosistema Artístico",
    icon: Network,
    description: "Creación de redes y comunidad alrededor de tu proyecto",
    accentColor: "#22C55E",
    bgGradient: "from-green-500/5 to-emerald-500/5"
  },
  {
    title: "Gestión de Catálogo",
    icon: FolderKanban,
    description: "Administración profesional de tu repertorio y derechos",
    accentColor: "#84CC16",
    bgGradient: "from-lime-500/5 to-green-500/5"
  },
  {
    title: "Branding Artístico",
    icon: Palette,
    description: "Identidad visual y construcción de marca personal",
    accentColor: "#D946EF",
    bgGradient: "from-fuchsia-500/5 to-pink-500/5"
  },
  {
    title: "Marketing & Monetización",
    icon: DollarSign,
    description: "Estrategias de comercialización y generación de ingresos",
    accentColor: "#EAB308",
    bgGradient: "from-yellow-500/5 to-orange-500/5"
  }
];

function ServiceSection({ service, index }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const iconY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const titleY = useTransform(scrollYProgress, [0, 1], [20, -20]);
  const descY = useTransform(scrollYProgress, [0, 1], [10, -10]);
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0.95, 1, 1, 0.95]);

  const Icon = service.icon;

  return (
    <motion.section
      ref={ref}
      style={{ opacity }}
      className="relative min-h-screen flex items-center justify-center px-6 py-20"
    >
      {/* Fashion magazine background with fabric texture */}
      <div className="absolute inset-0 bg-black" />
      
      {/* Elegant fabric texture */}
      <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='velvet'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' seed='${index}' /%3E%3CfeColorMatrix type='saturate' values='0.3'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23velvet)' /%3E%3C/svg%3E")`,
          backgroundSize: "300px 300px"
        }}
      />

      {/* Colored accent gradient per service */}
      <div className={`absolute inset-0 bg-gradient-to-br ${service.bgGradient}`} />

      {/* Spotlight effect */}
      <motion.div
        style={{ y: iconY }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${service.accentColor}15 0%, transparent 70%)`
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <motion.div
          style={{ scale }}
          className="flex flex-col items-center text-center space-y-16"
        >
          {/* Icon with 3D transform */}
          <motion.div
            style={{ y: iconY }}
            initial={{ opacity: 0, rotateY: -90, scale: 0.5 }}
            whileInView={{ opacity: 1, rotateY: 0, scale: 1 }}
            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
            viewport={{ once: true }}
            className="relative"
            whileHover={{ scale: 1.1, rotateY: 180 }}
          >
            <div 
              className="w-28 h-28 lg:w-36 lg:h-36 rounded-full flex items-center justify-center backdrop-blur-sm border"
              style={{
                background: `linear-gradient(135deg, ${service.accentColor}20, ${service.accentColor}05)`,
                borderColor: `${service.accentColor}40`,
                boxShadow: `0 20px 60px -10px ${service.accentColor}40, inset 0 1px 0 ${service.accentColor}20`
              }}
            >
              <Icon className="w-14 h-14 lg:w-18 lg:h-18" style={{ color: service.accentColor }} />
            </div>

            {/* Glow effect */}
            <div 
              className="absolute inset-0 rounded-full blur-2xl opacity-40 -z-10"
              style={{ background: service.accentColor }}
            />
          </motion.div>

          {/* Title with stagger animation */}
          <motion.h2 
            style={{ y: titleY }}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: 0.3 }}
            viewport={{ once: true }}
            className="text-6xl md:text-8xl lg:text-9xl font-black leading-none"
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontWeight: "900",
              letterSpacing: "-0.04em",
              color: "white"
            }}
          >
            {service.title}
          </motion.h2>

          {/* Accent line */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut", delay: 0.5 }}
            viewport={{ once: true }}
            className="h-px w-24 lg:w-32"
            style={{ 
              background: `linear-gradient(90deg, transparent, ${service.accentColor}, transparent)`,
              boxShadow: `0 0 10px ${service.accentColor}80`
            }}
          />

          {/* Description */}
          <motion.p 
            style={{ y: descY }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
            viewport={{ once: true }}
            className="text-xl md:text-2xl lg:text-3xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontWeight: "300",
              letterSpacing: "0.01em"
            }}
          >
            {service.description}
          </motion.p>
        </motion.div>
      </div>

      {/* Fashion magazine vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, transparent 30%, rgba(0, 0, 0, 0.9) 100%)"
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
        {/* Cinematic gradient background */}
        <div className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, #0a0a0b 0%, #1a1410 50%, #0a0a0b 100%)"
          }}
        />

        {/* Subtle wood texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d4a574' fill-opacity='0.8'%3E%3Cpath d='M0 0h200v1H0zM0 10h200v1H0zM0 20h200v1H0zM0 30h200v1H0zM0 40h200v1H0zM0 50h200v1H0zM0 60h200v1H0zM0 70h200v1H0zM0 80h200v1H0zM0 90h200v1H0zM0 100h200v1H0zM0 110h200v1H0zM0 120h200v1H0zM0 130h200v1H0zM0 140h200v1H0zM0 150h200v1H0zM0 160h200v1H0zM0 170h200v1H0zM0 180h200v1H0zM0 190h200v1H0z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "150px 150px"
          }}
        />

        {/* Cinematic light rays */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              opacity: [0.3, 0.5, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px]"
            style={{
              background: "radial-gradient(ellipse at center, rgba(255, 140, 0, 0.15) 0%, transparent 70%)",
            }}
          />
          <motion.div
            animate={{
              opacity: [0.2, 0.4, 0.2],
              scale: [1.1, 1, 1.1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute bottom-0 right-1/4 w-[600px] h-[500px]"
            style={{
              background: "radial-gradient(circle, rgba(212, 165, 116, 0.1) 0%, transparent 60%)",
            }}
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
              className="text-7xl md:text-9xl font-black mb-8 leading-none tracking-tight"
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontWeight: "900",
                background: "linear-gradient(135deg, #ffffff 0%, #e0e0e0 50%, #ffffff 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "-0.04em"
              }}
              animate={{
                backgroundPosition: ["0% center", "200% center", "0% center"],
              }}
              transition={{
                duration: 8,
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
              className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto"
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontWeight: "300",
                letterSpacing: "0.01em"
              }}
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

        {/* Bottom CTA - Fashion Editorial Style */}
        <section className="relative min-h-screen flex items-center justify-center px-6">
          {/* Fashion fabric background */}
          <div className="absolute inset-0 bg-black" />
          <div className="absolute inset-0 opacity-10 mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='fabricCTA'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' seed='99' /%3E%3CfeColorMatrix type='saturate' values='0.2'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23fabricCTA)' /%3E%3C/svg%3E")`,
              backgroundSize: "250px 250px"
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center relative z-10 space-y-12"
          >
            <h3 className="text-6xl md:text-8xl lg:text-9xl font-black leading-none"
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontWeight: "900",
                letterSpacing: "-0.04em",
                color: "white"
              }}
            >
              ¿Listo para comenzar?
            </h3>
            
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-300 max-w-3xl mx-auto"
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontWeight: "300",
                letterSpacing: "0.01em"
              }}
            >
              Agenda una consulta gratuita y descubre cómo podemos ayudarte a alcanzar tus objetivos
            </p>

            <Link to={createPageUrl("Landing")}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-6 rounded-full bg-white text-black text-lg font-bold transition-all relative overflow-hidden"
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontWeight: "700",
                  boxShadow: "0 20px 60px rgba(255, 255, 255, 0.2)"
                }}
              >
                Contactar
              </motion.button>
            </Link>
          </motion.div>

          {/* Elegant spotlight */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.3, 0.4, 0.3]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-br from-white/5 via-white/10 to-transparent rounded-full blur-3xl"
            />
          </div>
        </section>
      </div>

      {/* Footer gradient */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}