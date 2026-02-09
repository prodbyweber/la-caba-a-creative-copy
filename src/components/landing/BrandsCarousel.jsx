import React from "react";
import { motion } from "framer-motion";

export default function BrandsCarousel({ logos }) {
  if (!logos || logos.length === 0) return null;

  // Duplicar logos para loop infinito suave
  const duplicatedLogos = [...logos, ...logos, ...logos];

  return (
    <section className="relative py-6 bg-zinc-950/50 border-t border-white/5">
      <div className="max-w-full overflow-hidden">
        <div className="text-center mb-4">
          <span className="text-xs uppercase tracking-wider text-gray-500">Han confiado en mí</span>
        </div>
        
        <div className="relative overflow-hidden">
          <motion.div
            className="flex gap-16 items-center"
            animate={{
              x: [0, -100 * logos.length],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: logos.length * 3,
                ease: "linear",
              },
            }}
          >
            {duplicatedLogos.map((logo, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-24 h-12 flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              >
                <img
                  src={logo}
                  alt="Brand logo"
                  className="max-w-full max-h-full object-contain filter brightness-200"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}