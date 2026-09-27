import type { Metadata } from "next";
import { deleteMemory } from "@/actions/memories";
import { createClient } from "@/lib/supabase/server";
import styles from "./AdminMemories.module.css";

export const metadata: Metadata = {
  title: "Zarządzanie wspomnieniami",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

type MemoriesAdminPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    created?: string;
    updated?: string;
    deleted?: string;
    error?: string;
  }>;
};

type MemoryRow = {
  id: string;
  title: string;
  slug: string;
  icon: string;
  year: number | null;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
  category: {
    name: string;
    icon: string;
  } | null;
};

const statusLabels = {
  draft: "Szkic",
  published: "Opublikowany",
  archived: "Archiwum",
};

const statusIcons = {
  draft: "📝",
  published: "🌐",
  archived: "📦",
};

export default async function MemoriesAdminPage({
  searchParams,
}: MemoriesAdminPageProps) {
  const params = await searchParams;

  const search = params.q?.trim() ?? "";
  const selectedStatus = params.status ?? "all";

  const supabase = await createClient();

  let query = supabase
    .from("memories")
    .select(`
      id,
      title,
      slug,
      icon,
      year,
      status,
      created_at,
      updated_at,
      category:categories (
        name,
        icon
      )
    `)
    .order("created_at", {
      ascending: false,
    });

  if (
    selectedStatus === "draft" ||
    selectedStatus === "published" ||
    selectedStatus === "archived"
  ) {
    query = query.eq("status", selectedStatus);
  }

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  const { data, error } = await query;

  const memories = (data ?? []) as unknown as MemoryRow[];

  return (
    <main>
      <div className={styles.breadcrumbs}>
        <a href="/admin">Panel administratora</a>
        <span>›</span>
        <strong>Wspomnienia</strong>
      </div>

      <header className={styles.pageHeader}>
        <div>
          <p>&gt; MENEDŻER PLIKÓW</p>
          <h1>Wspomnienia</h1>

          <span>
            Dodawaj, wyszukuj, edytuj i publikuj treści strony.
          </span>
        </div>

        <a
          className="retro-button retro-button--primary"
          href="/admin/wspomnienia/nowe"
        >
          📝 Dodaj wspomnienie
        </a>
      </header>

      {params.created === "1" ? (
        <div className={styles.messageSuccess}>
          <span aria-hidden="true">✅</span>
          Wspomnienie zostało utworzone.
        </div>
      ) : null}

      {params.updated === "1" ? (
  <div className={styles.messageSuccess}>
    <span aria-hidden="true">✅</span>
    Wspomnienie zostało zaktualizowane.
  </div>
) : null}

      {params.deleted === "1" ? (
        <div className={styles.messageSuccess}>
          <span aria-hidden="true">✅</span>
          Wspomnienie zostało usunięte.
        </div>
      ) : null}

      {params.error ? (
        <div className={styles.messageError}>
          <span aria-hidden="true">⚠️</span>
          Nie udało się wykonać operacji.
        </div>
      ) : null}

      <section className={styles.window}>
        <div className={styles.windowTitle}>
          <span>🔍 Wyszukiwanie i filtry</span>
          <span aria-hidden="true">×</span>
        </div>

        <form className={styles.filters}>
          <div>
            <label htmlFor="q">Nazwa wspomnienia:</label>

            <input
              defaultValue={search}
              id="q"
              name="q"
              placeholder="Wpisz tytuł..."
              type="search"
            />
          </div>

          <div>
            <label htmlFor="status">Status:</label>

            <select
              defaultValue={selectedStatus}
              id="status"
              name="status"
            >
              <option value="all">Wszystkie</option>
              <option value="published">Opublikowane</option>
              <option value="draft">Szkice</option>
              <option value="archived">Archiwum</option>
            </select>
          </div>

          <button className="retro-button" type="submit">
            Szukaj
          </button>

          <a
            className="retro-button"
            href="/admin/wspomnienia"
          >
            Wyczyść
          </a>
        </form>
      </section>

      <section className={styles.window}>
        <div className={styles.windowTitle}>
          <span>💾 Lista wspomnień</span>
          <span aria-hidden="true">×</span>
        </div>

        {error ? (
          <div className={styles.messageError}>
            Nie udało się pobrać danych: {error.message}
          </div>
        ) : memories.length > 0 ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nazwa</th>
                  <th>Kategoria</th>
                  <th>Rok</th>
                  <th>Status</th>
                  <th>Aktualizacja</th>
                  <th>Operacje</th>
                </tr>
              </thead>

              <tbody>
                {memories.map((memory) => (
                  <tr key={memory.id}>
                    <td>
                      <div className={styles.memoryName}>
                        <span aria-hidden="true">
                          {memory.icon}
                        </span>

                        <div>
                          <strong>{memory.title}</strong>
                          <small>{memory.slug}.html</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      {memory.category ? (
                        <span>
                          {memory.category.icon}{" "}
                          {memory.category.name}
                        </span>
                      ) : (
                        <span className={styles.muted}>
                          Brak kategorii
                        </span>
                      )}
                    </td>

                    <td>{memory.year ?? "—"}</td>

                    <td>
                      <span
                        className={`${styles.status} ${
                          styles[
                            `status_${memory.status}`
                          ]
                        }`}
                      >
                        {statusIcons[memory.status]}{" "}
                        {statusLabels[memory.status]}
                      </span>
                    </td>

                    <td>
                      {new Intl.DateTimeFormat("pl-PL", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(new Date(memory.updated_at))}
                    </td>

                    <td>
                      <div className={styles.rowActions}>
                        <a
                          href={`/wspomnienia/${memory.slug}`}
                          title="Zobacz wpis"
                        >
                          👁️
                        </a>

                        <a
                          href={`/admin/wspomnienia/${memory.id}/edytuj`}
                          title="Edytuj wpis"
                        >
                          ✏️
                        </a>

                        <form
                          action={deleteMemory.bind(
                            null,
                            memory.id,
                          )}
                        >
                          <button
                            title="Usuń wpis"
                            type="submit"
                          >
                            🗑️
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.empty}>
            <span aria-hidden="true">📂</span>
            <strong>Ten folder jest pusty.</strong>
            <p>
              Nie znaleziono wspomnień spełniających wybrane
              kryteria.
            </p>

            <a
              className="retro-button"
              href="/admin/wspomnienia/nowe"
            >
              Dodaj pierwszy wpis
            </a>
          </div>
        )}

        <div className={styles.windowStatus}>
          <span>{memories.length} obiektów</span>
          <span>Wybrano: 0</span>
        </div>
      </section>
    </main>
  );
}