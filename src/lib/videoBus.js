/**
 * Un único vídeo puede sonar en la página.
 * Cada reproductor reclama el turno antes de arrancar y el bus pausa al que
 * estuviera activo, así que nunca hay dos vídeos reproduciéndose a la vez.
 */
let active = null;

export function claimPlayback(id, pause) {
  const previous = active;
  active = { id, pause };
  if (previous && previous.id !== id) {
    try {
      previous.pause();
    } catch {
      /* el reproductor anterior ya no existe */
    }
  }
}

export function releasePlayback(id) {
  if (active && active.id === id) active = null;
}