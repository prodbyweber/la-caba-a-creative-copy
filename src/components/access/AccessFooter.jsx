import React from "react";
import { Link } from "react-router-dom";

const LOGO = "https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png";

// Footer minimalista para /access.
// Usa solo links y rutas que ya existen en la aplicación.
export default function AccessFooter() {
  return (
    <footer className="bg-[#080808] border-t border-white/5 pt-14 pb-10 px-6 sm:px-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-10">
          {/* Marca */}
          <div className="max-w-xs">
            <img src={LOGO} alt="Cabaña Creative" className="h-9 w-auto opacity-80 mb-4" />
            <p className="text-white/35 text-xs leading-relaxed">
              El universo audiovisual de los artistas. Madrid.
            </p>
          </div>

          {/* Navegación */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-12">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40 mb-3">Plataforma</p>
              <ul className="space-y-2.5">
                <li><Link to="/Explorar" className="text-xs text-white/55 hover:text-white transition-colors">Explorar</Link></li>
                <li><Link to="/beats" className="text-xs text-white/55 hover:text-white transition-colors">Beats</Link></li>
                <li><Link to="/start" className="text-xs text-white/55 hover:text-white transition-colors">Inicio</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40 mb-3">Acceso</p>
              <ul className="space-y-2.5">
                <li><Link to="/register" className="text-xs text-white/55 hover:text-white transition-colors">Regístrate</Link></li>
                <li><Link to="/login" className="text-xs text-white/55 hover:text-white transition-colors">Iniciar sesión</Link></li>
                <li><Link to="/Marcas" className="text-xs text-white/55 hover:text-white transition-colors">Marcas</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40 mb-3">Legal</p>
              <ul className="space-y-2.5">
                <li><Link to="/politica-de-privacidad" className="text-xs text-white/55 hover:text-white transition-colors">Privacidad</Link></li>
                <li><Link to="/aviso-legal" className="text-xs text-white/55 hover:text-white transition-colors">Aviso legal</Link></li>
                <li><Link to="/politica-de-cookies" className="text-xs text-white/55 hover:text-white transition-colors">Cookies</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-white/25">© {new Date().getFullYear()} Cabaña Creative</p>
          <p className="text-[10px] text-white/25">Madrid · España</p>
        </div>
      </div>
    </footer>
  );
}