import React from "react";
import ChoiceList from "@/components/admision/ChoiceList";
import { COUNTRIES } from "@/lib/countries";
import { MODALITY_OPTIONS } from "@/lib/admissionScreens";

export default function LocationScreen({ data, set, errors }) {
  return (
    <div>
      <h1 className="adm-title">¿Dónde te ubicas?</h1>

      <div className="adm-fields">
        <label className="adm-field">
          <span className="adm-field__label">País</span>
          <select value={data.country} onChange={(event) => set("country", event.target.value)}>
            {COUNTRIES.map((country) => (
              <option key={country.code} value={country.name}>
                {country.name}
              </option>
            ))}
          </select>
          {errors.country ? <span className="adm-field__error">{errors.country}</span> : null}
        </label>

        <label className="adm-field">
          <span className="adm-field__label">Ciudad</span>
          <input
            type="text"
            value={data.city}
            onChange={(event) => set("city", event.target.value)}
            placeholder="Tu ciudad"
            autoComplete="address-level2"
          />
          {errors.city ? <span className="adm-field__error">{errors.city}</span> : null}
        </label>
      </div>

      <h2 className="adm-question">¿Cómo prefieres trabajar?</h2>
      <ChoiceList
        options={MODALITY_OPTIONS}
        value={data.modality}
        onChange={(value) => set("modality", value)}
      />
      {errors.modality ? <p className="adm-error">{errors.modality}</p> : null}
    </div>
  );
}