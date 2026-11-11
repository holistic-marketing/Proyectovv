-- Avisos que gerencia manda a todos (push + campanita). Solo se lee y escribe
-- con la service role desde el servidor.
create table if not exists public.push_broadcasts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  url text not null default '/overview',
  audience text not null check (audience in ('clientes', 'todos', 'prueba')),
  sent_by uuid references auth.users (id) on delete set null,
  sent_by_email text,
  recipients integer not null default 0,
  devices integer not null default 0,
  delivered integer not null default 0,
  failed integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists push_broadcasts_created_idx
  on public.push_broadcasts (created_at desc);

alter table public.push_broadcasts enable row level security;
revoke all on public.push_broadcasts from anon, authenticated;
