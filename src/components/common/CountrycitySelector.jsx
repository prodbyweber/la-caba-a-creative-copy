import React, { useState, useMemo } from "react";

const COUNTRY_CITY_MAP = {
  "España": ["Madrid", "Barcelona", "Valencia", "Sevilla", "Bilbao", "Zaragoza", "Málaga", "Murcia", "Palma", "Ibiza", "Otra"],
  "México": ["México City", "Guadalajara", "Monterrey", "Cancún", "Playa del Carmen", "Puerto Vallarta", "Oaxaca", "Otra"],
  "Argentina": ["Buenos Aires", "Córdoba", "Rosario", "La Plata", "Mar del Plata", "Mendoza", "Otra"],
  "Colombia": ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Cúcuta", "Otra"],
  "Venezuela": ["Caracas", "Valencia", "Barquisimeto", "Maracaibo", "Otra"],
  "Perú": ["Lima", "Arequipa", "Cusco", "Trujillo", "Chiclayo", "Otra"],
  "Chile": ["Santiago", "Valparaíso", "Concepción", "La Serena", "Otra"],
  "Ecuador": ["Quito", "Guayaquil", "Cuenca", "Otra"],
  "Cuba": ["La Habana", "Santiago de Cuba", "Holguín", "Otra"],
  "Panamá": ["Ciudad de Panamá", "Colón", "San Miguelito", "Otra"],
  "Brasil": ["São Paulo", "Rio de Janeiro", "Salvador", "Brasília", "Otra"],
  "Uruguay": ["Montevideo", "Salto", "Paysandú", "Otra"],
  "Bolivia": ["La Paz", "Santa Cruz", "Cochabamba", "Otra"],
  "Paraguay": ["Asunción", "Ciudad del Este", "Otra"],
  "República Dominicana": ["Santo Domingo", "Santiago", "La Romana", "Otra"],
  "Puerto Rico": ["San Juan", "Bayamón", "Carolina", "Otra"],
  "Estados Unidos": ["Nueva York", "Los Ángeles", "Chicago", "Houston", "Phoenix", "Miami", "Otra"],
  "Canadá": ["Toronto", "Vancouver", "Montreal", "Calgary", "Otra"],
  "Reino Unido": ["Londres", "Manchester", "Birmingham", "Leeds", "Liverpool", "Otra"],
  "Francia": ["París", "Marseille", "Lyon", "Toulouse", "Nice", "Otra"],
  "Alemania": ["Berlín", "Múnich", "Colonia", "Hamburgo", "Otra"],
  "Italia": ["Roma", "Milán", "Nápoles", "Turín", "Venecia", "Otra"],
  "Portugal": ["Lisboa", "Oporto", "Covilhã", "Otra"],
};

export default function CountryCitySelector({ country, city, onCountryChange, onCityChange }) {
  const cities = useMemo(() => {
    return COUNTRY_CITY_MAP[country] || [];
  }, [country]);

  // Si el país cambió y la ciudad anterior no existe en el nuevo país, limpiar
  React.useEffect(() => {
    if (country && cities.length > 0 && !cities.includes(city)) {
      onCityChange("");
    }
  }, [country, cities, city, onCityChange]);

  return (
    <>
      <div>
        <label className="block text-[11px] font-semibold text-white/35 uppercase tracking-wider mb-1.5">País</label>
        <select
          value={country}
          onChange={(e) => onCountryChange(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl text-sm text-white bg-white/[0.06] border border-white/[0.08] focus:outline-none focus:border-white/25 transition-colors"
        >
          <option value="">Selecciona un país</option>
          {Object.keys(COUNTRY_CITY_MAP).map(c => (
            <option key={c} value={c} className="bg-[#111]">{c}</option>
          ))}
        </select>
      </div>

      {country && cities.length > 0 && (
        <div>
          <label className="block text-[11px] font-semibold text-white/35 uppercase tracking-wider mb-1.5">Ciudad</label>
          <select
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-sm text-white bg-white/[0.06] border border-white/[0.08] focus:outline-none focus:border-white/25 transition-colors"
          >
            <option value="">Selecciona una ciudad</option>
            {cities.map(c => (
              <option key={c} value={c} className="bg-[#111]">{c}</option>
            ))}
          </select>
        </div>
      )}
    </>
  );
}