import { getCountries, getCountryCallingCode } from "libphonenumber-js";

/** Lista completa de países con prefijo, nombres en español y sin emojis. */

const regionNames = (() => {
  try {
    return new Intl.DisplayNames(["es"], { type: "region" });
  } catch {
    return null;
  }
})();

export const PHONE_COUNTRIES = getCountries()
  .map((code) => ({
    code,
    name: regionNames?.of(code) || code,
    dial: `+${getCountryCallingCode(code)}`,
  }))
  .sort((a, b) => a.name.localeCompare(b.name, "es"));

/** Países que aparecen primero en la lista. */
export const MAIN_COUNTRY_CODES = ["ES", "MX", "CO", "AR", "CL", "PE", "US", "BR"];

export const countryByCode = (code) =>
  PHONE_COUNTRIES.find((country) => country.code === code) || null;

/** País del navegador; España si no hay una coincidencia válida. */
export function browserCountryCode() {
  if (typeof navigator === "undefined") return "ES";
  const languages = [...(navigator.languages || []), navigator.language].filter(Boolean);
  for (const language of languages) {
    const region = String(language).split("-")[1];
    if (region && countryByCode(region.toUpperCase())) return region.toUpperCase();
  }
  return "ES";
}

export const foldText = (value) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");