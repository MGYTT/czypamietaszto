alter table public.suggestions
add column if not exists created_memory_id uuid
references public.memories(id)
on delete set null;

create index if not exists
  suggestions_created_memory_id_index
on public.suggestions(created_memory_id);