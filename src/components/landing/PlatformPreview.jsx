import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { TrendingUp, Play, Users, Zap, BarChart3, Music2 } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis } from "recharts";

const mockData = [
  { name: "Jan", value: 2400 },
  { name: "Feb", value: 3200 },
  { name: "Mar", value: 2800 },
  { name: "Apr", value: 4100 },
  { name: "May", value: 3600 },
  { name: "Jun", value: 5200 },
  { name: "Jul", value: 4800 },
];

export default function PlatformPreview() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section id="platform" ref={ref} className="relative py-32 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[150px]" />
      
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Tu <span className="text-emerald-400">centro de comando</span> creativo
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Rastrea tu rendimiento como un atleta profesional. Cada reproducción, cada clip, cada dólar — visualizado.
          </p>
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div
          style={{ y }}
          className="relative"
        >
          <div className="relative bg-gradient-to-b from-[#111113] to-[#0a0a0b] rounded-3xl border border-white/10 overflow-hidden shadow-2xl shadow-black/50">
            {/* Top Bar */}
            <div className="flex items-center gap-2 px-6 py-4 border-b border-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div className="ml-4 text-sm text-gray-500">dashboard.lacabana.io</div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Artist Profile Card */}
                <div className="lg:col-span-1">
                  <div className="bg-[#18181b]/80 rounded-2xl p-6 border border-white/5 h-full">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold">
                        JV
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Jay Vega</h3>
                        <p className="text-sm text-gray-500">Urbano / Latin Trap</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-[#0a0a0b] rounded-xl p-4">
                        <div className="text-2xl font-bold text-emerald-400">847K</div>
                        <div className="text-xs text-gray-500">Reproducciones</div>
                      </div>
                      <div className="bg-[#0a0a0b] rounded-xl p-4">
                        <div className="text-2xl font-bold text-purple-400">234</div>
                        <div className="text-xs text-gray-500">Clips Activos</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-3 border-t border-white/5">
                      <span className="text-sm text-gray-400">Puntuación</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-white">92</span>
                        <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">+8%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Chart */}
                <div className="lg:col-span-2">
                  <div className="bg-[#18181b]/80 rounded-2xl p-6 border border-white/5 h-full">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold">Pronóstico de Crecimiento</h3>
                        <p className="text-sm text-gray-500">Basado en tu trayectoria actual</p>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-400">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-medium">+24.5%</span>
                      </div>
                    </div>

                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={mockData}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                          <YAxis hide />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#10b981"
                            strokeWidth={2}
                            fill="url(#colorValue)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                {[
                  { icon: Play, label: "Vistas", value: "1.2M", change: "+12%", color: "emerald" },
                  { icon: Music2, label: "Reproducciones", value: "847K", change: "+8%", color: "purple" },
                  { icon: Users, label: "Nuevos Fans", value: "2.4K", change: "+34%", color: "orange" },
                  { icon: Zap, label: "Engagement", value: "94%", change: "+5%", color: "emerald" },
                ].map((metric, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-[#18181b]/80 rounded-2xl p-4 border border-white/5"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-${metric.color}-500/10 flex items-center justify-center mb-3`}>
                      <metric.icon className={`w-5 h-5 text-${metric.color}-400`} />
                    </div>
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{metric.label}</span>
                      <span className={`text-xs text-${metric.color}-400`}>{metric.change}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-purple-500/20 to-orange-500/20 rounded-3xl blur-3xl -z-10" />
        </motion.div>
      </div>
    </section>
  );
}