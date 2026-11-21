import React, { useRef, useState } from "react";
import { Check, Loader2, Music2, Mic2, Sliders, Sparkles, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { inkFor } from "./PillCard";

const ICONS = [Sparkles, Music2, Sliders, Mic2];
const LINK_RE = /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}([\/?#]\S*)?$/i;

export default function DemoCard({
  card,
  index = 0,
  link = "",
  onLink,
  file,
  onFile,
  directions = [],
  onToggleDirection,
  onInteract,
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const valid = LINK_RE.test(link.trim());

  const upload = async (picked) => {
    if (!picked) return;
    setUploading(true);
    setError("");
    try {
      const res = await base44.integrations.Core.UploadPrivateFile({ file: picked });
      const uri = res?.file_uri || res?.data?.file_uri;
      if (uri) onFile({ name: picked.name, uri });
    } catch (e) {
      setError("No se pudo subir el audio. Inténtalo otra vez.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className={`ccl-bcard ccl-bcard--demo ${inkFor(card.color) === "#f1efe8" ? "ccl-bcard--dark" : ""}`}
      style={{ background: card.color || "#c9431f", color: inkFor(card.color) }}
    >
      <div className="ccl-bcard__head">
        <span className="ccl-bcard__num">{String(index + 1).padStart(2, "0")}</span>
        <h3 className="ccl-bcard__title">{card.title}</h3>
      </div>

      <div className="ccl-demo">
        <div className={`ccl-demo__link ${valid ? "is-valid" : ""}`}>
          <input
            value={link}
            onChange={(e) => {
              onLink(e.target.value);
              onInteract?.();
            }}
            placeholder="Pega tu link (Spotify, SoundCloud, YouTube, Drive)"
            aria-label="Enlace de tu demo"
          />
          {valid && <Check size={15} className="ccl-demo__check" />}
        </div>

        <button
          type="button"
          className={`ccl-pill ccl-pill--upload ${file ? "is-on" : ""}`}
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 size={13} className="ccl-spin" /> : <Upload size={13} />}
          {file ? file.name : "Subir audio"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          className="ccl-hidden-input"
          onChange={(e) => upload(e.target.files?.[0])}
        />
        {error && <span className="ccl-demo__error">{error}</span>}
      </div>

      <span className="ccl-bcard__mini">Dirección creativa</span>
      <div className="ccl-dirs">
        {(card.options || []).map((option, i) => {
          const Icon = ICONS[i % ICONS.length];
          const on = directions.includes(option);
          return (
            <button
              key={option}
              type="button"
              className={`ccl-dir ${on ? "is-on" : ""}`}
              onClick={() => {
                onToggleDirection(option);
                onInteract?.();
              }}
              aria-pressed={on}
            >
              <Icon size={14} />
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}