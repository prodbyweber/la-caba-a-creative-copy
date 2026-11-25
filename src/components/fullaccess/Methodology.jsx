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

        <div className="fa-method">
          {stages.map((stage, index) => (
            <motion.article
              className="fa-method__card"
              key={stage.id || stage.num || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-70px" }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
            >
              <div className="fa-method__top">
                <span className="fa-method__num">
                  {stage.num || String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="fa-method__title">{stage.title}</h3>
              </div>

              {stage.text ? <p className="fa-method__text">{stage.text}</p> : null}

              <StageVisual stage={stage} />

              {stage.items?.length ? (
                <div className="fa-method__chips">
                  {stage.items.slice(0, 6).map((item) => (
                    <span className="fa-method__chip" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}