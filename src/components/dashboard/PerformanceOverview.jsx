import React from "react";
import { motion } from "framer-motion";
import { Play, Music2, Users, Eye, TrendingUp, TrendingDown } from "lucide-react";

const metrics = [
  {
    icon: Eye,
    label: "Total Views",
    value: "1.24M",
    change: "+12.5%",
    trend: "up",
    color: "emerald"
  },
  {
    icon: Music2,
    label: "Streams",
    value: "847K",
    change: "+8.2%",
    trend: "up",
    color: "purple"
  },
  {
    icon: Play,
    label: "Active Clips",
    value: "234",
    change: "+23",
    trend: "up",
    color: "orange"
  },
  {
    icon: Users,
    label: "New Followers",
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
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {metrics.map((metric, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ scale: 1.02 }}
          className="bg-[#111113] rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`w-11 h-11 rounded-xl bg-${metric.color}-500/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <metric.icon className={`w-5 h-5 text-${metric.color}-400`} />
            </div>
            <div className={`flex items-center gap-1 text-xs font-medium ${
              metric.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {metric.trend === 'up' ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {metric.change}
            </div>
          </div>
          
          <div className="text-2xl font-bold mb-1">{metric.value}</div>
          <div className="text-xs text-gray-500">{metric.label}</div>
        </motion.div>
      ))}
    </motion.div>
  );
}