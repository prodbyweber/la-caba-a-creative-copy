import React from "react";

/**
 * Mini paneles animados de "Cómo funciona". Solo CSS: sin imágenes ni vídeos.
 * Las animaciones arrancan cuando la tarjeta recibe .is-live.
 */
export default function MiniPanel({ kind = "genres" }) {
  if (kind === "mood") {
    return (
      <div className="ccl-mini-p ccl-mini-p--mood" aria-hidden="true">
        <div className="ccl-mp__chips">
          <span className="ccl-mp__chip">Sensual</span>
          <span className="ccl-mp__chip">Nocturno</span>
          <span className="ccl-mp__chip">Épico</span>
        </div>
        <div className="ccl-mp__link">
          <i className="ccl-mp__linkbar" />
          <span>tu-demo.mp3</span>
          <b className="ccl-mp__check">✓</b>
        </div>
      </div>
    );
  }

  if (kind === "mix") {
    return (
      <div className="ccl-mini-p ccl-mini-p--mix" aria-hidden="true">
        <div className="ccl-mp__eq">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="ccl-mp__faders">
          <span className="ccl-mp__fader">
            <b />
          </span>
          <span className="ccl-mp__fader">
            <b />
          </span>
          <span className="ccl-mp__fader">
            <b />
          </span>
        </div>
      </div>
    );
  }

  if (kind === "checklist") {
    return (
      <div className="ccl-mini-p ccl-mini-p--check" aria-hidden="true">
        {["Másters", "Portada", "Créditos", "Fecha de salida"].map((label, i) => (
          <div className="ccl-mp__row" key={label} style={{ "--d": `${i * 900}ms` }}>
            <b className="ccl-mp__box">✓</b>
            <span>{label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="ccl-mini-p ccl-mini-p--genres" aria-hidden="true">
      <span className="ccl-mp__pill">Latin Urban</span>
      <span className="ccl-mp__pill">Afrobeats</span>
      <span className="ccl-mp__pill">House</span>
      <span className="ccl-mp__pill">Hip Hop</span>
    </div>
  );
}