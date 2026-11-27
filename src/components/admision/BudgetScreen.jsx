import React from "react";
import ChoiceList from "@/components/admision/ChoiceList";
import {
  BUDGET_OPTIONS,
  INVESTMENT_SUBTEXT,
  INVESTMENT_TEXT,
  INVESTMENT_TITLE,
} from "@/lib/admissionScreens";

export default function BudgetScreen({ data, set, errors }) {
  return (
    <div>
      <h1 className="adm-title">{INVESTMENT_TITLE}</h1>
      <p className="adm-note">{INVESTMENT_TEXT}</p>
      <p className="adm-hint-inline">{INVESTMENT_SUBTEXT}</p>

      <h2 className="adm-question">
        ¿Qué presupuesto tienes previsto para el desarrollo de tu proyecto?
      </h2>
      <ChoiceList
        options={BUDGET_OPTIONS}
        value={data.budget}
        onChange={(value) => set("budget", value)}
      />
      {errors.budget ? <p className="adm-error">{errors.budget}</p> : null}
    </div>
  );
}