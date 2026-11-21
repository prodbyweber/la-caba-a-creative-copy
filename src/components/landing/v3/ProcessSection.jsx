import React from "react";
import {
  Sparkles,
  Disc3,
  Target,
  Rocket,
  Music2,
  Mic2,
  TrendingUp,
  Layers,
} from "lucide-react";

const ICONS = {
  sparkles: Sparkles,
  disc: Disc3,
  target: Target,
  rocket: Rocket,
  music: Music2,
  mic: Mic2,
  trending: TrendingUp,
  layers: Layers,
};

export default function ProcessSection({ section, steps = [] }) {
  const list = steps.filter((s) => s.is_visible !== false);

  return (
    <section className="ccl-snap ccl-snap--dark" id="proceso">
      <div className="ccl-wrap ccl-snap__inner">
        {section?.eyebrow && <span className="ccl-eyebrow">{section.eyebrow}</span>}
        <h2 className="ccl-display ccl-h2" style={{ marginTop: 12 }}>
          {section?.title}
        </h2>
        {section?.subtitle && <p className="ccl-small">{section.subtitle}</p>}

        <div className="ccl-proc__list">
          {list.map((step, i) => {
            const Icon = ICONS[step.icon] || Sparkles;
            return (
              <article className="ccl-proccard" key={step.id || step.title}>
                <span className="ccl-proccard__num">{step.num || `0${i + 1}`}</span>
                <span className="ccl-proccard__icon">
                  <Icon size={18} />
                </span>
                <div className="ccl-proccard__body">
                  <h3 className="ccl-proccard__title">{step.title}</h3>
                  <p className="ccl-proccard__text">{step.text}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}