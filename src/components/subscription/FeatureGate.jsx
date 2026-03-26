import React from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { Lock } from "lucide-react";

export default function FeatureGate({ feature, children, onUpgradeClick, fallback = null }) {
  const { canAccess, isTrial, trialDaysLeft } = useSubscription();

  if (canAccess(feature)) {
    return children;
  }

  if (fallback) {
    return fallback;
  }

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>

      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg">
        <div className="text-center px-4">
          <Lock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <p className="text-white font-semibold mb-2">Funcionalidad Premium</p>
          <p className="text-sm text-gray-300 mb-4">
            {isTrial
              ? `Actualiza tu plan para acceder. ${trialDaysLeft} días de prueba restantes.`
              : 'Necesitas una suscripción activa para usar esta función.'}
          </p>
          {onUpgradeClick && (
            <button
              onClick={onUpgradeClick}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Ver Planes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}