create extension if not exists "pgcrypto";

create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon text not null default '📁',
  description text not null default '',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  content text not null default '',
  year integer,
  icon text not null default '💾',
  cover_image_url text,
  status text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint memories_status_check
    check (status in ('draft', 'published', 'archived')),

  constraint memories_year_check
    check (
      year is null
      or year between 1900 and 2100
    )
);

create table if not exists public.memory_facts (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories(id) on delete cascade,
  content text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.memory_tags (
  memory_id uuid not null references public.memories(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),

  primary key (memory_id, tag_id)
);

create index if not exists categories_slug_index
  on public.categories(slug);

create index if not exists categories_sort_order_index
  on public.categories(sort_order);

create index if not exists memories_slug_index
  on public.memories(slug);

create index if not exists memories_status_index
  on public.memories(status);

create index if not exists memories_category_id_index
  on public.memories(category_id);

create index if not exists memories_published_at_index
  on public.memories(published_at desc);

create index if not exists memory_facts_memory_id_index
  on public.memory_facts(memory_id);

create index if not exists memory_tags_memory_id_index
  on public.memory_tags(memory_id);

create index if not exists memory_tags_tag_id_index
  on public.memory_tags(tag_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists categories_set_updated_at on public.categories;

create trigger categories_set_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();

drop trigger if exists memories_set_updated_at on public.memories;

create trigger memories_set_updated_at
before update on public.memories
for each row
execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where admin_users.id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;

grant execute
on function public.is_admin()
to anon, authenticated;

alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.memories enable row level security;
alter table public.memory_facts enable row level security;
alter table public.tags enable row level security;
alter table public.memory_tags enable row level security;

drop policy if exists "Admins can view their account" on public.admin_users;

create policy "Admins can view their account"
on public.admin_users
for select
to authenticated
using (id = auth.uid());

drop policy if exists "Public can view active categories" on public.categories;

create policy "Public can view active categories"
on public.categories
for select
to anon, authenticated
using (
  is_active = true
  or public.is_admin()
);

drop policy if exists "Admins can create categories" on public.categories;

create policy "Admins can create categories"
on public.categories
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update categories" on public.categories;

create policy "Admins can update categories"
on public.categories
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete categories" on public.categories;

create policy "Admins can delete categories"
on public.categories
for delete
to authenticated
using (public.is_admin());

drop policy if exists "Public can view published memories" on public.memories;

create policy "Public can view published memories"
on public.memories
for select
to anon, authenticated
using (
  status = 'published'
  or public.is_admin()
);

drop policy if exists "Admins can create memories" on public.memories;

create policy "Admins can create memories"
on public.memories
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update memories" on public.memories;

create policy "Admins can update memories"
on public.memories
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete memories" on public.memories;

create policy "Admins can delete memories"
on public.memories
for delete
to authenticated
using (public.is_admin());

drop policy if exists "Public can view facts of published memories"
on public.memory_facts;

create policy "Public can view facts of published memories"
on public.memory_facts
for select
to anon, authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.memories
    where memories.id = memory_facts.memory_id
      and memories.status = 'published'
  )
);

drop policy if exists "Admins can create facts" on public.memory_facts;

create policy "Admins can create facts"
on public.memory_facts
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update facts" on public.memory_facts;

create policy "Admins can update facts"
on public.memory_facts
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete facts" on public.memory_facts;

create policy "Admins can delete facts"
on public.memory_facts
for delete
to authenticated
using (public.is_admin());

drop policy if exists "Public can view tags" on public.tags;

create policy "Public can view tags"
on public.tags
for select
to anon, authenticated
using (true);

drop policy if exists "Admins can create tags" on public.tags;

create policy "Admins can create tags"
on public.tags
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update tags" on public.tags;

create policy "Admins can update tags"
on public.tags
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete tags" on public.tags;

create policy "Admins can delete tags"
on public.tags
for delete
to authenticated
using (public.is_admin());

drop policy if exists "Public can view tags of published memories"
on public.memory_tags;

create policy "Public can view tags of published memories"
on public.memory_tags
for select
to anon, authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.memories
    where memories.id = memory_tags.memory_id
      and memories.status = 'published'
  )
);

drop policy if exists "Admins can assign tags" on public.memory_tags;

create policy "Admins can assign tags"
on public.memory_tags
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can remove tags" on public.memory_tags;

create policy "Admins can remove tags"
on public.memory_tags
for delete
to authenticated
using (public.is_admin());

insert into public.categories (
  name,
  slug,
  icon,
  description,
  sort_order
)
values
  (
    'Gry',
    'gry',
    '🎮',
    'Gry komputerowe, przeglądarkowe, konsolowe i pierwsze gry mobilne.',
    10
  ),
  (
    'Muzyka',
    'muzyka',
    '🎵',
    'Piosenki z odtwarzaczy MP3, szkolnych dyskotek i pierwszych teledysków.',
    20
  ),
  (
    'Słodycze',
    'slodycze',
    '🍬',
    'Produkty ze szkolnych sklepików i smaki, których już nie znajdziemy.',
    30
  ),
  (
    'Dawny internet',
    'dawny-internet',
    '🌐',
    'Komunikatory, portale społecznościowe, fora i strony z grami.',
    40
  ),
  (
    'Telewizja',
    'telewizja',
    '📺',
    'Kreskówki, seriale, programy i reklamy zapamiętane z dzieciństwa.',
    50
  ),
  (
    'Zabawki',
    'zabawki',
    '🧸',
    'Figurki, kolekcje, gadżety szkolne i zabawki, o których marzyliśmy.',
    60
  ),
  (
    'Technologia',
    'technologia',
    '💻',
    'Stare telefony, komputery, odtwarzacze i urządzenia używane przed laty.',
    70
  )
on conflict (slug)
do update set
  name = excluded.name,
  icon = excluded.icon,
  description = excluded.description,
  sort_order = excluded.sort_order;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'memory-images',
  'memory-images',
  true,
  5242880,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
)
on conflict (id)
do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view memory images"
on storage.objects;

create policy "Public can view memory images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'memory-images');

drop policy if exists "Admins can upload memory images"
on storage.objects;

create policy "Admins can upload memory images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'memory-images'
  and public.is_admin()
);

drop policy if exists "Admins can update memory images"
on storage.objects;

create policy "Admins can update memory images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'memory-images'
  and public.is_admin()
)
with check (
  bucket_id = 'memory-images'
  and public.is_admin()
);

drop policy if exists "Admins can delete memory images"
on storage.objects;

create policy "Admins can delete memory images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'memory-images'
  and public.is_admin()
);