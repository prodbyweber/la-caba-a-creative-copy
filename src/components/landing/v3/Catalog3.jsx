import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Play, Pause, Lock, ArrowUpRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { CATALOG_CTA, GENRES } from "./constants";

export default function Catalog3({ section, creators = [], beats = [] }) {
  const [beatList, setBeatList] = useState([]);
  const [playing, setPlaying] = useState(null);
  const audioRef = useRef(null);

  const tracks = useMemo(
    () => creators.filter((c) => c.is_public !== false && (c.audio_url || c.cover_url)),
    [creators]
  );

  const ids = useMemo(
    () => beats.filter((b) => b.is_visible !== false && b.beat_id).map((b) => b.beat_id),
    [beats]
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const found = ids.length ? await base44.entities.Beat.filter({ id: { $in: ids } }) : [];
        const ordered = ids.map((id) => found.find((b) => b.id === id)).filter(Boolean);
        if (alive) setBeatList(ordered);
      } catch (e) {
        if (alive) setBeatList([]);
      }
    })();
    return () => {
      alive = false;
      audioRef.current?.pause();
    };
  }, [ids]);

  const toggle = (key, src) => {
    const audio = audioRef.current;
    if (!audio || !src) return;
    if (playing === key) {
      audio.pause();
      setPlaying(null);
      return;
    }
    audio.src = src;
    audio.play().then(() => setPlaying(key)).catch(() => setPlaying(null));
  };

  return (
    <section className="ccl-sec" id="catalogo">
      <audio ref={audioRef} preload="none" onEnded={() => setPlaying(null)} />
      <div className="ccl-wrap">
        <div data-reveal>
          <span className="ccl-eyebrow">Catálogo</span>
          <h2 className="ccl-h2">{section?.title || "Escucha lo que se produce aquí."}</h2>
          <p className="ccl-lead">
            {section?.subtitle ||
              "Proyectos, canciones y beats que nacen en la Cabaña. Escucha una muestra y entra al catálogo completo."}
          </p>
        </div>

        <div className="ccl-genres" style={{ marginTop: 22 }}>
          {GENRES.map((genre) => (
            <Link key={genre} to={CATALOG_CTA} className="ccl-genre">
              {genre}
            </Link>
          ))}
        </div>

        {tracks.length > 0 && (
          <div className="ccl-tracks">
            {tracks.map((track, idx) => {
              const key = `t-${track.id || idx}`;
              const isPlaying = playing === key;
              return (
                <article key={key} className="ccl-track" data-reveal>
                  <div className="ccl-track__cover">
                    {track.cover_url || track.photo_url ? (
                      <img
                        src={track.cover_url || track.photo_url}
                        alt={`Portada de ${track.track_title || track.name}`}
                        loading="lazy"
                      />
                    ) : null}
                    {track.audio_url && (
                      <button
                        type="button"
                        className="ccl-track__play"
                        onClick={() => toggle(key, track.audio_url)}
                        aria-label={isPlaying ? `Pausar ${track.track_title}` : `Escuchar ${track.track_title}`}
                      >
                        {isPlaying ? <Pause size={15} fill="#fff" /> : <Play size={15} fill="#fff" />}
                      </button>
                    )}
                  </div>
                  <h3 className="ccl-track__title">{track.track_title || track.name}</h3>
                  <p className="ccl-track__meta">{[track.name, track.genre].filter(Boolean).join(" · ")}</p>
                </article>
              );
            })}
          </div>
        )}

        {beatList.length > 0 && (
          <div className="ccl-beats">
            {beatList.map((beat) => {
              const key = `b-${beat.id}`;
              const isPlaying = playing === key;
              return (
                <div key={key} className="ccl-beat" data-reveal>
                  {beat.cover_url ? (
                    <img className="ccl-beat__cover" src={beat.cover_url} alt="" loading="lazy" />
                  ) : (
                    <span className="ccl-beat__cover" />
                  )}
                  <div className="ccl-beat__body">
                    <div className="ccl-beat__title">{beat.title}</div>
                    <div className="ccl-beat__meta">
                      {[beat.producer || "Cabaña Creative", beat.bpm ? `${beat.bpm} BPM` : null, beat.key]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  </div>
                  {beat.preview_mp3_url ? (
                    <button
                      type="button"
                      className="ccl-beat__play"
                      onClick={() => toggle(key, beat.preview_mp3_url)}
                      aria-label={isPlaying ? `Pausar ${beat.title}` : `Escuchar ${beat.title}`}
                    >
                      {isPlaying ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
                    </button>
                  ) : (
                    <span className="ccl-beat__play" aria-hidden="true">
                      <Lock size={12} />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="ccl-catalog__foot">
          <span className="ccl-catalog__note">
            <Lock size={11} /> Beats y descargas completas dentro de la plataforma.
          </span>
          <Link to={CATALOG_CTA} className="ccl-btn ccl-btn--primary">
            Explorar catálogo completo <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}