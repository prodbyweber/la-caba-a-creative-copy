import React from "react";
import ChoiceList from "@/components/admision/ChoiceList";
import { RELEASE_DATE_OPTIONS, RELEASE_OPTIONS } from "@/lib/admissionScreens";

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

      <h2 className="adm-question">¿Cuándo te gustaría lanzarlo?</h2>
      <ChoiceList
        options={RELEASE_DATE_OPTIONS}
        value={data.release_date}
        onChange={(value) => set("release_date", value)}
      />
      {errors.release_date ? <p className="adm-error">{errors.release_date}</p> : null}
    </div>
  );
}