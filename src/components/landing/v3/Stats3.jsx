import React from "react";
import Counter from "./Counter";

export default function Stats3({ section, stats = [] }) {
  const list = stats.filter((s) => s.is_visible !== false);
  const words = (section?.title || "").trim().split(" ").filter(Boolean);
  const last = words.length > 1 ? words.pop() : "";
  const head = words.join(" ");

  return (
    <section className="ccl-snap ccl-snap--light" id="cifras">
      <div className="ccl-wrap ccl-snap__inner">
        {section?.eyebrow && <span className="ccl-eyebrow">{section.eyebrow}</span>}
        <h2 className="ccl-display ccl-stats__title">
          {head} {last && <em>{last}</em>}
        </h2>
        {section?.subtitle && <p className="ccl-lead">{section.subtitle}</p>}

        <div className="ccl-statgrid">
          {list.map((stat, i) => (
            <div className={`ccl-statcard ccl-statcard--${i % 3}`} key={stat.id || stat.label}>
              <Counter
                value={stat.value || 0}
                prefix={stat.prefix || ""}
                suffix={stat.suffix || ""}
                className="ccl-statcard__value"
              />
              <span className="ccl-statcard__label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}