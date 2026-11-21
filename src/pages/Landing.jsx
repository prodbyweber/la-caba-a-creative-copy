import React, { useEffect, useRef, useState } from "react";
import "@/components/landing/v3/landing3.css";
import "@/components/landing/v3/landing3-extra.css";
import { useHomeContent } from "@/hooks/useHomeContent";
import Nav3 from "@/components/landing/v3/Nav3";
import Hero5 from "@/components/landing/v3/Hero5";
import Stats3 from "@/components/landing/v3/Stats3";
import SantiagoSection from "@/components/landing/v3/SantiagoSection";
import BrandsSection from "@/components/landing/v3/BrandsSection";
import ProposalSection from "@/components/landing/v3/ProposalSection";
import ProcessSection from "@/components/landing/v3/ProcessSection";
import BuilderSection from "@/components/landing/v3/builder/BuilderSection";
import GenresStack from "@/components/landing/v3/GenresStack";
import WhatIs3 from "@/components/landing/v3/WhatIs3";
import CountriesSection from "@/components/landing/v3/CountriesSection";
import FollowUpSection from "@/components/landing/v3/FollowUpSection";
import FaqSection from "@/components/landing/v3/FaqSection";
import Final3 from "@/components/landing/v3/Final3";
import FloatingCta from "@/components/landing/v3/FloatingCta";
import { scrollToSection } from "@/components/landing/v3/scrollToSection";

const ANCHORS = {
  hero: "top",
  cifras: "cifras",
  santiago: "santiago",
  marcas: "marcas",
  propuesta: "propuesta",
  proceso: "proceso",
  comenzar: "comenzar",
  generos: "generos",
  casa: "casa",
  paises: "paises",
  seguimiento: "seguimiento",
  faq: "faq",
  final: "final",
};

const DOT_LABELS = {
  hero: "Inicio",
  cifras: "Cifras",
  santiago: "Santiago",
  marcas: "Marcas",
  propuesta: "Propuesta",
  proceso: "Cómo funciona",
  comenzar: "Tu brief",
  generos: "Géneros",
  casa: "Estudio",
  paises: "Países",
  seguimiento: "Seguimiento",
  faq: "FAQ",
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
    document.title = s.seo_title || "Cabaña Creative | Producción musical y catálogo para artistas";
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

    const nodes = Array.from(root.querySelectorAll(".ccl-snap, .ccl-stack__intro"));

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

    nodes.forEach((node) => {
      if (node.classList.contains("ccl-snap")) reveal.observe(node);
    });
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
        return <Hero5 key={section.key} section={section} settings={content.settings} />;
      case "cifras":
        return <Stats3 key={section.key} section={section} stats={content.stats} />;
      case "santiago":
        return (
          <SantiagoSection
            key={section.key}
            section={section}
            settings={content.settings}
            creators={content.creators}
          />
        );
      case "marcas":
        return <BrandsSection key={section.key} />;
      case "propuesta":
        return <ProposalSection key={section.key} section={section} blocks={content.proposal} />;
      case "proceso":
        return <ProcessSection key={section.key} section={section} steps={content.process} />;
      case "comenzar":
        return <BuilderSection key={section.key} section={section} cards={content.builder} />;
      case "generos":
        return <GenresStack key={section.key} section={section} items={content.genres} />;
      case "casa":
        return <WhatIs3 key={section.key} />;
      case "paises":
        return <CountriesSection key={section.key} section={section} flags={content.flags} />;
      case "seguimiento":
        return <FollowUpSection key={section.key} section={section} stages={content.tracking} />;
      case "faq":
        return <FaqSection key={section.key} section={section} items={content.faq} />;
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

      <FloatingCta />

      <div className="ccl-grain" aria-hidden="true" />
    </div>
  );
}