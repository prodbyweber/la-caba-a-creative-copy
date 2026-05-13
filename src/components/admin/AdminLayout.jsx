import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Users, 
  Calendar,
  Menu,
  X,
  Home,
  Inbox,
  Monitor,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", page: "AdminDashboard" },
  { icon: Users, label: "Creadores", page: "Artists" },
  { icon: Calendar, label: "Calendars", page: "Calendars" },
  { icon: Monitor, label: "Design Editor", page: "DesignEditor" },
  { icon: Inbox, label: "Solicitudes", page: "ContactLeads" },
];

export default function AdminLayout({ children, activePage }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0b]/90 backdrop-blur-xl border-b border-white/5">
        {/* First row: logo + actions */}
        <div className="flex items-center justify-between px-2 sm:px-4 h-14">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-white"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link to={createPageUrl("Landing")}>
              <img
                src="https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png"
                alt="Cabaña Creative"
                className="h-12 w-auto cursor-pointer hover:scale-105 transition-transform"
              />
            </Link>
            <div className="hidden sm:block">
              <div className="text-[11px] font-bold text-white">Cabaña Creative</div>
              <div className="text-[8px] text-gray-500">Prod. by Weber</div>
            </div>
          </div>

          {/* Desktop nav links — horizontal */}
          <div className="hidden lg:flex items-center gap-0.5 flex-1 mx-6 overflow-x-auto">
            {navItems.map((item, i) => {
              const isActive = activePage === item.page;
              return (
                <Link key={i} to={createPageUrl(item.page)}>
                  <button
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                </Link>
              );
            })}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => { window.scrollTo(0,0); window.location.href = "/start"; }}
              className="w-8 h-8 rounded-full border border-white/10 hover:border-white/25 bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-all cursor-pointer"
              title="Ir a la landing"
            >
              <Home className="w-4 h-4 text-white/50" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <aside className={`fixed left-0 top-14 bottom-0 w-56 bg-[#0a0a0b] border-r border-white/5 z-40 transition-transform lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          <div className="flex-1 px-3 py-3 overflow-y-auto">
            <nav className="space-y-0.5">
              {navItems.map((item, i) => {
                const isActive = activePage === item.page;
                return (
                  <Link key={i} to={createPageUrl(item.page)} onClick={() => setSidebarOpen(false)}>
                    <button
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="p-2.5 border-t border-white/5">
            <div className="px-3 py-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <div className="text-[10px] font-semibold text-white mb-0.5">Admin</div>
              <div className="text-[8px] text-gray-400">Full Access</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content — no left padding on desktop */}
      <main className="pt-14">
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