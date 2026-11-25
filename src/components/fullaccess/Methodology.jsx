import React from "react";
import { motion } from "framer-motion";

export default function Methodology({ settings, stages }) {
  return (
    <section className="fa-sec fa-sec--line" id="metodologia">
      <div className="fa-wrap">
        <div className="fa-sec-head">
          <span className="fa-eyebrow">Metodología</span>
          <h2 className="fa-display fa-h2">{settings.method_title}</h2>
          <p className="fa-lead">{settings.method_subtitle}</p>
        </div>

        <div className="fa-stages">
          {stages.map((stage, index) => (
            <motion.div
              className="fa-stage"
              key={stage.id || stage.num || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-70px" }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
            >
              <span className="fa-stage__num">{stage.num || String(index + 1).padStart(2, "0")}</span>
              <h3 className="fa-stage__title">{stage.title}</h3>
              <div className="fa-stage__body">
                {stage.items?.length ? (
                  <ul className="fa-stage__list">
                    {stage.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
                {stage.result ? (
                  <p className="fa-stage__result" style={{ marginTop: 18 }}>
                    <b>Resultado</b>
                    {stage.result}
                  </p>
                ) : null}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}