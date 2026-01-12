import React from "react";
import { motion } from "framer-motion";
import { Check, X, ChevronRight, TrendingUp, Users, Activity } from "lucide-react";

const colorClasses = {
  red: {
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    text: "text-red-400",
    button: "bg-red-500 hover:bg-red-600",
    icon: "bg-red-500/20"
  },
  pink: {
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    text: "text-pink-400",
    button: "bg-pink-500 hover:bg-pink-600",
    icon: "bg-pink-500/20"
  },
  green: {
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    text: "text-green-400",
    button: "bg-green-500 hover:bg-green-600",
    icon: "bg-green-500/20"
  },
  purple: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    text: "text-purple-400",
    button: "bg-purple-500 hover:bg-purple-600",
    icon: "bg-purple-500/20"
  }
};

export default function SocialAccountCard({ platform, onConnect, delay = 0 }) {
  const colors = colorClasses[platform.color] || colorClasses.purple;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[#111113] rounded-2xl border border-white/5 overflow-hidden group hover:border-white/10 transition-all duration-300"
    >
      {/* Header */}
      <div className={`p-6 ${colors.bg} border-b ${colors.border} relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full" />
        
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl ${colors.icon} flex items-center justify-center`}>
              <platform.icon className={`w-7 h-7 ${colors.text}`} />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">{platform.name}</h3>
              <div className="flex items-center gap-2">
                {platform.connected ? (
                  <>
                    <div className={`w-2 h-2 rounded-full bg-emerald-400 animate-pulse`} />
                    <span className="text-xs text-emerald-400 font-medium">Conectado</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-gray-600" />
                    <span className="text-xs text-gray-500">No conectado</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
          {platform.description}
        </p>

        {/* Stats - only shown if connected */}
        {platform.connected && platform.stats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 rounded-xl bg-[#0a0a0b]">
              <Users className="w-4 h-4 text-gray-500 mx-auto mb-1" />
              <div className="text-lg font-bold">{platform.stats.followers.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Seguidores</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-[#0a0a0b]">
              <TrendingUp className="w-4 h-4 text-gray-500 mx-auto mb-1" />
              <div className="text-lg font-bold">{platform.stats.engagement}</div>
              <div className="text-xs text-gray-500">Engagement</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-[#0a0a0b]">
              <Activity className="w-4 h-4 text-gray-500 mx-auto mb-1" />
              <div className="text-lg font-bold">{platform.stats.posts}</div>
              <div className="text-xs text-gray-500">Publicaciones</div>
            </div>
          </div>
        )}

        {/* Connect/Disconnect Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onConnect(platform.id)}
          className={`w-full py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
            platform.connected
              ? "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
              : `${colors.button} text-white shadow-lg`
          }`}
        >
          {platform.connected ? (
            <>
              <X className="w-4 h-4" />
              Desconectar
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Conectar Cuenta
            </>
          )}
        </motion.button>

        {platform.connected && (
          <button className="w-full mt-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2 group">
            <span>Ver Analíticas Detalladas</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </motion.div>
  );
}