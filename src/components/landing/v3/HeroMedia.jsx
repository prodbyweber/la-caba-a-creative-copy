import React, { useEffect, useRef, useState } from "react";

const ROTATE_MS = 7000;

/** Rotación de vídeos del hero: crossfade suave, zoom lento, sin controles. */
export default function HeroMedia({ videos = [], poster = "" }) {
  const list = videos.filter((v) => v.is_visible !== false && v.video_url);
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState({});
  const refs = useRef([]);

  useEffect(() => {
    if (list.length < 2) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % list.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [list.length]);

  useEffect(() => {
    list.forEach((video, i) => {
      const el = refs.current[i];
      if (!el) return;
      el.muted = true;
      if (i === index) {
        const attempt = el.play();
        if (attempt && attempt.catch) attempt.catch(() => setFailed((f) => ({ ...f, [video.video_url]: true })));
      } else {
        try {
          el.pause();
        } catch (e) {
          /* noop */
        }
      }
    });
  }, [index, list.length]);

  if (list.length === 0) {
    return poster ? <img className="ccl-media__el" src={poster} alt="" aria-hidden="true" /> : null;
  }

  return (
    <div className="ccl-hero__rotator">
      {list.map((video, i) => {
        const active = i === index;
        if (failed[video.video_url]) {
          const still = video.poster_url || poster;
          return still ? (
            <img
              key={video.video_url}
              className={`ccl-hero__frame ccl-media__el ${active ? "is-on" : ""}`}
              src={still}
              alt=""
              aria-hidden="true"
            />
          ) : null;
        }
        return (
          <div key={video.video_url} className={`ccl-hero__frame ${active ? "is-on" : ""}`}>
            <video
              ref={(el) => {
                refs.current[i] = el;
              }}
              className="ccl-media__el ccl-amb"
              src={video.video_url}
              poster={video.poster_url || poster || undefined}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              controls={false}
              disablePictureInPicture
              disableRemotePlayback
              controlsList="nodownload nofullscreen noremoteplayback"
              tabIndex={-1}
              aria-hidden="true"
              onError={() => setFailed((f) => ({ ...f, [video.video_url]: true }))}
              onContextMenu={(e) => e.preventDefault()}
              onClick={(e) => e.preventDefault()}
            />
          </div>
        );
      })}
      <span className="ccl-amb__shield" aria-hidden="true" />
    </div>
  );
}