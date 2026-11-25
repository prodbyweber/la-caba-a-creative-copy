import React, { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

let activeAudio = null;

const BARS = 32;

export default function DemoCard({ demo }) {
  const audioRef = useRef(null);
  const [version, setVersion] = useState("demo");
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const src = version === "demo" ? demo.demo_audio_url : demo.master_audio_url;
  const hasDemo = !!demo.demo_audio_url;
  const hasMaster = !!demo.master_audio_url;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      if (audio.duration) setProgress(audio.currentTime / audio.duration);
    };
    const onEnd = () => {
      setPlaying(false);
      setProgress(0);
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  const switchVersion = (next) => {
    if (next === version) return;
    const audio = audioRef.current;
    const wasPlaying = playing;
    setVersion(next);
    setProgress(0);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      if (wasPlaying) {
        setTimeout(() => audio.play().catch(() => setPlaying(false)), 80);
      } else {
        setPlaying(false);
      }
    }
  };

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio || !src) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    if (activeAudio && activeAudio !== audio) activeAudio.pause();
    activeAudio = audio;
    audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };

  const lit = Math.round(progress * BARS);

  return (
    <article className="fa-demo">
      <div className="fa-demo__top">
        <div>
          <h3 className="fa-demo__artist">{demo.song || demo.artist}</h3>
          <p className="fa-demo__genre">
            {[demo.song ? demo.artist : null, demo.genre].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="fa-demo__toggle" role="group" aria-label="Versión">
          <button
            type="button"
            className={`fa-demo__opt${version === "demo" ? " is-on" : ""}`}
            onClick={() => switchVersion("demo")}
            disabled={!hasDemo}
          >
            Demo
          </button>
          <button
            type="button"
            className={`fa-demo__opt${version === "master" ? " is-on" : ""}`}
            onClick={() => switchVersion("master")}
            disabled={!hasMaster}
          >
            Master
          </button>
        </div>
      </div>

      <div className="fa-demo__player">
        <button type="button" className="fa-demo__play" onClick={toggle} aria-label="Reproducir">
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <div className="fa-demo__wave" aria-hidden="true">
          {Array.from({ length: BARS }).map((_, index) => (
            <span
              key={index}
              className={`fa-demo__bar${index < lit ? " is-on" : ""}`}
              style={{ height: `${22 + ((index * 37) % 78)}%` }}
            />
          ))}
        </div>
      </div>

      {demo.description ? <p className="fa-demo__desc">{demo.description}</p> : null}

      <audio ref={audioRef} src={src || undefined} preload="none" />
    </article>
  );
}