import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { updateMemory } from "@/actions/update-memory";
import {
  MemoryForm,
  type MemoryFormValues,
} from "@/components/admin/memories/MemoryForm";
import { createClient } from "@/lib/supabase/server";
import type { DatabaseCategory } from "@/types/database";
import styles from "../../AdminMemories.module.css";

type EditMemoryPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type MemoryRow = {
  id: string;
  title: string;
  slug: string;
  category_id: string | null;
  excerpt: string;
  content: string;
  icon: string;
  year: number | null;
  cover_image_url: string | null;
  status: "draft" | "published" | "archived";
};

type FactRow = {
  content: string;
  sort_order: number;
};

type TagRelationRow = {
  tag:
    | {
        name: string;
      }
    | {
        name: string;
      }[]
    | null;
};

export const metadata: Metadata = {
  title: "Edytuj wspomnienie",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

function getTagName(
  relation: TagRelationRow,
): string | null {
  if (!relation.tag) {
    return null;
  }

  if (Array.isArray(relation.tag)) {
    return relation.tag[0]?.name ?? null;
  }

  return relation.tag.name;
}

export default async function EditMemoryPage({
  params,
}: EditMemoryPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    memoryResult,
    categoriesResult,
    factsResult,
    tagsResult,
  ] = await Promise.all([
    supabase
      .from("memories")
      .select(`
        id,
        title,
        slug,
        category_id,
        excerpt,
        content,
        icon,
        year,
        cover_image_url,
        status
      `)
      .eq("id", id)
      .maybeSingle(),

    supabase
      .from("categories")
      .select(
        "id, name, slug, icon, description, is_active, sort_order, created_at, updated_at",
      )
      .order("sort_order", {
        ascending: true,
      }),

    supabase
      .from("memory_facts")
      .select("content, sort_order")
      .eq("memory_id", id)
      .order("sort_order", {
        ascending: true,
      }),

    supabase
      .from("memory_tags")
      .select(`
        tag:tags (
          name
        )
      `)
      .eq("memory_id", id),
  ]);

  if (
    memoryResult.error ||
    !memoryResult.data
  ) {
    notFound();
  }

  const memory =
    memoryResult.data as MemoryRow;

  const categories =
    (categoriesResult.data ?? []) as DatabaseCategory[];

  const facts =
    (factsResult.data ?? []) as FactRow[];

  const tagRelations =
    (tagsResult.data ??
      []) as unknown as TagRelationRow[];

  const tags = tagRelations
    .map(getTagName)
    .filter(
      (tag): tag is string =>
        typeof tag === "string" &&
        tag.length > 0,
    );

  const initialValues: MemoryFormValues = {
    title: memory.title,
    slug: memory.slug,
    categoryId: memory.category_id ?? "",
    excerpt: memory.excerpt,
    content: memory.content,
    icon: memory.icon,
    year: memory.year,
    coverImageUrl: memory.cover_image_url,
    status: memory.status,
    facts: facts.map(
      (fact) => fact.content,
    ),
    tags,
  };

  const updateAction = updateMemory.bind(
    null,
    memory.id,
  );

  return (
    <main>
      <div className={styles.breadcrumbs}>
        <a href="/admin">
          Panel administratora
        </a>

        <span>›</span>

        <a href="/admin/wspomnienia">
          Wspomnienia
        </a>

        <span>›</span>
        <strong>{memory.title}</strong>
      </div>

      <header className={styles.pageHeader}>
        <div>
          <p>&gt; EDYCJA PLIKU</p>
          <h1>Edytuj wspomnienie</h1>

          <span>
            Zmieniasz wpis „{memory.title}”.
          </span>
        </div>

        <div>
          <a
            className="retro-button retro-button--primary"
            href={`/admin/podglad/wspomnienia/${memory.id}`}
            target="_blank"
          >
            👁️ Podgląd wpisu
          </a>

          {memory.status === "published" ? (
            <a
              className="retro-button"
              href={`/wspomnienia/${memory.slug}`}
              target="_blank"
            >
              🌐 Strona publiczna
            </a>
          ) : null}

          <a
            className="retro-button"
            href="/admin/wspomnienia"
          >
            ◀ Powrót do listy
          </a>
        </div>
      </header>

      {categoriesResult.error ? (
        <div className={styles.messageError}>
          Nie udało się pobrać kategorii:{" "}
          {categoriesResult.error.message}
        </div>
      ) : null}

      <MemoryForm
        action={updateAction}
        cancelHref="/admin/wspomnienia"
        categories={categories}
        initialValues={initialValues}
        submitLabel="Zapisz zmiany"
      />
    </main>
  );
}