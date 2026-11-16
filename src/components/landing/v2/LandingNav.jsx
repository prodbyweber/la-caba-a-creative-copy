import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import CtaButton from "./CtaButton";

export default function LandingNav({ settings, nav = [], onAccess }) {
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 24);
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
    if (!el) return;
    e.preventDefault();
    setOpen(false);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <header className={`cc-nav ${compact ? "is-compact" : ""}`}>
        <div className="cc-wrap cc-nav__inner">
          <a
            href="#top"
            className="cc-nav__brand"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <span className="cc-nav__dot" aria-hidden="true" />
            Cabaña Creative
          </a>

          <nav className="cc-nav__links" aria-label="Navegación principal">
            {nav.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="cc-nav__link"
                onClick={(e) => go(e, item.id)}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="cc-nav__actions">
            <CtaButton
              label={settings?.request_label || "Solicitar acceso"}
              variant="ghost"
              className="cc-btn--sm"
              onAccess={onAccess}
            />
            <CtaButton
              label={settings?.login_label || "Acceder"}
              href={settings?.login_url || "/login"}
              variant="primary"
              className="cc-btn--sm"
            />
          </div>

          <button
            type="button"
            className="cc-nav__burger"
            aria-label="Abrir menú"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu size={19} />
          </button>
        </div>
      </header>

      {open && (
        <div className="cc-nav__mobile" role="dialog" aria-modal="true" aria-label="Menú">
          <div className="cc-nav__mobile-top">
            <span className="cc-nav__brand">
              <span className="cc-nav__dot" aria-hidden="true" />
              Cabaña Creative
            </span>
            <button
              type="button"
              className="cc-nav__burger"
              aria-label="Cerrar menú"
              onClick={() => setOpen(false)}
            >
              <X size={19} />
            </button>
          </div>

          {nav.map((item) => (
            <a key={item.id} href={`#${item.id}`} onClick={(e) => go(e, item.id)}>
              {item.label}
            </a>
          ))}

          <div className="cc-nav__mobile-ctas">
            <CtaButton
              label={settings?.login_label || "Acceder"}
              href={settings?.login_url || "/login"}
              variant="primary"
              className="cc-btn--block"
            />
            <CtaButton
              label={settings?.request_label || "Solicitar acceso"}
              variant="ghost"
              className="cc-btn--block"
              onAccess={onAccess}
            />
          </div>
        </div>
      )}
    </>
  );
}