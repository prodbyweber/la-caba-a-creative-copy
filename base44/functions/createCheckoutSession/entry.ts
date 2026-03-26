import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

const PLANS = {
  pro: {
    name: 'Pro',
    amount: 2999,
    currency: 'eur',
    interval: 'month',
    description: 'Acceso completo a todas las funcionalidades'
  },
  enterprise: {
    name: 'Enterprise',
    amount: 9999,
    currency: 'eur',
    interval: 'month',
    description: 'Soporte prioritario y funcionalidades avanzadas'
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planType, successUrl, cancelUrl } = await req.json();

    if (!PLANS[planType]) {
      return Response.json({ error: 'Plan inválido' }, { status: 400 });
    }

    // Buscar o crear cliente Stripe
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id }
      });
      customerId = customer.id;
    }

    // Crear sesión de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: PLANS[planType].currency,
            product_data: {
              name: PLANS[planType].name,
              description: PLANS[planType].description
            },
            unit_amount: PLANS[planType].amount,
            recurring: {
              interval: PLANS[planType].interval,
              trial_period_days: 14
            }
          },
          quantity: 1
        }
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        plan_type: planType,
        user_email: user.email
      }
    });

    return Response.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});