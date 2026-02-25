import React, { useState } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Music2, Heart } from "lucide-react";
import DashboardNav from "@/components/dashboard/DashboardNav";
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
  { name: "España", flag: "🇪🇸", score: 289100 },
  { name: "México", flag: "🇲🇽", score: 221000 },
  { name: "Argentina", flag: "🇦🇷", score: 183900 },
  { name: "Colombia", flag: "🇨🇴", score: 156700 },
  { name: "Chile", flag: "🇨🇱", score: 114600 },
  { name: "Perú", flag: "🇵🇪", score: 100950 },
];

const genderData = [
  { gender: "Femenino", percentage: 58 },
  { gender: "Masculino", percentage: 40 },
  { gender: "Otro", percentage: 2 },
];

const topClips = [
  { title: "Summer Vibes BTS", platform: "TikTok", views: 487000, engagement: 8.2, thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=400&fit=crop" },
  { title: "New Single Teaser", platform: "Instagram", views: 356000, engagement: 7.8, thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=400&fit=crop" },
  { title: "Studio Session", platform: "YouTube", views: 298000, engagement: 6.5, thumbnail: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&h=400&fit=crop" },
  { title: "Fan Q&A", platform: "TikTok", views: 245000, engagement: 9.1, thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=400&fit=crop" },
  { title: "Live Performance", platform: "Instagram", views: 189000, engagement: 7.2, thumbnail: "https://images.unsplash.com/photo-1501612780327-45045538702b?w=300&h=400&fit=crop" },
  { title: "Recording Session", platform: "YouTube", views: 176000, engagement: 6.8, thumbnail: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=300&h=400&fit=crop" },
  { title: "Concert Highlights", platform: "TikTok", views: 165000, engagement: 7.5, thumbnail: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=300&h=400&fit=crop" },
  { title: "Behind The Music", platform: "Instagram", views: 142000, engagement: 8.0, thumbnail: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=300&h=400&fit=crop" },
  { title: "Acoustic Version", platform: "YouTube", views: 128000, engagement: 7.9, thumbnail: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=300&h=400&fit=crop" },
  { title: "Music Video Teaser", platform: "TikTok", views: 115000, engagement: 8.5, thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=400&fit=crop" },
];

export default function Analytics() {
  const [timeframe, setTimeframe] = useState("6M");

  const timeframes = ["7D", "1M", "3M", "6M", "1A", "TODO"];

  const urlParams = new URLSearchParams(window.location.search);
  const artistId = urlParams.get("artistId");

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <DashboardNav artistId={artistId} />

      <main className="pt-14">
        <div className="px-6 sm:px-12 lg:px-16 xl:px-24 py-6 max-w-[1600px] mx-auto">
          {/* Timeframe Selector */}
          <div className="flex items-center gap-2 mb-3">
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
          <div className="grid lg:grid-cols-3 gap-4 mb-4">
            <div className="lg:col-span-2 bg-[#111113] rounded-xl border border-white/5 p-3">
              <div className="mb-1">
                <h3 className="text-sm font-bold">Evolución de Reproducciones</h3>
              </div>
              <div className="h-40">
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
                      tick={{ fill: '#6b7280', fontSize: 9 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6b7280', fontSize: 9 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a1d', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        fontSize: '10px'
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

            <div className="bg-[#111113] rounded-xl border border-white/5 p-3">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                <Music2 className="w-4 h-4 text-purple-400" />
                Top Tracks
              </h3>
              <div className="space-y-2">
                {topTracks.map((track, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-400">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs truncate text-white">{track.title}</div>
                      <div className="text-[10px] text-gray-500">{(track.streams / 1000).toFixed(0)}K streams</div>
                    </div>
                    <div className={`flex items-center gap-0.5 text-[10px] font-medium ${track.trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
                      {track.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {track.trend}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Streams, Views & Likes by Platform */}
          <div className="grid lg:grid-cols-3 gap-3 mb-4">
            {/* Streams by Platform */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111113] rounded-xl border border-white/5 p-2.5"
            >
              <h3 className="text-[11px] font-bold mb-2">Streams</h3>
              <div className="space-y-1.5">
                {platformsStreamsData.map((platform, i) => {
                  const total = platformsStreamsData.reduce((sum, p) => sum + p.value, 0);
                  const percentage = ((platform.value / total) * 100).toFixed(1);
                  
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[9px] font-medium">{platform.name}</span>
                        <span className="text-[9px] text-gray-500">{(platform.value / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: platform.color
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Views by Platform */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-[#111113] rounded-xl border border-white/5 p-2.5"
            >
              <h3 className="text-[11px] font-bold mb-2">Visualizaciones</h3>
              <div className="space-y-1.5">
                {platformsViewsData.map((platform, i) => {
                  const total = platformsViewsData.reduce((sum, p) => sum + p.value, 0);
                  const percentage = ((platform.value / total) * 100).toFixed(1);
                  
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[9px] font-medium">{platform.name}</span>
                        <span className="text-[9px] text-gray-500">{(platform.value / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: platform.color
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Likes by Platform */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#111113] rounded-xl border border-white/5 p-2.5"
            >
              <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-400" />
                Me Gusta
              </h3>
              <div className="space-y-1.5">
                {platformsLikesData.map((platform, i) => {
                  const total = platformsLikesData.reduce((sum, p) => sum + p.value, 0);
                  const percentage = ((platform.value / total) * 100).toFixed(1);
                  
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[9px] font-medium">{platform.name}</span>
                        <span className="text-[9px] text-gray-500">{(platform.value / 1000).toFixed(1)}K</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: platform.color
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Top Clips - Netflix Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <h3 className="text-lg font-bold mb-3">Top Clips</h3>
            <div className="grid grid-cols-8 gap-2">
              {topClips.slice(0, 8).map((clip, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="group relative aspect-[9/16] rounded-md overflow-hidden bg-[#111113] border border-white/10 hover:border-emerald-500/30 transition-all cursor-pointer"
                >
                  <img 
                    src={clip.thumbnail} 
                    alt={clip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-1.5">
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/60 flex items-center justify-center text-[9px] font-bold text-emerald-400 border border-emerald-500/30">
                      {i + 1}
                    </div>
                    
                    <h4 className="font-bold text-[9px] mb-0.5 line-clamp-1 leading-tight">{clip.title}</h4>
                    <div className="flex items-center gap-1 text-[8px] text-gray-400">
                      <span className="px-1 py-0.5 rounded bg-white/10 text-[7px] font-medium">{clip.platform}</span>
                      <span>{(clip.views / 1000).toFixed(0)}K</span>
                    </div>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent ml-0.5" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Demographics & Top Countries */}
          <div className="grid lg:grid-cols-2 gap-3 mb-4">
            {/* Demographics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111113] rounded-xl border border-white/5 p-3"
            >
              <h3 className="text-[11px] font-bold mb-2">Demografía</h3>
              
              {/* Age Demographics */}
              <div className="mb-2">
                <h4 className="text-[9px] font-semibold text-gray-400 mb-1">Por Edad</h4>
                <div className="h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={demographicsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                      <XAxis 
                        dataKey="age" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#6b7280', fontSize: 7 }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#6b7280', fontSize: 7 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1a1a1d', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '6px',
                          fontSize: '8px'
                        }}
                      />
                      <Bar dataKey="percentage" fill="#a855f7" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gender Demographics */}
              <div>
                <h4 className="text-[9px] font-semibold text-gray-400 mb-1">Por Sexo</h4>
                <div className="space-y-0.5">
                  {genderData.map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="text-[8px] text-gray-300 w-12">{item.gender}</span>
                      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-[8px] font-semibold text-gray-300 w-6 text-right">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Top Countries */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#111113] rounded-xl border border-white/5 p-2.5"
            >
              <h3 className="text-[11px] font-bold mb-1.5">Top Países</h3>
              <div className="grid grid-cols-2 gap-1">
                {topCountriesData.map((country, i) => (
                  <div key={i} className="flex items-center gap-1 p-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-4 h-4 rounded bg-gradient-to-br from-emerald-500/20 to-purple-500/20 flex items-center justify-center text-[8px] font-bold text-emerald-400">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[8px] flex items-center gap-0.5 truncate">
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                      </div>
                      <div className="text-[7px] font-bold text-emerald-400">{(country.score / 1000).toFixed(0)}K</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

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