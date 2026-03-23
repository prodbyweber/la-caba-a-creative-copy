import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Menu, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const { data: config } = useQuery({
    queryKey: ['landingConfig'],
    queryFn: async () => {
      const configs = await base44.entities.LandingConfig.list();
      return configs.length > 0 ? configs[0] : null;
    }
  });

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      }
    };
    checkUser();
  }, []);

  const handleLogin = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (currentUser?.role === 'admin') {
        navigate(createPageUrl("AdminDashboard"));
      } else {
        alert("Acceso restringido: Solo administradores pueden acceder");
      }
    } catch (error) {
      base44.auth.redirectToLogin(window.location.href);
    }
  };

  const handleAccountClick = () => {
    navigate(createPageUrl("UserProfile"));
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
    setMobileOpen(false);
  };

  const visibleMenuButtons = config?.menu_buttons || {
    quienes_somos: true,
    artistas: true,
    adn_marca: false,
    exploracion: true,
    startups: true,
    comenzar: true
  };

  const adnMarcaLink = config?.adn_marca_link || createPageUrl("ADNdeMarca");

  const navItems = [
    { label: "Servicios", url: createPageUrl("Services"), key: "servicios" },
    { label: "Planes", url: createPageUrl("Planes"), key: "planes" },
    { label: "Quiénes Somos", id: "team", key: "quienes_somos" },
    { label: "Artistas", id: "stories", key: "artistas" },
    { label: "ADN de Marca", url: adnMarcaLink, key: "adn_marca" },
    { label: "Exploración", id: "exploracion", key: "exploracion" },
    { label: "Comenzar", id: "offers", highlight: true, key: "comenzar" }
  ].filter(item => visibleMenuButtons[item.key] !== false);

  const adminNavItems = user?.role === 'admin' ? [
    { label: "Panel de Artista", url: createPageUrl("ArtistPanelList"), key: "artist_panel" }
  ] : [];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled 
            ? "bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-white/5" 
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to={createPageUrl("Landing")} className="flex items-center gap-3">
            <img 
              src="https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png" 
              alt="La Cabaña Creative"
              className="h-16 w-auto"
            />
            <div style={{ fontFamily: "'Pragmatica', 'Franklin Gothic Heavy', 'Arial Black', sans-serif", fontWeight: 900, lineHeight: 1, display: 'flex', flexDirection: 'column', gap: 0, margin: 0, padding: 0 }}>
              <span className="text-white text-xl uppercase" style={{ letterSpacing: '-0.08em', display: 'block', lineHeight: 1, margin: 0, padding: 0 }}>Cabaña</span>
              <span className="text-orange-500 text-xl uppercase" style={{ letterSpacing: '-0.08em', display: 'block', lineHeight: 1, margin: 0, padding: 0 }}>Creative</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              item.highlight ? (
                <button
                  key={item.key}
                  onClick={() => scrollToSection(item.id)}
                  className="px-5 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-all"
                >
                  {item.label}
                </button>
              ) : item.url ? (
                <Link
                  key={item.key}
                  to={item.url}
                  className="text-sm text-gray-400 hover:text-white transition-colors font-medium"
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.key}
                  onClick={() => scrollToSection(item.id)}
                  className="text-sm text-gray-400 hover:text-white transition-colors font-medium"
                >
                  {item.label}
                </button>
              )
            ))}
            {adminNavItems.map((item) => (
              <Link
                key={item.key}
                to={item.url}
                className="text-sm text-white/60 hover:text-white transition-colors font-medium border border-white/20 px-3 py-1.5 rounded-lg hover:bg-white/10"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <button
                onClick={handleAccountClick}
                className="hidden sm:flex items-center gap-2 text-sm hover:text-white transition-colors"
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                    {user.full_name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <span className="text-gray-400">Mi Cuenta</span>
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="hidden sm:block text-sm text-gray-400 hover:text-white transition-colors"
              >
                Iniciar Sesión
              </button>
            )}
            <button 
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0a0a0b]/95 backdrop-blur-xl md:hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-3">
                  <img 
                    src="https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png" 
                    alt="La Cabaña Creative"
                    className="h-12 w-auto"
                  />
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-2 text-gray-400">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col gap-6">
                {navItems.map((item) => (
                  item.url ? (
                    <Link
                      key={item.key}
                      to={item.url}
                      onClick={() => setMobileOpen(false)}
                      className="text-2xl font-light text-left text-gray-300 hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      key={item.key}
                      onClick={() => scrollToSection(item.id)}
                      className={`text-2xl font-light text-left transition-colors ${
                        item.highlight 
                          ? 'text-white font-semibold' 
                          : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  )
                ))}
                {adminNavItems.map((item) => (
                  <Link
                    key={item.key}
                    to={item.url}
                    onClick={() => setMobileOpen(false)}
                    className="text-2xl font-light text-left text-white/70 hover:text-white transition-colors border border-white/20 rounded-lg px-4 py-2"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-6 border-t border-white/10">
                  {user ? (
                    <button
                      onClick={handleAccountClick}
                      className="flex items-center gap-3 w-full py-4 px-5 rounded-full bg-white text-black font-medium hover:bg-gray-100 transition-colors"
                    >
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.full_name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-white/30"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                          {user.full_name?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                      <span>Mi Cuenta</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleLogin}
                      className="block w-full py-4 rounded-full bg-white text-black text-center font-medium hover:bg-gray-100 transition-colors"
                    >
                      Iniciar Sesión
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}