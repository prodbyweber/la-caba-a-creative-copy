import React, { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";

export default function PublicProfileLink({ username }) {
  const [copied, setCopied] = useState(false);
  const url = `cabanacreative.es/${username}`;
  const fullUrl = `https://${url}`;

  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex items-center justify-center gap-2 mb-3">
      <a
        href={fullUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors"
        onClick={e => e.stopPropagation()}
      >
        <ExternalLink className="w-3 h-3 flex-shrink-0" />
        <span>{url}</span>
      </a>
      <button
        onClick={handleCopy}
        className="p-1 rounded hover:bg-white/10 transition-colors text-white/20 hover:text-white/50"
        title="Copiar enlace"
      >
        {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
      </button>
    </div>
  );
}