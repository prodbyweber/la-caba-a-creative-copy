import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Film, 
  Calendar, 
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  X,
  Music2,
  Share2,
  Shield,
  FolderKanban,
  Palette
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function DashboardSidebar({ isOpen, onClose, artistId }) {
  const menuItems = [
    { icon: LayoutDashboard, label: "Panel", active: true, page: artistId ? `ArtistDashboard?artistId=${artistId}` : "Dashboard" },
    { icon: BarChart3, label: "Análisis", page: artistId ? `Analytics?artistId=${artistId}` : "Analytics" },
    { icon: Film, label: "Clips", page: artistId ? `Clips?artistId=${artistId}` : "Clips" },
    { icon: Music2, label: "Tracks", page: artistId ? `ArtistTracks?artistId=${artistId}` : "Tracks" },
    { icon: FolderKanban, label: "Proyectos", page: artistId ? `ArtistProjects?artistId=${artistId}` : "Projects" },
    { icon: Share2, label: "Redes Sociales", page: artistId ? `SocialAccounts?artistId=${artistId}` : "SocialAccounts" },
    { icon: Calendar, label: "Calendario", page: artistId ? `Calendars?artistId=${artistId}` : "Calendars" },
    { icon: Palette, label: "ADN de Marca", page: artistId ? `ADNdeMarca?artistId=${artistId}` : "ADNdeMarca" },
  ];

  const bottomItems = [
    { icon: Settings, label: "Configuración" },
    { icon: HelpCircle, label: "Ayuda" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-16 bottom-0 w-64 flex-col bg-[#0a0a0b] border-r border-white/5 z-30">
        <div className="flex-1 px-4 py-6">
          <nav className="space-y-1">
            {menuItems.map((item, i) => (
              item.page ? (
                <Link key={i} to={createPageUrl(item.page)}>
                  <motion.button
                    whileHover={{ x: 4 }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      item.active 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </motion.button>
                </Link>
              ) : (
                <motion.button
                  key={i}
                  whileHover={{ x: 4 }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    item.active 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </motion.button>
              )
            ))}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="px-4 py-6 border-t border-white/5">
          <nav className="space-y-1">
            {bottomItems.map((item, i) => (
              item.page ? (
                <Link key={i} to={createPageUrl(item.page)}>
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-white hover:bg-white/5 transition-all">
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </button>
                </Link>
              ) : (
                <button
                  key={i}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              )
            ))}
            <Link to={createPageUrl("Landing")}>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all">
                <LogOut className="w-5 h-5" />
                Cerrar Sesión
              </button>
            </Link>
          </nav>
        </div>

        {/* Pro Badge */}
        <div className="mx-4 mb-6 p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
          <div className="text-sm font-semibold text-white mb-1">Miembro Pro</div>
          <div className="text-xs text-gray-400 mb-3">Renueva 15 Ene, 2025</div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-[#0a0a0b] border-r border-white/5 z-50 lg:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <img
                    src="https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png"
                    alt="La Cabaña Creative"
                    className="h-10 w-auto"
                  />
                  <div style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 900, lineHeight: 1, display: 'flex', flexDirection: 'column' }}>
                    <span style={{ letterSpacing: '-0.04em', display: 'inline-flex', alignItems: 'flex-start', lineHeight: 1, color: '#ff5833', fontWeight: 900, fontSize: '1rem' }}>
                      Cabaña<sup style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.5rem', fontWeight: 400, lineHeight: 1, marginLeft: '3px', verticalAlign: 'top', position: 'relative', top: '2px' }}>®</sup>
                    </span>
                    <span style={{ letterSpacing: '-0.04em', display: 'block', lineHeight: 1, color: 'white', fontWeight: 900, fontSize: '1rem' }}>Creative</span>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 px-4 py-6">
                <nav className="space-y-1">
                  {menuItems.map((item, i) => (
                    item.page ? (
                      <Link key={i} to={createPageUrl(item.page)}>
                        <button
                          onClick={onClose}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                            item.active 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          {item.label}
                        </button>
                      </Link>
                    ) : (
                      <button
                        key={i}
                        onClick={onClose}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          item.active 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                      </button>
                    )
                  ))}
                </nav>
              </div>

              <div className="px-4 py-6 border-t border-white/5">
                <nav className="space-y-1">
                  {bottomItems.map((item, i) => (
                    item.page ? (
                      <Link key={i} to={createPageUrl(item.page)}>
                        <button
                          onClick={onClose}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                        >
                          <item.icon className="w-5 h-5" />
                          {item.label}
                        </button>
                      </Link>
                    ) : (
                      <button
                        key={i}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                      </button>
                    )
                  ))}
                </nav>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}