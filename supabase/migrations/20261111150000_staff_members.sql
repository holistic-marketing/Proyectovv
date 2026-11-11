-- Staff de Ads Holistic (gerentes) en base de datos, en lugar de listas en código.
-- Reemplaza a futuro DEFAULT_STAFF_EMAILS (lib/auth/hecom-otp.server.ts).
-- Borrador local: NO aplicado en remoto. La app sigue usando la lista del código
-- como respaldo mientras esta tabla no exista o no responda.

begin;
set local lock_timeout = '5s';
set local statement_timeout = '20s';

create table if not exists public.staff_members (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text,
  role text not null default 'staff',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint staff_members_email_key unique (email),
  -- El correo se guarda ya normalizado: así el UNIQUE y las búsquedas no dependen de mayúsculas.
  constraint staff_members_email_normalized check (email = lower(btrim(email)) and email like '%_@_%'),
  constraint staff_members_role_check check (role in ('staff', 'admin'))
);

comment on table public.staff_members is
  'Gerentes / staff de Ads Holistic. is_active = false revoca el rol aunque el correo siga en listas legadas.';

alter table public.staff_members enable row level security;

-- service_role ignora RLS, pero dejamos la política explícita para que quede documentada.
drop policy if exists staff_members_service_role_all on public.staff_members;
create policy staff_members_service_role_all
  on public.staff_members
  for all
  to service_role
  using (true)
  with check (true);

-- Un usuario autenticado solo ve su propia fila (por el correo verificado del JWT).
drop policy if exists staff_members_select_own on public.staff_members;
create policy staff_members_select_own
  on public.staff_members
  for select
  to authenticated
  using (email = lower(btrim(coalesce(auth.jwt() ->> 'email', ''))));

revoke all on public.staff_members from anon;
revoke all on public.staff_members from authenticated;
grant select on public.staff_members to authenticated;
grant all on public.staff_members to service_role;

-- Semilla: DEFAULT_STAFF_EMAILS del código al 2026-11-11.
-- Excluidos a propósito:
--   * atlvbasiliorengifo@gmail.com: gerente demo, se resuelve en código (isDemoGerenteEmail).
--   * sandrowonmer@gmail.com: tester con cookie de modo; si estuviera aquí, el modo "cliente" dejaría de funcionar.
--   * Correos que solo existen en la tabla `gerentes` de Hecom (sin verificar para Ads).
insert into public.staff_members (email, role) values
  ('anniealejandrova6@gmail.com', 'staff'),
  ('gian.rojas.arcos@gmail.com', 'staff'),
  ('victor.minas@unmsm.edu.pe', 'staff'),
  ('attermayerbasiliorengifo@gmail.com', 'staff'),
  ('lizarzaburusebastian046@gmail.com', 'staff'),
  ('clats2003@hotmail.com', 'staff'),
  ('branlyn.lopez.r@gmail.com', 'staff'),
  ('freddyjgt258@gmail.com', 'staff'),
  ('sebasnodeal@gmail.com', 'staff'),
  ('alexquispealbino@gmail.com', 'staff')
on conflict (email) do nothing;

commit;
