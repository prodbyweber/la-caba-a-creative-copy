import React, { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

const BARS = [38, 62, 45, 78, 54, 88, 41, 70, 58, 92, 47, 66, 35, 74, 52, 84, 44, 60, 49, 80, 39, 68, 56, 90, 43, 72, 51, 63, 37, 76, 46, 58];

export default function BeforeAfterSection({ section, items = [] }) {
  const list = items.filter((i) => i.is_visible !== false);
  const audioRef = useRef(null);
  const [active, setActive] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const idOf = (item) => item.id || item.artist;

  const select = (item, version) => {
    const src = version === "master" ? item.master_audio_url : item.demo_audio_url;
    if (!src) return;
    const el = audioRef.current;
    const key = idOf(item);
    const same = active?.id === key;
    const time = same ? el.currentTime || 0 : 0;

    el.pause();
    el.src = src;
    el.load();
    el.addEventListener(
      "loadedmetadata",
      () => {
        try {
          el.currentTime = Math.min(time, el.duration || time);
        } catch (e) {
          /* noop */
        }
      },
      { once: true }
    );

    setActive({ id: key, version });
    setProgress(0);
    el.play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  };

  const toggle = (item) => {
    const el = audioRef.current;
    const key = idOf(item);
    if (!active || active.id !== key) {
      select(item, item.demo_audio_url ? "demo" : "master");
      return;
    }
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      el.play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    }
  };

  return (
    <section className="ccl-snap ccl-snap--dark" id="antes_despues">
      <div className="ccl-wrap ccl-snap__inner">
        {section?.eyebrow && <span className="ccl-eyebrow">{section.eyebrow}</span>}
        <h2 className="ccl-display ccl-h2" style={{ marginTop: 12 }}>
          {section?.title}
        </h2>
        {section?.subtitle && <p className="ccl-small">{section.subtitle}</p>}

        <div className="ccl-rail">
          {list.map((item) => {
            const key = idOf(item);
            const isActive = active?.id === key;
            const isPlaying = isActive && playing;
            const version = isActive ? active.version : "demo";

            return (
              <article className={`ccl-ba ${isActive ? "is-active" : ""}`} key={key}>
                <div className="ccl-ba__cover">
                  {item.cover_url && (
                    <img className="ccl-media__el" src={item.cover_url} alt="" loading="lazy" />
                  )}
                  <span className="ccl-media__veil" />

                  <div className="ccl-ba__switch" role="group" aria-label="Versión">
                    <button
                      type="button"
                      className={`ccl-ba__opt ${version === "demo" ? "is-on" : ""}`}
                      onClick={() => select(item, "demo")}
                      disabled={!item.demo_audio_url}
                    >
                      Demo
                    </button>
                    <button
                      type="button"
                      className={`ccl-ba__opt ${version === "master" ? "is-on" : ""}`}
                      onClick={() => select(item, "master")}
                      disabled={!item.master_audio_url}
                    >
                      Master final
                    </button>
                  </div>

                  <button
                    type="button"
                    className="ccl-ba__play"
                    onClick={() => toggle(item)}
                    aria-label={isPlaying ? "Pausar" : "Reproducir"}
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                </div>

                <div className="ccl-ba__body">
                  <h3 className="ccl-ba__artist">{item.artist}</h3>
                  <p className="ccl-ba__genre">{item.genre || "Cabaña Creative"}</p>

                  <div className={`ccl-wave ${isPlaying ? "is-on" : ""}`} aria-hidden="true">
                    {BARS.map((h, i) => (
                      <span key={i} style={{ height: `${h}%`, animationDelay: `${i * 45}ms` }} />
                    ))}
                  </div>

                  <div className="ccl-ba__bar">
                    <span style={{ width: `${isActive ? progress * 100 : 0}%` }} />
                  </div>

                  {!item.master_audio_url && (
                    <span className="ccl-ba__note">Master en preparación</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <audio
          ref={audioRef}
          preload="none"
          onTimeUpdate={(e) => {
            const el = e.currentTarget;
            if (el.duration) setProgress(el.currentTime / el.duration);
          }}
          onEnded={() => {
            setPlaying(false);
            setProgress(0);
          }}
        />
      </div>
    </section>
  );
}