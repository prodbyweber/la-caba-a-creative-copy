import React from "react";
import { motion } from "framer-motion";
import { Play, TrendingUp, TrendingDown, ExternalLink, MoreHorizontal } from "lucide-react";

const clips = [
  {
    id: 1,
    title: "Midnight Sessions #23",
    platform: "TikTok",
    views: "124K",
    change: "+42%",
    trend: "up",
    thumbnail: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=120&h=80&fit=crop",
    time: "2h ago"
  },
  {
    id: 2,
    title: "Studio Vibes - BTS",
    platform: "Instagram",
    views: "89K",
    change: "+18%",
    trend: "up",
    thumbnail: "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=120&h=80&fit=crop",
    time: "5h ago"
  },
  {
    id: 3,
    title: "New Track Preview",
    platform: "YouTube",
    views: "234K",
    change: "-3%",
    trend: "down",
    thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&h=80&fit=crop",
    time: "1d ago"
  },
  {
    id: 4,
    title: "Live Performance Clip",
    platform: "TikTok",
    views: "67K",
    change: "+28%",
    trend: "up",
    thumbnail: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=120&h=80&fit=crop",
    time: "2d ago"
  }
];

const platformColors = {
  TikTok: "bg-pink-500/10 text-pink-400",
  Instagram: "bg-purple-500/10 text-purple-400",
  YouTube: "bg-red-500/10 text-red-400"
};

export default function ClipActivityFeed() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-[#111113] rounded-2xl border border-white/5"
    >
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Clip Activity</h3>
          <p className="text-sm text-gray-500">Your latest performing content</p>
        </div>
        <button className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
          View All
        </button>
      </div>

      {/* Clip List */}
      <div className="divide-y divide-white/5">
        {clips.map((clip, i) => (
          <motion.div
            key={clip.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="p-4 hover:bg-white/[0.02] transition-colors group"
          >
            <div className="flex items-center gap-4">
              {/* Thumbnail */}
              <div className="relative flex-shrink-0">
                <img 
                  src={clip.thumbnail}
                  alt={clip.title}
                  className="w-20 h-14 object-cover rounded-lg"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-6 h-6 text-white" fill="white" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate mb-1">{clip.title}</h4>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${platformColors[clip.platform]}`}>
                    {clip.platform}
                  </span>
                  <span className="text-xs text-gray-500">{clip.time}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold">{clip.views}</div>
                <div className={`flex items-center justify-end gap-1 text-xs ${
                  clip.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {clip.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {clip.change}
                </div>
              </div>

              {/* Actions */}
              <button className="p-2 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}