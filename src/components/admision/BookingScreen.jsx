import React from "react";

export default function BookingScreen({ data, settings }) {
  const base = (settings?.meetings_url || "").trim();

  if (!base) {
    return (
      <div>
        <h1 className="adm-title">Reserva tu videollamada.</h1>
        <p className="adm-note adm-note--soft">
          Estamos terminando de configurar la agenda. Te escribiremos a{" "}
          <strong>{data.email || "tu correo"}</strong> para coordinar la videollamada.
        </p>
      </div>
    );
  }

  const params = new URLSearchParams();
  if (data.email) params.set("email", data.email);
  if (data.full_name) params.set("firstname", data.full_name);
  if (data.phone) params.set("phone", data.phone);
  params.set("embed", "true");
  const src = `${base}${base.includes("?") ? "&" : "?"}${params.toString()}`;

  return (
    <div>
      <h1 className="adm-title">Reserva tu videollamada.</h1>
      <div className="adm-booking">
        <iframe src={src} title="Reserva tu videollamada con Cabaña Creative" loading="lazy" />
      </div>
    </div>
  );
}