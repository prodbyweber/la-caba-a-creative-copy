import React, { useEffect, useRef, useState } from "react";
import "@/components/landing/v3/landing3.css";
import "@/components/landing/v3/home-v3.css";
import { useHomeContent } from "@/hooks/useHomeContent";
import Nav3 from "@/components/landing/v3/Nav3";
import Hero3 from "@/components/landing/v3/Hero3";
import ManifestoSection from "@/components/landing/v3/ManifestoSection";
import StudioSection from "@/components/landing/v3/StudioSection";
import GenresStack from "@/components/landing/v3/GenresStack";
import CommunitySection from "@/components/landing/v3/CommunitySection";
import Stats3 from "@/components/landing/v3/Stats3";
import BrandsSection from "@/components/landing/v3/BrandsSection";
import ProcessSection from "@/components/landing/v3/ProcessSection";
import BeforeAfterSection from "@/components/landing/v3/BeforeAfterSection";
import BuilderSection from "@/components/landing/v3/builder/BuilderSection";
import WhatIs3 from "@/components/landing/v3/WhatIs3";
import Trending3 from "@/components/landing/v3/Trending3";
import Final3 from "@/components/landing/v3/Final3";
import { scrollToSection } from "@/components/landing/v3/scrollToSection";

const ANCHORS = {
  hero: "top",
  manifiesto: "manifiesto",
  estudio: "estudio",
  generos: "generos",
  comunidad: "comunidad",
  cifras: "cifras",
  marcas: "marcas",
  proceso: "proceso",
  comenzar: "comenzar",
  antes_despues: "antes_despues",
  casa: "casa",
  tendencia: "tendencia",
  final: "final",
};

const DOT_LABELS = {
  hero: "Inicio",
  manifiesto: "Manifiesto",
  estudio: "Estudio",
  generos: "Géneros",
  comunidad: "Comunidad",
  cifras: "Cifras",
  marcas: "Marcas",
  proceso: "Cómo funciona",
  comenzar: "Empezar",
  antes_despues: "Antes / Después",
  casa: "Qué es",
  tendencia: "Explorar",
  final: "Contacto",
};

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
  const { content, loading } = useHomeContent();
  const rootRef = useRef(null);
  const [active, setActive] = useState("top");

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    if (!content) return;
    const s = content.settings;
    document.title = s.seo_title || "Cabaña Creative";
    setMeta("name", "description", s.seo_description);
    setMeta("property", "og:title", s.seo_title);
    setMeta("property", "og:description", s.seo_description);
    setMeta("property", "og:image", s.og_image_url);
    setMeta("property", "og:type", "website");
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:image", s.og_image_url);
  }, [content]);

  const sections = (content?.sections || []).filter((s) => s.is_visible !== false && ANCHORS[s.key]);

  useEffect(() => {
    if (!content || !rootRef.current) return;
    const root = rootRef.current;
    root.scrollTop = 0;

    const nodes = Array.from(root.querySelectorAll(".ccl-snap"));

    if (!("IntersectionObserver" in window)) {
      nodes.forEach((n) => n.classList.add("is-in"));
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

    nodes.forEach((node) => reveal.observe(node));
    sections.forEach((section) => {
      const el = document.getElementById(ANCHORS[section.key]);
      if (el) spy.observe(el);
    });

    return () => {
      reveal.disconnect();
      spy.disconnect();
    };
  }, [content, sections.length]);

  if (loading || !content) {
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

  const renderSection = (section) => {
    switch (section.key) {
      case "hero":
        return (
          <Hero3 key={section.key} section={section} settings={content.settings} videos={content.heroVideos} />
        );
      case "manifiesto":
        return <ManifestoSection key={section.key} section={section} />;
      case "estudio":
        return <StudioSection key={section.key} section={section} cards={content.studio} />;
      case "generos":
        return (
          <GenresStack
            key={section.key}
            section={section}
            items={content.genres}
            fusion={content.fusion}
          />
        );
      case "comunidad":
        return (
          <CommunitySection
            key={section.key}
            section={section}
            creators={content.creators}
            stats={content.stats}
          />
        );
      case "cifras":
        return <Stats3 key={section.key} section={section} stats={content.stats} />;
      case "marcas":
        return <BrandsSection key={section.key} section={section} logos={content.brands} />;
      case "proceso":
        return <ProcessSection key={section.key} section={section} steps={content.process} />;
      case "comenzar":
        return <BuilderSection key={section.key} section={section} cards={content.builder} />;
      case "antes_despues":
        return <BeforeAfterSection key={section.key} section={section} items={content.demos} />;
      case "casa":
        return <WhatIs3 key={section.key} />;
      case "tendencia":
        return <Trending3 key={section.key} videos={content.videos || []} />;
      case "final":
        return <Final3 key={section.key} section={section} settings={content.settings} />;
      default:
        return null;
    }
  };

  return (
    <div className="ccl" ref={rootRef}>
      <Nav3 />

      <main>{sections.map(renderSection)}</main>

      <div className="ccl-dots">
        {sections.map((section) => (
          <button
            key={section.key}
            type="button"
            className={`ccl-dot ${active === ANCHORS[section.key] ? "is-active" : ""}`}
            aria-label={`Ir a ${DOT_LABELS[section.key] || section.key}`}
            onClick={() => scrollToSection(ANCHORS[section.key])}
          />
        ))}
      </div>

      <div className="ccl-grain" aria-hidden="true" />
    </div>
  );
}