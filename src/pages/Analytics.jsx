import React, { useState } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Eye, Play, Users, Heart, Share2, Music2, Calendar } from "lucide-react";
import DashboardNav from "@/components/dashboard/DashboardNav";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

const streamData = [
  { month: "Ene", streams: 45000, listeners: 12000, saves: 3200 },
  { month: "Feb", streams: 52000, listeners: 14500, saves: 3800 },
  { month: "Mar", streams: 48000, listeners: 13200, saves: 3500 },
  { month: "Abr", streams: 61000, listeners: 16800, saves: 4200 },
  { month: "May", streams: 55000, listeners: 15200, saves: 3900 },
  { month: "Jun", streams: 67000, listeners: 18500, saves: 4800 },
  { month: "Jul", streams: 73000, listeners: 20100, saves: 5200 },
  { month: "Ago", streams: 82000, listeners: 22800, saves: 5900 },
];

const demographicsData = [
  { age: "13-17", percentage: 12 },
  { age: "18-24", percentage: 38 },
  { age: "25-34", percentage: 28 },
  { age: "35-44", percentage: 15 },
  { age: "45+", percentage: 7 },
];

const topTracks = [
  { title: "Midnight Vibes", streams: 124500, trend: "+12%", trendUp: true },
  { title: "City Lights", streams: 98300, trend: "+8%", trendUp: true },
  { title: "Summer Dreams", streams: 87600, trend: "-3%", trendUp: false },
  { title: "Neon Nights", streams: 76200, trend: "+15%", trendUp: true },
  { title: "Golden Hour", streams: 65400, trend: "+5%", trendUp: true },
];

const platformsData = [
  { name: "Spotify", streams: 345000, color: "#1DB954" },
  { name: "Apple Music", streams: 187000, color: "#FC3C44" },
  { name: "YouTube", streams: 156000, color: "#FF0000" },
  { name: "Deezer", streams: 78000, color: "#FF6600" },
  { name: "SoundCloud", streams: 45000, color: "#FF5500" },
];

export default function Analytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeframe, setTimeframe] = useState("6M");

  const timeframes = ["7D", "1M", "3M", "6M", "1A", "TODO"];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <DashboardNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="lg:pl-64 pt-16">
        <div className="p-6 max-w-[1800px] mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">Analíticas</h1>
            <p className="text-gray-500">Datos detallados de tu música y audiencia</p>
          </motion.div>

          {/* Timeframe Selector */}
          <div className="flex items-center gap-2 mb-6">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  timeframe === tf
                    ? "bg-emerald-500 text-white"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Play className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="flex items-center gap-1 text-emerald-400 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  +24%
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">847K</div>
              <div className="text-sm text-gray-400">Reproducciones</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex items-center gap-1 text-purple-400 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  +18%
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">142K</div>
              <div className="text-sm text-gray-400">Oyentes</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-pink-400" />
                </div>
                <div className="flex items-center gap-1 text-pink-400 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  +32%
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">38.5K</div>
              <div className="text-sm text-gray-400">Me Gusta</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Share2 className="w-6 h-6 text-orange-400" />
                </div>
                <div className="flex items-center gap-1 text-red-400 text-sm">
                  <TrendingDown className="w-4 h-4" />
                  -5%
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">12.3K</div>
              <div className="text-sm text-gray-400">Compartidos</div>
            </motion.div>
          </div>

          {/* Main Charts Row */}
          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            {/* Streams Over Time */}
            <div className="lg:col-span-2 bg-[#111113] rounded-2xl border border-white/5 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold mb-1">Evolución de Reproducciones</h3>
                  <p className="text-sm text-gray-500">Últimos 8 meses</p>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={streamData}>
                    <defs>
                      <linearGradient id="streamGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a1d', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="streams"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#streamGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Tracks */}
            <div className="bg-[#111113] rounded-2xl border border-white/5 p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Music2 className="w-5 h-5 text-purple-400" />
                Top Tracks
              </h3>
              <div className="space-y-3">
                {topTracks.map((track, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-sm font-bold text-purple-400">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{track.title}</div>
                      <div className="text-xs text-gray-500">{track.streams.toLocaleString()}</div>
                    </div>
                    <div className={`flex items-center gap-1 text-xs ${track.trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
                      {track.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {track.trend}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Demographics & Platforms */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Demographics */}
            <div className="bg-[#111113] rounded-2xl border border-white/5 p-6">
              <h3 className="text-lg font-bold mb-4">Demografía por Edad</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={demographicsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                    <XAxis 
                      dataKey="age" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a1d', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px'
                      }}
                    />
                    <Bar dataKey="percentage" fill="#a855f7" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Platforms */}
            <div className="bg-[#111113] rounded-2xl border border-white/5 p-6">
              <h3 className="text-lg font-bold mb-4">Streams por Plataforma</h3>
              <div className="space-y-4">
                {platformsData.map((platform, i) => {
                  const total = platformsData.reduce((sum, p) => sum + p.streams, 0);
                  const percentage = ((platform.streams / total) * 100).toFixed(1);
                  
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{platform.name}</span>
                        <span className="text-sm text-gray-500">{platform.streams.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: platform.color
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{percentage}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}