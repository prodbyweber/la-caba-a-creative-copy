import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  FA_DEFAULTS,
  FA_STATS_FALLBACK,
  FA_PROJECTS_FALLBACK,
  FA_STAGES,
} from "@/lib/fullAccessDefaults";

const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0);

async function loadContent() {
  const [settingsList, stats, projects, demos, stages, configs] = await Promise.all([
    base44.entities.FullAccessSettings.list("-created_date", 1),
    base44.entities.FullAccessStat.list("order"),
    base44.entities.FullAccessProject.list("order"),
    base44.entities.DemoCase.list("order"),
    base44.entities.FullAccessStage.list("order"),
    base44.entities.LandingConfig.list(),
  ]);

  const saved = settingsList?.[0] || {};
  const settings = { ...FA_DEFAULTS };
  Object.entries(saved).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) settings[key] = value;
  });
  // Los vídeos opcionales deben poder vaciarse desde el editor.
  ["preview_video_url", "studio_video_url"].forEach((key) => {
    if (saved[key] !== undefined) settings[key] = saved[key] || "";
  });

  const visibleStats = (stats || []).filter((s) => s.is_visible !== false).sort(byOrder);
  const visibleProjects = (projects || []).filter((p) => p.is_visible !== false).sort(byOrder);
  const visibleDemos = (demos || []).filter((d) => d.is_visible !== false).sort(byOrder);
  const visibleStages = (stages || []).filter((s) => s.is_visible !== false).sort(byOrder);

  return {
    settings,
    stats: visibleStats.length ? visibleStats : FA_STATS_FALLBACK,
    projects: visibleProjects.length ? visibleProjects : FA_PROJECTS_FALLBACK,
    demos: visibleDemos,
    stages: visibleStages.length ? visibleStages : FA_STAGES,
    collabLogos: settings.collab_logos?.length > 0 ? settings.collab_logos : configs?.[0]?.brand_logos || [],
  };
}

export default function useFullAccessContent() {
  const { data, isLoading } = useQuery({
    queryKey: ["full-access-content"],
    queryFn: loadContent,
    staleTime: 60000,
  });

  return {
    loading: isLoading,
    settings: data?.settings || FA_DEFAULTS,
    stats: data?.stats || FA_STATS_FALLBACK,
    projects: data?.projects || FA_PROJECTS_FALLBACK,
    demos: data?.demos || [],
    stages: data?.stages || FA_STAGES,
    collabLogos: data?.collabLogos || [],
  };
}