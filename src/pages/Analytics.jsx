import React, { useState } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Music2, Heart } from "lucide-react";
import DashboardNav from "@/components/dashboard/DashboardNav";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import OverviewSummary from "@/components/analytics/OverviewSummary";
import WalletCard from "@/components/dashboard/WalletCard";

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

const platformsStreamsData = [
  { name: "Spotify", value: 345000, color: "#1DB954" },
  { name: "Apple Music", value: 187000, color: "#FC3C44" },
  { name: "YouTube", value: 156000, color: "#FF0000" },
  { name: "Deezer", value: 78000, color: "#FF6600" },
  { name: "SoundCloud", value: 45000, color: "#FF5500" },
];

const platformsViewsData = [
  { name: "Instagram Reels", value: 234100, color: "#E4405F" },
  { name: "TikTok", value: 187500, color: "#000000" },
  { name: "YouTube Shorts", value: 120700, color: "#FF0000" },
];

const platformsLikesData = [
  { name: "Instagram", value: 28400, color: "#E4405F" },
  { name: "TikTok", value: 15200, color: "#000000" },
  { name: "YouTube", value: 8900, color: "#FF0000" },
  { name: "Others", value: 3800, color: "#9CA3AF" },
];

const topCountriesData = [
  { name: "España", views: 245000, likes: 12400, comments: 3200, followers: 28500, score: 289100 },
  { name: "México", views: 187000, likes: 9800, comments: 2100, followers: 22100, score: 221000 },
  { name: "Argentina", views: 156000, likes: 7200, comments: 1800, followers: 18900, score: 183900 },
  { name: "Colombia", views: 134000, likes: 6100, comments: 1400, followers: 15200, score: 156700 },
  { name: "Chile", views: 98000, likes: 4500, comments: 900, followers: 11200, score: 114600 },
  { name: "Perú", views: 87000, likes: 3800, comments: 750, followers: 9400, score: 100950 },
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

          {/* Overview Summary */}
          <OverviewSummary />

          {/* Streams Over Time + Top Tracks */}
          <div className="grid lg:grid-cols-3 gap-6 mb-6">
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

          {/* Streams, Views & Likes by Platform */}
          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            {/* Streams by Platform */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111113] rounded-2xl border border-white/5 p-6"
            >
              <h3 className="text-lg font-bold mb-4">Streams por Plataforma</h3>
              <div className="space-y-4">
                {platformsStreamsData.map((platform, i) => {
                  const total = platformsStreamsData.reduce((sum, p) => sum + p.value, 0);
                  const percentage = ((platform.value / total) * 100).toFixed(1);
                  
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{platform.name}</span>
                        <span className="text-sm text-gray-500">{(platform.value / 1000).toFixed(0)}K</span>
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
            </motion.div>

            {/* Views by Platform */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#111113] rounded-2xl border border-white/5 p-6"
            >
              <h3 className="text-lg font-bold mb-4">Visualizaciones por Plataforma</h3>
              <div className="space-y-4">
                {platformsViewsData.map((platform, i) => {
                  const total = platformsViewsData.reduce((sum, p) => sum + p.value, 0);
                  const percentage = ((platform.value / total) * 100).toFixed(1);
                  
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{platform.name}</span>
                        <span className="text-sm text-gray-500">{(platform.value / 1000).toFixed(0)}K</span>
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
            </motion.div>

            {/* Likes by Platform */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#111113] rounded-2xl border border-white/5 p-6"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-400" />
                Me Gusta por Plataforma
              </h3>
              <div className="space-y-4">
                {platformsLikesData.map((platform, i) => {
                  const total = platformsLikesData.reduce((sum, p) => sum + p.value, 0);
                  const percentage = ((platform.value / total) * 100).toFixed(1);
                  
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{platform.name}</span>
                        <span className="text-sm text-gray-500">{(platform.value / 1000).toFixed(1)}K</span>
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
            </motion.div>
          </div>

          {/* Demographics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#111113] rounded-2xl border border-white/5 p-6 mb-6"
          >
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
          </motion.div>

          {/* Top Countries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#111113] rounded-2xl border border-white/5 p-6 mb-6"
          >
            <h3 className="text-lg font-bold mb-4">Top Países por Interacción</h3>
            <div className="space-y-3">
              {topCountriesData.map((country, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-purple-500/20 flex items-center justify-center text-sm font-bold text-emerald-400">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold mb-1">{country.name}</div>
                    <div className="grid grid-cols-4 gap-4 text-xs text-gray-400">
                      <div>👁️ {(country.views / 1000).toFixed(0)}K vistas</div>
                      <div>❤️ {country.likes.toLocaleString()} me gusta</div>
                      <div>💬 {country.comments.toLocaleString()} comentarios</div>
                      <div>👥 {(country.followers / 1000).toFixed(1)}K seguidores</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-400">{(country.score / 1000).toFixed(0)}K</div>
                    <div className="text-xs text-gray-500">interacción</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Wallet Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <WalletCard />
          </motion.div>
        </div>
      </main>
    </div>
  );
}