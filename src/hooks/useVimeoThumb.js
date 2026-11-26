import { useEffect, useState } from "react";

/**
 * Recupera la miniatura del VSL desde Vimeo oEmbed, su relación de aspecto
 * y su valor numérico (ancho / alto) para calcular la altura real del vídeo.
 */
export default function useVimeoThumb(vimeoUrl, fallback) {
  const [poster, setPoster] = useState(fallback || "");
  const [ratio, setRatio] = useState("16 / 9");
  const [ratioValue, setRatioValue] = useState(16 / 9);

  useEffect(() => {
    if (!vimeoUrl) return undefined;
    const id = vimeoUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1];
    if (!id) return undefined;
    const hash = vimeoUrl.match(/[?&]h=([a-zA-Z0-9]+)/)?.[1];
    const target = hash ? `https://vimeo.com/${id}/${hash}` : `https://vimeo.com/${id}`;

    let alive = true;
    fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(target)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!alive || !data) return;
        if (data.thumbnail_url) setPoster(data.thumbnail_url);
        if (data.width && data.height) {
          setRatio(`${data.width} / ${data.height}`);
          setRatioValue(data.width / data.height);
        }
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, [vimeoUrl]);

  return { poster, ratio, ratioValue };
}