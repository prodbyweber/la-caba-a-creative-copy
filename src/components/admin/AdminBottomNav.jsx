import React from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Calendar, Inbox, Monitor, Film } from "lucide-react";
import { createPageUrl } from "@/utils";

const items = [
  { icon: LayoutDashboard, label: "Dashboard", page: "AdminDashboard" },
  { icon: Users,           label: "Creadores",  page: "ArtistPanelList" },
  { icon: Calendar,        label: "Calendario",  page: "Calendars" },
  { icon: Inbox,           label: "Solicitudes", page: "ContactLeads" },
  { icon: Monitor,         label: "Design",     page: "DesignEditor" },
  { icon: Film,            label: "Weber",      page: "WeberAdmin" },
];

export default function AdminBottomNav() {
  const location = useLocation();

  const isActive = (page) => location.pathname.toLowerCase().includes(page.toLowerCase());

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      style={{
        background: "#0a0a0b",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 14px)",
      }}
    >
      <div className="flex items-center justify-around px-2 pt-3 pb-3">
        {items.map((item) => {
          const active = isActive(item.page);
          const Icon = item.icon;
          return (
            <Link key={item.label} to={createPageUrl(item.page)} className="flex-1">
              <button className="flex flex-col items-center gap-1 w-full py-1.5">
                <div className="relative">
                  <Icon
                    className="w-6 h-6 relative z-10 transition-colors"
                    style={{ color: active ? "white" : "rgba(255,255,255,0.3)" }}
                  />
                  {active && (
                    <motion.div
                      layoutId="adminNavDot"
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white"
                    />
                  )}
                </div>
                <span
                  className="text-[10px] font-medium transition-colors leading-tight"
                  style={{ color: active ? "white" : "rgba(255,255,255,0.3)" }}
                >
                  {item.label}
                </span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}