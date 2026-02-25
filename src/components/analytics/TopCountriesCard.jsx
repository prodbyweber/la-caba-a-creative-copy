import React from "react";
import { motion } from "framer-motion";
import { Globe, Users } from "lucide-react";

const topCountriesData = [
  { name: "España", flag: "🇪🇸", score: 289100 },
  { name: "México", flag: "🇲🇽", score: 221000 },
  { name: "Argentina", flag: "🇦🇷", score: 183900 },
  { name: "Colombia", flag: "🇨🇴", score: 156700 },
  { name: "Chile", flag: "🇨🇱", score: 114600 },
  { name: "Perú", flag: "🇵🇪", score: 100950 },
];

export default function TopCountriesCard() {
  const totalScore = topCountriesData.reduce((sum, c) => sum + c.score, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="lg:col-span-2 bg-[#111113] rounded-lg sm:rounded-xl border border-white/5 p-2 sm:p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs sm:text-sm font-bold flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-400" />
          Top Países
        </h3>
        <span className="text-[9px] text-gray-400">Total: {(totalScore / 1000).toFixed(0)}K</span>
      </div>

      {/* Desktop Grid View */}
      <div className="hidden lg:grid lg:grid-cols-6 gap-3 mb-4">
        {topCountriesData.map((country, i) => {
          const percentage = ((country.score / totalScore) * 100).toFixed(1);
          return (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-emerald-500/30 hover:from-white/10 transition-all"
            >
              <div className="text-3xl">{country.flag}</div>
              <div className="text-center">
                <div className="text-[10px] font-semibold text-white mb-1">{country.name}</div>
                <div className="text-xs font-bold text-emerald-400 mb-2">{(country.score / 1000).toFixed(0)}K</div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-[9px] text-gray-400 mt-1">{percentage}%</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Mobile Grid View - Sin cambios */}
      <div className="lg:hidden grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2">
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

      {/* Desktop List View Alternative - Compact ranking */}
      <div className="hidden lg:block mt-4 pt-4 border-t border-white/5">
        <div className="space-y-2">
          {topCountriesData.slice(0, 3).map((country, i) => {
            const percentage = ((country.score / totalScore) * 100).toFixed(1);
            return (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-2 flex-1">
                  <div className="text-lg">{country.flag}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-semibold text-white">{country.name}</div>
                    <div className="h-0.5 bg-white/10 rounded-full overflow-hidden mt-1">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-400">{(country.score / 1000).toFixed(0)}K</div>
                  <div className="text-[8px] text-gray-400">{percentage}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}