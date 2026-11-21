import React, { useEffect } from "react";
import "@/components/landing/v3/landing3.css";
import { useLandingContent } from "@/hooks/useLandingContent";
import Nav3 from "@/components/landing/v3/Nav3";
import Hero3 from "@/components/landing/v3/Hero3";
import Manifesto3 from "@/components/landing/v3/Manifesto3";
import Method3 from "@/components/landing/v3/Method3";
import Catalog3 from "@/components/landing/v3/Catalog3";
import ArtistDev3 from "@/components/landing/v3/ArtistDev3";
import Connect3 from "@/components/landing/v3/Connect3";
import Work3 from "@/components/landing/v3/Work3";
import Closing3 from "@/components/landing/v3/Closing3";
import Footer3 from "@/components/landing/v3/Footer3";

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
      <div
        className="ccl"
        style={{ minHeight: "100svh", display: "grid", placeItems: "center" }}
      >
        <div style={{ display: "grid", gap: 14, justifyItems: "center" }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: "#ff5833",
              display: "block",
            }}
          />
          <span
            style={{
              fontSize: 9.5,
              letterSpacing: "0.34em",
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

  const section = (key) => model.sections.find((s) => s.key === key);
  const visible = (key) => {
    const s = section(key);
    return s ? s.is_visible !== false : true;
  };

  return (
    <div className="ccl">
      <Nav3 settings={model.settings} />

      <main>
        <Hero3 section={section("hero")} settings={model.settings} />

        {visible("features") && (
          <Manifesto3
            section={section("features")}
            features={model.features}
            settings={model.settings}
          />
        )}

        {visible("journey") && <Method3 section={section("journey")} />}

        {visible("creators") && (
          <Catalog3
            section={section("creators")}
            creators={model.creators}
            beats={model.beats}
          />
        )}

        <ArtistDev3 section={section("about")} settings={model.settings} />

        <Connect3 section={null} />

        {visible("videos") && (
          <Work3 section={section("videos")} videos={model.videos} creators={model.creators} />
        )}

        <Closing3 section={section("closing")} settings={model.settings} />
      </main>

      <Footer3 settings={model.settings} />

      {isPreview && <div className="ccl-preview-badge">Vista previa del borrador</div>}
    </div>
  );
}