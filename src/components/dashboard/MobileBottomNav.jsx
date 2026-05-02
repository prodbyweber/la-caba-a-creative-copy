import React from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, BarChart3, Compass } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function MobileBottomNav({ artistId, isAdmin }) {
  const location = useLocation();

  const isActive = (page) => location.pathname.includes(page.split("?")[0]);

  const items = [
    {
      icon: Home,
      label: "Inicio",
      page: "Landing",
    },
    {
      icon: Compass,
      label: "Explorar",
      page: "Explorar",
    },
    {
      icon: BookOpen,
      label: "Tu catálogo",
      page: artistId ? `ArtistDashboard?artistId=${artistId}` : "Dashboard",
      highlight: true,
    },
    {
      icon: BarChart3,
      label: "Análisis",
      page: artistId ? `Analytics?artistId=${artistId}` : "Analytics",
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        background: "rgba(10,10,11,0.96)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-3">
        {items.map((item) => {
          const active = isActive(item.page);
          const Icon = item.icon;
          return (
            <Link key={item.label} to={createPageUrl(item.page)} className="flex-1">
              <button className="flex flex-col items-center gap-1 w-full py-1">
                <div className="relative">
                  {item.highlight && (
                    <div
                      className="absolute inset-0 rounded-full blur-md opacity-40"
                      style={{ background: "rgba(255,88,51,0.5)", transform: "scale(1.8)" }}
                    />
                  )}
                  <Icon
                    className="w-6 h-6 relative z-10 transition-colors"
                    style={{
                      color: active
                        ? item.highlight
                          ? "#ff5833"
                          : "white"
                        : "rgba(255,255,255,0.35)",
                    }}
                  />
                  {active && (
                    <motion.div
                      layoutId="bottomNavDot"
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{
                        background: item.highlight ? "#ff5833" : "white",
                      }}
                    />
                  )}
                </div>
                <span
                  className="text-[10px] font-medium transition-colors leading-tight"
                  style={{
                    color: active
                      ? item.highlight
                        ? "#ff5833"
                        : "white"
                      : "rgba(255,255,255,0.35)",
                    fontFamily: "'Helvetica Neue', sans-serif",
                  }}
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