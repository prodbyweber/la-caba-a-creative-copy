import { useCallback, useRef, useState } from "react";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * Reordena una lista vertical arrastrando con ratón o dedo desde un asa.
 * El asa debe tener touch-action: none para que el gesto no desplace la página.
 */
export default function useDragSort({ count, onMove }) {
  const listRef = useRef(null);
  const dragRef = useRef(null);
  const [drag, setDrag] = useState(null);

  const start = useCallback(
    (index) => (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      const list = listRef.current;
      if (!list || count < 2) return;
      const rects = Array.from(list.children).map((node) => node.getBoundingClientRect());
      const step = rects.length > 1 ? rects[1].top - rects[0].top : rects[0]?.height || 0;
      if (!step) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture?.(event.pointerId);
      const next = {
        from: index,
        to: index,
        dy: 0,
        step,
        startY: event.clientY,
        pointerId: event.pointerId,
      };
      dragRef.current = next;
      setDrag(next);
    },
    [count]
  );

  const track = useCallback(
    (event) => {
      const current = dragRef.current;
      if (!current || current.pointerId !== event.pointerId) return;
      const dy = event.clientY - current.startY;
      const to = clamp(current.from + Math.round(dy / current.step), 0, count - 1);
      const next = { ...current, dy, to };
      dragRef.current = next;
      setDrag(next);
    },
    [count]
  );

  const end = useCallback(() => {
    const current = dragRef.current;
    if (!current) return;
    dragRef.current = null;
    if (current.to === current.from) {
      setDrag(null);
      return;
    }
    // Coloca la fila en su hueco nuevo sin animación antes de soltar el estado.
    setDrag({ ...current, from: current.to, to: current.to, dy: 0 });
    onMove(current.from, current.to);
    window.requestAnimationFrame(() => setDrag(null));
  }, [onMove]);

  /** Desplazamiento visual de cada fila mientras se arrastra. */
  const offset = useCallback(
    (index) => {
      if (!drag) return 0;
      if (index === drag.from) return drag.dy;
      if (drag.from < drag.to && index > drag.from && index <= drag.to) return -drag.step;
      if (drag.from > drag.to && index < drag.from && index >= drag.to) return drag.step;
      return 0;
    },
    [drag]
  );

  return { listRef, drag, offset, start, track, end };
}