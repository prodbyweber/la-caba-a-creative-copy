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
  TrendingUp,
  Music
} from "lucide-react";

const features = [
  {
    icon: Film,
    title: "Universos visuales coherentes",
    description: "Desde avatares 3D hasta films, clips y branding. No es solo estética: es identidad y dirección.",
    color: "emerald",
    size: "large"
  },
  {
    icon: Music,
    title: "La música se siente",
    description: "Trabajamos la música desde la emoción. Nostalgia, energía, calma o intimidad. La producción al servicio de lo que quieres transmitir.",
    color: "purple",
    size: "normal"
  },
  {
    icon: Archive,
    title: "Del estéreo al futuro del sonido",
    description: "Adaptamos tu música a Dolby Atmos. Lista para Apple Music y formatos inmersivos. Más profundidad y calidad.",
    color: "orange",
    size: "normal"
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard de artista",
    description: "Control total de tu proyecto. Sesiones, clips, análisis y gestión en un solo lugar.",
    color: "emerald",
    size: "normal"
  },
  {
    icon: Calendar,
    title: "Trabajo por horas",
    description: "No cobramos por canción. Trabajamos por tiempo y proceso creativo. Calidad garantizada.",
    color: "purple",
    size: "normal"
  },
  {
    icon: Globe,
    title: "Imagen premium",
    description: "Look cinematográfico y premium. Destacar en un entorno saturado requiere identidad visual potente.",
    color: "orange",
    size: "large"
  }
];

export default function Features({ config }) {
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
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="text-white">{config?.features_title || 'Digitalizamos artistas.'}</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-4">
            {config?.features_subtitle || 'Imagen, identidad y narrativa para destacar en un entorno saturado.'}
          </p>
          <p className="text-gray-500 max-w-xl mx-auto">
            Cada proyecto tiene una intención emocional clara.
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
          className="mt-16 bg-gradient-to-r from-orange-500/10 via-purple-500/10 to-orange-500/10 rounded-3xl p-8 border border-orange-500/20"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-semibold">Dolby Atmos</h4>
              <p className="text-sm text-gray-400">Disponible según proyecto y viabilidad técnica</p>
            </div>
            </div>
            <div className="flex items-center gap-2 text-orange-400">
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">Más recorrido</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}