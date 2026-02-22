import React from "react";
import { motion } from "framer-motion";
import { Menu, Bell, Search, Settings, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function DashboardNav({ onMenuClick, artistName }) {
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
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6966ddf48947f217e81ea27c/2b10817bf_LOGOPNGTRANSPARENTCABANACREATIVE.png" 
              alt="La Cabaña Creative"
              className="h-9 w-auto"
            />
            <span className="text-lg font-semibold tracking-tight hidden sm:block">
              La Cabaña <span className="text-orange-500">Creative</span>
            </span>
          </Link>
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