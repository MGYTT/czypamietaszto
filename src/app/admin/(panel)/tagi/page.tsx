import type { Metadata } from "next";
import { deleteTag } from "@/actions/tags";
import { createClient } from "@/lib/supabase/server";
import styles from "./AdminTags.module.css";

export const metadata: Metadata = {
  title: "Zarządzanie tagami",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

type TagsPageProps = {
  searchParams: Promise<{
    created?: string;
    updated?: string;
    deleted?: string;
    error?: string;
  }>;
};

type TagRow = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

type TagRelationRow = {
  tag_id: string;
};

const errorMessages: Record<string, string> = {
  "missing-id": "Nie podano identyfikatora tagu.",
  "delete-failed": "Nie udało się usunąć tagu.",
};

export default async function TagsAdminPage({
  searchParams,
}: TagsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const [tagsResult, relationsResult] =
    await Promise.all([
      supabase
        .from("tags")
        .select("id, name, slug, created_at")
        .order("name", {
          ascending: true,
        }),

      supabase
        .from("memory_tags")
        .select("tag_id"),
    ]);

  const tags = (tagsResult.data ?? []) as TagRow[];

  const relations =
    (relationsResult.data ?? []) as TagRelationRow[];

  const usageCounts = new Map<string, number>();

  for (const relation of relations) {
    usageCounts.set(
      relation.tag_id,
      (usageCounts.get(relation.tag_id) ?? 0) + 1,
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
        <strong>Tagi</strong>
      </div>

      <header className={styles.pageHeader}>
        <div>
          <p>&gt; MENEDŻER ETYKIET</p>
          <h1>Tagi</h1>

          <span>
            Zarządzaj oznaczeniami przypisywanymi do
            wspomnień.
          </span>
        </div>

        <a
          className="retro-button retro-button--primary"
          href="/admin/tagi/nowy"
        >
          🏷️ Dodaj tag
        </a>
      </header>

      {params.created === "1" ? (
        <div className={styles.messageSuccess}>
          ✅ Tag został utworzony.
        </div>
      ) : null}

      {params.updated === "1" ? (
        <div className={styles.messageSuccess}>
          ✅ Tag został zaktualizowany.
        </div>
      ) : null}

      {params.deleted === "1" ? (
        <div className={styles.messageSuccess}>
          ✅ Tag został usunięty.
        </div>
      ) : null}

      {errorMessage ? (
        <div className={styles.messageError}>
          ⚠️ {errorMessage}
        </div>
      ) : null}

      <section className={styles.window}>
        <div className={styles.titleBar}>
          <span>🏷️ C:\Tagi</span>
          <span aria-hidden="true">×</span>
        </div>

        {tagsResult.error ? (
          <div className={styles.messageError}>
            Nie udało się pobrać tagów:{" "}
            {tagsResult.error.message}
          </div>
        ) : tags.length > 0 ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nazwa tagu</th>
                  <th>Slug</th>
                  <th>Przypisane wspomnienia</th>
                  <th>Data utworzenia</th>
                  <th>Operacje</th>
                </tr>
              </thead>

              <tbody>
                {tags.map((tag) => {
                  const usageCount =
                    usageCounts.get(tag.id) ?? 0;

                  return (
                    <tr key={tag.id}>
                      <td>
                        <span className={styles.tag}>
                          #{tag.name}
                        </span>
                      </td>

                      <td>
                        <code>{tag.slug}</code>
                      </td>

                      <td>{usageCount}</td>

                      <td>
                        {new Intl.DateTimeFormat("pl-PL", {
                          dateStyle: "medium",
                        }).format(new Date(tag.created_at))}
                      </td>

                      <td>
                        <div className={styles.actions}>
                          <a
                            href={`/admin/tagi/${tag.id}/edytuj`}
                            title="Edytuj tag"
                          >
                            ✏️
                          </a>

                          <form
                            action={deleteTag.bind(
                              null,
                              tag.id,
                            )}
                          >
                            <button
                              title="Usuń tag"
                              type="submit"
                            >
                              🗑️
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.empty}>
            <span aria-hidden="true">🏷️</span>
            <strong>Brak tagów</strong>

            <p>
              Tagi możesz dodać ręcznie lub podczas tworzenia
              wspomnienia.
            </p>

            <a
              className="retro-button"
              href="/admin/tagi/nowy"
            >
              Dodaj pierwszy tag
            </a>
          </div>
        )}

        <div className={styles.statusBar}>
          <span>{tags.length} obiektów</span>
          <span>Typ: etykiety wspomnień</span>
        </div>
      </section>
    </main>
  );
}