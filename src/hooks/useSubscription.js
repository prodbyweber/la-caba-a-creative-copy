import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useSubscription() {
  const { data: subscription = null, isLoading, refetch } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      try {
        const res = await base44.functions.invoke('getUserSubscription', {});
        return res.data;
      } catch (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }
    },
    refetchInterval: 60000 // Actualizar cada minuto
  });

  // Determinar acceso a funcionalidades
  const canAccess = (feature) => {
    if (!subscription) return true; // Acceso por defecto si no hay data

    const isActive = subscription.can_access_features;

    // Mapeo de features según plan
    const featureAccess = {
      // Funcionalidades gratuitas (trial + paid)
      'view_dashboard': isActive,
      'manage_artists': isActive,
      'manage_projects': isActive,
      'manage_sessions': isActive,
      'view_sessions': isActive,

      // Funcionalidades PRO (solo si está pagado)
      'google_calendar_sync': subscription.plan_type === 'pro' || subscription.plan_type === 'enterprise',
      'clips': subscription.plan_type === 'pro' || subscription.plan_type === 'enterprise',
      'analytics': subscription.plan_type === 'pro' || subscription.plan_type === 'enterprise',
      'export_data': subscription.plan_type === 'pro' || subscription.plan_type === 'enterprise',

      // Funcionalidades ENTERPRISE
      'api_access': subscription.plan_type === 'enterprise',
      'team_members': subscription.plan_type === 'enterprise',
      'custom_integrations': subscription.plan_type === 'enterprise'
    };

    return featureAccess[feature] ?? isActive;
  };

  const isPaid = subscription && subscription.plan_type !== 'free_trial';
  const isTrial = subscription && subscription.is_trial_active;
  const isExpired = subscription && !subscription.can_access_features;
  const trialDaysLeft = subscription?.trial_days_left ?? 0;

  return {
    subscription,
    isLoading,
    canAccess,
    isPaid,
    isTrial,
    isExpired,
    trialDaysLeft,
    refetch
  };
}