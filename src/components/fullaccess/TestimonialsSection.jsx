import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TestimonialCard from "@/components/fullaccess/TestimonialCard";

const PER_ROUND = 3;

/** Testimonios estilo Netflix: carrusel horizontal que avanza de 3 en 3. */
export default function TestimonialsSection({ items = [] }) {
  const railRef = useRef(null);
  const list = items.filter((item) => item.is_visible !== false && item.video_url);

  if (!list.length) return null;

  const step = (direction) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.firstElementChild;
    if (!card) return;
    const styles = window.getComputedStyle(rail);
    const gap = parseFloat(styles.columnGap || styles.gap || "12") || 12;
    const round = (card.getBoundingClientRect().width + gap) * PER_ROUND;
    rail.scrollBy({ left: direction * round, behavior: "smooth" });
  };

  return (
    <section className="fa-testis-sec" id="testimonios">
      <div className="fa-wrap">
        <div className="fa-testis__wrap">
          <div className="fa-testis__head">
            <h2 className="fa-display fa-testis__title">Experiencias que dejan huella</h2>
            <div className="fa-testis__nav">
              <button
                type="button"
                className="fa-testis__arrow"
                onClick={() => step(-1)}
                aria-label="Testimonios anteriores"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className="fa-testis__arrow"
                onClick={() => step(1)}
                aria-label="Siguientes testimonios"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="fa-testis" ref={railRef}>
            {list.map((item) => (
              <TestimonialCard key={item.id || item.video_url} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}