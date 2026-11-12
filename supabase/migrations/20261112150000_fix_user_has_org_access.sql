-- user_has_org_access usaba organizations.created_by, columna que no existe:
-- toda lectura de organizations / onboarding con sesión de cliente daba 400
-- («column o.created_by does not exist»). Se deja solo la membresía activa.
CREATE OR REPLACE FUNCTION public.user_has_org_access(target_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT target_org_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.organization_memberships om
      WHERE om.user_id = auth.uid()
        AND om.organization_id = target_org_id
        AND om.status::text = 'active'
    );
$function$;
