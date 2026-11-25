import React from "react";

export default function FullAccessNav({ onApply }) {
  return (
    <header className="fa-nav">
      <a href="/" className="fa-nav__brand">
        Cabaña Creative
      </a>
      <button type="button" className="fa-nav__link" onClick={onApply}>
        Aplicar →
      </button>
    </header>
  );
}