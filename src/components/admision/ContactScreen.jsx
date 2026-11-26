import React from "react";

export default function ContactScreen({ data, set, errors }) {
  return (
    <div>
      <h1 className="adm-title">
        Déjanos tus datos para saber quién está detrás del proyecto y poder contactar contigo.
      </h1>

      <div className="adm-fields">
        <label className="adm-field">
          <span className="adm-field__label">Nombre</span>
          <input
            type="text"
            value={data.full_name}
            onChange={(event) => set("full_name", event.target.value)}
            placeholder="Tu nombre y apellido"
            autoComplete="name"
            autoCapitalize="words"
            autoFocus
          />
          {errors.full_name ? <span className="adm-field__error">{errors.full_name}</span> : null}
        </label>

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

        <label className="adm-field">
          <span className="adm-field__label">Número de teléfono</span>
          <input
            type="tel"
            value={data.phone}
            onChange={(event) => set("phone", event.target.value)}
            placeholder="+34 612 34 56 78"
            autoComplete="tel"
            inputMode="tel"
          />
          {errors.phone ? <span className="adm-field__error">{errors.phone}</span> : null}
        </label>
      </div>
    </div>
  );
}