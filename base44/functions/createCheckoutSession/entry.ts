import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Intentar obtener usuario autenticado
    let user;
    try {
      user = await base44.auth.me();
    } catch (e) {
      return Response.json({ error: 'Usuario no autenticado. Por favor inicia sesión.' }, { status: 401 });
    }

    if (!user) {
      return Response.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    const { planType, successUrl, cancelUrl } = await req.json();

    if (!planType || !successUrl || !cancelUrl) {
      return Response.json({ error: 'Parámetros incompletos' }, { status: 400 });
    }

    // Fetch plan from database (usando service role para mayor confiabilidad)
    let plan;
    try {
      const plans = await base44.asServiceRole.entities.Plan.list();
      plan = plans.find(p => p.name.toLowerCase() === planType.toLowerCase());
    } catch (e) {
      console.error('Error fetching plans:', e);
      return Response.json({ error: 'Error al obtener planes' }, { status: 500 });
    }

    if (!plan || !plan.price_id) {
      return Response.json({ error: 'Plan no configurado o sin Price ID' }, { status: 400 });
    }

    // Buscar o crear cliente Stripe
    let customerId;
    try {
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1
      });

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { user_id: user.id }
        });
        customerId = customer.id;
      }
    } catch (e) {
      console.error('Error with Stripe customer:', e);
      return Response.json({ error: 'Error al procesar cliente Stripe' }, { status: 500 });
    }

    // Crear sesión de checkout
    let session;
    try {
      session = await stripe.checkout.sessions.create({
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
    } catch (e) {
      console.error('Error creating checkout session:', e);
      return Response.json({ error: 'Error al crear sesión de pago' }, { status: 500 });
    }

    return Response.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Unexpected error:', error);
    return Response.json({ error: 'Error inesperado: ' + error.message }, { status: 500 });
  }
});