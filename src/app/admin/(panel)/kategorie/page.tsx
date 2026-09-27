import type { Metadata } from "next";
import { deleteCategory } from "@/actions/categories";
import { createClient } from "@/lib/supabase/server";
import styles from "./AdminCategories.module.css";

export const metadata: Metadata = {
  title: "Zarządzanie kategoriami",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

type CategoriesPageProps = {
  searchParams: Promise<{
    created?: string;
    updated?: string;
    deleted?: string;
    error?: string;
  }>;
};

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  is_active: boolean;
  sort_order: number;
  updated_at: string;
};

type MemoryCategoryRow = {
  category_id: string | null;
};

const errorMessages: Record<string, string> = {
  "missing-id": "Nie podano identyfikatora kategorii.",
  "count-failed":
    "Nie udało się sprawdzić zawartości kategorii.",
  "category-not-empty":
    "Nie można usunąć kategorii zawierającej wspomnienia.",
  "delete-failed": "Nie udało się usunąć kategorii.",
};

export default async function CategoriesAdminPage({
  searchParams,
}: CategoriesPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const [categoriesResult, memoriesResult] =
    await Promise.all([
      supabase
        .from("categories")
        .select(`
          id,
          name,
          slug,
          icon,
          description,
          is_active,
          sort_order,
          updated_at
        `)
        .order("sort_order", {
          ascending: true,
        })
        .order("name", {
          ascending: true,
        }),

      supabase
        .from("memories")
        .select("category_id"),
    ]);

  const categories =
    (categoriesResult.data ?? []) as CategoryRow[];

  const memories =
    (memoriesResult.data ?? []) as MemoryCategoryRow[];

  const memoryCounts = new Map<string, number>();

  for (const memory of memories) {
    if (!memory.category_id) {
      continue;
    }

    memoryCounts.set(
      memory.category_id,
      (memoryCounts.get(memory.category_id) ?? 0) + 1,
    );
  }

  const errorMessage = params.error
    ? errorMessages[params.error] ??
      "Wystąpił nieoczekiwany błąd."
    : null;

  return (
    <main>
      <div className={styles.breadcrumbs}>
        <a href="/admin">Panel administratora</a>
        <span>›</span>
        <strong>Kategorie</strong>
      </div>

      <header className={styles.pageHeader}>
        <div>
          <p>&gt; MENEDŻER FOLDERÓW</p>
          <h1>Kategorie</h1>

          <span>
            Zarządzaj folderami, w których grupowane są
            wspomnienia.
          </span>
        </div>

        <a
          className="retro-button retro-button--primary"
          href="/admin/kategorie/nowa"
        >
          📁 Dodaj kategorię
        </a>
      </header>

      {params.created === "1" ? (
        <div className={styles.messageSuccess}>
          ✅ Kategoria została utworzona.
        </div>
      ) : null}

      {params.updated === "1" ? (
        <div className={styles.messageSuccess}>
          ✅ Kategoria została zaktualizowana.
        </div>
      ) : null}

      {params.deleted === "1" ? (
        <div className={styles.messageSuccess}>
          ✅ Kategoria została usunięta.
        </div>
      ) : null}

      {errorMessage ? (
        <div className={styles.messageError}>
          ⚠️ {errorMessage}
        </div>
      ) : null}

      <section className={styles.window}>
        <div className={styles.titleBar}>
          <span>📁 C:\Kategorie</span>
          <span aria-hidden="true">×</span>
        </div>

        {categoriesResult.error ? (
          <div className={styles.messageError}>
            Nie udało się pobrać kategorii:{" "}
            {categoriesResult.error.message}
          </div>
        ) : categories.length > 0 ? (
          <div className={styles.grid}>
            {categories.map((category) => {
              const memoryCount =
                memoryCounts.get(category.id) ?? 0;

              return (
                <article
                  className={styles.category}
                  key={category.id}
                >
                  <div className={styles.categoryHeader}>
                    <span
                      className={styles.icon}
                      aria-hidden="true"
                    >
                      {category.icon}
                    </span>

                    <div>
                      <h2>{category.name}</h2>
                      <code>{category.slug}</code>
                    </div>
                  </div>

                  <p>{category.description}</p>

                  <dl>
                    <div>
                      <dt>Wspomnienia:</dt>
                      <dd>{memoryCount}</dd>
                    </div>

                    <div>
                      <dt>Kolejność:</dt>
                      <dd>{category.sort_order}</dd>
                    </div>

                    <div>
                      <dt>Status:</dt>
                      <dd>
                        <span
                          className={
                            category.is_active
                              ? styles.active
                              : styles.inactive
                          }
                        >
                          {category.is_active
                            ? "● Aktywna"
                            : "● Ukryta"}
                        </span>
                      </dd>
                    </div>
                  </dl>

                  <div className={styles.actions}>
                    {category.is_active ? (
                      <a
                        href={`/kategorie/${category.slug}`}
                        title="Zobacz kategorię"
                      >
                        👁️
                      </a>
                    ) : null}

                    <a
                      href={`/admin/kategorie/${category.id}/edytuj`}
                      title="Edytuj kategorię"
                    >
                      ✏️
                    </a>

                    <form
                      action={deleteCategory.bind(
                        null,
                        category.id,
                      )}
                    >
                      <button
                        disabled={memoryCount > 0}
                        title={
                          memoryCount > 0
                            ? "Najpierw przenieś lub usuń wspomnienia"
                            : "Usuń kategorię"
                        }
                        type="submit"
                      >
                        🗑️
                      </button>
                    </form>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className={styles.empty}>
            <span aria-hidden="true">📂</span>
            <strong>Brak kategorii</strong>

            <p>
              Utwórz pierwszą kategorię, aby grupować
              wspomnienia.
            </p>

            <a
              className="retro-button"
              href="/admin/kategorie/nowa"
            >
              Dodaj kategorię
            </a>
          </div>
        )}

        <div className={styles.statusBar}>
          <span>{categories.length} obiektów</span>
          <span>Widok: duże ikony</span>
        </div>
      </section>
    </main>
  );
}