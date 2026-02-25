import React from "react";
import { Link2, X } from "lucide-react";

const versionFields = [
  { key: "mp3", label: "MP3" },
  { key: "wav_24bit", label: "WAV 24bit" },
  { key: "stems", label: "Stems" },
  { key: "mix", label: "Mix" },
  { key: "master_24bit", label: "Master 24bit" },
  { key: "show", label: "Show" },
  { key: "acapella", label: "Acapella" },
  { key: "beat_wav", label: "Beat WAV" }
];

export default function TrackVersions({ versions = {}, onChange }) {
  const handleVersionChange = (key, value) => {
    onChange({
      ...versions,
      [key]: value
    });
  };

  const handleClear = (key) => {
    const newVersions = { ...versions };
    delete newVersions[key];
    onChange(newVersions);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-3">Versiones del Track</label>
      <div className="grid md:grid-cols-2 gap-3">
        {versionFields.map(({ key, label }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-400">{label}</label>
              {versions[key] && (
                <button
                  type="button"
                  onClick={() => handleClear(key)}
                  className="p-1 hover:bg-red-500/10 rounded transition-colors"
                  title="Eliminar link"
                >
                  <X className="w-3 h-3 text-red-400" />
                </button>
              )}
            </div>
            {versions[key] ? (
              <div className="flex items-center gap-2 p-2 bg-white/5 border border-emerald-500/30 rounded-lg">
                <Link2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a
                  href={versions[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-400 truncate hover:underline"
                >
                  Link guardado
                </a>
              </div>
            ) : (
              <input
                type="url"
                placeholder="Pega el link de Drive o Dropbox"
                value={versions[key] || ""}
                onChange={(e) => handleVersionChange(key, e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}