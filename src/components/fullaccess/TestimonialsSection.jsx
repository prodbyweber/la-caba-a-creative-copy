import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TestimonialCard from "@/components/fullaccess/TestimonialCard";

/** Testimonios en tarjetas verticales con scroll horizontal (3 por ronda). */
export default function TestimonialsSection({ items = [] }) {
  const railRef = useRef(null);
  const list = items.filter((item) => item.is_visible !== false && item.video_url);

  if (!list.length) return null;

  const step = (direction) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.firstElementChild;
    const width = card ? card.getBoundingClientRect().width + 14 : rail.clientWidth;
    rail.scrollBy({ left: direction * width, behavior: "smooth" });
  };

  return (
    <section className="fa-block" id="testimonios">
      <div className="fa-wrap">
        <div className="fa-testis__wrap">
          <div className="fa-testis__head">
            <h2 className="fa-display fa-h2">Testimonios</h2>
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