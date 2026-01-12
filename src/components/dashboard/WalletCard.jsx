import React from "react";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, ArrowUpRight, Coins } from "lucide-react";

export default function WalletCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-[#111113] rounded-2xl border border-white/5 overflow-hidden"
    >
      {/* Header with Gradient */}
      <div className="p-6 bg-gradient-to-br from-emerald-500/10 via-transparent to-purple-500/10 relative">
        <div className="absolute top-4 right-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-2">Saldo Disponible</div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold">$2,847</span>
          <span className="text-lg text-gray-500">.32</span>
        </div>

        {/* Growth Indicator */}
        <div className="flex items-center gap-2 mt-3">
          <div className="flex items-center gap-1 text-sm text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <span>+$342.18</span>
          </div>
          <span className="text-xs text-gray-500">este mes</span>
        </div>
      </div>

      {/* Details */}
      <div className="p-6 pt-4">
        {/* EVA Coins */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Coins className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <div className="text-sm font-medium">Monedas EVA</div>
              <div className="text-xs text-gray-500">Créditos Bonus</div>
            </div>
          </div>
          <div className="text-lg font-bold text-orange-400">1,250</div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 rounded-xl bg-[#0a0a0b]">
            <div className="text-xs text-gray-500 mb-1">Pendiente</div>
            <div className="text-lg font-semibold">$486</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-[#0a0a0b]">
            <div className="text-xs text-gray-500 mb-1">Histórico</div>
            <div className="text-lg font-semibold">$12.4K</div>
          </div>
        </div>

        {/* Withdraw Button */}
        <button className="w-full mt-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium text-sm hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2">
          <ArrowUpRight className="w-4 h-4" />
          Retirar Fondos
        </button>
      </div>
    </motion.div>
  );
}