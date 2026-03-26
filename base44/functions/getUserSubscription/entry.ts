import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Buscar suscripción del usuario
    const subs = await base44.entities.Subscription.filter({
      user_email: user.email
    });

    if (subs.length === 0) {
      // Usuario nuevo sin suscripción
      const trialEnds = new Date();
      trialEnds.setDate(trialEnds.getDate() + 14);

      const newSub = await base44.entities.Subscription.create({
        user_email: user.email,
        plan_type: 'free_trial',
        status: 'active',
        trial_ends_at: trialEnds.toISOString()
      });

      return Response.json({
        plan_type: 'free_trial',
        status: 'active',
        trial_ends_at: newSub.trial_ends_at,
        trial_days_left: 14,
        is_trial_active: true,
        can_access_features: true
      });
    }

    const sub = subs[0];

    // Verificar si la prueba aún está activa
    const trialEndsAt = sub.trial_ends_at ? new Date(sub.trial_ends_at) : null;
    const now = new Date();
    const isTrialActive = trialEndsAt && now < trialEndsAt && sub.plan_type === 'free_trial';
    const trialDaysLeft = trialEndsAt ? Math.ceil((trialEndsAt - now) / (1000 * 60 * 60 * 24)) : 0;

    return Response.json({
      plan_type: sub.plan_type,
      status: sub.status,
      trial_ends_at: sub.trial_ends_at,
      trial_days_left: Math.max(0, trialDaysLeft),
      is_trial_active: isTrialActive,
      can_access_features: sub.status === 'active' || isTrialActive,
      current_period_end: sub.current_period_end,
      amount_monthly: sub.amount_monthly
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});