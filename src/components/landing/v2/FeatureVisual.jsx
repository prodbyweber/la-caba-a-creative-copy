import React from "react";
import { Lock, Play, Check } from "lucide-react";

/** Mini interfaz animada de cada tarjeta de funciones. */
export default function FeatureVisual({ visual, creators = [] }) {
  const covers = creators.filter((c) => c.cover_url);
  const c1 = covers[0];
  const c2 = covers[1];
  const c3 = covers[2];

  if (visual === "player") {
    const bars = [14, 26, 18, 34, 22, 30, 12, 24, 20, 32, 16, 28, 10, 22, 18, 30, 14, 26];
    return (
      <div className="cc-ui">
        <div className="cc-ui__wave" aria-hidden="true">
          {bars.map((h, i) => (
            <i key={i} className={i < 8 ? "on" : ""} style={{ height: `${h}px` }} />
          ))}
        </div>
        <div className="cc-ui__row">
          <span className="cc-ui__cov" style={{ display: "grid", placeItems: "center" }}>
            <Play size={10} fill="#fff" color="#fff" />
          </span>
          <div className="cc-ui__lines">
            <span />
            <span />
          </div>
          <span className="cc-ui__time">1:24 / 3:10</span>
        </div>
      </div>
    );
  }

  if (visual === "artwork") {
    return (
      <div className="cc-ui">
        <div className="cc-ui__meta">
          {c1?.cover_url ? (
            <img src={c1.cover_url} alt={`Portada de ${c1.track_title || c1.name}`} loading="lazy" />
          ) : (
            <span className="cc-ui__cov" style={{ width: 56, height: 56 }} />
          )}
          <div className="cc-ui__lines">
            <span />
            <span />
            <span />
          </div>
        </div>
        <div className="cc-ui__tags">
          <span className="cc-ui__tag">Portada</span>
          <span className="cc-ui__tag">Créditos</span>
          <span className="cc-ui__tag">BPM</span>
          <span className="cc-ui__tag">Tonalidad</span>
        </div>
      </div>
    );
  }

  if (visual === "beats") {
    return (
      <div className="cc-ui">
        <div className="cc-ui__row">
          {c2?.cover_url ? (
            <img src={c2.cover_url} alt="" className="cc-ui__cov" loading="lazy" />
          ) : (
            <span className="cc-ui__cov" />
          )}
          <div className="cc-ui__lines">
            <span />
            <span />
          </div>
          <Play size={10} color="#ff5833" fill="#ff5833" />
        </div>
        <div className="cc-ui__row">
          {c3?.cover_url ? (
            <img src={c3.cover_url} alt="" className="cc-ui__cov" loading="lazy" />
          ) : (
            <span className="cc-ui__cov" />
          )}
          <div className="cc-ui__lines">
            <span />
            <span />
          </div>
          <Lock size={10} color="rgba(241,239,232,0.45)" />
        </div>
        <div className="cc-ui__lock">
          <Lock size={9} /> Exclusivo para miembros
        </div>
      </div>
    );
  }

  if (visual === "roadmap") {
    return (
      <div className="cc-ui">
        <div className="cc-ui__check">
          <span className="dot done">
            <Check size={7} color="#fff" />
          </span>
          <strong>Mezcla final</strong>
        </div>
        <div className="cc-ui__check">
          <span className="dot done">
            <Check size={7} color="#fff" />
          </span>
          <strong>Portada aprobada</strong>
        </div>
        <div className="cc-ui__check">
          <span className="dot" />
          <span>Pre-save del single</span>
        </div>
        <div className="cc-ui__check">
          <span className="dot" />
          <span>Plan de contenido</span>
        </div>
      </div>
    );
  }

  if (visual === "workshop") {
    return (
      <div className="cc-ui">
        <div className="cc-ui__meta" style={{ alignItems: "start" }}>
          <span
            style={{
              width: 56,
              height: 56,
              borderRadius: 8,
              background: "linear-gradient(135deg, rgba(255,88,51,0.9), rgba(255,88,51,0.25))",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Play size={16} fill="#fff" color="#fff" />
          </span>
          <div className="cc-ui__lines">
            <span />
            <span />
            <span />
          </div>
        </div>
        <div className="cc-ui__tags">
          <span className="cc-ui__tag">Grabación</span>
          <span className="cc-ui__tag">Mezcla</span>
          <span className="cc-ui__tag">Sesión guiada</span>
        </div>
      </div>
    );
  }

  // catalog
  return (
    <div className="cc-ui">
      {[c1, c2, c3].map((c, i) => (
        <div className="cc-ui__row" key={i}>
          {c?.cover_url ? (
            <img src={c.cover_url} alt="" className="cc-ui__cov" loading="lazy" />
          ) : (
            <span className="cc-ui__cov" />
          )}
          <div className="cc-ui__lines">
            <span />
            <span />
          </div>
          <span className="cc-ui__time">{["3:12", "2:48", "3:35"][i]}</span>
        </div>
      ))}
    </div>
  );
}