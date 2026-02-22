import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Play, Users, Eye, Music2 } from "lucide-react";

const formatNumber = (num) => {
  if (!num) return "—";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

export default function OverviewSummary() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMetrics({
        streams_30d_total: 623000,
        followers_total: 287500,
        views_30d_total: 542300,
        spotify_monthly_listeners: 98200
      });
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white/5 border border-white/10 rounded-xl p-4 h-24 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  const cards = [
    {
      icon: Play,
      label: "Streams (30d)",
      value: metrics.streams_30d_total,
      color: "emerald",
      trend: "+24%"
    },
    {
      icon: Users,
      label: "Seguidores",
      value: metrics.followers_total,
      color: "purple",
      trend: "+18%"
    },
    {
      icon: Eye,
      label: "Visualizaciones (30d)",
      value: metrics.views_30d_total,
      color: "pink",
      trend: "+32%"
    },
    {
      icon: Music2,
      label: "Oyentes Spotify",
      value: metrics.spotify_monthly_listeners,
      color: "orange",
      trend: "+15%"
    }
  ];

  const colorMap = {
    emerald: { bg: "from-emerald-500/10 to-emerald-600/5", border: "border-emerald-500/20", icon: "bg-emerald-500/20", iconText: "text-emerald-400", trend: "text-emerald-400" },
    purple: { bg: "from-purple-500/10 to-purple-600/5", border: "border-purple-500/20", icon: "bg-purple-500/20", iconText: "text-purple-400", trend: "text-purple-400" },
    pink: { bg: "from-pink-500/10 to-pink-600/5", border: "border-pink-500/20", icon: "bg-pink-500/20", iconText: "text-pink-400", trend: "text-pink-400" },
    orange: { bg: "from-orange-500/10 to-orange-600/5", border: "border-orange-500/20", icon: "bg-orange-500/20", iconText: "text-orange-400", trend: "text-orange-400" }
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
      {cards.map((card, i) => {
        const colors = colorMap[card.color];
        const Icon = card.icon;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-gradient-to-br ${colors.bg} ${colors.border} border rounded-xl p-4`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${colors.icon} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${colors.iconText}`} />
              </div>
              <span className={`text-xs font-semibold ${colors.trend} flex items-center gap-0.5`}>
                <TrendingUp className="w-3 h-3" />
                {card.trend}
              </span>
            </div>
            <div className="text-2xl font-bold mb-1">{formatNumber(card.value)}</div>
            <div className="text-xs text-gray-400">{card.label}</div>
          </motion.div>
        );
      })}
    </div>
  );
}