import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Play, Users, Eye, Music2, Info } from "lucide-react";

// Adapter: Convierte datos actuales a estructura agregada
const overviewAdapter = (currentData) => {
  return {
    streams_30d: {
      total: 623000,
      breakdown: {
        spotify: 345000,
        youtube_music: null,
        youtube: 156000
      }
    },
    followers_total: {
      total: 287500,
      breakdown: {
        instagram: 125000,
        tiktok: 98700,
        youtube: 63800
      }
    },
    views_30d: {
      total: 542300,
      breakdown: {
        instagram: 234100,
        tiktok: 187500,
        youtube_shorts: 120700
      }
    },
    spotify_monthly_listeners: 98200,
    engagement_avg_30d: 4.8, // %
    clips_retention_avg_30d: 71.5, // %
    revenue_estimated_30d: 1840.50
  };
};

// Formatea números a K/M
const formatNumber = (num) => {
  if (!num) return "—";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

const Tooltip = ({ children, text }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {show && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 border border-white/10 rounded text-xs text-gray-300 whitespace-nowrap z-10">
          {text}
        </div>
      )}
    </div>
  );
};

export default function OverviewSummary() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulación: en producción, orquestar fetches con Promise.all + caching
    const timer = setTimeout(() => {
      const data = overviewAdapter({});
      setMetrics(data);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 h-32 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Card 1: Streams (30d) */}
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
        <div className="text-3xl font-bold mb-1">{formatNumber(metrics.streams_30d.total)}</div>
        <div className="text-sm text-gray-400 mb-3">Streams (30d)</div>
        <div className="text-xs text-gray-500 space-y-1">
          <div>
            {metrics.streams_30d.breakdown.spotify
              ? `Spotify: ${formatNumber(metrics.streams_30d.breakdown.spotify)}`
              : "Spotify: —"}
          </div>
          <div>
            {metrics.streams_30d.breakdown.youtube_music
              ? `YT Music: ${formatNumber(metrics.streams_30d.breakdown.youtube_music)}`
              : "YT Music: —"}
          </div>
          <div>
            {metrics.streams_30d.breakdown.youtube
              ? `YouTube: ${formatNumber(metrics.streams_30d.breakdown.youtube)}`
              : "YouTube: —"}
          </div>
        </div>
      </motion.div>

      {/* Card 2: Seguidores (Total) */}
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
        <div className="text-3xl font-bold mb-1">{formatNumber(metrics.followers_total.total)}</div>
        <div className="text-sm text-gray-400 mb-3">Seguidores (Total)</div>
        <div className="text-xs text-gray-500 space-y-1">
          <div>
            {metrics.followers_total.breakdown.instagram
              ? `IG: ${formatNumber(metrics.followers_total.breakdown.instagram)}`
              : "IG: —"}
          </div>
          <div>
            {metrics.followers_total.breakdown.tiktok
              ? `TikTok: ${formatNumber(metrics.followers_total.breakdown.tiktok)}`
              : "TikTok: —"}
          </div>
          <div>
            {metrics.followers_total.breakdown.youtube
              ? `YouTube: ${formatNumber(metrics.followers_total.breakdown.youtube)}`
              : "YouTube: —"}
          </div>
        </div>
      </motion.div>

      {/* Card 3: Visualizaciones (30d) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
            <Eye className="w-6 h-6 text-pink-400" />
          </div>
          <div className="flex items-center gap-1 text-pink-400 text-sm">
            <TrendingUp className="w-4 h-4" />
            +32%
          </div>
        </div>
        <div className="text-3xl font-bold mb-1">{formatNumber(metrics.views_30d.total)}</div>
        <div className="text-sm text-gray-400 mb-3">Visualizaciones (30d)</div>
        <div className="text-xs text-gray-500 space-y-1">
          <div>
            {metrics.views_30d.breakdown.instagram
              ? `IG Reels: ${formatNumber(metrics.views_30d.breakdown.instagram)}`
              : "IG Reels: —"}
          </div>
          <div>
            {metrics.views_30d.breakdown.tiktok
              ? `TikTok: ${formatNumber(metrics.views_30d.breakdown.tiktok)}`
              : "TikTok: —"}
          </div>
          <div>
            {metrics.views_30d.breakdown.youtube_shorts
              ? `Shorts: ${formatNumber(metrics.views_30d.breakdown.youtube_shorts)}`
              : "Shorts: —"}
          </div>
        </div>
      </motion.div>

      {/* Card 4: Engagement & Retención (Calidad de Contenido) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <Music2 className="w-6 h-6 text-orange-400" />
          </div>
          <Tooltip text="Oyentes únicos últimos 30 días en Spotify">
            <Info className="w-4 h-4 text-gray-500 hover:text-gray-300" />
          </Tooltip>
        </div>
        <div className="text-3xl font-bold mb-1">
          {formatNumber(metrics.spotify_monthly_listeners)}
        </div>
        <div className="text-sm text-gray-400 mb-3">Oyentes Mensuales (Spotify)</div>
        <div className="text-xs text-gray-500 space-y-1">
          <div>Engagement: {metrics.engagement_avg_30d}%</div>
          <div>Retención clips: {metrics.clips_retention_avg_30d}%</div>
        </div>
      </motion.div>
    </div>
  );
}