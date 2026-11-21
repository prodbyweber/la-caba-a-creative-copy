import React from "react";

export default function BrandsSection({ section, logos = [] }) {
  const list = (logos || []).filter(Boolean);
  if (!list.length) return null;

  return (
    <section className="ccl-snap ccl-snap--dark" id="marcas">
      <div className="ccl-wrap ccl-snap__inner">
        {section?.eyebrow && <span className="ccl-eyebrow">{section.eyebrow}</span>}
        <h2 className="ccl-display ccl-h2" style={{ marginTop: 12 }}>
          {section?.title}
        </h2>
        {section?.subtitle && <p className="ccl-lead">{section.subtitle}</p>}

        <div className="ccl-brandgrid">
          {list.map((url, i) => (
            <div className="ccl-brandcell" key={`${url}-${i}`}>
              <img src={url} alt="" loading="lazy" draggable={false} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}