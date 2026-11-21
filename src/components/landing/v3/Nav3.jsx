import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { LOGO, NAV_ITEMS, PROJECT_CTA } from "./constants";

export default function Nav3({ settings }) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const go = (e, id) => {
    const el = document.getElementById(id);
    setOpen(false);
    if (!el) return;
    e.preventDefault();
    setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  return (
    <>
      <header className={`ccl-nav ${solid ? "is-solid" : ""}`}>
        <div className="ccl-wrap ccl-nav__inner">
          <a
            href="#top"
            className="ccl-nav__logo"
            aria-label="Cabaña Creative — inicio"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <img src={LOGO} alt="Cabaña Creative" />
          </a>

          <nav className="ccl-nav__links" aria-label="Navegación principal">
            {NAV_ITEMS.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="ccl-nav__link" onClick={(e) => go(e, item.id)}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="ccl-nav__actions">
            <Link to={PROJECT_CTA} className="ccl-btn ccl-btn--primary ccl-btn--sm">
              Enviar mi proyecto
            </Link>
            <button
              type="button"
              className="ccl-nav__burger"
              aria-label="Abrir menú"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="ccl-menu" role="dialog" aria-modal="true" aria-label="Menú">
          <div className="ccl-menu__top">
            <span className="ccl-menu__logo">
              <img src={LOGO} alt="Cabaña Creative" />
            </span>
            <button type="button" className="ccl-nav__burger" aria-label="Cerrar menú" onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <nav className="ccl-menu__nav">
            {NAV_ITEMS.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="ccl-menu__link" onClick={(e) => go(e, item.id)}>
                {item.label}
                <ArrowUpRight size={18} />
              </a>
            ))}
          </nav>

          <div className="ccl-menu__ctas">
            <Link to={PROJECT_CTA} className="ccl-btn ccl-btn--primary ccl-btn--block" onClick={() => setOpen(false)}>
              Enviar mi proyecto
            </Link>
            <Link
              to={settings?.login_url || "/login"}
              className="ccl-btn ccl-btn--ghost ccl-btn--block"
              onClick={() => setOpen(false)}
            >
              {settings?.login_label || "Acceder"}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}