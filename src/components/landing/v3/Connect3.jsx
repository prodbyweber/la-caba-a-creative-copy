import React from "react";
import { Link } from "react-router-dom";
import { Mic2, Music2, PenLine, Video, Sparkles, Building2, ArrowUpRight } from "lucide-react";
import { CONNECT_CTA, ROLES } from "./constants";

const ICONS = [Mic2, Music2, PenLine, Video, Sparkles, Building2];

export default function Connect3({ section }) {
  return (
    <section className="ccl-sec" id="creadores">
      <div className="ccl-wrap">
        <div data-reveal>
          <span className="ccl-eyebrow">Ecosistema creativo</span>
          <h2 className="ccl-h2">{section?.title || "Las grandes ideas no se construyen solos."}</h2>
          <p className="ccl-lead">
            {section?.subtitle ||
              "Conectamos talento, creatividad y nuevas perspectivas para desarrollar proyectos que merecen ser escuchados."}
          </p>
        </div>

        <div className="ccl-roles">
          {ROLES.map((role, i) => {
            const Icon = ICONS[i] || Sparkles;
            return (
              <div key={role} className="ccl-role" data-reveal>
                <Icon size={14} />
                {role}
              </div>
            );
          })}
        </div>

        <div className="ccl-connect__cta">
          <Link to={CONNECT_CTA} className="ccl-btn ccl-btn--primary">
            Conectar con Cabaña <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}