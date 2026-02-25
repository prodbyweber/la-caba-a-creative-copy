import React, { useState } from "react";
import { ChevronDown, Link2, X, Edit2, Check } from "lucide-react";

const versionFields = [
  { key: "mp3", label: "MP3", icon: "🎵", color: "emerald" },
  { key: "wav_24bit", label: "WAV 24bit", icon: "🎚️", color: "blue" },
  { key: "stems", label: "Stems", icon: "🎛️", color: "purple" },
  { key: "mix", label: "Mix", icon: "🎶", color: "pink" },
  { key: "master_24bit", label: "Master 24bit", icon: "🏆", color: "orange" },
  { key: "show", label: "Show", icon: "🎬", color: "yellow" },
  { key: "acapella", label: "Acapella", icon: "🎤", color: "cyan" },
  { key: "beat_wav", label: "Beat WAV", icon: "🥁", color: "violet" }
];

const colorClasses = {
  emerald: "border-emerald-500/30 hover:border-emerald-500/50 focus:border-emerald-500/50 text-emerald-400",
  blue: "border-blue-500/30 hover:border-blue-500/50 focus:border-blue-500/50 text-blue-400",
  purple: "border-purple-500/30 hover:border-purple-500/50 focus:border-purple-500/50 text-purple-400",
  pink: "border-pink-500/30 hover:border-pink-500/50 focus:border-pink-500/50 text-pink-400",
  orange: "border-orange-500/30 hover:border-orange-500/50 focus:border-orange-500/50 text-orange-400",
  yellow: "border-yellow-500/30 hover:border-yellow-500/50 focus:border-yellow-500/50 text-yellow-400",
  cyan: "border-cyan-500/30 hover:border-cyan-500/50 focus:border-cyan-500/50 text-cyan-400",
  violet: "border-violet-500/30 hover:border-violet-500/50 focus:border-violet-500/50 text-violet-400"
};

export default function TrackFilesSection({ versions = {}, onChange }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState("");

  const handleVersionChange = (key, value) => {
    onChange({
      ...versions,
      [key]: value || null
    });
  };

  const handleStartEdit = (key) => {
    setEditingKey(key);
    setEditValue(versions[key] || "");
  };

  const handleSaveEdit = (key) => {
    handleVersionChange(key, editValue);
    setEditingKey(null);
  };

  const handleClear = (key) => {
    handleVersionChange(key, null);
  };

  const filledCount = Object.values(versions).filter(v => v).length;

  return (
    <div className="bg-gradient-to-br from-[#1a1a1d] to-[#0f0f12] rounded-lg border border-white/10 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Link2 className="w-5 h-5 text-emerald-400" />
          <div className="text-left">
            <h3 className="text-sm font-bold text-white">Archivos & Versiones</h3>
            <p className="text-xs text-gray-400">{filledCount} de 8 versiones agregadas</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 py-4 border-t border-white/5 space-y-3">
          {versionFields.map(({ key, label, icon, color }) => (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className={`text-xs font-semibold flex items-center gap-2 ${colorClasses[color]}`}>
                  <span>{icon}</span>
                  {label}
                </label>
                {versions[key] && !editingKey && (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(key)}
                      className="p-1 hover:bg-blue-500/10 rounded transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-3 h-3 text-blue-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleClear(key)}
                      className="p-1 hover:bg-red-500/10 rounded transition-colors"
                      title="Eliminar"
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
                    placeholder="https://drive.google.com/... o https://dropbox.com/..."
                    className={`flex-1 px-3 py-2 bg-white/5 border rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 ${colorClasses[color]}`}
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
                  className={`flex items-center gap-2 p-2.5 bg-white/5 border rounded-lg hover:bg-white/10 transition-all ${colorClasses[color]}`}
                >
                  <Link2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="text-xs font-medium truncate hover:underline">Link cargado ✓</span>
                </a>
              ) : (
                <input
                  type="url"
                  placeholder="https://drive.google.com/... o dropbox.com/..."
                  value={versions[key] || ""}
                  onChange={(e) => handleVersionChange(key, e.target.value)}
                  className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-colors ${colorClasses[color]}`}
                />
              )}
            </div>
          ))}

          <div className="pt-2 border-t border-white/5 text-[11px] text-gray-500">
            💡 Pega links de Google Drive o Dropbox. Soporta carpetas compartidas.
          </div>
        </div>
      )}
    </div>
  );
}