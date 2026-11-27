import React from "react";
import ChoiceList from "@/components/admision/ChoiceList";
import { RELEASE_OPTIONS } from "@/lib/admissionScreens";

export default function ReleaseScreen({ data, set, errors }) {
  return (
    <div>
      <h1 className="adm-title">¿Qué te gustaría crear en esta etapa de tu proyecto?</h1>
      <ChoiceList
        options={RELEASE_OPTIONS}
        value={data.release_type}
        onChange={(value) => set("release_type", value)}
      />
      {errors.release_type ? <p className="adm-error">{errors.release_type}</p> : null}
    </div>
  );
}