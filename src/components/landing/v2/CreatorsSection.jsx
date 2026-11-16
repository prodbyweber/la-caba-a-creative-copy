import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, X } from "lucide-react";

export default function CreatorsSection({ section, creators = [] }) {
  const list = creators.filter((c) => c.is_public !== false);
  const audioRef = useRef(null);
  const [playingIdx, setPlayingIdx] = useState(null);
  const [progress, setProgress] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (selectedIdx === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") setSelectedIdx(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selectedIdx]);

  const toggle = (idx) => {
    const creator = list[idx];
    const audio = audioRef.current;
    if (!audio || !creator?.audio_url) return;

    if (playingIdx === idx) {
      audio.pause();
      setPlayingIdx(null);
      return;
    }
    audio.src = creator.audio_url;
    audio.play().then(() => setPlayingIdx(idx)).catch(() => setPlayingIdx(null));
  };

  const openCard = (idx) => {
    setSelectedIdx(idx);
  };

  const selected = selectedIdx !== null ? list[selectedIdx] : null;

  if (list.length === 0) return null;

  return (
    <section className="cc-sec" id="creadores">
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => {
          const a = e.currentTarget;
          setProgress(a.duration ? (a.currentTime / a.duration) * 100 : 0);
        }}
        onEnded={() => {
          setPlayingIdx(null);
          setProgress(0);
        }}
        preload="none"
      />

      <div className="cc-wrap">
        <div className="cc-sec-head" data-reveal>
          {section?.eyebrow && <span className="cc-eyebrow">{section.eyebrow}</span>}
          <h2 className="cc-h2">{section?.title}</h2>
          {section?.subtitle && <p className="cc-lead">{section.subtitle}</p>}
        </div>

        <div className="cc-creators">
          {list.slice(0, 8).map((creator, idx) => (
            <article key={`${creator.name}-${idx}`} className="cc-creator" data-reveal>
              <button
                type="button"
                onClick={() => openCard(idx)}
                style={{ display: "block", width: "100%", padding: 0, border: 0, background: "none", cursor: "pointer", textAlign: "left" }}
                aria-label={`Ver ficha de ${creator.name}`}
              >
                <div className="cc-creator__media">
                  {creator.photo_url || creator.cover_url ? (
                    <img
                      src={creator.photo_url || creator.cover_url}
                      alt={`${creator.name}${creator.genre ? `, ${creator.genre}` : ""}`}
                      loading="lazy"
                    />
                  ) : null}
                  <span className="cc-creator__shade" />
                  <div className="cc-creator__info">
                    <b>{creator.name}</b>
                    <small>{[creator.genre, creator.track_title].filter(Boolean).join(" · ")}</small>
                  </div>
                </div>
              </button>

              {creator.audio_url && (
                <button
                  type="button"
                  className="cc-creator__play"
                  onClick={() => toggle(idx)}
                  aria-label={playingIdx === idx ? `Pausar ${creator.track_title}` : `Escuchar ${creator.track_title}`}
                >
                  {playingIdx === idx ? <Pause size={13} fill="#fff" /> : <Play size={13} fill="#fff" />}
                </button>
              )}
              <div className="cc-creator__bar">
                <i style={{ width: playingIdx === idx ? `${progress}%` : "0%" }} />
              </div>
            </article>
          ))}
        </div>
      </div>

      {selected && (
        <div className="cc-modal" role="dialog" aria-modal="true" aria-label={selected.track_title} onClick={() => setSelectedIdx(null)}>
          <div className="cc-modal__panel cc-modal__panel--wide" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="cc-modal__close" onClick={() => setSelectedIdx(null)} aria-label="Cerrar">
              <X size={16} />
            </button>
            <div className="cc-track-modal">
              {selected.cover_url && (
                <img
                  className="cc-track-modal__cover"
                  src={selected.cover_url}
                  alt={`Portada de ${selected.track_title || selected.name}`}
                />
              )}
              <div className="cc-track-modal__body">
                <h3 className="cc-modal__title">{selected.track_title || selected.name}</h3>
                <p className="cc-modal__sub" style={{ marginBottom: 0 }}>
                  {selected.name}
                </p>
                <div className="cc-track-modal__meta">
                  {selected.year && <span className="cc-chip">{selected.year}</span>}
                  {selected.genre && <span className="cc-chip">{selected.genre}</span>}
                </div>
                {selected.credits && <p className="cc-track-modal__credits">{selected.credits}</p>}

                {selected.audio_url && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18 }}>
                    <button
                      type="button"
                      className="cc-beat__play"
                      onClick={() => toggle(selectedIdx)}
                      aria-label={playingIdx === selectedIdx ? "Pausar" : "Reproducir"}
                    >
                      {playingIdx === selectedIdx ? <Pause size={14} fill="#fff" /> : <Play size={14} fill="#fff" />}
                    </button>
                    <div style={{ flex: 1, height: 3, borderRadius: 999, background: "rgba(241,239,232,0.15)", overflow: "hidden" }}>
                      <i
                        style={{
                          display: "block",
                          height: "100%",
                          width: playingIdx === selectedIdx ? `${progress}%` : "0%",
                          background: "#ff5833",
                          transition: "width .2s linear",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}