import React from "react";
import { motion } from "framer-motion";

export default function BrandsCarousel({ logos }) {
  // Mostrar logos por defecto si no hay configurados
  const defaultLogos = [
    "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop",
    "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=100&fit=crop",
    "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=100&fit=crop",
    "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=100&fit=crop",
    "https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=200&h=100&fit=crop"
  ];
  
  const displayLogos = (logos && logos.length > 0) ? logos : defaultLogos;
  
  // Duplicar logos múltiples veces para loop infinito continuo
  const duplicatedLogos = [...displayLogos, ...displayLogos, ...displayLogos, ...displayLogos];
  
  // Calcular el ancho total de un conjunto de logos (ancho + gap)
  const totalWidth = displayLogos.length * (96 + 64); // 96px (w-24) + 64px (gap-16)

  return (
    <section className="relative -mt-2 sm:-mt-2 lg:-mt-4 pt-0 pb-1 lg:pb-2 bg-zinc-950/50 border-t border-white/5">
      <div className="max-w-full overflow-hidden">
        <div className="text-center mb-0.5 lg:mb-1">
          <span className="text-xs uppercase tracking-wider text-gray-500">Hemos colaborado con</span>
        </div>
        
        <div className="relative overflow-hidden">
          <motion.div
            className="flex gap-16 items-center"
            animate={{
              x: [-totalWidth, 0],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: displayLogos.length * 4,
                ease: "linear",
              },
            }}
          >
            {duplicatedLogos.map((logo, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-24 h-12 flex items-center justify-center transition-all duration-300 group"
              >
                <img
                  src={logo}
                  alt="Brand logo"
                  className="max-w-full max-h-full object-contain group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}