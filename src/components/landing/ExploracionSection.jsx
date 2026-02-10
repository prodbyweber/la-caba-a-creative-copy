import React from "react";
import { motion } from "framer-motion";

export default function ExploracionSection() {
  return (
    <section className="relative min-h-screen py-20 overflow-hidden bg-black">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-emerald-950/20 to-black" />
      
      <div className="relative z-10 max-w-2xl mx-auto px-6 flex flex-col items-center justify-center min-h-screen text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-12"
        >
          {/* Título Principal - Estilo espaciado */}
          <div className="space-y-2">
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-light tracking-[0.3em] text-white/90 uppercase">
              EXPLORACIÓN
            </h2>
            <p className="text-xl sm:text-2xl text-white/80 font-light tracking-wide">
              con Prod. by Weber
            </p>
          </div>

          {/* Precio en Badge */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-block"
          >
            <div className="px-12 py-4 border-2 border-white/30 rounded-full">
              <span className="text-3xl sm:text-4xl font-bold text-white tracking-wide">$600 EUR</span>
            </div>
          </motion.div>

          {/* Descripción Principal */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="space-y-6 max-w-xl mx-auto"
          >
            <p className="text-base sm:text-lg text-white/70 leading-relaxed font-light">
              Exploración con Prod. by Weber no es una revisión de contenido, es una sesión privada de 40 minutos conmigo, donde te digo sin filtro qué estás haciendo mal, qué está frenando tus ventas y cómo ajustar tu mensaje para que tu marca se perciba como referente y empiece a atraer clientes reales: sales con claridad, dirección y una forma distinta de usar tus redes para vender, no para "ver si pega".
            </p>
          </motion.div>

          {/* Imagen placeholder (puedes reemplazar con tu foto) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="w-64 h-64 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10"
          >
            {/* Reemplaza el src con tu imagen real */}
            <img 
              src="https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&h=400&fit=crop&q=80" 
              alt="Prod. by Weber"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* CTA Final */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <button className="px-8 py-3 border border-white/30 rounded-full text-white/80 hover:bg-white/10 hover:text-white transition-all text-sm tracking-wider">
              lacabanacreative.com
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}