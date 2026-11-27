import React from "react";
import CountryField from "@/components/admision/CountryField";

export default function CountryScreen({ data, set, errors }) {
  return (
    <div>
      <h1 className="adm-title">¿Dónde te ubicas?</h1>

      <div className="adm-fields">
        <div className="adm-field">
          <span className="adm-field__label">País</span>
          <CountryField
            value={data.country}
            onChange={(value) => set("country", value)}
            error={errors.country}
          />
          {errors.country ? <span className="adm-field__error">{errors.country}</span> : null}
        </div>
      </div>
    </div>
  );
}