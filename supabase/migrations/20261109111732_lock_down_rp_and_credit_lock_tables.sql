-- Activa RLS y quita acceso público (anon/authenticated) a tablas que estaban expuestas.
-- La app accede con service_role (createAdminClient), que no se ve afectada.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['rp_organizations','rp_users','rp_stores','rp_shopify_sessions','rp_products','rp_orders','rp_ad_spend_daily','rp_ad_integrations','credit_lock_profiles']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', t);
  END LOOP;
END $$;
