import React from "react";
import { motion } from "framer-motion";
import { Menu, Bell, Search, Settings, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function DashboardNav({ onMenuClick }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center justify-between px-6 h-16">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <Link to={createPageUrl("Landing")} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold">LC</span>
            </div>
            <span className="text-lg font-semibold tracking-tight hidden sm:block">
              La Cabaña
            </span>
          </Link>
        </div>

        {/* Center - Search */}
        <div className="hidden md:flex items-center flex-1 max-w-xl mx-8">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar clips, pistas, análisis..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <Link to={createPageUrl("AdminDashboard")}>
            <button 
              className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center gap-2"
              title="Volver al Panel Admin"
            >
              <Home className="w-4 h-4" />
              <span className="text-xs font-medium hidden sm:inline">Admin</span>
            </button>
          </Link>
          <Link to={createPageUrl("Landing")}>
            <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
              <Home className="w-5 h-5" />
            </button>
          </Link>
          <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
            <Search className="w-5 h-5 md:hidden" />
            <Bell className="w-5 h-5 hidden md:block" />
          </button>
          <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all hidden sm:block">
            <Settings className="w-5 h-5" />
          </button>
          
          {/* Avatar */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold cursor-pointer hover:scale-105 transition-transform">
            JV
          </div>
        </div>
      </div>
    </nav>
  );
}