import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { LOGO } from "./constants";
import { scrollToSection } from "./scrollToSection";
import CtaLink from "./CtaLink";

const LINKS = [
  { id: "proceso", label: "Cómo funciona" },
  { id: "comenzar", label: "Tu brief" },
  { id: "faq", label: "Preguntas frecuentes" },
  { id: "generos", label: "Géneros" },
];

export default function Nav3() {
  const [open, setOpen] = useState(false);

  const go = (id) => {
    setOpen(false);
    scrollToSection(id);
  };

  return (
    <header className="ccl-nav">
      <div className="ccl-nav__inner">
        <a
          href="#top"
          className="ccl-nav__logo"
          aria-label="Cabaña Creative — inicio"
          onClick={(e) => {
            e.preventDefault();
            go("top");
          }}
        >
          <img src={LOGO} alt="Cabaña Creative" />
        </a>

        <div className="ccl-nav__links">
          {LINKS.slice(0, 2).map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="ccl-nav__link ccl-nav__link--desk"
              onClick={(e) => {
                e.preventDefault();
                go(link.id);
              }}
            >
              {link.label}
            </a>
          ))}
          <Link to="/login" className="ccl-nav__link ccl-nav__link--desk">
            Acceder
          </Link>

          <CtaLink to="#comenzar" className="ccl-btn ccl-btn--primary ccl-btn--sm ccl-nav__cta">
            Enviar proyecto
          </CtaLink>

          <button
            type="button"
            className="ccl-nav__burger"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="ccl-nav__sheet">
          {LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="ccl-nav__sheet-link"
              onClick={(e) => {
                e.preventDefault();
                go(link.id);
              }}
            >
              {link.label}
            </a>
          ))}
          <Link to="/login" className="ccl-nav__sheet-link" onClick={() => setOpen(false)}>
            Acceder
          </Link>
        </div>
      )}
    </header>
  );
}