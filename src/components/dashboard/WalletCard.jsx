import React from "react";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, ArrowUpRight, Coins } from "lucide-react";

export default function WalletCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-[#111113] rounded-lg border border-white/5 overflow-hidden"
    >
      {/* Header Compacto */}
      <div className="p-3 bg-gradient-to-br from-emerald-500/10 via-transparent to-purple-500/10 relative">
        <div className="absolute top-2 right-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>

        <div className="text-[10px] text-gray-500 mb-1">Saldo</div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold">€2,847</span>
          <span className="text-sm text-gray-500">.32</span>
        </div>

        {/* Growth Indicator */}
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex items-center gap-1 text-xs text-emerald-400">
            <TrendingUp className="w-3 h-3" />
            <span>+€342</span>
          </div>
          <span className="text-[10px] text-gray-500">este mes</span>
        </div>
      </div>

      {/* Details Compactos */}
      <div className="p-3">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-[#0a0a0b]">
            <div className="text-[10px] text-gray-500 mb-0.5">Coins</div>
            <div className="text-sm font-bold text-orange-400">1.2K</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-[#0a0a0b]">
            <div className="text-[10px] text-gray-500 mb-0.5">Pend.</div>
            <div className="text-sm font-semibold">€486</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-[#0a0a0b]">
            <div className="text-[10px] text-gray-500 mb-0.5">Total</div>
            <div className="text-sm font-semibold">€12K</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}