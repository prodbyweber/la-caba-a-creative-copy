import React, { useState } from "react";
import { Link2, X, Edit2, Check } from "lucide-react";

const versionFields = [
  { key: "mp3", label: "MP3", color: "emerald" },
  { key: "wav_24bit", label: "WAV 24bit", color: "blue" },
  { key: "stems", label: "Stems", color: "purple" },
  { key: "mix", label: "Mix", color: "pink" },
  { key: "master_24bit", label: "Master 24bit", color: "orange" },
  { key: "show", label: "Show", color: "yellow" },
  { key: "acapella", label: "Acapella", color: "cyan" },
  { key: "beat_wav", label: "Beat WAV", color: "violet" }
];

const colorClasses = {
  emerald: "border-emerald-500/30 hover:border-emerald-500/50 focus:border-emerald-500/50",
  blue: "border-blue-500/30 hover:border-blue-500/50 focus:border-blue-500/50",
  purple: "border-purple-500/30 hover:border-purple-500/50 focus:border-purple-500/50",
  pink: "border-pink-500/30 hover:border-pink-500/50 focus:border-pink-500/50",
  orange: "border-orange-500/30 hover:border-orange-500/50 focus:border-orange-500/50",
  yellow: "border-yellow-500/30 hover:border-yellow-500/50 focus:border-yellow-500/50",
  cyan: "border-cyan-500/30 hover:border-cyan-500/50 focus:border-cyan-500/50",
  violet: "border-violet-500/30 hover:border-violet-500/50 focus:border-violet-500/50"
};

const textClasses = {
  emerald: "text-emerald-400",
  blue: "text-blue-400",
  purple: "text-purple-400",
  pink: "text-pink-400",
  orange: "text-orange-400",
  yellow: "text-yellow-400",
  cyan: "text-cyan-400",
  violet: "text-violet-400"
};

export default function TrackVersions({ versions = {}, onChange }) {
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState("");

  const handleVersionChange = (key, value) => {
    onChange({
      ...versions,
      [key]: value
    });
  };

  const handleStartEdit = (key, currentValue) => {
    setEditingKey(key);
    setEditValue(currentValue || "");
  };

  const handleSaveEdit = (key) => {
    handleVersionChange(key, editValue);
    setEditingKey(null);
  };

  const handleClear = (key) => {
    const newVersions = { ...versions };
    delete newVersions[key];
    onChange(newVersions);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <label className="block text-sm font-bold text-gray-200 mb-4 flex items-center gap-2">
        <Link2 className="w-4 h-4 text-emerald-400" />
        Archivos y Versiones
      </label>
      <div className="grid md:grid-cols-2 gap-3">
        {versionFields.map(({ key, label, color }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-300">{label}</label>
              {versions[key] && !editingKey && (
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(key, versions[key])}
                    className="p-1 hover:bg-blue-500/10 rounded transition-colors"
                    title="Editar link"
                  >
                    <Edit2 className="w-3 h-3 text-blue-400" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleClear(key)}
                    className="p-1 hover:bg-red-500/10 rounded transition-colors"
                    title="Eliminar link"
                  >
                    <X className="w-3 h-3 text-red-400" />
                  </button>
                </div>
              )}
            </div>

            {editingKey === key ? (
              <div className="flex gap-2">
                <input
                  type="url"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="Drive o Dropbox link"
                  className={`flex-1 px-3 py-2 bg-white/5 border rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none ${colorClasses[color]}`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => handleSaveEdit(key)}
                  className="px-2 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg transition-colors"
                >
                  <Check className="w-3 h-3 text-emerald-400" />
                </button>
              </div>
            ) : versions[key] ? (
              <a
                href={versions[key]}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 p-2.5 bg-white/5 border rounded-lg hover:bg-white/10 transition-all ${colorClasses[color]} group`}
              >
                <Link2 className={`w-4 h-4 flex-shrink-0 ${textClasses[color]}`} />
                <span className={`text-xs truncate ${textClasses[color]} font-medium group-hover:underline`}>
                  Link guardado
                </span>
              </a>
            ) : (
              <input
                type="url"
                placeholder="Pega Drive o Dropbox"
                value={versions[key] || ""}
                onChange={(e) => handleVersionChange(key, e.target.value)}
                className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none transition-colors ${colorClasses[color]}`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}