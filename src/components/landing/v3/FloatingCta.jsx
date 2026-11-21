import React, { useEffect, useState } from "react";
import CtaLink from "./CtaLink";

/** Botón flotante en móvil: aparece al pasar el hero y se esconde en "Tu brief" y en el cierre. */
export default function FloatingCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;

    const state = { hero: true, brief: false, final: false };
    const sync = () => setShow(!state.hero && !state.brief && !state.final);

    const watch = (id, key) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const io = new IntersectionObserver(
        (entries) => {
          state[key] = entries[0].isIntersecting;
          sync();
        },
        { threshold: 0.12 }
      );
      io.observe(el);
      return io;
    };

    const observers = [
      watch("top", "hero"),
      watch("comenzar", "brief"),
      watch("final", "final"),
    ].filter(Boolean);

    return () => observers.forEach((io) => io.disconnect());
  }, []);

  return (
    <div className={`ccl-float ${show ? "is-on" : ""}`}>
      <CtaLink to="#comenzar" className="ccl-btn ccl-btn--primary ccl-float__btn">
        Enviar proyecto
      </CtaLink>
    </div>
  );
}