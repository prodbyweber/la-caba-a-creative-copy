import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PROCESS, PROJECT_CTA } from "./constants";

export default function ArtistDev3({ section, settings }) {
  const image = settings?.weber_bg_url || settings?.access_card_image_url || "";
  const booking = settings?.booking_url || "/reservas";

  return (
    <section className="ccl-dev" id="artistas">
      <div className="ccl-wrap ccl-dev__grid">
        <div data-reveal>
          <span className="ccl-eyebrow">Desarrollo artístico</span>
          <h2 className="ccl-dev__title">
            No se trata solo de hacer canciones.
            <br />
            <em>Se trata de construir un proyecto.</em>
          </h2>
          <p className="ccl-dev__text">
            {section?.subtitle ||
              "Trabajamos con artistas que quieren desarrollar su sonido, construir un catálogo y dar dirección a su carrera. Del primer demo al lanzamiento, con criterio y acompañamiento."}
          </p>

          <ul className="ccl-dev__list">
            {PROCESS.map((item, i) => (
              <li key={item} className="ccl-dev__item">
                <span className="ccl-dev__idx">{String(i + 1).padStart(2, "0")}</span>
                {item}
              </li>
            ))}
          </ul>

          <div className="ccl-dev__ctas">
            <Link to={PROJECT_CTA} className="ccl-btn ccl-btn--primary">
              Enviar mi proyecto <ArrowRight size={14} />
            </Link>
            <Link to={booking} className="ccl-btn ccl-btn--ghost">
              Agendar una sesión
            </Link>
          </div>
        </div>

        {image && (
          <div className="ccl-dev__media" data-reveal>
            <img src={image} alt="Sesión de producción en Cabaña Creative" loading="lazy" />
          </div>
        )}
      </div>
    </section>
  );
}