import React, { useState, useEffect, useRef } from "react";
import { Search, X, AtSign, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

/**
 * ArtistPicker
 * Selector de artista para un soundtrack.
 * - Auto-asigna el nombre artístico del perfil del creador (defaultName) si el valor viene vacío.
 * - Permite buscar otro usuario de la plataforma por su tag (username) o nombre artístico.
 * - Permite escribir manualmente cualquier nombre artístico.
 *
 * Props:
 *  - value: string (nombre artístico actual)
 *  - onChange: (string) => void
 *  - defaultName: string (nombre artístico del perfil del usuario actual, para auto-asignar)
 */
export default function ArtistPicker({ value, onChange, defaultName }) {
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const didAutoFill = useRef(false);

  // Auto-asignar el nombre artístico del perfil del creador la primera vez
  useEffect(() => {
    if (didAutoFill.current) return;
    if (!value && defaultName) {
      onChange(defaultName);
      didAutoFill.current = true;
    } else if (defaultName) {
      didAutoFill.current = true;
    }
  }, [defaultName]); // eslint-disable-line react-hooks/exhaustive-deps

  // Búsqueda con debounce de usuarios de la plataforma por tag / nombre
  useEffect(() => {
    if (!showSearch) return;
    const q = query.trim().toLowerCase().replace(/^@/, "");
    if (q.length < 1) { setResults([]); return; }
    let cancelled = false;
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const all = await base44.entities.UserProfile.list("-created_date", 100);
        if (cancelled) return;
        const filtered = all.filter((p) =>
          (p.username && p.username.toLowerCase().includes(q)) ||
          (p.artist_name && p.artist_name.toLowerCase().includes(q)) ||
          (p.display_name && p.display_name.toLowerCase().includes(q)) ||
          (p.full_name && p.full_name.toLowerCase().includes(q))
        ).slice(0, 8);
        setResults(filtered);
      } catch {
        setResults([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [query, showSearch]);

  const pickUser = (profile) => {
    const name = profile.artist_name || profile.display_name || profile.full_name || profile.username || "";
    onChange(name);
    setShowSearch(false);
    setQuery("");
    setResults([]);
  };

  const clearName = () => {
    onChange("");
  };

  const inp = "w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors";

  return (
    <div className="space-y-2">
      {/* Manual name input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Nombre artístico del artista"
            className={inp + " pr-9"}
          />
          {value && (
            <button
              type="button"
              onClick={clearName}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              title="Limpiar"
            >
              <X className="w-3.5 h-3.5 text-white/40" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowSearch((v) => !v)}
          className="flex items-center gap-1.5 px-3 rounded-xl text-xs font-medium transition-colors"
          style={{
            background: showSearch ? "rgba(250,204,21,0.12)" : "rgba(255,255,255,0.06)",
            border: `1px solid ${showSearch ? "rgba(250,204,21,0.3)" : "rgba(255,255,255,0.08)"}`,
            color: showSearch ? "#facc15" : "rgba(255,255,255,0.5)",
          }}
          title="Buscar un usuario de la plataforma por su tag"
        >
          <AtSign className="w-3.5 h-3.5" /> Tag
        </button>
      </div>

      {/* Default hint */}
      {defaultName && !showSearch && value === defaultName && (
        <p className="text-[10px] text-white/30">
          Asignado automáticamente desde tu perfil: <span className="text-white/50">{defaultName}</span>
        </p>
      )}

      {/* Search panel */}
      {showSearch && (
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)", background: "#0a0a0a" }}>
          <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.06]">
            <Search className="w-3.5 h-3.5 text-white/30" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Escribe el @tag o nombre del usuario…"
              autoFocus
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/20 focus:outline-none"
            />
            <button type="button" onClick={() => setShowSearch(false)} className="text-white/30 hover:text-white transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto">
            {searching && (
              <div className="px-4 py-3 text-xs text-white/30">Buscando…</div>
            )}
            {!searching && query.trim() && results.length === 0 && (
              <div className="px-4 py-3 text-xs text-white/30">
                No se encontró ningún usuario. Escribe el nombre manualmente arriba.
              </div>
            )}
            {!searching && results.map((p) => {
              const name = p.artist_name || p.display_name || p.full_name || p.username || "—";
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => pickUser(p)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/[0.06] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)" }}>
                    {p.profile_photo_url || p.avatar_url
                      ? <img src={p.profile_photo_url || p.avatar_url} alt={name} className="w-full h-full object-cover" />
                      : <span className="text-xs font-bold text-white/40">{(name || "?").charAt(0).toUpperCase()}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 font-medium truncate">{name}</p>
                    {p.username && <p className="text-[11px] text-white/30 truncate">@{p.username}</p>}
                  </div>
                  {value === name && <Check className="w-4 h-4 text-[#facc15] flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}