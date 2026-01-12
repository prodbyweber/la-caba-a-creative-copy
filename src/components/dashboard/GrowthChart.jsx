import React, { useState } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { TrendingUp, Calendar } from "lucide-react";

const data = [
  { name: "Jan", streams: 45000, views: 62000, clips: 120 },
  { name: "Feb", streams: 52000, views: 78000, clips: 145 },
  { name: "Mar", streams: 48000, views: 71000, clips: 132 },
  { name: "Apr", streams: 61000, views: 95000, clips: 168 },
  { name: "May", streams: 55000, views: 88000, clips: 155 },
  { name: "Jun", streams: 67000, views: 112000, clips: 189 },
  { name: "Jul", streams: 73000, views: 124000, clips: 210 },
  { name: "Aug", streams: 82000, views: 138000, clips: 234 },
];

const timeframes = ["7D", "1M", "3M", "6M", "1Y", "ALL"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1d] border border-white/10 rounded-xl p-4 shadow-xl">
        <p className="text-sm text-gray-400 mb-2">{label}</p>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-400 capitalize">{entry.dataKey}:</span>
            <span className="font-medium text-white">
              {entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function GrowthChart() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("6M");
  const [activeMetric, setActiveMetric] = useState("streams");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-[#111113] rounded-2xl border border-white/5 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">Growth Trajectory</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-medium">+24.5%</span>
              <span>vs last period</span>
            </div>
          </div>
          
          {/* Timeframe Selector */}
          <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedTimeframe === tf
                    ? "bg-emerald-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Metric Toggles */}
        <div className="flex gap-4 mt-4">
          {[
            { key: "streams", label: "Streams", color: "#10b981" },
            { key: "views", label: "Views", color: "#a855f7" },
            { key: "clips", label: "Clips", color: "#f97316" },
          ].map((m) => (
            <button
              key={m.key}
              onClick={() => setActiveMetric(m.key)}
              className={`flex items-center gap-2 text-sm transition-all ${
                activeMetric === m.key ? "opacity-100" : "opacity-40 hover:opacity-70"
              }`}
            >
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: m.color }}
              />
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="p-6 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="streamGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="viewGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="clipGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <YAxis 
              hide
            />
            <Tooltip content={<CustomTooltip />} />
            {activeMetric === "streams" && (
              <Area
                type="monotone"
                dataKey="streams"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#streamGradient)"
              />
            )}
            {activeMetric === "views" && (
              <Area
                type="monotone"
                dataKey="views"
                stroke="#a855f7"
                strokeWidth={2}
                fill="url(#viewGradient)"
              />
            )}
            {activeMetric === "clips" && (
              <Area
                type="monotone"
                dataKey="clips"
                stroke="#f97316"
                strokeWidth={2}
                fill="url(#clipGradient)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}