import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a0b]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">LC</span>
              </div>
              <span className="text-xl font-semibold tracking-tight">
                La Cabaña <span className="text-emerald-400">Creative</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm max-w-sm leading-relaxed mb-3">
              Formación, dirección creativa y producción musical para artistas que quieren ir en serio.
            </p>
            <p className="text-xs text-gray-600 italic">
              Algunos servicios requieren validación previa
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Servicios</h4>
            <ul className="space-y-3">
              <li><a href="#ofertas" className="text-sm text-gray-500 hover:text-white transition-colors">Cursos</a></li>
              <li><a href="#ofertas" className="text-sm text-gray-500 hover:text-white transition-colors">Consultoría</a></li>
              <li><a href="#ofertas" className="text-sm text-gray-500 hover:text-white transition-colors">Producción</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Contacto</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Instagram</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">YouTube</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Email</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} La Cabaña Creative. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-gray-600 hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="text-sm text-gray-600 hover:text-white transition-colors">Términos</a>
          </div>
        </div>
      </div>
    </footer>
  );
}