import React from "react";
import { Play } from "lucide-react";

/**
 * Mockup de la plataforma dentro de un marco de navegador.
 * Usa portadas reales del catálogo con datos de demostración.
 */
export default function PlatformMockup({ creators = [], url = "cabanacreative.es/artist/dashboard" }) {
  const covers = creators.filter((c) => c.cover_url).slice(0, 4);
  const rows = creators.slice(0, 3);

  return (
    <div className="cc-browser">
      <div className="cc-browser__bar">
        <span className="cc-browser__dot" />
        <span className="cc-browser__dot" />
        <span className="cc-browser__dot" />
        <span className="cc-browser__url">{url}</span>
      </div>

      <div className="cc-mock">
        <div className="cc-mock__top">
          <div>
            <div className="cc-mock__title">Mi catálogo</div>
            <div className="cc-mock__sub">Singles · EP · Álbum</div>
          </div>
          <span className="cc-mock__pill">En producción</span>
        </div>

        <div className="cc-mock__grid">
          {covers.map((c) => (
            <div className="cc-mock__card" key={c.track_title || c.name}>
              <img src={c.cover_url} alt={`Portada de ${c.track_title || c.name}`} loading="lazy" />
              <span>{c.track_title || c.name}</span>
            </div>
          ))}
          {covers.length === 0 &&
            [0, 1, 2, 3].map((i) => <div className="cc-mock__card" key={i} />)}
        </div>

        <div className="cc-mock__rows">
          {rows.map((r, i) => (
            <div className="cc-mock__row" key={`${r.name}-${i}`}>
              {r.cover_url ? (
                <img src={r.cover_url} alt="" loading="lazy" />
              ) : (
                <span style={{ display: "block", width: 22, height: 22, borderRadius: 5, background: "#1a1a1c" }} />
              )}
              <div>
                <b>{r.track_title || "Demo"}</b>
                <small>{r.name}</small>
              </div>
              <div className="cc-mock__rowbar">
                <i style={{ width: `${38 + i * 19}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="cc-mock__player">
          <span className="cc-mock__play" aria-hidden="true">
            <Play size={11} fill="#fff" color="#fff" />
          </span>
          <div className="cc-mock__track">
            <b>{creators[0]?.track_title || "Demo"}</b>
            <small>{creators[0]?.name || "Cabaña Creative"}</small>
            <div className="cc-mock__progress">
              <i />
            </div>
          </div>
          <span className="cc-eq" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>
        </div>
      </div>
    </div>
  );
}