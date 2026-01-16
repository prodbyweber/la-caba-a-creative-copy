import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  Calendar,
  MessageSquare,
  GitPullRequest,
  Video,
  Settings,
  Menu,
  X,
  Search,
  Music2,
  TrendingUp,
  Home
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", page: "AdminDashboard" },
  { icon: Users, label: "Artists", page: "Artists" },
  { icon: FolderKanban, label: "Projects", page: "Projects" },
  { icon: Music2, label: "Tracks", page: "Tracks" },
  { icon: Calendar, label: "Calendars", page: "Calendars" },
  { icon: GitPullRequest, label: "Revisions", page: "Revisions" },
  { icon: TrendingUp, label: "Contabilidad", page: "Accounting" },
  { icon: MessageSquare, label: "Notes", page: "Notes" },
  { icon: Video, label: "Content", page: "ContentCalendar" },
  { icon: Settings, label: "Landing Editor", page: "LandingEditor" },
  { icon: Settings, label: "Settings", page: "Settings" }
];

export default function AdminLayout({ children, activePage }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-white"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            <div className="flex items-center gap-3">
              <Link to={createPageUrl("Landing")}>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-purple-600 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
                  <span className="text-white font-bold text-sm">W</span>
                </div>
              </Link>
              <div className="hidden sm:block">
                <div className="text-sm font-bold">Prod. by Weber</div>
                <div className="text-[10px] text-gray-500">La Cabaña Creative</div>
              </div>
            </div>
            </div>

            {/* Homepage Button */}
            <Link to={createPageUrl("Landing")}>
            <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-colors">
              <Home className="w-4 h-4" />
              <span>Homepage</span>
            </button>
            </Link>
            </div>

          {/* Global Search */}
          <div className="hidden md:flex items-center flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search artists, projects, tracks..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold cursor-pointer">
              W
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-16 bottom-0 w-64 bg-[#0a0a0b] border-r border-white/5 z-40 transition-transform lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          <div className="flex-1 px-4 py-6 overflow-y-auto">
            <nav className="space-y-1">
              {navItems.map((item, i) => {
                const isActive = activePage === item.page;
                return (
                  <Link key={i} to={createPageUrl(item.page)} onClick={() => setSidebarOpen(false)}>
                    <motion.button
                      whileHover={{ x: 4 }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </motion.button>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Section */}
          <div className="p-4 border-t border-white/5">
            <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <div className="text-xs font-semibold text-white mb-1">Admin Panel</div>
              <div className="text-[10px] text-gray-400">Full Access Mode</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64 pt-16">
        {children}
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}