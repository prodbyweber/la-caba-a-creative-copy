import React, { useEffect, useRef, useState } from "react";
import "@/components/landing/v3/landing3.css";
import { useLandingContent } from "@/hooks/useLandingContent";
import Nav3 from "@/components/landing/v3/Nav3";
import Hero3 from "@/components/landing/v3/Hero3";
import WhatIs3 from "@/components/landing/v3/WhatIs3";
import Stats3 from "@/components/landing/v3/Stats3";
import Genres3 from "@/components/landing/v3/Genres3";
import Steps3 from "@/components/landing/v3/Steps3";
import Trending3 from "@/components/landing/v3/Trending3";
import Final3 from "@/components/landing/v3/Final3";
import { SECTIONS } from "@/components/landing/v3/constants";
import { scrollToSection } from "@/components/landing/v3/scrollToSection";

function setMeta(attr, key, content) {
  if (!content) return;
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

export default function Landing() {
  const { model, loading, isPreview } = useLandingContent();
  const rootRef = useRef(null);
  const [active, setActive] = useState("top");

  useEffect(() => {
    if (!model) return;
    const s = model.settings;
    document.title = s.seo_title || "Cabaña Creative";
    setMeta("name", "description", s.seo_description);
    setMeta("property", "og:title", s.seo_title);
    setMeta("property", "og:description", s.seo_description);
    setMeta("property", "og:image", s.og_image_url);
    setMeta("property", "og:type", "website");
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:image", s.og_image_url);
  }, [model]);

  // Revelado por pantalla + sección activa para el indicador de progreso.
  useEffect(() => {
    if (!model || !rootRef.current) return;
    const root = rootRef.current;
    root.scrollTop = 0;

    const sections = Array.from(root.querySelectorAll(".ccl-snap"));

    if (!("IntersectionObserver" in window)) {
      sections.forEach((s) => s.classList.add("is-in"));
      return;
    }

    const reveal = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            reveal.unobserve(entry.target);
          }
        });
      },
      { root, threshold: 0.12 }
    );

    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { root, rootMargin: "-48% 0px -48% 0px", threshold: 0 }
    );

    sections.forEach((section) => {
      reveal.observe(section);
      spy.observe(section);
    });

    return () => {
      reveal.disconnect();
      spy.disconnect();
    };
  }, [model]);

  if (loading || !model) {
    return (
      <div className="ccl" style={{ display: "grid", placeItems: "center" }}>
        <div style={{ display: "grid", gap: 12, justifyItems: "center" }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, background: "#ff5833" }} />
          <span
            style={{
              fontSize: 9,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "rgba(241,239,232,0.4)",
            }}
          >
            Cabaña Creative
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="ccl" ref={rootRef}>
      <Nav3 />

      <main>
        <Hero3 settings={model.settings} />
        <WhatIs3 />
        <Stats3 />
        <Genres3 settings={model.settings} creators={model.creators} />
        <Steps3 />
        <Trending3 videos={model.videos} />
        <Final3 settings={model.settings} />
      </main>

      <div className="ccl-dots">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            className={`ccl-dot ${active === section.id ? "is-active" : ""}`}
            aria-label={`Ir a ${section.label}`}
            onClick={() => scrollToSection(section.id)}
          />
        ))}
      </div>

      <div className="ccl-grain" aria-hidden="true" />

      {isPreview && <div className="ccl-preview-badge">Vista previa del borrador</div>}
    </div>
  );
}