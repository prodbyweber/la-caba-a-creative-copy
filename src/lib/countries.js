// Países con bandera para el selector del configurador de proyecto.

export const COUNTRIES = [
  { code: "ES", name: "España", flag: "🇪🇸", main: true },
  { code: "MX", name: "México", flag: "🇲🇽", main: true },
  { code: "CO", name: "Colombia", flag: "🇨🇴", main: true },
  { code: "AR", name: "Argentina", flag: "🇦🇷", main: true },
  { code: "CL", name: "Chile", flag: "🇨🇱", main: true },
  { code: "PE", name: "Perú", flag: "🇵🇪", main: true },
  { code: "US", name: "Estados Unidos", flag: "🇺🇸", main: true },
  { code: "BR", name: "Brasil", flag: "🇧🇷", main: true },
  { code: "VE", name: "Venezuela", flag: "🇻🇪" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾" },
  { code: "PY", name: "Paraguay", flag: "🇵🇾" },
  { code: "BO", name: "Bolivia", flag: "🇧🇴" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷" },
  { code: "PA", name: "Panamá", flag: "🇵🇦" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹" },
  { code: "DO", name: "República Dominicana", flag: "🇩🇴" },
  { code: "PR", name: "Puerto Rico", flag: "🇵🇷" },
  { code: "CU", name: "Cuba", flag: "🇨🇺" },
  { code: "HN", name: "Honduras", flag: "🇭🇳" },
  { code: "SV", name: "El Salvador", flag: "🇸🇻" },
  { code: "NI", name: "Nicaragua", flag: "🇳🇮" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "FR", name: "Francia", flag: "🇫🇷" },
  { code: "IT", name: "Italia", flag: "🇮🇹" },
  { code: "DE", name: "Alemania", flag: "🇩🇪" },
  { code: "GB", name: "Reino Unido", flag: "🇬🇧" },
  { code: "NL", name: "Países Bajos", flag: "🇳🇱" },
  { code: "CH", name: "Suiza", flag: "🇨🇭" },
  { code: "MA", name: "Marruecos", flag: "🇲🇦" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "CA", name: "Canadá", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "JP", name: "Japón", flag: "🇯🇵" },
];

export const MAIN_COUNTRIES = COUNTRIES.filter((c) => c.main);

export function findCountry(name) {
  return COUNTRIES.find((c) => c.name === name) || null;
}