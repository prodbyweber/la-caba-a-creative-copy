import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Menu, X } from "lucide-react";

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6966ddf48947f217e81ea27c/2b10817bf_LOGOPNGTRANSPARENTCABANACREATIVE.png" 
              alt="La Cabaña Creative"
              className="h-12 w-auto"
            />
            <span className="text-xl font-semibold tracking-tight hidden sm:block">
              La Cabaña <span className="text-orange-500">Creative</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#platform" className="text-sm text-gray-400 hover:text-white transition-colors">Plataforma</a>
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Características</a>
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Precios</a>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              to={createPageUrl("Dashboard")}
              className="hidden sm:block text-sm text-gray-400 hover:text-white transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link 
              to={createPageUrl("Dashboard")}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
            >
              Comenzar
            </Link>
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
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6966ddf48947f217e81ea27c/2b10817bf_LOGOPNGTRANSPARENTCABANACREATIVE.png" 
                    alt="La Cabaña Creative"
                    className="h-10 w-auto"
                  />
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-2 text-gray-400">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col gap-6">
                <a href="#platform" onClick={() => setMobileOpen(false)} className="text-2xl font-light text-gray-300 hover:text-white">Plataforma</a>
                <a href="#features" onClick={() => setMobileOpen(false)} className="text-2xl font-light text-gray-300 hover:text-white">Características</a>
                <a href="#pricing" onClick={() => setMobileOpen(false)} className="text-2xl font-light text-gray-300 hover:text-white">Precios</a>
                <div className="pt-6 border-t border-white/10">
                  <Link 
                    to={createPageUrl("Dashboard")}
                    className="block w-full py-4 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-center font-medium"
                  >
                    Comenzar
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}