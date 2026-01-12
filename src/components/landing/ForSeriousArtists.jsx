import React from "react";
import { motion } from "framer-motion";
import { Shield, Target, Zap } from "lucide-react";

export default function ForSeriousArtists() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Dramatic Background */}
      <div className="absolute inset-0 bg-[#0a0a0b]">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-purple-500/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Icon Row */}
          <div className="flex items-center justify-center gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"
            >
              <Shield className="w-8 h-8 text-emerald-400" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center"
            >
              <Target className="w-10 h-10 text-purple-400" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center"
            >
              <Zap className="w-8 h-8 text-orange-400" />
            </motion.div>
          </div>

          {/* Main Statement */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 leading-tight">
            <span className="text-gray-500">This is</span>{" "}
            <span className="text-white">not</span>{" "}
            <span className="text-gray-500">for</span>{" "}
            <span className="text-white">hobbyists.</span>
          </h2>

          <p className="text-xl sm:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-12">
            This is for artists who <span className="text-emerald-400 font-medium">invest</span> in their career.
            <br className="hidden sm:block" />
            Who treat their music like a <span className="text-purple-400 font-medium">business</span>.
            <br className="hidden sm:block" />
            Who demand <span className="text-orange-400 font-medium">results</span>.
          </p>

          {/* Separator Line */}
          <div className="flex items-center justify-center gap-4">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>

          {/* Supporting Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {[
              { value: "87%", label: "Artist Retention" },
              { value: "3.2x", label: "Average Growth" },
              { value: "6mo", label: "To ROI" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}