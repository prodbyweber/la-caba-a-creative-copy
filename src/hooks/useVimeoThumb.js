import { useEffect, useState } from "react";

/**
 * Recupera la miniatura del VSL desde Vimeo oEmbed, su relación de aspecto
 * y su valor numérico (ancho / alto) para calcular la altura real del vídeo.
 */
export default function useVimeoThumb(vimeoUrl, fallback, size = "1280x720") {
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
        // Vimeo entrega la miniatura recortada al tamaño pedido: se pide uno
        // acorde a la tarjeta para que no haya zoom ni recorte.
        if (data.thumbnail_url) {
          setPoster(data.thumbnail_url.replace(/-d_\d+x\d+/, `-d_${size}`));
        }
        if (data.width && data.height) {
          setRatio(`${data.width} / ${data.height}`);
          setRatioValue(data.width / data.height);
        }
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, [vimeoUrl, size]);

  return { poster, ratio, ratioValue };
}