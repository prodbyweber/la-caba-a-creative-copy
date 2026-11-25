import React, { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function MediaField({ value, onChange, accept = "video/mp4,video/webm", hint }) {
  const [uploading, setUploading] = useState(false);

  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      onChange(file_url);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={hint}
          className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#ff5833]"
        />
        <label className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-white/10 px-3 text-xs font-semibold text-zinc-300 hover:border-[#ff5833]">
          {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
          Subir
          <input type="file" accept={accept} hidden onChange={upload} />
        </label>
      </div>
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="mt-1 text-[10px] uppercase tracking-[0.18em] text-zinc-500 hover:text-[#ff5833]"
        >
          Quitar
        </button>
      ) : null}
    </div>
  );
}