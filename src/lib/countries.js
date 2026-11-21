// Países con prefijo telefónico. Las banderas se pintan como SVG (flagcdn).

export const COUNTRIES = [
  { code: "ES", name: "España", dial: "34", main: true },
  { code: "MX", name: "México", dial: "52", main: true },
  { code: "CO", name: "Colombia", dial: "57", main: true },
  { code: "AR", name: "Argentina", dial: "54", main: true },
  { code: "CL", name: "Chile", dial: "56", main: true },
  { code: "PE", name: "Perú", dial: "51", main: true },
  { code: "US", name: "Estados Unidos", dial: "1", main: true },
  { code: "BR", name: "Brasil", dial: "55", main: true },
  { code: "VE", name: "Venezuela", dial: "58" },
  { code: "EC", name: "Ecuador", dial: "593" },
  { code: "UY", name: "Uruguay", dial: "598" },
  { code: "PY", name: "Paraguay", dial: "595" },
  { code: "BO", name: "Bolivia", dial: "591" },
  { code: "CR", name: "Costa Rica", dial: "506" },
  { code: "PA", name: "Panamá", dial: "507" },
  { code: "GT", name: "Guatemala", dial: "502" },
  { code: "DO", name: "República Dominicana", dial: "1" },
  { code: "PR", name: "Puerto Rico", dial: "1" },
  { code: "CU", name: "Cuba", dial: "53" },
  { code: "HN", name: "Honduras", dial: "504" },
  { code: "SV", name: "El Salvador", dial: "503" },
  { code: "NI", name: "Nicaragua", dial: "505" },
  { code: "PT", name: "Portugal", dial: "351" },
  { code: "FR", name: "Francia", dial: "33" },
  { code: "IT", name: "Italia", dial: "39" },
  { code: "DE", name: "Alemania", dial: "49" },
  { code: "GB", name: "Reino Unido", dial: "44" },
  { code: "NL", name: "Países Bajos", dial: "31" },
  { code: "CH", name: "Suiza", dial: "41" },
  { code: "MA", name: "Marruecos", dial: "212" },
  { code: "NG", name: "Nigeria", dial: "234" },
  { code: "CA", name: "Canadá", dial: "1" },
  { code: "AU", name: "Australia", dial: "61" },
  { code: "JP", name: "Japón", dial: "81" },
];

export const MAIN_COUNTRIES = COUNTRIES.filter((c) => c.main);

export function findCountry(name) {
  return COUNTRIES.find((c) => c.name === name) || null;
}

/** Bandera SVG de alta calidad (flagcdn). */
export function flagUrl(code, width = 80) {
  if (!code) return "";
  return `https://flagcdn.com/w${width}/${String(code).toLowerCase()}.png`;
}

export function flagSvg(code) {
  if (!code) return "";
  return `https://flagcdn.com/${String(code).toLowerCase()}.svg`;
}