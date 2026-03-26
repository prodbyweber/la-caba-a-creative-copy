import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Search } from "lucide-react";

const COUNTRIES = [
  { code: "AF", name: "Afganistán", dial: "+93", flag: "🇦🇫" },
  { code: "AL", name: "Albania", dial: "+355", flag: "🇦🇱" },
  { code: "DZ", name: "Argelia", dial: "+213", flag: "🇩🇿" },
  { code: "AD", name: "Andorra", dial: "+376", flag: "🇦🇩" },
  { code: "AO", name: "Angola", dial: "+244", flag: "🇦🇴" },
  { code: "AG", name: "Antigua y Barbuda", dial: "+1268", flag: "🇦🇬" },
  { code: "AR", name: "Argentina", dial: "+54", flag: "🇦🇷" },
  { code: "AM", name: "Armenia", dial: "+374", flag: "🇦🇲" },
  { code: "AU", name: "Australia", dial: "+61", flag: "🇦🇺" },
  { code: "AT", name: "Austria", dial: "+43", flag: "🇦🇹" },
  { code: "AZ", name: "Azerbaiyán", dial: "+994", flag: "🇦🇿" },
  { code: "BS", name: "Bahamas", dial: "+1242", flag: "🇧🇸" },
  { code: "BH", name: "Baréin", dial: "+973", flag: "🇧🇭" },
  { code: "BD", name: "Bangladés", dial: "+880", flag: "🇧🇩" },
  { code: "BB", name: "Barbados", dial: "+1246", flag: "🇧🇧" },
  { code: "BY", name: "Bielorrusia", dial: "+375", flag: "🇧🇾" },
  { code: "BE", name: "Bélgica", dial: "+32", flag: "🇧🇪" },
  { code: "BZ", name: "Belice", dial: "+501", flag: "🇧🇿" },
  { code: "BJ", name: "Benín", dial: "+229", flag: "🇧🇯" },
  { code: "BT", name: "Bután", dial: "+975", flag: "🇧🇹" },
  { code: "BO", name: "Bolivia", dial: "+591", flag: "🇧🇴" },
  { code: "BA", name: "Bosnia y Herzegovina", dial: "+387", flag: "🇧🇦" },
  { code: "BW", name: "Botsuana", dial: "+267", flag: "🇧🇼" },
  { code: "BR", name: "Brasil", dial: "+55", flag: "🇧🇷" },
  { code: "BN", name: "Brunéi", dial: "+673", flag: "🇧🇳" },
  { code: "BG", name: "Bulgaria", dial: "+359", flag: "🇧🇬" },
  { code: "BF", name: "Burkina Faso", dial: "+226", flag: "🇧🇫" },
  { code: "BI", name: "Burundi", dial: "+257", flag: "🇧🇮" },
  { code: "CV", name: "Cabo Verde", dial: "+238", flag: "🇨🇻" },
  { code: "KH", name: "Camboya", dial: "+855", flag: "🇰🇭" },
  { code: "CM", name: "Camerún", dial: "+237", flag: "🇨🇲" },
  { code: "CA", name: "Canadá", dial: "+1", flag: "🇨🇦" },
  { code: "CF", name: "República Centroafricana", dial: "+236", flag: "🇨🇫" },
  { code: "TD", name: "Chad", dial: "+235", flag: "🇹🇩" },
  { code: "CL", name: "Chile", dial: "+56", flag: "🇨🇱" },
  { code: "CN", name: "China", dial: "+86", flag: "🇨🇳" },
  { code: "CO", name: "Colombia", dial: "+57", flag: "🇨🇴" },
  { code: "KM", name: "Comoras", dial: "+269", flag: "🇰🇲" },
  { code: "CG", name: "Congo", dial: "+242", flag: "🇨🇬" },
  { code: "CR", name: "Costa Rica", dial: "+506", flag: "🇨🇷" },
  { code: "HR", name: "Croacia", dial: "+385", flag: "🇭🇷" },
  { code: "CU", name: "Cuba", dial: "+53", flag: "🇨🇺" },
  { code: "CY", name: "Chipre", dial: "+357", flag: "🇨🇾" },
  { code: "CZ", name: "República Checa", dial: "+420", flag: "🇨🇿" },
  { code: "DK", name: "Dinamarca", dial: "+45", flag: "🇩🇰" },
  { code: "DJ", name: "Yibuti", dial: "+253", flag: "🇩🇯" },
  { code: "DM", name: "Dominica", dial: "+1767", flag: "🇩🇲" },
  { code: "DO", name: "República Dominicana", dial: "+1809", flag: "🇩🇴" },
  { code: "EC", name: "Ecuador", dial: "+593", flag: "🇪🇨" },
  { code: "EG", name: "Egipto", dial: "+20", flag: "🇪🇬" },
  { code: "SV", name: "El Salvador", dial: "+503", flag: "🇸🇻" },
  { code: "GQ", name: "Guinea Ecuatorial", dial: "+240", flag: "🇬🇶" },
  { code: "ER", name: "Eritrea", dial: "+291", flag: "🇪🇷" },
  { code: "EE", name: "Estonia", dial: "+372", flag: "🇪🇪" },
  { code: "SZ", name: "Esuatini", dial: "+268", flag: "🇸🇿" },
  { code: "ET", name: "Etiopía", dial: "+251", flag: "🇪🇹" },
  { code: "FJ", name: "Fiyi", dial: "+679", flag: "🇫🇯" },
  { code: "FI", name: "Finlandia", dial: "+358", flag: "🇫🇮" },
  { code: "FR", name: "Francia", dial: "+33", flag: "🇫🇷" },
  { code: "GA", name: "Gabón", dial: "+241", flag: "🇬🇦" },
  { code: "GM", name: "Gambia", dial: "+220", flag: "🇬🇲" },
  { code: "GE", name: "Georgia", dial: "+995", flag: "🇬🇪" },
  { code: "DE", name: "Alemania", dial: "+49", flag: "🇩🇪" },
  { code: "GH", name: "Ghana", dial: "+233", flag: "🇬🇭" },
  { code: "GR", name: "Grecia", dial: "+30", flag: "🇬🇷" },
  { code: "GD", name: "Granada", dial: "+1473", flag: "🇬🇩" },
  { code: "GT", name: "Guatemala", dial: "+502", flag: "🇬🇹" },
  { code: "GN", name: "Guinea", dial: "+224", flag: "🇬🇳" },
  { code: "GW", name: "Guinea-Bisáu", dial: "+245", flag: "🇬🇼" },
  { code: "GY", name: "Guyana", dial: "+592", flag: "🇬🇾" },
  { code: "HT", name: "Haití", dial: "+509", flag: "🇭🇹" },
  { code: "HN", name: "Honduras", dial: "+504", flag: "🇭🇳" },
  { code: "HU", name: "Hungría", dial: "+36", flag: "🇭🇺" },
  { code: "IS", name: "Islandia", dial: "+354", flag: "🇮🇸" },
  { code: "IN", name: "India", dial: "+91", flag: "🇮🇳" },
  { code: "ID", name: "Indonesia", dial: "+62", flag: "🇮🇩" },
  { code: "IR", name: "Irán", dial: "+98", flag: "🇮🇷" },
  { code: "IQ", name: "Irak", dial: "+964", flag: "🇮🇶" },
  { code: "IE", name: "Irlanda", dial: "+353", flag: "🇮🇪" },
  { code: "IL", name: "Israel", dial: "+972", flag: "🇮🇱" },
  { code: "IT", name: "Italia", dial: "+39", flag: "🇮🇹" },
  { code: "JM", name: "Jamaica", dial: "+1876", flag: "🇯🇲" },
  { code: "JP", name: "Japón", dial: "+81", flag: "🇯🇵" },
  { code: "JO", name: "Jordania", dial: "+962", flag: "🇯🇴" },
  { code: "KZ", name: "Kazajistán", dial: "+7", flag: "🇰🇿" },
  { code: "KE", name: "Kenia", dial: "+254", flag: "🇰🇪" },
  { code: "KI", name: "Kiribati", dial: "+686", flag: "🇰🇮" },
  { code: "KW", name: "Kuwait", dial: "+965", flag: "🇰🇼" },
  { code: "KG", name: "Kirguistán", dial: "+996", flag: "🇰🇬" },
  { code: "LA", name: "Laos", dial: "+856", flag: "🇱🇦" },
  { code: "LV", name: "Letonia", dial: "+371", flag: "🇱🇻" },
  { code: "LB", name: "Líbano", dial: "+961", flag: "🇱🇧" },
  { code: "LS", name: "Lesoto", dial: "+266", flag: "🇱🇸" },
  { code: "LR", name: "Liberia", dial: "+231", flag: "🇱🇷" },
  { code: "LY", name: "Libia", dial: "+218", flag: "🇱🇾" },
  { code: "LI", name: "Liechtenstein", dial: "+423", flag: "🇱🇮" },
  { code: "LT", name: "Lituania", dial: "+370", flag: "🇱🇹" },
  { code: "LU", name: "Luxemburgo", dial: "+352", flag: "🇱🇺" },
  { code: "MG", name: "Madagascar", dial: "+261", flag: "🇲🇬" },
  { code: "MW", name: "Malaui", dial: "+265", flag: "🇲🇼" },
  { code: "MY", name: "Malasia", dial: "+60", flag: "🇲🇾" },
  { code: "MV", name: "Maldivas", dial: "+960", flag: "🇲🇻" },
  { code: "ML", name: "Malí", dial: "+223", flag: "🇲🇱" },
  { code: "MT", name: "Malta", dial: "+356", flag: "🇲🇹" },
  { code: "MH", name: "Islas Marshall", dial: "+692", flag: "🇲🇭" },
  { code: "MR", name: "Mauritania", dial: "+222", flag: "🇲🇷" },
  { code: "MU", name: "Mauricio", dial: "+230", flag: "🇲🇺" },
  { code: "MX", name: "México", dial: "+52", flag: "🇲🇽" },
  { code: "FM", name: "Micronesia", dial: "+691", flag: "🇫🇲" },
  { code: "MD", name: "Moldavia", dial: "+373", flag: "🇲🇩" },
  { code: "MC", name: "Mónaco", dial: "+377", flag: "🇲🇨" },
  { code: "MN", name: "Mongolia", dial: "+976", flag: "🇲🇳" },
  { code: "ME", name: "Montenegro", dial: "+382", flag: "🇲🇪" },
  { code: "MA", name: "Marruecos", dial: "+212", flag: "🇲🇦" },
  { code: "MZ", name: "Mozambique", dial: "+258", flag: "🇲🇿" },
  { code: "MM", name: "Myanmar", dial: "+95", flag: "🇲🇲" },
  { code: "NA", name: "Namibia", dial: "+264", flag: "🇳🇦" },
  { code: "NR", name: "Nauru", dial: "+674", flag: "🇳🇷" },
  { code: "NP", name: "Nepal", dial: "+977", flag: "🇳🇵" },
  { code: "NL", name: "Países Bajos", dial: "+31", flag: "🇳🇱" },
  { code: "NZ", name: "Nueva Zelanda", dial: "+64", flag: "🇳🇿" },
  { code: "NI", name: "Nicaragua", dial: "+505", flag: "🇳🇮" },
  { code: "NE", name: "Níger", dial: "+227", flag: "🇳🇪" },
  { code: "NG", name: "Nigeria", dial: "+234", flag: "🇳🇬" },
  { code: "MK", name: "Macedonia del Norte", dial: "+389", flag: "🇲🇰" },
  { code: "NO", name: "Noruega", dial: "+47", flag: "🇳🇴" },
  { code: "OM", name: "Omán", dial: "+968", flag: "🇴🇲" },
  { code: "PK", name: "Pakistán", dial: "+92", flag: "🇵🇰" },
  { code: "PW", name: "Palaos", dial: "+680", flag: "🇵🇼" },
  { code: "PA", name: "Panamá", dial: "+507", flag: "🇵🇦" },
  { code: "PG", name: "Papúa Nueva Guinea", dial: "+675", flag: "🇵🇬" },
  { code: "PY", name: "Paraguay", dial: "+595", flag: "🇵🇾" },
  { code: "PE", name: "Perú", dial: "+51", flag: "🇵🇪" },
  { code: "PH", name: "Filipinas", dial: "+63", flag: "🇵🇭" },
  { code: "PL", name: "Polonia", dial: "+48", flag: "🇵🇱" },
  { code: "PT", name: "Portugal", dial: "+351", flag: "🇵🇹" },
  { code: "QA", name: "Catar", dial: "+974", flag: "🇶🇦" },
  { code: "RO", name: "Rumanía", dial: "+40", flag: "🇷🇴" },
  { code: "RU", name: "Rusia", dial: "+7", flag: "🇷🇺" },
  { code: "RW", name: "Ruanda", dial: "+250", flag: "🇷🇼" },
  { code: "KN", name: "San Cristóbal y Nieves", dial: "+1869", flag: "🇰🇳" },
  { code: "LC", name: "Santa Lucía", dial: "+1758", flag: "🇱🇨" },
  { code: "VC", name: "San Vicente y las Granadinas", dial: "+1784", flag: "🇻🇨" },
  { code: "WS", name: "Samoa", dial: "+685", flag: "🇼🇸" },
  { code: "SM", name: "San Marino", dial: "+378", flag: "🇸🇲" },
  { code: "ST", name: "Santo Tomé y Príncipe", dial: "+239", flag: "🇸🇹" },
  { code: "SA", name: "Arabia Saudita", dial: "+966", flag: "🇸🇦" },
  { code: "SN", name: "Senegal", dial: "+221", flag: "🇸🇳" },
  { code: "RS", name: "Serbia", dial: "+381", flag: "🇷🇸" },
  { code: "SC", name: "Seychelles", dial: "+248", flag: "🇸🇨" },
  { code: "SL", name: "Sierra Leona", dial: "+232", flag: "🇸🇱" },
  { code: "SG", name: "Singapur", dial: "+65", flag: "🇸🇬" },
  { code: "SK", name: "Eslovaquia", dial: "+421", flag: "🇸🇰" },
  { code: "SI", name: "Eslovenia", dial: "+386", flag: "🇸🇮" },
  { code: "SB", name: "Islas Salomón", dial: "+677", flag: "🇸🇧" },
  { code: "SO", name: "Somalia", dial: "+252", flag: "🇸🇴" },
  { code: "ZA", name: "Sudáfrica", dial: "+27", flag: "🇿🇦" },
  { code: "SS", name: "Sudán del Sur", dial: "+211", flag: "🇸🇸" },
  { code: "ES", name: "España", dial: "+34", flag: "🇪🇸" },
  { code: "LK", name: "Sri Lanka", dial: "+94", flag: "🇱🇰" },
  { code: "SD", name: "Sudán", dial: "+249", flag: "🇸🇩" },
  { code: "SR", name: "Surinam", dial: "+597", flag: "🇸🇷" },
  { code: "SE", name: "Suecia", dial: "+46", flag: "🇸🇪" },
  { code: "CH", name: "Suiza", dial: "+41", flag: "🇨🇭" },
  { code: "SY", name: "Siria", dial: "+963", flag: "🇸🇾" },
  { code: "TW", name: "Taiwán", dial: "+886", flag: "🇹🇼" },
  { code: "TJ", name: "Tayikistán", dial: "+992", flag: "🇹🇯" },
  { code: "TZ", name: "Tanzania", dial: "+255", flag: "🇹🇿" },
  { code: "TH", name: "Tailandia", dial: "+66", flag: "🇹🇭" },
  { code: "TL", name: "Timor Oriental", dial: "+670", flag: "🇹🇱" },
  { code: "TG", name: "Togo", dial: "+228", flag: "🇹🇬" },
  { code: "TO", name: "Tonga", dial: "+676", flag: "🇹🇴" },
  { code: "TT", name: "Trinidad y Tobago", dial: "+1868", flag: "🇹🇹" },
  { code: "TN", name: "Túnez", dial: "+216", flag: "🇹🇳" },
  { code: "TR", name: "Turquía", dial: "+90", flag: "🇹🇷" },
  { code: "TM", name: "Turkmenistán", dial: "+993", flag: "🇹🇲" },
  { code: "TV", name: "Tuvalu", dial: "+688", flag: "🇹🇻" },
  { code: "UG", name: "Uganda", dial: "+256", flag: "🇺🇬" },
  { code: "UA", name: "Ucrania", dial: "+380", flag: "🇺🇦" },
  { code: "AE", name: "Emiratos Árabes Unidos", dial: "+971", flag: "🇦🇪" },
  { code: "GB", name: "Reino Unido", dial: "+44", flag: "🇬🇧" },
  { code: "US", name: "Estados Unidos", dial: "+1", flag: "🇺🇸" },
  { code: "UY", name: "Uruguay", dial: "+598", flag: "🇺🇾" },
  { code: "UZ", name: "Uzbekistán", dial: "+998", flag: "🇺🇿" },
  { code: "VU", name: "Vanuatu", dial: "+678", flag: "🇻🇺" },
  { code: "VE", name: "Venezuela", dial: "+58", flag: "🇻🇪" },
  { code: "VN", name: "Vietnam", dial: "+84", flag: "🇻🇳" },
  { code: "YE", name: "Yemen", dial: "+967", flag: "🇾🇪" },
  { code: "ZM", name: "Zambia", dial: "+260", flag: "🇿🇲" },
  { code: "ZW", name: "Zimbabue", dial: "+263", flag: "🇿🇼" },
];

