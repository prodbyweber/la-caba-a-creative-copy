import React from "react";
import PhoneField from "@/components/admision/PhoneField";

export default function ContactScreen({ data, set, errors }) {
  return (
    <div>
      <h1 className="adm-title">
        Déjanos tus datos para saber quién está detrás del proyecto y poder contactar contigo.
      </h1>

      <div className="adm-fields">
        <div className="adm-fields__row">
          <label className="adm-field">
            <span className="adm-field__label">Nombre</span>
            <input
              type="text"
              value={data.first_name}
              onChange={(event) => set("first_name", event.target.value)}
              placeholder="Tu nombre"
              autoComplete="given-name"
              autoCapitalize="words"
              autoFocus
            />
            {errors.first_name ? <span className="adm-field__error">{errors.first_name}</span> : null}
          </label>

          <label className="adm-field">
            <span className="adm-field__label">Apellido</span>
            <input
              type="text"
              value={data.last_name}
              onChange={(event) => set("last_name", event.target.value)}
              placeholder="Tus apellidos"
              autoComplete="family-name"
              autoCapitalize="words"
            />
            {errors.last_name ? <span className="adm-field__error">{errors.last_name}</span> : null}
          </label>
        </div>

        <label className="adm-field">
          <span className="adm-field__label">Email</span>
          <input
            type="email"
            value={data.email}
            onChange={(event) => set("email", event.target.value)}
            placeholder="nombre@ejemplo.com"
            autoComplete="email"
            inputMode="email"
          />
          {errors.email ? <span className="adm-field__error">{errors.email}</span> : null}
        </label>

        <div className="adm-field">
          <label className="adm-field__label" htmlFor="adm-phone">
            Número de teléfono
          </label>
          <PhoneField
            id="adm-phone"
            value={data.phone}
            country={data.phone_country}
            onNumber={(value) => set("phone", value)}
            onCountry={(value) => set("phone_country", value)}
            error={errors.phone}
          />
          {errors.phone ? <span className="adm-field__error">{errors.phone}</span> : null}
        </div>
      </div>
    </div>
  );
}