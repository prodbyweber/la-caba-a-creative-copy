import React from "react";
import { motion } from "framer-motion";
import { Play, Music2, Users, Eye, TrendingUp, TrendingDown } from "lucide-react";

const metrics = [
  {
    icon: Eye,
    label: "Vistas Totales",
    value: "1.24M",
    change: "+12.5%",
    trend: "up",
    color: "emerald"
  },
  {
    icon: Music2,
    label: "Reproducciones",
    value: "847K",
    change: "+8.2%",
    trend: "up",
    color: "purple"
  },
  {
    icon: Play,
    label: "Clips Activos",
    value: "234",
    change: "+23",
    trend: "up",
    color: "orange"
  },
  {
    icon: Users,
    label: "Nuevos Seguidores",
    value: "2.4K",
    change: "-2.1%",
    trend: "down",
    color: "pink"
  }
];

export default function PerformanceOverview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-2"
    >
      {metrics.map((metric, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          whileHover={{ scale: 1.02 }}
          className="bg-[#111113] rounded-lg p-3 border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`w-8 h-8 rounded-lg bg-${metric.color}-500/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <metric.icon className={`w-4 h-4 text-${metric.color}-400`} />
            </div>
            <div className={`flex items-center gap-0.5 text-[10px] font-medium ${
              metric.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {metric.trend === 'up' ? (
                <TrendingUp className="w-2.5 h-2.5" />
              ) : (
                <TrendingDown className="w-2.5 h-2.5" />
              )}
              <span className="whitespace-nowrap">{metric.change}</span>
            </div>
          </div>
          
          <div className="text-xl font-bold mb-0.5">{metric.value}</div>
          <div className="text-[10px] text-gray-500 leading-tight">{metric.label}</div>
        </motion.div>
      ))}
    </motion.div>
  );
}