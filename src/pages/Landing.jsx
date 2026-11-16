import React, { useEffect, useState } from "react";
import "@/components/landing/v2/landing.css";
import { useLandingContent } from "@/hooks/useLandingContent";
import LandingNav from "@/components/landing/v2/LandingNav";
import HeroSection from "@/components/landing/v2/HeroSection";
import BrandStrip from "@/components/landing/v2/BrandStrip";
import FeaturesSection from "@/components/landing/v2/FeaturesSection";
import JourneySection from "@/components/landing/v2/JourneySection";
import VideoWall from "@/components/landing/v2/VideoWall";
import CreatorsSection from "@/components/landing/v2/CreatorsSection";
import BeatsSection from "@/components/landing/v2/BeatsSection";
import AboutSection from "@/components/landing/v2/AboutSection";
import ClosingSection from "@/components/landing/v2/ClosingSection";
import LandingFooter from "@/components/landing/v2/LandingFooter";
import AccessModal from "@/components/landing/v2/AccessModal";

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
  const [accessOpen, setAccessOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // SEO dinámico
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

  // Aparición progresiva al hacer scroll
  useEffect(() => {
    if (!model) return;
    const els = Array.from(document.querySelectorAll("[data-reveal]"));
    if (els.length === 0) return;

    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [model]);

  if (loading || !model) {
    return (
      <div className="cc" style={{ minHeight: "100svh", display: "grid", placeItems: "center" }}>
        <div style={{ display: "grid", gap: 14, justifyItems: "center" }}>
          <span className="cc-nav__dot" style={{ width: 10, height: 10 }} />
          <span style={{ fontSize: 10, letterSpacing: "0.34em", textTransform: "uppercase", opacity: 0.4 }}>
            Cabaña Creative
          </span>
        </div>
      </div>
    );
  }

  const visible = model.sections.filter((s) => s.is_visible !== false);
  const has = (key) => visible.some((s) => s.key === key);

  const nav = [
    has("features") && { id: "funciones", label: "Funciones" },
    has("creators") && { id: "creadores", label: "Creadores" },
    has("beats") && { id: "beats", label: "Beats" },
  ].filter(Boolean);

  const openAccess = () => setAccessOpen(true);

  const renderSection = (section) => {
    switch (section.key) {
      case "hero":
        return (
          <HeroSection
            key={section.key}
            section={section}
            settings={model.settings}
            creators={model.creators}
            onAccess={openAccess}
          />
        );
      case "brands":
        return <BrandStrip key={section.key} title={section.title || model.settings.brand_strip_title} />;
      case "features":
        return (
          <FeaturesSection
            key={section.key}
            section={section}
            features={model.features}
            creators={model.creators}
          />
        );
      case "journey":
        return (
          <JourneySection
            key={section.key}
            section={section}
            settings={model.settings}
            creators={model.creators}
          />
        );
      case "videos":
        return <VideoWall key={section.key} section={section} videos={model.videos} />;
      case "creators":
        return <CreatorsSection key={section.key} section={section} creators={model.creators} />;
      case "beats":
        return <BeatsSection key={section.key} section={section} featured={model.beats} />;
      case "about":
        return <AboutSection key={section.key} section={section} settings={model.settings} />;
      case "closing":
        return (
          <ClosingSection
            key={section.key}
            section={section}
            settings={model.settings}
            onAccess={openAccess}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="cc">
      <LandingNav settings={model.settings} nav={nav} onAccess={openAccess} />
      <main>{visible.map(renderSection)}</main>
      <LandingFooter settings={model.settings} />
      <AccessModal open={accessOpen} onClose={() => setAccessOpen(false)} />

      {isPreview && (
        <div
          style={{
            position: "fixed",
            bottom: 14,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 95,
            background: "#ff5833",
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "8px 16px",
            borderRadius: 999,
          }}
        >
          Vista previa del borrador
        </div>
      )}
    </div>
  );
}