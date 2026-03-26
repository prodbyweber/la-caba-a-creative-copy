# Integración Stripe - Guía de Configuración

## ✅ Configuración Completada

La plataforma incluye una integración completa con Stripe para:
- ✅ Suscripciones con prueba gratuita de 14 días
- ✅ Tres planes disponibles (Free Trial, Pro, Enterprise)
- ✅ Bloqueo de funcionalidades según plan
- ✅ Webhook para sincronizar estado de pago
- ✅ Control de acceso a features

## 🔧 Configuración Requerida

### 1. Verificar Secrets en Base44

Ve a **Settings → Environment Variables** y verifica que tienes:
- ✅ `STRIPE_SECRET_KEY` - Ya configurado
- ✅ `STRIPE_WEBHOOK_SECRET` - Ya configurado

### 2. Configurar Webhook en Stripe Dashboard

1. Ve a: https://dashboard.stripe.com/webhooks
2. Click en **Add endpoint**
3. URL del webhook: `https://tudominio.com/webhook/stripe`
   - En local: Usa Stripe CLI o un servicio como ngrok
4. Selecciona eventos:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copia el **Signing secret** y guárdalo en `STRIPE_WEBHOOK_SECRET`

### 3. Configurar Productos en Stripe

Crea dos productos recurrentes:

**Pro Plan:**
- Nombre: "Pro"
- Precio: €29.99/mes
- Recurrencia: Mensual
- Trial: 14 días (configurado en checkout)

**Enterprise Plan:**
- Nombre: "Enterprise"
- Precio: €99.99/mes
- Recurrencia: Mensual
- Trial: 14 días (configurado en checkout)

## 📱 Flujo de Usuario

### Nuevos Usuarios
1. Se crean con `plan_type: 'free_trial'`
2. Acceso completo durante 14 días
3. Reciben alerta de "Prueba Gratuita" en dashboard
4. Botón "Actualizar Ahora" visible en el dashboard

### Usuarios en Prueba
- Ver: `/pricing` → Tabla de comparación
- Hacer clic en plan → Stripe checkout
- 14 días de prueba incluidos en la suscripción
- Acceso completo mientras la suscripción es activa

### Usuarios Pagados
- `plan_type: 'pro'` o `'enterprise'`
- Acceso a todas las funcionalidades del plan
- Renovación automática según período de facturación
- Pueden cancelar en cualquier momento

### Usuarios Expirados
- Suscripción vencida o cancelada
- Acceso limitado a funciones básicas
- Alerta roja en dashboard
- Botón "Renovar Suscripción"

## 🛡️ Funcionalidades Bloqueadas por Plan

### Free Trial + Pro Access:
- ✅ Gestión de artistas
- ✅ Proyectos y tracks
- ✅ Calendario de sesiones
- ✅ Google Calendar Sync (Pro only)
- ✅ Clip Management (Pro only)
- ✅ Análisis avanzados (Pro only)

### Enterprise Only:
- ✅ Usuarios ilimitados
- ✅ API personalizada
- ✅ Integraciones custom
- ✅ Soporte 24/7

## 🔑 Uso en Componentes

### Verificar Suscripción
```jsx
import { useSubscription } from '@/hooks/useSubscription';

const { canAccess, isPaid, isTrial, trialDaysLeft } = useSubscription();

if (canAccess('google_calendar_sync')) {
  // Mostrar Google Calendar
}
```

### Bloquear Features
```jsx
import FeatureGate from '@/components/subscription/FeatureGate';

<FeatureGate 
  feature="clips" 
  onUpgradeClick={() => setShowPlansModal(true)}
>
  <ClipsComponent />
</FeatureGate>
```

### Mostrar Estado
```jsx
import SubscriptionStatus from '@/components/subscription/SubscriptionStatus';

<SubscriptionStatus onUpgradeClick={() => setShowPlansModal(true)} />
```

## 🧪 Testing en Local

### Sin Webhook (desarrollo):
Las suscripciones se crean pero el webhook no se sincroniza automáticamente.

### Con Stripe CLI:
```bash
npm install -g @stripe/cli

# Authenticate
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/functions/stripeWebhook

# Usar tarjeta de test
- Visa: 4242 4242 4242 4242
- Exp: 12/25
- CVC: 123
```

## 📊 Base de Datos

### Tabla: Subscription
```sql
- user_email (string)
- stripe_customer_id (string)
- stripe_subscription_id (string)
- plan_type: 'free_trial' | 'pro' | 'enterprise'
- status: 'active' | 'canceled' | 'past_due'
- trial_ends_at (datetime)
- current_period_start (datetime)
- current_period_end (datetime)
- amount_monthly (number en centavos)
```

## 🚀 Funciones Backend

### `createCheckoutSession`
- Crea sesión de checkout en Stripe
- Retorna URL de Stripe para redirigir

### `getUserSubscription`
- Obtiene estado actual de suscripción
- Calcula días restantes de prueba
- Verifica si acceso está activo

### `stripeWebhook`
- Procesa webhooks de Stripe
- Sincroniza cambios en BD
- Maneja creación, actualización y cancelación

## 🔐 Seguridad

- ✅ Webhook tiene validación de firma Stripe
- ✅ Funciones verifican autenticación del usuario
- ✅ Acceso a features controlado por lado del servidor
- ✅ Tokens de Stripe nunca se exponen al frontend

## 📞 Soporte

Para problemas:
1. Verifica que STRIPE_SECRET_KEY y STRIPE_WEBHOOK_SECRET estén configurados
2. Revisa logs de webhook en Stripe Dashboard
3. Prueba con `stripe listen` en local
4. Verifica que los productos existan en Stripe con los precios correctos