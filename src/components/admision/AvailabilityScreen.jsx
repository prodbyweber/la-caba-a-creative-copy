import React from "react";
import ChoiceList from "@/components/admision/ChoiceList";
import { AVAILABILITY_OPTIONS, START_TEXT } from "@/lib/admissionScreens";

export default function AvailabilityScreen({ data, set, errors }) {
  return (
    <div>
      <h1 className="adm-title">¿Cuándo te gustaría comenzar?</h1>
      <p className="adm-hint-inline">{START_TEXT}</p>

      <ChoiceList
        options={AVAILABILITY_OPTIONS}
        value={data.availability}
        onChange={(value) => set("availability", value)}
      />
      {errors.availability ? <p className="adm-error">{errors.availability}</p> : null}
    </div>
  );
}