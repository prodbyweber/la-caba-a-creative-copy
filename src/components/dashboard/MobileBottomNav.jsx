import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Compass, LayoutDashboard, Music2 } from "lucide-react";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

export default function MobileBottomNav({ artistId, isAdmin }) {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(auth => setIsLoggedIn(auth)).catch(() => setIsLoggedIn(false));
  }, []);

  const isActive = (page) => location.pathname.includes(page.split("?")[0]);

  const catalogPage = isLoggedIn
    ? (artistId ? `ArtistDashboard?artistId=${artistId}` : "ArtistDashboard")
    : "GuestCatalogPreview";

  const thirdItem = isAdmin
    ? { icon: LayoutDashboard, label: "Admin", page: "AdminDashboard", highlight: true }
    : { icon: BookOpen, label: "Tu catálogo", page: catalogPage, highlight: true };

  const items = [
    { icon: Home, label: "Inicio", page: "Landing" },
    { icon: Music2, label: "Beats", page: "beats" },
    { icon: Compass, label: "Explorar", page: "Explorar" },
    thirdItem,
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        background: "#0a0a0b",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
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