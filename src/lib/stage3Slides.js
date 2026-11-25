import { ARTIST_SLIDES } from "@/lib/startArtistSlides";

const SHOT = (id, name) => ({
  name,
  src: `https://media.base44.com/images/public/6966ddf48947f217e81ea27c/${id}/v1/fit/w_1400,h_1400,al_c,q_82/file.jpg`,
});

/**
 * Etapa Lanzar: los tres perfiles nuevos y las dos últimas tarjetas tal cual.
 */
export const STAGE3_SLIDES = [
  SHOT(
    "2784f79dd315cd18a573360ffe483297_Capturadepantalla2026-11-25alas144040.png",
    "Santiago Weber"
  ),
  SHOT(
    "2263680c252dfe0042c99e1db95cb2c9_Capturadepantalla2026-11-25alas144100.png",
    "YADAM"
  ),
  SHOT(
    "eb0878502ebe9cfa134473f2d8a6fb41_Capturadepantalla2026-11-25alas144133.png",
    "MAYO"
  ),
  ARTIST_SLIDES[3],
  ARTIST_SLIDES[4],
];