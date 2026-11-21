import { parsePhoneNumberFromString, AsYouType } from "libphonenumber-js";

/** Devuelve el teléfono en formato internacional (E.164) o "" si no es válido. */
export function toE164(value, countryCode) {
  const parsed = parsePhoneNumberFromString(String(value || ""), countryCode || "ES");
  return parsed && parsed.isValid() ? parsed.number : "";
}

/** Formatea mientras se escribe. */
export function formatAsYouType(value, countryCode) {
  try {
    return new AsYouType(countryCode || "ES").input(String(value || ""));
  } catch (e) {
    return String(value || "");
  }
}

export function validatePhone(value, countryCode) {
  const raw = String(value || "").replace(/[^\d+]/g, "");
  if (!raw) return { valid: false, e164: "", error: "Añade tu WhatsApp: es la vía más rápida para responderte." };
  const parsed = parsePhoneNumberFromString(raw, countryCode || "ES");
  if (!parsed) return { valid: false, e164: "", error: "Ese número no parece válido. Revisa el prefijo y los dígitos." };
  if (!parsed.isValid()) {
    return {
      valid: false,
      e164: "",
      error: `Ese número no es válido para ${parsed.country || countryCode}. Revisa el prefijo y los dígitos.`,
    };
  }
  return { valid: true, e164: parsed.number, error: "" };
}