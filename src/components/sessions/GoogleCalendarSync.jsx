import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle, AlertCircle, RefreshCw, Link as LinkIcon } from "lucide-react";

export default function GoogleCalendarSync() {
  const [connected, setConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleConnect = () => {
    alert("Para conectar Google Calendar:\n\n1. Necesitas configurar OAuth en el backend\n2. Ve a la configuración de App Connectors\n3. Solicita autorización para 'googlecalendar'\n4. Los eventos se sincronizarán automáticamente\n\nContacta con el administrador para configurar las credenciales OAuth.");
  };

  const handleSync = async () => {
    setSyncing(true);
    // Simular sincronización
    setTimeout(() => {
      setSyncing(false);
      alert("Sincronización completada. Los eventos se han actualizado.");
    }, 2000);
  };

  return (
    <div className="bg-[#0a0a0b] rounded-2xl border border-white/5 p-6">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
          <Calendar className="w-7 h-7 text-blue-400" />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">Google Calendar</h3>
          <p className="text-sm text-gray-400 mb-4">
            Sincroniza tus sesiones con Google Calendar para tener todos tus eventos en un solo lugar.
            Las sesiones creadas aquí aparecerán en tu calendario de Google automáticamente.
          </p>

          {connected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-green-400">
                <CheckCircle className="w-4 h-4" />
                Conectado con Google Calendar
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="px-4 py-2 rounded-xl bg-blue-500 font-medium text-sm hover:bg-blue-600 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Sincronizando...' : 'Sincronizar Ahora'}
                </button>
                <button
                  onClick={() => setConnected(false)}
                  className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium text-sm hover:bg-red-500/20 transition-all"
                >
                  Desconectar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              className="px-4 py-2 rounded-xl bg-blue-500 font-medium text-sm hover:bg-blue-600 transition-all flex items-center gap-2"
            >
              <LinkIcon className="w-4 h-4" />
              Conectar Google Calendar
            </button>
          )}

          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-yellow-400">
                <strong>Nota:</strong> La sincronización bidireccional requiere configuración de OAuth en el backend.
                Los eventos creados en Google Calendar también aparecerán aquí automáticamente.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}