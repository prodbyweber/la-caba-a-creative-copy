import React from "react";
import { Link } from "react-router-dom";
import { LOGO, LOGIN_CTA, PROJECT_CTA } from "./constants";
import { scrollToSection } from "./scrollToSection";

export default function Nav3() {
  return (
    <header className="ccl-nav">
      <div className="ccl-nav__inner">
        <a
          href="#top"
          className="ccl-nav__logo"
          aria-label="Cabaña Creative — inicio"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection("top");
          }}
        >
          <img src={LOGO} alt="Cabaña Creative" />
        </a>

        <nav className="ccl-nav__links" aria-label="Navegación principal">
          <Link to={LOGIN_CTA} className="ccl-nav__link">
            Inicia Sesión
          </Link>
          <Link to={PROJECT_CTA} className="ccl-btn ccl-btn--primary ccl-btn--sm">
            Enviar proyecto
          </Link>
        </nav>
      </div>
    </header>
  );
}