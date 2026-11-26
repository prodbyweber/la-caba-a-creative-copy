import React from "react";
import ChoiceList from "@/components/admision/ChoiceList";
import { BUDGET_OPTIONS, INVESTMENT_NOTE, RELEASE_OPTIONS } from "@/lib/admissionScreens";

export default function ReleaseScreen({ data, set, errors }) {
  return (
    <div>
      <h1 className="adm-title">¿Qué formato de lanzamiento tienes en mente?</h1>
      <ChoiceList
        options={RELEASE_OPTIONS}
        value={data.release_type}
        onChange={(value) => set("release_type", value)}
      />
      {errors.release_type ? <p className="adm-error">{errors.release_type}</p> : null}

      <p className="adm-note">{INVESTMENT_NOTE}</p>

      <h2 className="adm-question">¿Qué presupuesto tienes previsto para desarrollar tu proyecto?</h2>
      <ChoiceList
        options={BUDGET_OPTIONS}
        value={data.budget}
        onChange={(value) => set("budget", value)}
      />
      {errors.budget ? <p className="adm-error">{errors.budget}</p> : null}
    </div>
  );
}