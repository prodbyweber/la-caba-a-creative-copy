import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

// Única fuente de verdad para las horas de estudio de un artista.
// Combina el total asignado (Artist.studio_hours_total) y los movimientos
// (StudioHoursLog) en un único cálculo, con sincronización en tiempo real
// mediante suscripciones a ambas entidades. Usado por el panel del artista
// y por el panel de admin para que nunca existan dos estados independientes.
export function useStudioHours(artistId) {
  const queryClient = useQueryClient();
  const enabled = !!artistId;

  const { data: artist } = useQuery({
    queryKey: ["artist", artistId],
    queryFn: async () => {
      const r = await base44.entities.Artist.filter({ id: artistId });
      return r[0] || null;
    },
    enabled,
  });

  const { data: logs = [] } = useQuery({
    queryKey: ["studio-hours-log", artistId],
    queryFn: () => base44.entities.StudioHoursLog.filter({ artist_id: artistId }),
    enabled,
  });

  // Suscripción en tiempo real: cualquier cambio en el Artist o en sus logs
  // invalida las queries y recalcula el contador al instante en todas las vistas.
  useEffect(() => {
    if (!enabled) return;
    let unsubArtist, unsubLogs;
    try {
      unsubArtist = base44.entities.Artist.subscribe?.((event) => {
        const changedId = event?.data?.id || event?.entity_id;
        if (changedId === artistId || !changedId) {
          queryClient.invalidateQueries({ queryKey: ["artist", artistId] });
          queryClient.invalidateQueries({ queryKey: ["artists"] });
        }
      });
    } catch { /* subscribe no disponible */ }
    try {
      unsubLogs = base44.entities.StudioHoursLog.subscribe?.(() => {
        queryClient.invalidateQueries({ queryKey: ["studio-hours-log", artistId] });
      });
    } catch { /* subscribe no disponible */ }
    return () => {
      if (typeof unsubArtist === "function") unsubArtist();
      if (typeof unsubLogs === "function") unsubLogs();
    };
  }, [enabled, artistId, queryClient]);

  const totalHours = artist?.studio_hours_total || 0;
  // Consumo = suma de horas de movimientos de tipo consumo (y logs legacy sin tipo)
  const consumed = logs
    .filter((l) => l.type !== "adjustment")
    .reduce((sum, l) => sum + (Math.abs(l.hours || l.delta || 0)), 0);
  const remaining = Math.max(totalHours - consumed, 0);

  // Historial ordenado por fecha desc (más reciente primero)
  const history = [...logs].sort(
    (a, b) => new Date(b.date || b.created_date || 0) - new Date(a.date || a.created_date || 0)
  );

  return { artist, totalHours, consumed, remaining, logs: history };
}