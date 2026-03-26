import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

export default function SubscriptionStatus({ onUpgradeClick }) {
  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getUserSubscription', {});
      return res.data;
    },
    refetchInterval: 60000 // Actualizar cada minuto
  });

  if (isLoading) return null;

  if (!subscription) return null;

  const isTrialActive = subscription.is_trial_active;
  const isPaid = subscription.plan_type !== 'free_trial';
  const isExpired = !subscription.can_access_features;

  if (isExpired) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-400 mb-1">Suscripción Vencida</p>
            <p className="text-sm text-red-300/80 mb-3">Tu suscripción ha expirado. Actualiza para continuar usando todas las funcionalidades.</p>
            <button
              onClick={onUpgradeClick}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Renovar Suscripción
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isTrialActive) {
    return (
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-blue-400 mb-1">Prueba Gratuita</p>
            <p className="text-sm text-blue-300/80 mb-3">
              {subscription.trial_days_left} días restantes • Acceso completo a todas las funcionalidades
            </p>
            <button
              onClick={onUpgradeClick}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Actualizar Ahora
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isPaid) {
    const nextBilling = subscription.current_period_end ? new Date(subscription.current_period_end) : null;
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-emerald-400 mb-1">Plan {subscription.plan_type.toUpperCase()}</p>
            <p className="text-sm text-emerald-300/80">
              {nextBilling ? `Próxima facturación: ${nextBilling.toLocaleDateString('es-ES')}` : 'Suscripción activa'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}