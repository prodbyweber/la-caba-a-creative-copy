import React from "react";

const LOGO_1X =
  "https://media.base44.com/images/public/6966ddf48947f217e81ea27c/7947f343ed3f736881e57cb4f568e85d_isotipo-cabana-creative.png/v1/fit/w_96,h_96,al_c,q_90/file.png";
const LOGO_2X =
  "https://media.base44.com/images/public/6966ddf48947f217e81ea27c/7947f343ed3f736881e57cb4f568e85d_isotipo-cabana-creative.png/v1/fit/w_192,h_192,al_c,q_90/file.png";

export default function FullAccessNav() {
  return (
    <header className="fa-nav">
      <a href="/" className="fa-nav__brand" aria-label="Cabaña Creative">
        <img
          src={LOGO_1X}
          srcSet={`${LOGO_1X} 1x, ${LOGO_2X} 2x`}
          alt="Cabaña Creative"
          width="48"
          height="48"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          draggable={false}
        />
      </a>
    </header>
  );
}