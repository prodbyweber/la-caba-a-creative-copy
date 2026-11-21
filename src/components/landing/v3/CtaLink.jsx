import React from "react";
import { Link } from "react-router-dom";
import { scrollToSection } from "./scrollToSection";

/** Botón que navega a una ruta o hace scroll a una sección (#id). */
export default function CtaLink({ to, className = "", children, onNavigate }) {
  const target = to || "";
  const isHash = target.startsWith("#");

  if (isHash) {
    return (
      <button
        type="button"
        className={className}
        onClick={() => {
          scrollToSection(target.slice(1));
          onNavigate?.();
        }}
      >
        {children}
      </button>
    );
  }

  return (
    <Link to={target || "/"} className={className} onClick={onNavigate}>
      {children}
    </Link>
  );
}