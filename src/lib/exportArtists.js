// Exporta la ficha completa de los creadores a un CSV compatible con Excel,
// Google Sheets y Numbers (UTF-8 con BOM + separador ";").

const SEPARATOR = ";";

const COLUMNS = [
  { label: "Nombre completo", value: (c) => fullName(c) },
  { label: "Nombre artistico", value: (c) => c.artist?.stageName || c.profile?.artist_name || c.profile?.display_name || "" },
  { label: "Correo", value: (c) => email(c) },
  { label: "Telefono", value: (c) => phone(c) },
  { label: "Nacionalidad", value: (c) => c.artist?.nationality || c.profile?.nationality || "" },
  { label: "Pais de residencia", value: (c) => c.artist?.country_of_residence || c.profile?.country_of_residence || "" },
  { label: "Direccion", value: (c) => c.profile?.address || c.artist?.location || "" },
  { label: "Genero musical", value: (c) => c.artist?.genre || c.genre || "" },
  { label: "Tipo de creador", value: (c) => c.profile?.creator_type || "" },
  { label: "Usuario", value: (c) => (c.username ? `@${c.username}` : "") },
  { label: "Estado", value: (c) => c.artist?.status || "" },
  { label: "Horas de estudio", value: (c) => c.artist?.studio_hours_total ?? "" },
  { label: "Alta", value: (c) => formatDate(c.artist?.created_date || c.profile?.created_date || c.platformUser?.created_date) },
];

function fullName(c) {
  const p = c.profile;
  const joined = [p?.first_name, p?.last_name].filter(Boolean).join(" ").trim();
  return (
    p?.full_name ||
    joined ||
    c.artist?.legalName ||
    c.platformUser?.full_name ||
    c.displayName ||
    ""
  );
}

function email(c) {
  return c.artist?.email || c.profile?.user_email || c.profile?.contact_email || c.platformUser?.email || c.email || "";
}

function phone(c) {
  const direct = c.artist?.phone;
  if (direct) return direct;
  const p = c.profile;
  const local = p?.phone;
  if (!local) return "";
  return [p?.phone_country_code, local].filter(Boolean).join(" ").trim();
}

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-ES");
}

function escapeCell(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
}

export function buildArtistsCsv(creators = []) {
  const header = COLUMNS.map((col) => escapeCell(col.label)).join(SEPARATOR);
  const rows = creators.map((creator) =>
    COLUMNS.map((col) => escapeCell(col.value(creator))).join(SEPARATOR)
  );
  return [header, ...rows].join("\r\n");
}

export function downloadArtistsCsv(creators = []) {
  const csv = buildArtistsCsv(creators);
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const today = new Date().toISOString().slice(0, 10);

  const link = document.createElement("a");
  link.href = url;
  link.download = `creadores-cabana-creative-${today}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}