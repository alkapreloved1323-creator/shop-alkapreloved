create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(), email text unique not null,
  subscribed_at timestamptz not null default now()
);
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(), name text not null, email text not null,
  message text not null, status text not null default 'unread', created_at timestamptz not null default now()
);
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages enable row level security;
