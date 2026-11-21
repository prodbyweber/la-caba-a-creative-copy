import React, { useEffect, useRef } from "react";
import Matter from "matter-js";
import { ArrowRight } from "lucide-react";
import Counter from "./Counter";
import CtaLink from "./CtaLink";
import { flagUrl } from "@/lib/countries";

const { Engine, World, Bodies, Body } = Matter;
const MAX_FLAGS = 16;

/** Países: cifra grande y banderas hexagonales que caen con física real. */
export default function CountriesSection({ section, flags = [] }) {
  const stageRef = useRef(null);
  const itemsRef = useRef([]);
  const bodiesRef = useRef([]);

  const list = flags.filter((f) => f.is_visible !== false && f.code).slice(0, MAX_FLAGS);

  const raw = String(section?.title || "+30");
  const prefix = raw.trim().startsWith("+") ? "+" : "";
  const value = Number(raw.replace(/\D/g, "")) || 0;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || list.length === 0) return undefined;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let engine = null;
    let bodies = [];
    let frame = 0;
    let running = false;

    const paint = () => {
      bodies.forEach((body, i) => {
        const el = itemsRef.current[i];
        if (!el) return;
        el.style.transform = `translate3d(${body.position.x - el.offsetWidth / 2}px, ${
          body.position.y - el.offsetHeight / 2
        }px, 0) rotate(${body.angle}rad)`;
      });
    };

    const build = () => {
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      const size = itemsRef.current[0]?.offsetWidth || 56;
      const radius = size / 2;

      engine = Engine.create({ gravity: { x: 0, y: 1.15 } });
      const wall = { isStatic: true, friction: 0.4 };

      World.add(engine.world, [
        Bodies.rectangle(width / 2, height + 70, width + 800, 140, wall),
        Bodies.rectangle(-70, height / 2, 140, height * 3, wall),
        Bodies.rectangle(width + 70, height / 2, 140, height * 3, wall),
      ]);

      bodies = list.map((flag, i) => {
        const body = Bodies.circle(
          50 + Math.random() * Math.max(width - 100, 40),
          -70 - i * 78,
          radius,
          { restitution: 0.45, friction: 0.06, frictionAir: 0.014, density: 0.0014 }
        );
        Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.2);
        return body;
      });

      World.add(engine.world, bodies);
      bodiesRef.current = bodies;
    };

    const tick = () => {
      Engine.update(engine, 1000 / 60);
      paint();
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;

      if (engine) {
        World.clear(engine.world, false);
        Engine.clear(engine);
      }
      build();
      stage.classList.add("is-live");
      paint();

      if (reduce) {
        for (let i = 0; i < 280; i += 1) Engine.update(engine, 1000 / 60);
        paint();
        running = false;
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const stop = () => {
      running = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    build();

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && entry.intersectionRatio > 0.35) start();
        else if (!entry.isIntersecting) stop();
      },
      { threshold: [0, 0.35, 0.6] }
    );
    observer.observe(stage);

    const onMove = (event) => {
      const rect = stage.getBoundingClientRect();
      const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      bodies.forEach((body) => {
        const dx = body.position.x - point.x;
        const dy = body.position.y - point.y;
        const distance = Math.hypot(dx, dy) || 1;
        if (distance < 120) {
          const power = 0.0006 * (1 - distance / 120);
          Body.applyForce(body, body.position, {
            x: (dx / distance) * power,
            y: (dy / distance) * power,
          });
        }
      });
    };
    stage.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      observer.disconnect();
      stage.removeEventListener("pointermove", onMove);
      stop();
      if (engine) {
        World.clear(engine.world, false);
        Engine.clear(engine);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.length]);

  return (
    <section className="ccl-snap ccl-paises" id="paises">
      <div className="ccl-paises__stage" ref={stageRef} aria-hidden="true">
        {list.map((flag, i) => (
          <span
            className="ccl-paises__flag"
            key={flag.id || flag.code}
            ref={(el) => {
              itemsRef.current[i] = el;
            }}
          >
            <span className="ccl-paises__hex">
              <img src={flagUrl(flag.code)} alt="" loading="lazy" draggable={false} />
            </span>
          </span>
        ))}
      </div>

      <div className="ccl-paises__content">
        <div className="ccl-paises__figure">
          <Counter value={value} prefix={prefix} className="ccl-paises__num" />
          {section?.subtitle && <span className="ccl-paises__unit">{section.subtitle}</span>}
        </div>

        {section?.body && <p className="ccl-paises__text">{section.body}</p>}

        {section?.cta_label && (
          <CtaLink to={section.cta_link || "#generos"} className="ccl-btn ccl-btn--primary ccl-paises__cta">
            {section.cta_label} <ArrowRight size={14} />
          </CtaLink>
        )}
      </div>
    </section>
  );
}