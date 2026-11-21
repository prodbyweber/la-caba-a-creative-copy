import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getYouTubeId, youtubeThumb } from "@/lib/landingMedia";
import { EXPLORE_CTA, TRENDING } from "./constants";

export default function Trending3({ videos = [] }) {
  const list = useMemo(() => {
    const visible = videos.filter((v) => v.is_visible !== false);
    const picked = TRENDING.map((title) =>
      visible.find((v) => (v.title || "").toLowerCase().includes(title.toLowerCase()))
    ).filter(Boolean);
    return picked.length ? picked : visible.slice(0, 5);
  }, [videos]);

  return (
    <section className="ccl-snap ccl-snap--dark" id="tendencia">
      <div className="ccl-wrap ccl-snap__inner">
        <span className="ccl-eyebrow">En tendencia</span>
        <h2 className="ccl-display ccl-h2" style={{ marginTop: 12 }}>
          Atrévete a explorar.
        </h2>
        <p className="ccl-small">Proyectos que ya suenan.</p>

        <div className="ccl-rail">
          {list.map((video) => {
          const poster = video.thumbnail_url || youtubeThumb(video.youtube_url);
          const tags = (video.tags || []).filter(Boolean);
            return (
              <div key={video.id || video.title} className="ccl-trend">
                <div className="ccl-trend__poster">
                  {poster && <img src={poster} alt={video.title} loading="lazy" />}
                  <span className="ccl-trend__tag">{tags[0] || "Cabaña"}</span>
                </div>
                <h3 className="ccl-trend__title">{video.title}</h3>
                <p className="ccl-trend__meta">{tags.length ? tags.join(" · ") : "Cabaña Creative"}</p>
              </div>
            );
          })}
        </div>

        <div className="ccl-trend__cta">
          <Link to={EXPLORE_CTA} className="ccl-btn ccl-btn--ghost">
            Explorar catálogo completo <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </section>
  );
}