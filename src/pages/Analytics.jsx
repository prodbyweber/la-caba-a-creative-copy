import React, { useState } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Music2, Heart, Play, Eye } from "lucide-react";
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
        <div className="px-3 sm:px-6 md:px-12 lg:px-16 xl:px-24 max-w-[1600px] mx-auto py-2 sm:py-3">
          {/* Timeframe Selector */}
          <div className="flex justify-end mb-2 sm:mb-3">
            <div className="flex items-center gap-0.5">
              {timeframes.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[8px] sm:text-[9px] font-medium transition-all ${
                    timeframe === tf
                      ? "bg-emerald-500/90 text-white"
                      : "bg-white/5 text-gray-500 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Overview Summary */}
          <OverviewSummary />

          {/* Streams Over Time + Top Tracks - Mobile Optimized */}
          <div className="grid lg:grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4">
            <div className="lg:col-span-2 bg-[#111113] rounded-lg sm:rounded-xl border border-white/5 p-2 sm:p-3">
              <div className="mb-1">
                <h3 className="text-xs sm:text-sm font-bold">Evolución de Reproducciones</h3>
              </div>
              <div className="h-32 sm:h-40">
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

              {/* Platform Stats Integrated - Mobile Minimized */}
              <div className="mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-white/5">
                <div className="hidden sm:grid sm:grid-cols-3 gap-4">
                   {/* Streams */}
                   <div className="bg-white/5 rounded-lg p-3">
                     <div className="flex items-center justify-between mb-2">
                       <h4 className="text-xs font-bold text-white">Streams</h4>
                       <span className="text-xs font-bold text-emerald-400">
                         {(platformsStreamsData.reduce((sum, p) => sum + p.value, 0) / 1000).toFixed(0)}K
                       </span>
                     </div>
                     <div className="space-y-1">
                       {platformsStreamsData.slice(0, 3).map((platform, i) => {
                         const total = platformsStreamsData.reduce((sum, p) => sum + p.value, 0);
                         const percentage = ((platform.value / total) * 100).toFixed(0);

                         return (
                           <div key={i}>
                             <div className="flex items-center justify-between mb-0.5">
                               <div className="flex items-center gap-1">
                                 <div className="w-1 h-1 rounded-full" style={{ backgroundColor: platform.color }} />
                                 <span className="text-[9px] text-gray-300">{platform.name}</span>
                               </div>
                               <span className="text-[9px] font-semibold text-white">{(platform.value / 1000).toFixed(0)}K</span>
                             </div>
                             <div className="h-0.5 bg-white/10 rounded-full overflow-hidden">
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
                   </div>

                   {/* Views */}
                   <div className="bg-white/5 rounded-lg p-3">
                     <div className="flex items-center justify-between mb-2">
                       <h4 className="text-xs font-bold text-white">Views</h4>
                       <span className="text-xs font-bold text-purple-400">
                         {(platformsViewsData.reduce((sum, p) => sum + p.value, 0) / 1000).toFixed(0)}K
                       </span>
                     </div>
                     <div className="space-y-1">
                       {platformsViewsData.map((platform, i) => {
                         const total = platformsViewsData.reduce((sum, p) => sum + p.value, 0);
                         const percentage = ((platform.value / total) * 100).toFixed(0);

                         return (
                           <div key={i}>
                             <div className="flex items-center justify-between mb-0.5">
                               <div className="flex items-center gap-1">
                                 <div className="w-1 h-1 rounded-full" style={{ backgroundColor: platform.color }} />
                                 <span className="text-[9px] text-gray-300">{platform.name}</span>
                               </div>
                               <span className="text-[9px] font-semibold text-white">{(platform.value / 1000).toFixed(0)}K</span>
                             </div>
                             <div className="h-0.5 bg-white/10 rounded-full overflow-hidden">
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
                   </div>

                   {/* Likes */}
                   <div className="bg-white/5 rounded-lg p-3">
                     <div className="flex items-center justify-between mb-2">
                       <h4 className="text-xs font-bold text-white flex items-center gap-1">
                         <Heart className="w-3 h-3 text-red-400" />
                         Likes
                       </h4>
                       <span className="text-xs font-bold text-red-400">
                         {(platformsLikesData.reduce((sum, p) => sum + p.value, 0) / 1000).toFixed(1)}K
                       </span>
                     </div>
                     <div className="space-y-1">
                       {platformsLikesData.map((platform, i) => {
                         const total = platformsLikesData.reduce((sum, p) => sum + p.value, 0);
                         const percentage = ((platform.value / total) * 100).toFixed(0);

                         return (
                           <div key={i}>
                             <div className="flex items-center justify-between mb-0.5">
                               <div className="flex items-center gap-1">
                                 <div className="w-1 h-1 rounded-full" style={{ backgroundColor: platform.color }} />
                                 <span className="text-[9px] text-gray-300">{platform.name}</span>
                               </div>
                               <span className="text-[9px] font-semibold text-white">{(platform.value / 1000).toFixed(1)}K</span>
                             </div>
                             <div className="h-0.5 bg-white/10 rounded-full overflow-hidden">
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
                   </div>
                </div>

                {/* Mobile Optimized Version - Clear Identification */}
                <div className="sm:hidden grid grid-cols-3 gap-1">
                  {/* Streams - Audio Platform */}
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2">
                    <div className="flex items-center gap-1 mb-1.5">
                      <div className="w-4 h-4 rounded bg-emerald-500/30 flex items-center justify-center">
                        <Play className="w-2.5 h-2.5 text-emerald-400" />
                      </div>
                      <div className="text-[7px] font-bold text-emerald-300">Streams</div>
                    </div>
                    <div className="text-[9px] font-bold text-emerald-400 mb-1">
                      {(platformsStreamsData.reduce((sum, p) => sum + p.value, 0) / 1000).toFixed(0)}K
                    </div>
                    <div className="space-y-0.5">
                      {platformsStreamsData.slice(0, 2).map((platform, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-[6px] text-emerald-200 truncate">{platform.name.split(' ')[0]}</span>
                          <span className="text-[7px] font-semibold text-emerald-300 ml-0.5">{(platform.value / 1000).toFixed(0)}K</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Views - Video Platform */}
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-2">
                    <div className="flex items-center gap-1 mb-1.5">
                      <div className="w-4 h-4 rounded bg-purple-500/30 flex items-center justify-center">
                        <Eye className="w-2.5 h-2.5 text-purple-400" />
                      </div>
                      <div className="text-[7px] font-bold text-purple-300">Views</div>
                    </div>
                    <div className="text-[9px] font-bold text-purple-400 mb-1">
                      {(platformsViewsData.reduce((sum, p) => sum + p.value, 0) / 1000).toFixed(0)}K
                    </div>
                    <div className="space-y-0.5">
                      {platformsViewsData.slice(0, 2).map((platform, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-[6px] text-purple-200 truncate">{platform.name.split(' ')[0]}</span>
                          <span className="text-[7px] font-semibold text-purple-300 ml-0.5">{(platform.value / 1000).toFixed(0)}K</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Likes - Engagement */}
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                    <div className="flex items-center gap-1 mb-1.5">
                      <div className="w-4 h-4 rounded bg-red-500/30 flex items-center justify-center">
                        <Heart className="w-2.5 h-2.5 text-red-400" />
                      </div>
                      <div className="text-[7px] font-bold text-red-300">Likes</div>
                    </div>
                    <div className="text-[9px] font-bold text-red-400 mb-1">
                      {(platformsLikesData.reduce((sum, p) => sum + p.value, 0) / 1000).toFixed(1)}K
                    </div>
                    <div className="space-y-0.5">
                      {platformsLikesData.slice(0, 2).map((platform, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-[6px] text-red-200 truncate">{platform.name.split(' ')[0]}</span>
                          <span className="text-[7px] font-semibold text-red-300 ml-0.5">{(platform.value / 1000).toFixed(1)}K</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Tracks - Desktop normal, Mobile larger */}
            <div className="bg-[#111113] rounded-lg sm:rounded-xl border border-white/5 p-2 sm:p-3">
              <h3 className="text-xs sm:text-sm font-bold mb-2 sm:mb-3 flex items-center gap-2">
                <Music2 className="w-3 sm:w-4 h-3 sm:h-4 text-purple-400" />
                Top Tracks
              </h3>
              <div className="sm:space-y-2 space-y-3">
                {topTracks.map((track, i) => (
                  <div key={i} className="flex items-center gap-3 sm:gap-3 p-2.5 sm:p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-8 sm:w-7 h-8 sm:h-7 rounded-lg bg-purple-500/20 flex items-center justify-center text-[10px] sm:text-xs font-bold text-purple-400 flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[10px] sm:text-xs truncate text-white">{track.title}</div>
                      <div className="text-[9px] sm:text-[10px] text-gray-500">{(track.streams / 1000).toFixed(0)}K streams</div>
                    </div>
                    <div className={`flex items-center gap-0.5 text-[9px] sm:text-[10px] font-medium flex-shrink-0 ${track.trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
                      {track.trendUp ? <TrendingUp className="w-3 sm:w-3 h-3 sm:h-3" /> : <TrendingDown className="w-3 sm:w-3 h-3 sm:h-3" />}
                      {track.trend}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>



          {/* Top Clips - Desktop Grid, Mobile Horizontal Scroll */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 sm:mb-4"
          >
            <h3 className="text-xs sm:text-sm font-bold mb-2 sm:mb-3 flex items-center gap-2">
              <Play className="w-3 sm:w-4 h-3 sm:h-4 text-emerald-400" />
              Top Clips
            </h3>
            {/* Desktop Grid */}
            <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {topClips.slice(0, 8).map((clip, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="group relative aspect-[9/16] rounded-lg overflow-hidden bg-[#111113] border border-white/10 hover:border-emerald-500/30 transition-all cursor-pointer"
                >
                  <img 
                    src={clip.thumbnail} 
                    alt={clip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-1.5">
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/60 flex items-center justify-center text-[8px] font-bold text-emerald-400 border border-emerald-500/30">
                      {i + 1}
                    </div>
                    
                    <h4 className="font-bold text-[9px] mb-0.5 line-clamp-2 leading-tight">{clip.title}</h4>
                    <div className="flex items-center gap-1 text-[8px] text-gray-400">
                      <span className="px-1 py-0.5 rounded bg-white/10 text-[7px] font-medium">{clip.platform}</span>
                      <span className="font-semibold">{(clip.views / 1000).toFixed(0)}K</span>
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

            {/* Mobile Horizontal Scroll */}
            <div className="sm:hidden overflow-x-auto pb-2 -mx-4 px-4">
              <div className="flex gap-2 w-max">
                {topClips.slice(0, 4).map((clip, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="group relative aspect-[9/16] w-24 rounded-lg overflow-hidden bg-[#111113] border border-white/10 hover:border-emerald-500/30 transition-all cursor-pointer flex-shrink-0"
                  >
                    <img 
                      src={clip.thumbnail} 
                      alt={clip.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-1">
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/60 flex items-center justify-center text-[7px] font-bold text-emerald-400 border border-emerald-500/30">
                        {i + 1}
                      </div>
                      
                      <h4 className="font-bold text-[8px] line-clamp-1">{clip.title}</h4>
                      <div className="flex items-center gap-0.5 text-[7px] text-gray-400">
                        <span className="px-0.5 py-0.5 rounded bg-white/10 text-[6px] font-medium">{clip.platform}</span>
                        <span className="font-semibold">{(clip.views / 1000).toFixed(0)}K</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Demographics & Top Countries - Optimized */}
          <div className="grid lg:grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
            {/* Demographics - Compact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-1 bg-[#111113] rounded-lg sm:rounded-xl border border-white/5 p-2 sm:p-3"
            >
              <h3 className="text-[10px] sm:text-[11px] font-bold mb-1.5">Demografía</h3>
              
              {/* Age Demographics - Compact */}
              <div className="mb-1.5 sm:mb-2">
                <h4 className="text-[8px] sm:text-[9px] font-semibold text-gray-400 mb-1">Edad</h4>
                <div className="h-12 sm:h-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={demographicsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                      <XAxis 
                        dataKey="age" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#6b7280', fontSize: 6 }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#6b7280', fontSize: 6 }}
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

              {/* Gender Demographics - Simplified */}
              <div>
                <h4 className="text-[8px] sm:text-[9px] font-semibold text-gray-400 mb-1">Sexo</h4>
                <div className="space-y-0.5">
                  {genderData.map((item, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span className="text-[7px] sm:text-[8px] text-gray-300 w-9 sm:w-12 truncate">{item.gender}</span>
                      <div className="flex-1 h-0.5 sm:h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-[7px] sm:text-[8px] font-semibold text-gray-300 w-5 sm:w-6 text-right">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Top Countries - Larger */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 bg-[#111113] rounded-lg sm:rounded-xl border border-white/5 p-2 sm:p-3"
            >
              <h3 className="text-[10px] sm:text-[11px] font-bold mb-1.5 sm:mb-2">Top Países</h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2">
                {topCountriesData.map((country, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex flex-col items-center gap-1 p-1.5 sm:p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-center"
                  >
                    <div className="text-base sm:text-lg">{country.flag}</div>
                    <div className="text-[8px] sm:text-[9px] font-semibold text-white truncate">{country.name}</div>
                    <div className="text-[10px] sm:text-xs font-bold text-emerald-400">{(country.score / 1000).toFixed(0)}K</div>
                  </motion.div>
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