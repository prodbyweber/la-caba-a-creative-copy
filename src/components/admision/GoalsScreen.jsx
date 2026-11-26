import React from "react";
import ChoiceList from "@/components/admision/ChoiceList";
import { GOAL_OPTIONS } from "@/lib/admissionScreens";

export default function GoalsScreen({ data, set, errors }) {
  return (
    <div>
      <h1 className="adm-title">¿Qué quieres conseguir con este proyecto?</h1>
      <p className="adm-hint-inline">Puedes elegir varios.</p>

      <ChoiceList
        options={GOAL_OPTIONS}
        value={data.goals}
        onChange={(value) => set("goals", value)}
        multi
      />
      {errors.goals ? <p className="adm-error">{errors.goals}</p> : null}
    </div>
  );
}