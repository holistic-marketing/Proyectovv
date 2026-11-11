# Clerk Auth (login Ads Holistic — instancia propia, sin satélite)
# Dashboard → https://dashboard.clerk.com → app propia de Ads Holistic → API Keys
# Domains: localhost + adsholistic.com como dominio principal (Frontend API clerk.adsholistic.com)

AUTH_CLERK_LOGIN=true
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/auth/clerk/complete
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/auth/clerk/complete

# NO definir NEXT_PUBLIC_CLERK_IS_SATELLITE ni NEXT_PUBLIC_CLERK_DOMAIN:
# @clerk/nextjs los lee solo y volvería a activar el modo satélite.

# DNS Vercel: CNAME clerk → frontend-api.clerk.services

# Configuración de la instancia (dashboard de Clerk):
# - Email address: activado, con "Email verification link".
# - Password: desactivado.
# - Phone number: desactivado (el teléfono va en unsafeMetadata y lo valida el servidor).
# - Sign-up: activado (registro sin contraseña en /sign-up).
# - Bot protection: activado (usa challenges.cloudflare.com, ya en la CSP).

# Seguridad: aunque Clerk acepte la cuenta, /auth/clerk/complete solo da acceso a
# staff (staff_members) o a correos con ficha en Hecom; el registro propio crea la ficha.
# Mantener AUTH_HECOM_OTP_LOGIN=true: activa el aislamiento entre clientes.
