import React, { useEffect, useState } from "react";
import { Play, X } from "lucide-react";
import { getYouTubeId, youtubeThumb, formatRange } from "@/lib/landingMedia";

export default function VideoWall({ section, videos = [] }) {
  const [openVideo, setOpenVideo] = useState(null);

  const visible = videos.filter((v) => v.is_visible !== false && v.youtube_url);
  const featured = visible.find((v) => v.is_featured) || visible[0];
  const rest = visible.filter((v) => v !== featured);

  useEffect(() => {
    if (!openVideo) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpenVideo(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openVideo]);

  if (visible.length === 0) return null;

  const thumb = (v, q) => v.thumbnail_url || youtubeThumb(v.youtube_url, q);
  const videoId = openVideo ? getYouTubeId(openVideo.youtube_url) : null;

  return (
    <section className="cc-sec" id="cabanita">
      <div className="cc-wrap">
        <div className="cc-sec-head" data-reveal>
          {section?.eyebrow && <span className="cc-eyebrow">{section.eyebrow}</span>}
          <h2 className="cc-h2">{section?.title}</h2>
          {section?.subtitle && <p className="cc-lead">{section.subtitle}</p>}
        </div>

        <div className="cc-wall">
          {featured && (
            <button
              type="button"
              className="cc-wall__featured"
              onClick={() => setOpenVideo(featured)}
              data-reveal
              aria-label={`Reproducir ${featured.title}`}
            >
              <img src={thumb(featured, "maxresdefault")} alt={featured.title} loading="lazy" />
              <span className="cc-wall__shade" />
              <span className="cc-play" aria-hidden="true">
                <Play size={22} fill="#fff" color="#fff" />
              </span>
              <span className="cc-wall__caption">
                {formatRange(featured.tags) && (
                  <span className="cc-chip cc-chip--solid">{formatRange(featured.tags)}</span>
                )}
                <h3>{featured.title}</h3>
              </span>
            </button>
          )}

          {rest.length > 0 && (
            <div className="cc-wall__grid">
              {rest.map((v, i) => (
                <button
                  key={`${v.title}-${i}`}
                  type="button"
                  className="cc-thumb"
                  onClick={() => setOpenVideo(v)}
                  data-reveal
                  aria-label={`Reproducir ${v.title}`}
                >
                  <img src={thumb(v, "hqdefault")} alt={v.title} loading="lazy" />
                  <span className="cc-thumb__shade" />
                  <span className="cc-thumb__caption">
                    {formatRange(v.tags) && (
                      <span className="cc-chip" style={{ marginBottom: 5 }}>
                        {formatRange(v.tags)}
                      </span>
                    )}
                    <b>{v.title}</b>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {openVideo && (
        <div
          className="cc-modal"
          role="dialog"
          aria-modal="true"
          aria-label={openVideo.title}
          onClick={() => setOpenVideo(null)}
        >
          <div className="cc-modal__panel cc-modal__panel--wide" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="cc-modal__close"
              onClick={() => setOpenVideo(null)}
              aria-label="Cerrar vídeo"
            >
              <X size={16} />
            </button>
            <div className="cc-modal__video">
              {videoId ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                  title={openVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              ) : (
                <div style={{ display: "grid", placeItems: "center", height: "100%", padding: 24 }}>
                  <a href={openVideo.youtube_url} target="_blank" rel="noopener noreferrer">
                    Ver en YouTube
                  </a>
                </div>
              )}
            </div>
            <div style={{ padding: "14px 18px 18px" }}>
              <h3 className="cc-modal__title">{openVideo.title}</h3>
              {formatRange(openVideo.tags) && (
                <p className="cc-modal__sub" style={{ margin: 0 }}>
                  {formatRange(openVideo.tags)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}