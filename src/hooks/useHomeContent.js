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
        const [
          sections,
          settings,
          genres,
          proposal,
          flags,
          process,
          builder,
          demos,
          stats,
          creators,
          videos,
          faq,
          tracking,
        ] = await Promise.all([
          base44.entities.LandingSection.list("-created_date", 100),
          base44.entities.SiteSettings.list("-created_date", 5),
          base44.entities.GenreCard.list("-created_date", 100),
          base44.entities.ProposalBlock.list("-created_date", 100),
          base44.entities.CountryFlag.list("-created_date", 100),
          base44.entities.ProcessStep.list("-created_date", 100),
          base44.entities.BuilderCard.list("-created_date", 100),
          base44.entities.DemoCase.list("-created_date", 100),
          base44.entities.HomeStat.list("-created_date", 100),
          base44.entities.FeaturedCreator.list("-created_date", 100),
          base44.entities.FeaturedVideo.list("-created_date", 100),
          base44.entities.FaqItem.list("-created_date", 100),
          base44.entities.TrackingStage.list("-created_date", 100),
        ]);

        if (!alive) return;
        setContent(
          mergeHome({
            sections,
            settings: settings?.[0] || null,
            genres,
            proposal,
            flags,
            process,
            builder,
            demos,
            stats,
            creators,
            videos,
            faq,
            tracking,
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