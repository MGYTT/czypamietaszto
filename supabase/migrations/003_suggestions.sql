create table if not exists public.suggestions (
  id uuid primary key default gen_random_uuid(),

  category_id uuid
    references public.categories(id)
    on delete set null,

  title text not null,
  approximate_year integer,
  description text not null,

  submitter_name text,
  submitter_email text,
  source_url text,

  status text not null default 'pending',
  admin_notes text not null default '',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint suggestions_status_check
    check (
      status in (
        'pending',
        'accepted',
        'rejected'
      )
    ),

  constraint suggestions_year_check
    check (
      approximate_year is null
      or approximate_year between 1900 and 2100
    ),

  constraint suggestions_title_length_check
    check (
      char_length(title) between 2 and 150
    ),

  constraint suggestions_description_length_check
    check (
      char_length(description) between 20 and 5000
    )
);

create index if not exists suggestions_status_index
  on public.suggestions(status);

create index if not exists suggestions_created_at_index
  on public.suggestions(created_at desc);

create index if not exists suggestions_category_id_index
  on public.suggestions(category_id);

drop trigger if exists suggestions_set_updated_at
on public.suggestions;

create trigger suggestions_set_updated_at
before update on public.suggestions
for each row
execute function public.set_updated_at();

alter table public.suggestions
enable row level security;

drop policy if exists
  "Anyone can submit suggestions"
on public.suggestions;

create policy
  "Anyone can submit suggestions"
on public.suggestions
for insert
to anon, authenticated
with check (
  status = 'pending'
  and admin_notes = ''
);

drop policy if exists
  "Admins can view suggestions"
on public.suggestions;

create policy
  "Admins can view suggestions"
on public.suggestions
for select
to authenticated
using (public.is_admin());

drop policy if exists
  "Admins can update suggestions"
on public.suggestions;

create policy
  "Admins can update suggestions"
on public.suggestions
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists
  "Admins can delete suggestions"
on public.suggestions;

create policy
  "Admins can delete suggestions"
on public.suggestions
for delete
to authenticated
using (public.is_admin());