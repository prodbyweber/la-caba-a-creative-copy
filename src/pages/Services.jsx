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
    color: "from-amber-700 to-orange-600"
  },
  {
    title: "Producción Musical",
    icon: Music,
    description: "Creación, grabación y producción de música de alta calidad",
    color: "from-orange-600 to-amber-700"
  },
  {
    title: "Construcción de Catálogo",
    icon: FolderKanban,
    description: "Desarrollo y estructuración de tu repertorio musical",
    color: "from-amber-600 to-yellow-700"
  },
  {
    title: "Producción Audiovisual",
    icon: Film,
    description: "Creación de contenido visual cinematográfico y estrategia de medios",
    color: "from-orange-700 to-red-800"
  },
  {
    title: "Producción Digital",
    icon: Sparkles,
    description: "Contenido digital optimizado para plataformas y redes sociales",
    color: "from-yellow-600 to-orange-600"
  },
  {
    title: "Posicionamiento",
    icon: Target,
    description: "Estrategia de marca y posicionamiento en el mercado",
    color: "from-amber-700 to-orange-700"
  },
  {
    title: "Desarrollo de Proyecto Artístico",
    icon: Award,
    description: "Acompañamiento integral en el crecimiento de tu carrera artística",
    color: "from-orange-600 to-amber-600"
  },
  {
    title: "Supervisión Creativa",
    icon: Eye,
    description: "Supervisión experta de procesos creativos y artísticos",
    color: "from-amber-600 to-yellow-600"
  },
  {
    title: "Narrativa & Comunicación",
    icon: MessageSquare,
    description: "Construcción de storytelling y estrategia comunicacional",
    color: "from-orange-700 to-amber-700"
  },
  {
    title: "Ecosistema Artístico",
    icon: Network,
    description: "Creación de redes y comunidad alrededor de tu proyecto",
    color: "from-yellow-700 to-amber-700"
  },
  {
    title: "Gestión de Catálogo",
    icon: FolderKanban,
    description: "Administración profesional de tu repertorio y derechos",
    color: "from-amber-700 to-orange-600"
  },
  {
    title: "Branding Artístico",
    icon: Palette,
    description: "Identidad visual y construcción de marca personal",
    color: "from-orange-600 to-amber-700"
  },
  {
    title: "Marketing & Monetización",
    icon: DollarSign,
    description: "Estrategias de comercialización y generación de ingresos",
    color: "from-yellow-600 to-orange-700"
  }
];

function ServiceSection({ service, index }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.95, 1, 1, 0.95]);

  const Icon = service.icon;

  return (
    <motion.section
      ref={ref}
      style={{ opacity }}
      className="relative min-h-screen flex items-center justify-center px-6 py-20"
    >
      {/* Cinematic gradient background */}
      <div className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(10, 10, 11, 0.5) 0%, rgba(26, 20, 16, 0.3) 50%, rgba(10, 10, 11, 0.5) 100%)"
        }}
      />

      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d4a574'%3E%3Cpath d='M0 0h200v1H0zM0 20h200v1H0zM0 40h200v1H0zM0 60h200v1H0zM0 80h200v1H0zM0 100h200v1H0zM0 120h200v1H0zM0 140h200v1H0zM0 160h200v1H0zM0 180h200v1H0z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: "100px 100px"
        }}
      />

      {/* Warm cinematic light */}
      <motion.div
        style={{ y }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-orange-600/10 via-amber-600/5 to-transparent rounded-full blur-3xl"
      />

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <motion.div
          style={{ scale }}
          className="flex flex-col items-center text-center"
        >
          {/* Icon centered */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="relative mb-12"
          >
            <div className={`w-24 h-24 lg:w-32 lg:h-32 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center`}
              style={{
                boxShadow: `0 20px 40px -10px rgba(255, 140, 0, 0.3)`,
              }}
            >
              <Icon className="w-12 h-12 lg:w-16 lg:h-16 text-white" />
            </div>

            {/* Subtle glow */}
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${service.color} blur-2xl opacity-30 -z-10`} />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Title - same typography as SERVICIOS */}
            <h2 
              className="text-6xl md:text-8xl lg:text-9xl font-black leading-none tracking-tighter"
              style={{
                background: "linear-gradient(135deg, #f4e4c1 0%, #d4a574 25%, #f4e4c1 50%, #d4a574 75%, #f4e4c1 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "0 4px 30px rgba(212, 165, 116, 0.4)",
                fontFamily: "'Impact', 'Arial Black', sans-serif",
              }}
            >
              {service.title}
            </h2>

            {/* Description - same typography as subtitle */}
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto"
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontWeight: "300",
                letterSpacing: "0.01em"
              }}
            >
              {service.description}
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Cinematic vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, transparent 40%, rgba(10, 10, 11, 0.8) 100%)"
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
              className="text-7xl md:text-9xl font-black mb-8 leading-none tracking-tighter"
              style={{
                background: "linear-gradient(135deg, #f4e4c1 0%, #d4a574 25%, #f4e4c1 50%, #d4a574 75%, #f4e4c1 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "0 4px 30px rgba(212, 165, 116, 0.4)",
                fontFamily: "'Impact', 'Arial Black', sans-serif",
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

        {/* Bottom CTA - Luxury Cabin Style */}
        <section className="relative min-h-screen flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
            className="text-center relative z-10"
          >
            <h3 className="text-6xl md:text-9xl font-black mb-8 leading-none tracking-tighter"
              style={{
                background: "linear-gradient(135deg, #f4e4c1 0%, #d4a574 25%, #f4e4c1 50%, #d4a574 75%, #f4e4c1 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontFamily: "'Impact', 'Arial Black', sans-serif",
                textShadow: "0 4px 30px rgba(212, 165, 116, 0.4)",
                filter: "drop-shadow(0 6px 20px rgba(0,0,0,0.7))"
              }}
            >
              ¿Listo para comenzar?
            </h3>
            <p className="text-xl md:text-3xl text-[#d4a574]/90 mb-12 max-w-3xl mx-auto font-light"
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                textShadow: "0 2px 12px rgba(0,0,0,0.8)"
              }}
            >
              Agenda una consulta gratuita y descubre cómo podemos ayudarte a alcanzar tus objetivos
            </p>
            <Link to={createPageUrl("Landing")}>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-6 rounded-full bg-gradient-to-r from-amber-700 to-orange-600 text-[#f4e4c1] text-xl font-bold transition-all relative overflow-hidden"
                style={{
                  boxShadow: "0 10px 40px rgba(212, 165, 116, 0.5), inset 0 2px 10px rgba(255,255,255,0.2)"
                }}
              >
                <span className="relative z-10">Contactar</span>
                {/* Wood texture overlay */}
                <div className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`
                  }}
                />
              </motion.button>
            </Link>
          </motion.div>

          {/* Warm ambient glow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 40, repeat: Infinity, ease: "linear" },
                scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-gradient-to-br from-amber-700/20 via-orange-600/20 to-amber-700/20 rounded-full blur-3xl"
            />
          </div>
        </section>
      </div>

      {/* Footer gradient */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}