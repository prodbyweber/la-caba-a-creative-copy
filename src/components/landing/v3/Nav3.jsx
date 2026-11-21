import React from "react";
import { Link } from "react-router-dom";
import { LOGO, REGISTER_CTA } from "./constants";
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
          <a
            href="#generos"
            className="ccl-nav__link"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("generos");
            }}
          >
            Explorar
          </a>
          <Link to={REGISTER_CTA} className="ccl-btn ccl-btn--primary ccl-btn--sm">
            Registrarse
          </Link>
        </nav>
      </div>
    </header>
  );
}