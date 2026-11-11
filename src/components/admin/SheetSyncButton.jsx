import React, { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCw, Loader2, Check, ExternalLink } from "lucide-react";

export default function SheetSyncButton({ disabled, autoSync = true }) {
  const [status, setStatus] = useState("idle"); // idle | syncing | done | error
  const [sheetUrl, setSheetUrl] = useState(null);
  const [error, setError] = useState(null);
  const startedRef = useRef(false);

  const sync = useCallback(async (silent) => {
    setStatus("syncing");
    setError(null);
    try {
      const res = await base44.functions.invoke("syncArtistsToSheet", {});
      const data = res.data || {};
      if (data.error) throw new Error(data.error);
      if (data.spreadsheet_url) setSheetUrl(data.spreadsheet_url);
      setStatus("done");
      setTimeout(() => setStatus((s) => (s === "done" ? "idle" : s)), 3000);
    } catch (e) {
      if (silent) {
        setStatus("idle");
        return;
      }
      setStatus("error");
      setError(e?.response?.data?.error || e.message);
    }
  }, []);

  // Mantiene la hoja al día cada vez que se abre el panel.
  useEffect(() => {
    if (!autoSync || disabled || startedRef.current) return;
    startedRef.current = true;
    sync(true);
  }, [autoSync, disabled, sync]);

  const isSyncing = status === "syncing";

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1.5">
        {sheetUrl && (
          <a
            href={sheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir la hoja de Google"
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] font-semibold text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
            style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Abrir hoja</span>
          </a>
        )}

        <button
          onClick={() => sync(false)}
          disabled={disabled || isSyncing}
          title={error || "Sincronizar los creadores con la hoja de Google"}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[11px] font-semibold text-white/70 hover:bg-white/[0.08] hover:text-white transition-colors flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
        >
          {isSyncing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : status === "done" ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">
            {isSyncing ? "Sincronizando..." : status === "done" ? "Hoja actualizada" : "Sincronizar hoja"}
          </span>
        </button>
      </div>

      {status === "error" && (
        <span className="text-[10px] text-red-400 max-w-[320px] text-right leading-tight">{error}</span>
      )}
    </div>
  );
}