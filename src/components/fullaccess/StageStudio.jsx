import React, { useEffect, useRef, useState } from "react";
import { vimeoEmbedUrl } from "@/lib/fullAccess";

export default function StageStudio({ url }) {
  const holderRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const isVimeo = /vimeo\.com/.test(url || "");

  useEffect(() => {
    const el = holderRef.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="fa-studio" ref={holderRef}>
      {url && visible && isVimeo ? (
        <iframe
          src={vimeoEmbedUrl(url, {
            background: "1",
            autoplay: "1",
            loop: "1",
            muted: "1",
            controls: "0",
            dnt: "1",
          })}
          title="Estudio"
          allow="autoplay; fullscreen; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : null}

      {url && visible && !isVimeo ? (
        <video src={url} autoPlay muted loop playsInline preload="none" />
      ) : null}
    </div>
  );
}