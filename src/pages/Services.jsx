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

function ServiceCard({ service, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const Icon = service.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 100, rotateX: -15 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
      className="group relative"
    >
      <motion.div
        whileHover={{ scale: 1.05, z: 50 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative h-full bg-gradient-to-br from-white/5 to-white/[0.02] rounded-3xl p-8 border border-white/10 backdrop-blur-sm overflow-hidden"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Background gradient on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
        
        {/* Icon */}
        <motion.div
          whileHover={{ rotate: 360, scale: 1.2 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6 relative z-10`}
        >
          <Icon className="w-8 h-8 text-white" />
        </motion.div>

        {/* Title */}
        <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent relative z-10">
          {service.title}
        </h3>

        {/* Description */}
        <p className="text-gray-400 leading-relaxed relative z-10">
          {service.description}
        </p>

        {/* Decorative element */}
        <motion.div
          initial={{ scale: 0, rotate: 0 }}
          whileHover={{ scale: 1, rotate: 180 }}
          transition={{ duration: 0.5 }}
          className={`absolute -right-10 -bottom-10 w-40 h-40 bg-gradient-to-br ${service.color} rounded-full blur-3xl opacity-0 group-hover:opacity-20`}
        />
      </motion.div>
    </motion.div>
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

      {/* Services Grid */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Nuestro Ecosistema
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Un conjunto completo de servicios diseñados para impulsar tu carrera artística
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard key={index} service={service} index={index} />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-32"
        >
          <h3 className="text-4xl md:text-5xl font-bold mb-6">
            ¿Listo para comenzar?
          </h3>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
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
      </section>

      {/* Footer gradient */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}