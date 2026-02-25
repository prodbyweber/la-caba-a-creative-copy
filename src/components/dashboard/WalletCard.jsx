import React from "react";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, ArrowUpRight, Coins } from "lucide-react";

export default function WalletCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-[#111113] rounded-xl border border-white/5 p-3"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[9px] text-gray-500 mb-0.5">Saldo</div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-lg font-bold">€2,847</span>
            <span className="text-[10px] text-gray-500">.32</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-2.5 h-2.5 text-emerald-400" />
            <span className="text-[9px] text-emerald-400 font-medium">+€342 este mes</span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-1.5">
          <div className="text-center p-1.5 rounded bg-[#0a0a0b]">
            <div className="text-[8px] text-gray-500">Coins</div>
            <div className="text-[10px] font-bold text-orange-400">1.2K</div>
          </div>
          <div className="text-center p-1.5 rounded bg-[#0a0a0b]">
            <div className="text-[8px] text-gray-500">Pend.</div>
            <div className="text-[10px] font-semibold">€486</div>
          </div>
          <div className="text-center p-1.5 rounded bg-[#0a0a0b]">
            <div className="text-[8px] text-gray-500">Total</div>
            <div className="text-[10px] font-semibold">€12K</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}