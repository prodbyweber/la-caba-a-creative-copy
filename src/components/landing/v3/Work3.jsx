import React, { useState } from "react";
import { Play, X } from "lucide-react";
import { getYouTubeId, youtubeThumb } from "@/lib/landingMedia";

export default function Work3({ section, videos = [], creators = [] }) {
  const list = videos.filter((v) => v.is_visible !== false).slice(0, 5);
  const [openId, setOpenId] = useState(null);
  const people = creators.filter((c) => c.is_public !== false).slice(0, 8);

  return (
    <section className="ccl-sec" id="proyectos">
      <div className="ccl-wrap">
        <div data-reveal>
          <span className="ccl-eyebrow">Proyectos y experiencia</span>
          <h2 className="ccl-h2">{section?.title || "Lo que sale del estudio."}</h2>
          <p className="ccl-lead">
            {section?.subtitle || "Música, campañas y piezas audiovisuales producidas en la Cabaña."}
          </p>
        </div>

        {list.length > 0 && (
          <div className="ccl-work__grid">
            {list.map((video) => {
              const id = getYouTubeId(video.youtube_url);
              const thumb = video.thumbnail_url || youtubeThumb(video.youtube_url);
              if (!id && !thumb) return null;
              return (
                <button
                  key={video.id || video.title}
                  type="button"
                  className="ccl-work__item"
                  data-reveal
                  onClick={() => id && setOpenId(id)}
                  aria-label={`Ver ${video.title}`}
                >
                  <img src={thumb} alt={video.title} loading="lazy" />
                  <span className="ccl-work__play" aria-hidden="true">
                    <Play size={16} fill="#fff" />
                  </span>
                  <span className="ccl-work__label">{video.title}</span>
                </button>
              );
            })}
          </div>
        )}

        {people.length > 0 && (
          <div className="ccl-creators-strip">
            {people.map((person, i) => (
              <div key={`${person.name}-${i}`} className="ccl-creator" data-reveal>
                {(person.photo_url || person.cover_url) && (
                  <img src={person.photo_url || person.cover_url} alt={person.name} loading="lazy" />
                )}
                <b>{person.name}</b>
                <small>{person.track_title || person.genre || "Cabaña Creative"}</small>
              </div>
            ))}
          </div>
        )}
      </div>

      {openId && (
        <div className="ccl-modal" role="dialog" aria-modal="true" aria-label="Vídeo" onClick={() => setOpenId(null)}>
          <div className="ccl-modal__box" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="ccl-modal__close" onClick={() => setOpenId(null)} aria-label="Cerrar">
              <X size={16} />
            </button>
            <div className="ccl-modal__frame">
              <iframe
                src={`https://www.youtube.com/embed/${openId}?autoplay=1&rel=0`}
                title="Vídeo de Cabaña Creative"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}