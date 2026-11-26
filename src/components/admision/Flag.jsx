import React from "react";

/**
 * Bandera SVG real (paquete country-flag-icons, formato 3x2).
 * Nunca se usan emojis.
 */
const FLAGS = import.meta.glob("../../../node_modules/country-flag-icons/3x2/*.svg", {
  eager: true,
  query: "?url",
  import: "default",
});

const PREFIX = "../../../node_modules/country-flag-icons/3x2/";

export default function Flag({ code }) {
  const src = FLAGS[`${PREFIX}${code}.svg`];
  if (!src) return <span className="adm-flag" aria-hidden="true" />;
  return (
    <img
      className="adm-flag"
      src={src}
      alt=""
      width={24}
      height={18}
      loading="lazy"
      decoding="async"
    />
  );
}