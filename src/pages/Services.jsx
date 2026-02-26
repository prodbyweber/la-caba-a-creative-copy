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

  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.9, 1, 1, 0.9]);

  const Icon = service.icon;
  const isEven = index % 2 === 0;

  return (
    <motion.section
      ref={ref}
      style={{ opacity }}
      className="relative min-h-screen flex items-center justify-center px-6 py-20"
    >
      {/* Wood texture background */}
      <div className="absolute inset-0 opacity-20 mix-blend-soft-light pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d4a574' fill-opacity='0.3'%3E%3Cpath d='M0 0h200v2H0zM0 10h200v2H0zM0 20h200v1H0zM0 25h200v1H0zM0 30h200v2H0zM0 40h200v1H0zM0 50h200v2H0zM0 60h200v1H0zM0 70h200v2H0zM0 80h200v1H0zM0 90h200v2H0zM0 100h200v1H0zM0 110h200v2H0zM0 120h200v1H0zM0 130h200v2H0zM0 140h200v1H0zM0 150h200v2H0zM0 160h200v1H0zM0 170h200v2H0zM0 180h200v1H0zM0 190h200v2H0z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: "100px 100px"
        }}
      />

      {/* Film grain overlay */}
      <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px"
        }}
      />

      {/* Warm gradient blobs */}
      <motion.div
        style={{ y }}
        className={`absolute ${isEven ? '-left-1/4' : '-right-1/4'} top-1/4 w-96 h-96 bg-gradient-to-br ${service.color} rounded-full blur-3xl opacity-30`}
      />

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <motion.div
          style={{ scale }}
          className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-20`}
        >
          {/* Icon with vintage 3D effect */}
          <motion.div
            whileInView={{ rotateY: 360 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            viewport={{ once: true }}
            className="relative flex-shrink-0"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Wooden frame effect */}
            <div className="absolute -inset-2 rounded-3xl"
              style={{
                background: "linear-gradient(135deg, #8b6f47 0%, #5d4e37 50%, #8b6f47 100%)",
                boxShadow: "inset 0 2px 10px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.5)"
              }}
            />
            
            <div className={`relative w-32 h-32 lg:w-48 lg:h-48 rounded-3xl bg-gradient-to-br ${service.color} flex items-center justify-center`}
              style={{
                boxShadow: `0 20px 60px -10px rgba(139, 111, 71, 0.6), inset 0 2px 20px rgba(255,255,255,0.2)`,
              }}
            >
              <Icon className="w-16 h-16 lg:w-24 lg:h-24 text-[#f4e4c1]" />
              
              {/* Vintage texture overlay */}
              <div className="absolute inset-0 rounded-3xl opacity-20"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.7' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`
                }}
              />
            </div>

            {/* Warm glow effect */}
            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${service.color} blur-3xl opacity-40 -z-10`} />
          </motion.div>

          {/* Content */}
          <div className={`flex-1 ${isEven ? 'lg:text-left' : 'lg:text-right'} text-center`}>
            <motion.div
              initial={{ opacity: 0, x: isEven ? -100 : 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              viewport={{ once: true }}
            >
              {/* Number with vintage style */}
              <div className={`text-9xl lg:text-[14rem] font-black mb-6 leading-none bg-gradient-to-br ${service.color} bg-clip-text text-transparent opacity-25`}
                style={{
                  textShadow: "0 0 60px rgba(212, 165, 116, 0.4)",
                  fontFamily: "'Impact', 'Arial Black', sans-serif",
                  letterSpacing: "-0.05em",
                  filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.6))"
                }}
              >
                {String(index + 1).padStart(2, '0')}
              </div>

              {/* Title with luxury cabin style */}
              <h2 
                className="text-6xl lg:text-9xl font-black mb-8 leading-none tracking-tighter"
                style={{
                  background: `linear-gradient(135deg, #f4e4c1 0%, #d4a574 30%, #f4e4c1 50%, #d4a574 70%, #f4e4c1 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  textShadow: "0 4px 30px rgba(212, 165, 116, 0.5)",
                  fontFamily: "'Impact', 'Arial Black', sans-serif",
                  filter: "drop-shadow(0 6px 20px rgba(0,0,0,0.7))"
                }}
              >
                {service.title}
              </h2>

              {/* Description */}
              <p className="text-xl lg:text-3xl text-[#d4a574]/90 font-light leading-relaxed max-w-2xl mx-auto lg:mx-0"
                style={{
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  letterSpacing: "0.01em",
                  textShadow: "0 2px 12px rgba(0,0,0,0.8)"
                }}
              >
                {service.description}
              </p>

              {/* Decorative line with vintage style */}
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                viewport={{ once: true }}
                className={`h-0.5 bg-gradient-to-r ${isEven ? 'from-amber-600 via-orange-600 to-transparent' : 'from-transparent via-orange-600 to-amber-600'} mt-10 max-w-md mx-auto lg:mx-0`}
                style={{
                  boxShadow: "0 0 10px rgba(212, 165, 116, 0.6)"
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Warm vignette effect */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, transparent 30%, rgba(26, 22, 18, 0.7) 100%)"
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
    <div ref={containerRef} className="min-h-screen bg-[#1a1612] text-white overflow-hidden">
      {/* Hero Section */}
      <motion.section 
        className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden"
        style={{ opacity, scale }}
      >
        {/* Wood texture background */}
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23d4a574' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: "150px 150px"
          }}
        />

        {/* Warm gradient overlays */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 45, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-amber-700/20 to-orange-700/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [45, 0, 45],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-br from-orange-600/20 to-amber-600/20 rounded-full blur-3xl"
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