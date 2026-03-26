import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planType, successUrl, cancelUrl } = await req.json();

    // Fetch plan from database
    const plans = await base44.asServiceRole.entities.Plan.list();
    const plan = plans.find(p => p.name.toLowerCase() === planType.toLowerCase());

    if (!plan || !plan.price_id) {
      return Response.json({ error: 'Plan no configurado o sin Price ID' }, { status: 400 });
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
          price: plan.price_id,
          quantity: 1
        }
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      locale: 'es',
      billing_address_collection: 'auto',
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