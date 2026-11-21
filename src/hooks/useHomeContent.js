import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { DEFAULT_HOME, mergeHome } from "@/lib/homeDefaults";

/** Carga todo el contenido editable de la home desde las entidades. */
export function useHomeContent() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const [sections, settings, genres, fusion, heroVideos, studio, process, builder, demos, stats, creators, videos] =
          await Promise.all([
            base44.entities.LandingSection.list("-created_date", 100),
            base44.entities.SiteSettings.list("-created_date", 5),
            base44.entities.GenreCard.list("-created_date", 100),
            base44.entities.FusionGenre.list("-created_date", 100),
            base44.entities.HeroVideo.list("-created_date", 100),
            base44.entities.StudioCard.list("-created_date", 100),
            base44.entities.ProcessStep.list("-created_date", 100),
            base44.entities.BuilderCard.list("-created_date", 100),
            base44.entities.DemoCase.list("-created_date", 100),
            base44.entities.HomeStat.list("-created_date", 100),
            base44.entities.FeaturedCreator.list("-created_date", 100),
            base44.entities.FeaturedVideo.list("-created_date", 100),
          ]);

        const configs = await base44.entities.LandingConfig.list("-created_date", 3).catch(() => []);
        const brands = configs?.[0]?.brand_logos || [];

        if (!alive) return;
        setContent(
          mergeHome({
            sections,
            settings: settings?.[0] || null,
            genres,
            fusion,
            heroVideos,
            studio,
            process,
            builder,
            demos,
            stats,
            creators,
            videos,
            brands,
          })
        );
      } catch (e) {
        if (alive) setContent(DEFAULT_HOME);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, []);

  return { content, loading: !content };
}