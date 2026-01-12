import React from "react";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Film, 
  Archive, 
  Wallet, 
  Calendar, 
  Globe,
  Sparkles,
  TrendingUp
} from "lucide-react";

const features = [
  {
    icon: LayoutDashboard,
    title: "Panel de Artista",
    description: "Tu centro de comando creativo completo. Rendimiento de un vistazo.",
    color: "emerald",
    size: "large"
  },
  {
    icon: Film,
    title: "Sistema de Control de Clips",
    description: "Gestiona, rastrea y optimiza todos tus clips de contenido entre plataformas.",
    color: "purple",
    size: "normal"
  },
  {
    icon: Archive,
    title: "Bóveda de Música y Contenido",
    description: "Almacenamiento seguro para todos tus activos creativos. Siempre accesible.",
    color: "orange",
    size: "normal"
  },
  {
    icon: Wallet,
    title: "Cartera Inteligente",
    description: "Rastrea ganancias, estima regalías, gestiona tus finanzas creativas.",
    color: "emerald",
    size: "normal"
  },
  {
    icon: Calendar,
    title: "Calendario de Sesiones",
    description: "Reserva tiempo de estudio, programa revisiones, gestiona tu flujo creativo.",
    color: "purple",
    size: "normal"
  },
  {
    icon: Globe,
    title: "Seguimiento Multi-Plataforma",
    description: "Análisis unificados en Spotify, Apple Music, YouTube, TikTok y más.",
    color: "orange",
    size: "large"
  }
];

export default function Features() {
  return (
    <section id="features" className="relative py-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-purple-400 text-sm font-medium tracking-wider uppercase mb-4 block">
            Características
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Todo lo que necesitas para <span className="text-emerald-400">crecer</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Herramientas modulares diseñadas para artistas serios. Sin relleno, solo poder.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`group relative ${feature.size === 'large' ? 'lg:col-span-2' : ''}`}
            >
              <div className="bg-[#111113] rounded-3xl p-8 border border-white/5 hover:border-white/10 transition-all duration-500 h-full overflow-hidden">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-${feature.color}-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-7 h-7 text-${feature.color}-400`} />
                </div>

                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>

                {/* Decorative Corner */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-${feature.color}-500/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              </div>

              {/* Hover Glow */}
              <div className={`absolute inset-0 bg-${feature.color}-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-5 transition-opacity duration-500 -z-10`} />
            </motion.div>
          ))}
        </div>

        {/* Bottom Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-emerald-500/10 via-purple-500/10 to-orange-500/10 rounded-3xl p-8 border border-white/5"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-semibold">Información Impulsada por IA</h4>
              <p className="text-sm text-gray-400">Obtén recomendaciones inteligentes para impulsar tu crecimiento</p>
            </div>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">Próximamente Q2 2025</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}