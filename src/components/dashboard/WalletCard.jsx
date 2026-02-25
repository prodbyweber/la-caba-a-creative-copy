import React from "react";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, ArrowUpRight, Coins } from "lucide-react";

export default function WalletCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-[#111113] rounded-lg border border-white/5 p-2"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <div className="text-[7px] text-gray-500 mb-0.5">Saldo</div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-sm font-bold">€2,847</span>
            <span className="text-[8px] text-gray-500">.32</span>
          </div>
          <div className="flex items-center gap-0.5 mt-0.5">
            <TrendingUp className="w-2 h-2 text-emerald-400" />
            <span className="text-[7px] text-emerald-400 font-medium">+€342</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-1">
          <div className="text-center p-1 rounded bg-[#0a0a0b]">
            <div className="text-[7px] text-gray-500">Pending</div>
            <div className="text-[8px] font-semibold">€486</div>
          </div>
          <div className="text-center p-1 rounded bg-[#0a0a0b]">
            <div className="text-[7px] text-gray-500">Total</div>
            <div className="text-[8px] font-semibold">€12K</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}