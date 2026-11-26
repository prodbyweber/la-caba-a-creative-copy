import React from "react";
import ChoiceList from "@/components/admision/ChoiceList";
import { STAGE_OPTIONS } from "@/lib/admissionScreens";

export default function StageScreen({ data, set, errors }) {
  return (
    <div>
      <h1 className="adm-title">¿En qué etapa está tu proyecto?</h1>
      <ChoiceList
        options={STAGE_OPTIONS}
        value={data.project_stage}
        onChange={(value) => set("project_stage", value)}
      />
      {errors.project_stage ? <p className="adm-error">{errors.project_stage}</p> : null}
    </div>
  );
}