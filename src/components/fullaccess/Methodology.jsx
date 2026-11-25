import React from "react";
import { motion } from "framer-motion";
import StageVisual from "@/components/fullaccess/StageVisual";

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
            <motion.article
              className="fa-stage"
              key={stage.id || stage.num || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-70px" }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
            >
              <span className="fa-stage__num">{stage.num || String(index + 1).padStart(2, "0")}</span>

              <div className="fa-stage__head">
                <h3 className="fa-stage__title">{stage.title}</h3>
                {stage.text ? <p className="fa-stage__text">{stage.text}</p> : null}
              </div>

              <div className="fa-stage__body">
                <StageVisual stage={stage} />

                {stage.items?.length ? (
                  <ul className="fa-stage__list">
                    {stage.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}

                {stage.result ? (
                  <p className="fa-stage__result">
                    <b>Resultado</b>
                    {stage.result}
                  </p>
                ) : null}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}