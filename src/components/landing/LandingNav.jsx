import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Menu, X, LogOut, Home } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [logoVisible, setLogoVisible] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
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

  const handleAccountClick = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (currentUser?.role === 'admin') {
        navigate(createPageUrl("AdminDashboard"));
      } else {
        navigate(createPageUrl("Dashboard"));
      }
    } catch (error) {
      base44.auth.redirectToLogin(window.location.href);
    }
  };

  const handleLogout = async () => {
    await base44.auth.logout(createPageUrl("Landing"));
  };

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight;
      setScrolled(window.scrollY > 60);
      // Logo aparece justo al terminar el scroll del hero (>= 95% del hero height)
      setLogoVisible(window.scrollY >= heroHeight * 0.9);
    };
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
    { label: "Pricing", url: createPageUrl("Pricing"), key: "pricing" },
    { label: "Quiénes Somos", id: "team", key: "quienes_somos" },
    { label: "Artistas", id: "stories", key: "artistas" },
    { label: "ADN de Marca", url: adnMarcaLink, key: "adn_marca" },
    { label: "Exploración", id: "exploracion", key: "exploracion" },
    { label: "Comenzar", id: "offers", highlight: true, key: "comenzar" }
  ].filter(item => visibleMenuButtons[item.key] !== false);

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
          <Link to={createPageUrl("Landing")} className="flex items-center gap-2">
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -16, scale: 0.85 }}
              animate={logoVisible
                ? { opacity: 1, x: 0, scale: 1 }
                : { opacity: 0, x: -16, scale: 0.85 }
              }
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <img 
                src="https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png" 
                alt="La Cabaña Creative"
                className="h-10 w-auto"
              />
              <div style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 900, lineHeight: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{ letterSpacing: '-0.04em', display: 'inline-flex', alignItems: 'flex-start', lineHeight: 1, color: '#ff5833', fontWeight: 900, fontSize: '1.1rem' }}>
                  Cabaña<sup style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.55rem', fontWeight: 400, marginLeft: '3px', verticalAlign: 'top', position: 'relative', top: '2px' }}>®</sup>
                </span>
                <span style={{ letterSpacing: '-0.04em', display: 'block', lineHeight: 1, color: 'white', fontWeight: 900, fontSize: '1.1rem' }}>Creative</span>
              </div>
            </motion.div>
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
          </div>

          <div className="flex items-center gap-4">
            {/* Desktop Account Menu */}
            {user ? (
              <div className="hidden sm:relative sm:flex sm:items-center">
                <button
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                      {user.full_name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <span className="text-gray-400 text-sm">{user.full_name?.split(' ')[0]}</span>
                </button>

                <AnimatePresence>
                  {accountMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-12 bg-[#1a1a1c] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 min-w-[180px]"
                    >
                      <button
                        onClick={() => { handleAccountClick(); setAccountMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-colors text-left"
                      >
                        <Home className="w-4 h-4" />
                        Dashboard
                      </button>
                      <div className="border-t border-white/5" />
                      <button
                        onClick={() => { handleLogout(); setAccountMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => base44.auth.redirectToLogin(window.location.href)}
                className="hidden sm:block px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-gray-100 transition-colors"
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
                <div className="pt-6 border-t border-white/10 space-y-2">
                  {user ? (
                    <>
                      <button
                        onClick={handleAccountClick}
                        className="flex items-center gap-3 w-full py-3 px-4 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
                      >
                        <Home className="w-4 h-4" />
                        Dashboard
                      </button>
                      <button
                        onClick={() => { handleLogout(); setMobileOpen(false); }}
                        className="flex items-center gap-3 w-full py-3 px-4 rounded-lg bg-red-500/10 text-red-400 font-medium hover:bg-red-500/20 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => base44.auth.redirectToLogin(window.location.href)}
                      className="block w-full py-3 rounded-lg bg-white text-black text-center font-medium hover:bg-gray-100 transition-colors"
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