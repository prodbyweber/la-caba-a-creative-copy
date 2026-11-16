import React, { useEffect, useState } from "react";
import { Play, Lock, Check } from "lucide-react";
import { isVideoFile } from "@/lib/landingMedia";

const STEPS = [
  { key: "explora", panel: "explora" },
  { key: "descubre", panel: "descubre" },
  { key: "lanza", panel: "lanza" },
];

function ScreenExplora({ creators }) {
  const bars = [10, 22, 15, 30, 18, 26, 12, 20, 28, 16, 24, 14, 22, 10, 26, 18];
  return (
    <div className="cc-ui" style={{ height: "100%" }}>
      <div className="cc-mock__top">
        <div>
          <div className="cc-mock__title">Demos</div>
          <div className="cc-mock__sub">Últimas versiones</div>
        </div>
        <span className="cc-mock__pill">Escuchando</span>
      </div>
      <div className="cc-ui__wave" aria-hidden="true">
        {bars.map((h, i) => (
          <i key={i} className={i < 9 ? "on" : ""} style={{ height: `${h}px` }} />
        ))}
      </div>
      <div className="cc-ui">
        {creators.slice(0, 3).map((c, i) => (
          <div className="cc-ui__row" key={i}>
            {c.cover_url ? (
              <img src={c.cover_url} alt="" className="cc-ui__cov" loading="lazy" />
            ) : (
              <span className="cc-ui__cov" />
            )}
            <div className="cc-ui__lines">
              <span />
              <span />
            </div>
            <span className="cc-ui__time">{i === 0 ? "ahora" : "v2"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScreenDescubre({ creators }) {
  return (
    <div className="cc-ui" style={{ height: "100%" }}>
      <div className="cc-mock__top">
        <div>
          <div className="cc-mock__title">Proyecto</div>
          <div className="cc-mock__sub">Identidad del catálogo</div>
        </div>
      </div>
      <div className="cc-ui__meta">
        {creators[0]?.cover_url ? (
          <img src={creators[0].cover_url} alt="" style={{ width: 64, height: 64 }} loading="lazy" />
        ) : (
          <span className="cc-ui__cov" style={{ width: 64, height: 64 }} />
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
        <span className="cc-ui__tag">Letra</span>
      </div>
      <div className="cc-ui__row">
        <span className="cc-ui__cov" style={{ display: "grid", placeItems: "center" }}>
          <Play size={10} fill="#fff" color="#fff" />
        </span>
        <div className="cc-ui__lines">
          <span />
          <span />
        </div>
        <span className="cc-ui__time">3:10</span>
      </div>
    </div>
  );
}

function ScreenLanza() {
  const rows = [
    ["Mezcla final", true],
    ["Portada aprobada", true],
    ["Pre-save del single", false],
    ["Plan de contenido", false],
    ["Distribución", false],
  ];
  return (
    <div className="cc-ui" style={{ height: "100%" }}>
      <div className="cc-mock__top">
        <div>
          <div className="cc-mock__title">Hoja de ruta</div>
          <div className="cc-mock__sub">Lanzamiento · Single</div>
        </div>
        <span className="cc-mock__pill">2 / 5</span>
      </div>
      {rows.map(([label, done], i) => (
        <div className="cc-ui__check" key={i}>
          <span className={`dot ${done ? "done" : ""}`}>
            {done ? <Check size={7} color="#fff" /> : null}
          </span>
          <strong>{label}</strong>
        </div>
      ))}
      <div className="cc-ui__lock">
        <Lock size={9} /> Siguiente paso sugerido
      </div>
    </div>
  );
}

export default function JourneySection({ section, settings, creators = [] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const els = STEPS.map((_, i) => document.getElementById(`cc-step-${i}`)).filter(Boolean);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-step"));
            setActive(idx);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const steps = [
    { title: settings?.journey_step1_title, text: settings?.journey_step1_text, panel: "explora" },
    { title: settings?.journey_step2_title, text: settings?.journey_step2_text, panel: "descubre" },
    { title: settings?.journey_step3_title, text: settings?.journey_step3_text, panel: "lanza" },
  ];

  const bg = settings?.journey_media_url || "";

  return (
    <section className="cc-sec cc-journey" id="recorrido">
      {isVideoFile(bg) && (
        <video
          className="cc-journey__bg"
          src={bg}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
        />
      )}
      <div className="cc-journey__veil" />

      <div className="cc-wrap">
        <div className="cc-sec-head" data-reveal>
          {section?.eyebrow && <span className="cc-eyebrow">{section.eyebrow}</span>}
          <h2 className="cc-h2">{section?.title}</h2>
          {section?.subtitle && <p className="cc-lead">{section.subtitle}</p>}
        </div>

        <div className="cc-journey__grid">
          <div className="cc-journey__sticky" data-reveal>
            <div className="cc-browser">
              <div className="cc-browser__bar">
                <span className="cc-browser__dot" />
                <span className="cc-browser__dot" />
                <span className="cc-browser__dot" />
                <span className="cc-browser__url">cabanacreative.es/studio</span>
              </div>
              <div className="cc-screen">
                <div className={`cc-screen__panel ${active === 0 ? "is-active" : ""}`}>
                  <ScreenExplora creators={creators} />
                </div>
                <div className={`cc-screen__panel ${active === 1 ? "is-active" : ""}`}>
                  <ScreenDescubre creators={creators} />
                </div>
                <div className={`cc-screen__panel ${active === 2 ? "is-active" : ""}`}>
                  <ScreenLanza />
                </div>
              </div>
            </div>
          </div>

          <div className="cc-steps">
            {steps.map((step, i) => (
              <div
                key={i}
                id={`cc-step-${i}`}
                data-step={i}
                className={`cc-step ${active === i ? "is-active" : ""}`}
                data-reveal
              >
                <span className="cc-step__num">0{i + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}