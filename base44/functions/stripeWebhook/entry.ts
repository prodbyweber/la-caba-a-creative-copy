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

    // Procesar pagos exitosos
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object;
      const customer = await stripe.customers.retrieve(invoice.customer);

      // Buscar la suscripción y actualizar estado
      if (invoice.subscription) {
        const subs = await base44.asServiceRole.entities.Subscription.filter({
          stripe_subscription_id: invoice.subscription
        });

        if (subs.length > 0) {
          await base44.asServiceRole.entities.Subscription.update(subs[0].id, {
            status: 'active',
            current_period_start: new Date(invoice.period_start * 1000).toISOString(),
            current_period_end: new Date(invoice.period_end * 1000).toISOString(),
            amount_monthly: invoice.amount_paid
          });

          // Enviar email de confirmación
          try {
            await base44.integrations.Core.SendEmail({
              to: customer.email,
              subject: '✓ Pago de suscripción recibido',
              body: `Hola,\n\nTu pago de €${(invoice.amount_paid / 100).toFixed(2)} ha sido procesado exitosamente.\n\nTu suscripción estará activa hasta ${new Date(invoice.period_end * 1000).toLocaleDateString('es-ES')}.\n\nGracias por ser parte de Cabaña Creative.\n\nSaludos,\nEl equipo de Cabaña`
            });
          } catch (e) {
            console.error('Error sending payment email:', e);
          }
        }
      }
    }

    // Procesar eventos de suscripción
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
        const customer = await stripe.customers.retrieve(subscription.customer);
        await base44.asServiceRole.entities.Subscription.update(existingSubs[0].id, {
          status: 'canceled'
        });

        // Enviar email de cancelación
        try {
          await base44.integrations.Core.SendEmail({
            to: customer.email,
            subject: 'Suscripción cancelada',
            body: `Hola,\n\nTu suscripción a Cabaña Creative ha sido cancelada.\n\nSi cambias de idea, puedes reactivarla en cualquier momento.\n\nSaludos,\nEl equipo de Cabaña`
          });
        } catch (e) {
          console.error('Error sending cancellation email:', e);
        }
      }
    }

    // Procesar fallos de pago
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      const customer = await stripe.customers.retrieve(invoice.customer);

      if (invoice.subscription) {
        const subs = await base44.asServiceRole.entities.Subscription.filter({
          stripe_subscription_id: invoice.subscription
        });

        if (subs.length > 0) {
          await base44.asServiceRole.entities.Subscription.update(subs[0].id, {
            status: 'past_due'
          });

          // Enviar email de alerta de pago fallido
          try {
            await base44.integrations.Core.SendEmail({
              to: customer.email,
              subject: '⚠ Pago fallido - Acción requerida',
              body: `Hola,\n\nNo pudimos procesar tu pago de €${(invoice.amount_due / 100).toFixed(2)}.\n\nPor favor, actualiza tu método de pago para mantener tu suscripción activa.\n\nSaludos,\nEl equipo de Cabaña`
            });
          } catch (e) {
            console.error('Error sending payment failed email:', e);
          }
        }
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});