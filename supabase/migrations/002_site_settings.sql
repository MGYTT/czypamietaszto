create table if not exists public.site_settings (
  id boolean primary key default true,

  site_name text not null default 'CzyPamiętaszTo.pl',
  site_description text not null default
    'Internetowe archiwum nostalgii, gier, muzyki, słodyczy i dawnego internetu.',

  hero_eyebrow text not null default
    'Internetowe archiwum nostalgii',

  hero_title text not null default
    'Czy pamiętasz',

  hero_highlight text not null default
    'to?',

  hero_description text not null default
    'Wróć do czasów, kiedy internet łączył się przez modem, na komputerze królowały gry z płyt, a najlepsze piosenki przesyłaliśmy sobie przez Bluetooth.',

  announcement text not null default
    'Witamy na stronie CzyPamiętaszTo.pl! Przypomnij sobie stare gry, piosenki, słodycze i portale internetowe.',

  tiktok_url text,
  contact_email text,

  footer_text text not null default
    'Internetowe Archiwum Nostalgii',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint site_settings_single_row_check
    check (id = true)
);

drop trigger if exists site_settings_set_updated_at
on public.site_settings;

create trigger site_settings_set_updated_at
before update on public.site_settings
for each row
execute function public.set_updated_at();

insert into public.site_settings (
  id,
  site_name,
  site_description,
  hero_eyebrow,
  hero_title,
  hero_highlight,
  hero_description,
  announcement,
  footer_text
)
values (
  true,
  'CzyPamiętaszTo.pl',
  'Internetowe archiwum nostalgii, gier, muzyki, słodyczy i dawnego internetu.',
  'Internetowe archiwum nostalgii',
  'Czy pamiętasz',
  'to?',
  'Wróć do czasów, kiedy internet łączył się przez modem, na komputerze królowały gry z płyt, a najlepsze piosenki przesyłaliśmy sobie przez Bluetooth.',
  'Witamy na stronie CzyPamiętaszTo.pl! Przypomnij sobie stare gry, piosenki, słodycze i portale internetowe.',
  'Internetowe Archiwum Nostalgii'
)
on conflict (id)
do nothing;

alter table public.site_settings
enable row level security;

drop policy if exists
  "Public can view site settings"
on public.site_settings;

create policy
  "Public can view site settings"
on public.site_settings
for select
to anon, authenticated
using (true);

drop policy if exists
  "Admins can create site settings"
on public.site_settings;

create policy
  "Admins can create site settings"
on public.site_settings
for insert
to authenticated
with check (
  public.is_admin()
  and id = true
);

drop policy if exists
  "Admins can update site settings"
on public.site_settings;

create policy
  "Admins can update site settings"
on public.site_settings
for update
to authenticated
using (public.is_admin())
with check (
  public.is_admin()
  and id = true
);