// Map de código de país (ISO) a entrada de COUNTRIES
const COUNTRY_BY_CODE = Object.fromEntries(COUNTRIES.map(c => [c.code, c]));

export default function PhoneInput({ value, onChange }) {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_BY_CODE["ES"]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [detecting, setDetecting] = useState(true);
  const dropdownRef = useRef(null);

  // Detectar país automáticamente por IP
  useEffect(() => {
    const detect = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data.country_code && COUNTRY_BY_CODE[data.country_code]) {
          setSelectedCountry(COUNTRY_BY_CODE[data.country_code]);
        }
      } catch {
        // fallback España
      } finally {
        setDetecting(false);
      }
    };
    detect();
  }, []);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.dial.includes(search)
  );

  const handleNumberChange = (e) => {
    // Solo números
    const raw = e.target.value.replace(/[^\d\s\-]/g, "");
    onChange(selectedCountry.dial + " " + raw);
  };

  const localNumber = value
    ? value.replace(selectedCountry.dial, "").trim()
    : "";

  const selectCountry = (country) => {
    setSelectedCountry(country);
    onChange(country.dial + " " + localNumber);
    setDropdownOpen(false);
    setSearch("");
  };

  return (
    <div className="relative w-full min-w-0 flex" ref={dropdownRef}>
      {/* Country selector button */}
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex-shrink-0 flex items-center gap-1 px-2.5 py-3 bg-zinc-900 border border-white/10 border-r-0 rounded-l-lg text-white hover:bg-zinc-800 transition-colors focus:outline-none"
        style={{ minWidth: 0 }}
      >
        <span className="text-base leading-none">{selectedCountry.flag}</span>
        <span className="text-xs text-gray-300 whitespace-nowrap">{selectedCountry.dial}</span>
        <ChevronDown className={`w-3 h-3 text-gray-500 flex-shrink-0 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Number input */}
      <input
        type="tel"
        placeholder="Tu teléfono"
        value={localNumber}
        onChange={handleNumberChange}
        className="flex-1 min-w-0 w-full px-3 py-3 bg-zinc-900 border border-white/10 rounded-r-lg text-white placeholder-gray-500 focus:border-[#ff5833] focus:outline-none transition-colors"
      />

      {/* Dropdown — se ancla a la izquierda y limita su ancho al viewport */}
      {dropdownOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden"
          style={{ width: 'min(288px, calc(100vw - 48px))' }}
        >
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
            <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="Buscar país..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
              autoFocus
            />
          </div>
          {/* List */}
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">Sin resultados</div>
            ) : (
              filtered.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => selectCountry(country)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-white/5 transition-colors text-left ${
                    selectedCountry.code === country.code ? "bg-white/5 text-[#ff5833]" : "text-gray-300"
                  }`}
                >
                  <span className="text-base flex-shrink-0">{country.flag}</span>
                  <span className="flex-1 truncate min-w-0">{country.name}</span>
                  <span className="text-gray-500 text-xs flex-shrink-0">{country.dial}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}