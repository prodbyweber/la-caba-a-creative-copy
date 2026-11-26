import React from "react";
import ChoiceList from "@/components/admision/ChoiceList";
import { AVAILABILITY_OPTIONS, BUDGET_OPTIONS, INVESTMENT_NOTE } from "@/lib/admissionScreens";

export default function AvailabilityScreen({ data, set, errors }) {
  return (
    <div>
      <h1 className="adm-title">¿Cuándo puedes empezar?</h1>
      <ChoiceList
        options={AVAILABILITY_OPTIONS}
        value={data.availability}
        onChange={(value) => set("availability", value)}
      />
      {errors.availability ? <p className="adm-error">{errors.availability}</p> : null}

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