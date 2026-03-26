import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { planType, successUrl, cancelUrl, email } = await req.json();

    if (!planType || !successUrl || !cancelUrl) {
      return Response.json({ error: 'Parámetros incompletos' }, { status: 400 });
    }

    // Obtener usuario si está autenticado, sino usar email proporcionado
    let userEmail = email;
    let userId = null;
    
    try {
      const user = await base44.auth.me();
      if (user) {
        userEmail = user.email;
        userId = user.id;
      }
    } catch (e) {
      // Usuario no autenticado, continuar con email proporcionado
      if (!userEmail) {
        return Response.json({ error: 'Email requerido para usuarios no autenticados' }, { status: 400 });
      }
    }

    // Map plan types directly to Stripe price IDs
    const planPriceMap = {
      'explorador': 'price_1TFJAu2cunznauNiggK0VNsU',
      'pionero': process.env.STRIPE_PRICE_PIONERO || 'price_1TFJAu2cunznauNiggK0VNsU',
      'independiente': process.env.STRIPE_PRICE_INDEPENDIENTE || 'price_1TFJAu2cunznauNiggK0VNsU'
    };

    const priceId = planPriceMap[planType.toLowerCase()];
    if (!priceId) {
      return Response.json({ error: 'Plan no válido' }, { status: 400 });
    }

    // Buscar o crear cliente Stripe
    let customerId;
    try {
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 1
      });

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: userEmail,
          metadata: { user_id: userId || 'anonymous' }
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
            price: priceId,
            quantity: 1
          }
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        locale: 'es',
        billing_address_collection: 'auto',
        customer_update: {
          address: 'auto'
        },
        metadata: {
          plan_type: planType,
          user_email: userEmail
        }
      });
    } catch (e) {
      console.error('Error creating checkout session:', e);
      return Response.json({ error: 'Error al crear sesión de pago: ' + e.message }, { status: 500 });
    }

    return Response.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Unexpected error:', error);
    return Response.json({ error: 'Error inesperado: ' + error.message }, { status: 500 });
  }
});