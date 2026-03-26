import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    // Validar firma del webhook
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, WEBHOOK_SECRET);
    } catch (err) {
      return Response.json({ error: `Webhook signature failed: ${err.message}` }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    // Procesar eventos
    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      const customer = await stripe.customers.retrieve(subscription.customer);

      const planType = subscription.metadata?.plan_type || 'pro';
      const trialEndsAt = subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null;

      // Buscar o crear suscripción en BD
      const existingSubs = await base44.asServiceRole.entities.Subscription.filter({
        stripe_subscription_id: subscription.id
      });

      if (existingSubs.length > 0) {
        // Actualizar
        await base44.asServiceRole.entities.Subscription.update(existingSubs[0].id, {
          plan_type: planType,
          status: subscription.status,
          stripe_customer_id: subscription.customer,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          trial_ends_at: trialEndsAt,
          amount_monthly: subscription.items.data[0]?.price?.unit_amount || 0
        });
      } else {
        // Crear
        await base44.asServiceRole.entities.Subscription.create({
          user_email: customer.email,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer,
          plan_type: planType,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          trial_ends_at: trialEndsAt,
          amount_monthly: subscription.items.data[0]?.price?.unit_amount || 0
        });
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const existingSubs = await base44.asServiceRole.entities.Subscription.filter({
        stripe_subscription_id: subscription.id
      });

      if (existingSubs.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(existingSubs[0].id, {
          status: 'canceled'
        });
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});