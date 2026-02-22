import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, Info } from "lucide-react";

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
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 border border-white/10 rounded text-xs text-gray-300 whitespace-nowrap z-10">
          {text}
        </div>
      )}
    </div>
  );
};

export default function RevenueEstimate() {
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulación: orquestar datos de Spotify, YouTube, etc.
    const timer = setTimeout(() => {
      setRevenue({
        estimated_30d: 1840.50,
        breakdown: {
          spotify: 1200.75,
          youtube: 450.25,
          other: 189.50
        }
      });
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="bg-[#111113] rounded-2xl border border-white/5 p-6 h-40 animate-pulse" />
    );
  }

  if (!revenue) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold">Estimación de Ingresos</h3>
            <Tooltip text="Estimación aproximada basada en royalties de plataformas musicales. Puede variar según cambios de tarifa.">
              <Info className="w-4 h-4 text-gray-500 hover:text-gray-300" />
            </Tooltip>
          </div>
          <p className="text-sm text-gray-500">Últimos 30 días</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
          <DollarSign className="w-6 h-6 text-blue-400" />
        </div>
      </div>

      <div className="mb-6">
        <div className="text-4xl font-bold text-blue-400">
          ${revenue.estimated_30d.toFixed(2)}
        </div>
        <p className="text-xs text-gray-500 mt-1">Aproximadamente 30 días</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <span className="text-sm text-gray-300">Spotify</span>
          <span className="font-medium text-green-400">
            ${revenue.breakdown.spotify.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <span className="text-sm text-gray-300">YouTube</span>
          <span className="font-medium text-red-400">
            ${revenue.breakdown.youtube.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <span className="text-sm text-gray-300">Otras plataformas</span>
          <span className="font-medium text-gray-400">
            ${revenue.breakdown.other.toFixed(2)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}