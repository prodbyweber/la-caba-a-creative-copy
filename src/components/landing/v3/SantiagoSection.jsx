import React, { useState } from "react";
import { Play } from "lucide-react";

const FALLBACK_BIO =
  "Soy Santiago Weber, productor y artista, fundador de Cabaña Creative. He producido para Universal Music, Warner Music Spain y Magnus Media. Aquí desarrollo cada proyecto contigo, canción a canción.";

/** Presentación personal: vídeo con sonido al tocarlo, mini bio y tira de artistas. */
export default function SantiagoSection({ section, settings = {}, creators = [] }) {
  const [playing, setPlaying] = useState(false);
  const video = settings.weber_video_url;
  const poster =
    settings.weber_poster_url || settings.weber_photo_url || settings.weber_bg_url || "";
  const list = creators.filter((c) => c.is_public !== false && c.name && (c.photo_url || c.cover_url));

  return (
    <section className="ccl-snap ccl-snap--dark ccl-snap--auto ccl-santi" id="santiago">
      <div className="ccl-wrap ccl-snap__inner">
        <span className="ccl-eyebrow">
          {section?.eyebrow || "Santiago Weber · Founder, productor y artista"}
        </span>
        <h2 className="ccl-display ccl-h2" style={{ marginTop: 12 }}>
          {section?.title || "Aquí no creas solo."}
        </h2>
        {section?.subtitle && <p className="ccl-lead">{section.subtitle}</p>}

        <div className="ccl-santi__grid">
          <div className="ccl-santi__media">
            {playing && video ? (
              <video
                className="ccl-santi__video"
                src={video}
                poster={poster}
                controls
                autoPlay
                playsInline
              />
            ) : (
              <>
                {poster && <img src={poster} alt="Santiago Weber" loading="lazy" />}
                {video && (
                  <button
                    type="button"
                    className="ccl-santi__play"
                    onClick={() => setPlaying(true)}
                    aria-label="Reproducir el mensaje de Santiago"
                  >
                    <Play size={20} />
                  </button>
                )}
              </>
            )}
          </div>

          <div className="ccl-santi__copy">
            <p className="ccl-santi__bio">{settings.weber_bio || FALLBACK_BIO}</p>
            {settings.weber_name && <span className="ccl-santi__sign">{settings.weber_name}</span>}
          </div>
        </div>

        {list.length > 0 && (
          <div className="ccl-santi__strip">
            {list.map((creator) => (
              <figure key={creator.id || creator.name} className="ccl-santi__thumb">
                <img src={creator.photo_url || creator.cover_url} alt={creator.name} loading="lazy" />
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}