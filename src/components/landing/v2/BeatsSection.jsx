import React, { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, Lock } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function BeatsSection({ section, featured = [] }) {
  const [beats, setBeats] = useState([]);
  const [locked, setLocked] = useState([]);
  const [playingId, setPlayingId] = useState(null);
  const audioRef = useRef(null);

  const ids = useMemo(
    () => featured.filter((f) => f.is_visible !== false && f.beat_id).map((f) => f.beat_id),
    [featured]
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [selected, publicBeats] = await Promise.all([
          ids.length ? base44.entities.Beat.filter({ id: { $in: ids } }) : [],
          base44.entities.Beat.filter({ status: "Publicado", archived: false }, { sort: "-created_date", limit: 10 }),
        ]);
        if (!alive) return;

        const ordered = ids
          .map((id) => selected.find((b) => b.id === id))
          .filter(Boolean);

        setBeats(ordered);
        setLocked(publicBeats.items.filter((b) => !ids.includes(b.id)).slice(0, 3));
      } catch (e) {
        if (alive) {
          setBeats([]);
          setLocked([]);
        }
      }
    })();
    return () => {
      alive = false;
      audioRef.current?.pause();
    };
  }, [ids]);

  const toggle = (beat) => {
    const audio = audioRef.current;
    if (!audio || !beat?.preview_mp3_url) return;
    if (playingId === beat.id) {
      audio.pause();
      setPlayingId(null);
      return;
    }
    audio.src = beat.preview_mp3_url;
    audio.play().then(() => setPlayingId(beat.id)).catch(() => setPlayingId(null));
  };

  if (beats.length === 0 && locked.length === 0) return null;

  return (
    <section className="cc-sec" id="beats">
      <audio ref={audioRef} onEnded={() => setPlayingId(null)} preload="none" />
      <div className="cc-wrap">
        <div className="cc-sec-head" data-reveal>
          {section?.eyebrow && <span className="cc-eyebrow">{section.eyebrow}</span>}
          <h2 className="cc-h2">{section?.title}</h2>
          {section?.subtitle && <p className="cc-lead">{section.subtitle}</p>}
        </div>

        <div className="cc-beats">
          {beats.map((beat) => (
            <div
              key={beat.id}
              className={`cc-beat ${playingId === beat.id ? "is-playing" : ""}`}
              data-reveal
            >
              {beat.cover_url ? <img src={beat.cover_url} alt="" loading="lazy" /> : <span />}
              <div>
                <div className="cc-beat__title">
                  {beat.title}
                  {beat.genres?.[0] && <span className="cc-chip">{beat.genres[0]}</span>}
                </div>
                <div className="cc-beat__meta">
                  {[beat.producer || "Cabaña Creative", beat.bpm ? `${beat.bpm} BPM` : null, beat.key]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </div>
              {beat.preview_mp3_url ? (
                <button
                  type="button"
                  className="cc-beat__play"
                  onClick={() => toggle(beat)}
                  aria-label={playingId === beat.id ? `Pausar ${beat.title}` : `Escuchar ${beat.title}`}
                >
                  {playingId === beat.id ? <Pause size={14} fill="#fff" /> : <Play size={14} fill="#fff" />}
                </button>
              ) : (
                <span className="cc-beat__lock" aria-hidden="true">
                  <Lock size={14} />
                </span>
              )}
            </div>
          ))}

          {locked.map((beat) => (
            <div key={beat.id} className="cc-beat is-locked" data-reveal>
              {beat.cover_url ? <img src={beat.cover_url} alt="" loading="lazy" /> : <span />}
              <div>
                <div className="cc-beat__title">{beat.title}</div>
                <div className="cc-beat__meta">
                  {[beat.producer || "Cabaña Creative", beat.genres?.[0]].filter(Boolean).join(" · ")}
                </div>
              </div>
              <span className="cc-beat__lock" aria-hidden="true">
                <Lock size={14} />
              </span>
            </div>
          ))}
        </div>

        <p className="cc-beats__note">
          <Lock size={11} /> Disponible dentro de la plataforma. Las descargas se hacen desde tu cuenta.
        </p>
      </div>
    </section>
  );
}