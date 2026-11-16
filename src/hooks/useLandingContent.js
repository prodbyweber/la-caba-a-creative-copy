import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { DEFAULT_MODEL, mergeModel } from "@/lib/landingDefaults";

/**
 * Carga el contenido de la landing.
 * - Vista normal: contenido publicado (entidades).
 * - ?preview=1 (solo admin): borrador guardado en LandingVersion.
 */
export function useLandingContent() {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const isPreview =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("preview") === "1";

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        if (isPreview) {
          const drafts = await base44.entities.LandingVersion.filter(
            { status: "draft" },
            { sort: "-created_date", limit: 1 }
          );
          const draft = drafts.items?.[0];
          if (draft?.content) {
            const parsed = JSON.parse(draft.content);
            if (alive) {
              setModel(mergeModel(parsed));
              setLoading(false);
            }
            return;
          }
        }

        const [sections, features, videos, creators, beats, settings] = await Promise.all([
          base44.entities.LandingSection.list("-created_date", 50),
          base44.entities.FeaturedFeature.list("-created_date", 50),
          base44.entities.FeaturedVideo.list("-created_date", 50),
          base44.entities.FeaturedCreator.list("-created_date", 50),
          base44.entities.FeaturedBeat.list("-created_date", 50),
          base44.entities.SiteSettings.list("-created_date", 5),
        ]);

        if (alive) {
          setModel(
            mergeModel({
              sections,
              features,
              videos,
              creators,
              beats,
              settings: settings?.[0] || null,
            })
          );
          setLoading(false);
        }
      } catch (e) {
        if (alive) {
          setModel(DEFAULT_MODEL);
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [isPreview]);

  return { model, loading, isPreview };
}