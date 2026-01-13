import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle, AlertCircle, ExternalLink, Link as LinkIcon } from "lucide-react";

export default function CalendlySync() {
  const [calendlyUrl, setCalendlyUrl] = useState("");
  const [connected, setConnected] = useState(false);

  const handleConnect = () => {
    if (!calendlyUrl) {
      alert("Por favor ingresa tu URL de Calendly");
      return;
    }
    setConnected(true);
    alert("Calendly conectado. Las reservas aparecerán automáticamente como sesiones.");
  };

  return (
    <div className="bg-[#0a0a0b] rounded-2xl border border-white/5 p-6">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
          <Calendar className="w-7 h-7 text-purple-400" />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">Calendly</h3>
          <p className="text-sm text-gray-400 mb-4">
            Integra Calendly para gestionar reservas automáticas. Ideal para sesiones con artistas
            que pueden reservar directamente en tu calendario disponible.
          </p>

          {connected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-green-400">
                <CheckCircle className="w-4 h-4" />
                Conectado con Calendly
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <ExternalLink className="w-4 h-4" />
                {calendlyUrl}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => window.open(calendlyUrl, '_blank')}
                  className="px-4 py-2 rounded-xl bg-purple-500 font-medium text-sm hover:bg-purple-600 transition-all flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Abrir Calendly
                </button>
                <button
                  onClick={() => { setConnected(false); setCalendlyUrl(""); }}
                  className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium text-sm hover:bg-red-500/20 transition-all"
                >
                  Desconectar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  URL de tu Calendly
                </label>
                <input
                  type="text"
                  value={calendlyUrl}
                  onChange={(e) => setCalendlyUrl(e.target.value)}
                  placeholder="https://calendly.com/tu-usuario"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>
              <button
                onClick={handleConnect}
                className="px-4 py-2 rounded-xl bg-purple-500 font-medium text-sm hover:bg-purple-600 transition-all flex items-center gap-2"
              >
                <LinkIcon className="w-4 h-4" />
                Conectar Calendly
              </button>
            </div>
          )}

          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-400">
                <strong>Tip:</strong> Con Calendly, los artistas pueden reservar sesiones directamente
                según tu disponibilidad. Las reservas se importarán automáticamente como sesiones confirmadas.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}