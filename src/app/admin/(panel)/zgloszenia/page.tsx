import type { Metadata } from "next";
import {
  changeSuggestionStatus,
  createDraftFromSuggestion,
  deleteSuggestion,
} from "@/actions/admin-suggestions";
import { createClient } from "@/lib/supabase/server";
import styles from "./AdminSuggestions.module.css";

export const metadata: Metadata = {
  title: "Zgłoszenia użytkowników",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

type SuggestionsPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    updated?: string;
    deleted?: string;
    statusChanged?: string;
    error?: string;
  }>;
};

type SuggestionRow = {
  id: string;
  title: string;
  approximate_year: number | null;
  description: string;
  submitter_name: string | null;
  submitter_email: string | null;
  source_url: string | null;
  status: "pending" | "accepted" | "rejected";
  created_memory_id: string | null;
  created_at: string;
  category:
    | {
        name: string;
        icon: string;
      }
    | {
        name: string;
        icon: string;
      }[]
    | null;
};

const statusLabels = {
  pending: "Oczekujące",
  accepted: "Zaakceptowane",
  rejected: "Odrzucone",
};

const statusIcons = {
  pending: "🕒",
  accepted: "✅",
  rejected: "❌",
};

const errorMessages: Record<string, string> = {
  "invalid-status":
    "Wybrano nieprawidłowy status.",
  "status-failed":
    "Nie udało się zmienić statusu.",
  "not-found":
    "Nie znaleziono zgłoszenia.",
  "draft-failed":
    "Nie udało się utworzyć szkicu.",
  "relation-failed":
    "Nie udało się połączyć szkicu ze zgłoszeniem.",
  "delete-failed":
    "Nie udało się usunąć zgłoszenia.",
};

function getCategory(
  suggestion: SuggestionRow,
) {
  if (Array.isArray(suggestion.category)) {
    return suggestion.category[0] ?? null;
  }

  return suggestion.category;
}

export default async function SuggestionsPage({
  searchParams,
}: SuggestionsPageProps) {
  const params = await searchParams;

  const query = params.q?.trim() ?? "";

  const selectedStatus =
    params.status === "accepted" ||
    params.status === "rejected"
      ? params.status
      : params.status === "all"
        ? "all"
        : "pending";

  const supabase = await createClient();

  let suggestionsQuery = supabase
    .from("suggestions")
    .select(`
      id,
      title,
      approximate_year,
      description,
      submitter_name,
      submitter_email,
      source_url,
      status,
      created_memory_id,
      created_at,
      category:categories (
        name,
        icon
      )
    `)
    .order("created_at", {
      ascending: false,
    });

  if (selectedStatus !== "all") {
    suggestionsQuery =
      suggestionsQuery.eq(
        "status",
        selectedStatus,
      );
  }

  if (query) {
    suggestionsQuery =
      suggestionsQuery.ilike(
        "title",
        `%${query}%`,
      );
  }

  const {
    data,
    error,
  } = await suggestionsQuery;

  const suggestions =
    (data ?? []) as unknown as SuggestionRow[];

  const errorMessage = params.error
    ? errorMessages[params.error] ??
      "Wystąpił nieoczekiwany błąd."
    : null;

  return (
    <main>
      <div className={styles.breadcrumbs}>
        <a href="/admin">
          Panel administratora
        </a>

        <span>›</span>
        <strong>Zgłoszenia</strong>
      </div>

      <header className={styles.pageHeader}>
        <div>
          <p>&gt; SKRZYNKA ODBIORCZA</p>
          <h1>Zgłoszenia użytkowników</h1>

          <span>
            Sprawdzaj, poprawiaj i zamieniaj
            propozycje w szkice wspomnień.
          </span>
        </div>

        <a
          className="retro-button"
          href="/zaproponuj"
          target="_blank"
        >
          🌐 Otwórz formularz publiczny
        </a>
      </header>

      {params.updated === "1" ? (
        <div className={styles.success}>
          ✅ Zgłoszenie zostało zaktualizowane.
        </div>
      ) : null}

      {params.deleted === "1" ? (
        <div className={styles.success}>
          ✅ Zgłoszenie zostało usunięte.
        </div>
      ) : null}

      {params.statusChanged ? (
        <div className={styles.success}>
          ✅ Status zgłoszenia został zmieniony.
        </div>
      ) : null}

      {errorMessage ? (
        <div className={styles.error}>
          ⚠️ {errorMessage}
        </div>
      ) : null}

      <section className={styles.window}>
        <div className={styles.titleBar}>
          <span>
            🔍 Wyszukiwanie i filtry
          </span>

          <span aria-hidden="true">×</span>
        </div>

        <form className={styles.filters}>
          <div>
            <label htmlFor="q">
              Szukane zgłoszenie
            </label>

            <input
              defaultValue={query}
              id="q"
              name="q"
              placeholder="Wpisz nazwę..."
              type="search"
            />
          </div>

          <div>
            <label htmlFor="status">
              Status
            </label>

            <select
              defaultValue={selectedStatus}
              id="status"
              name="status"
            >
              <option value="pending">
                Oczekujące
              </option>

              <option value="accepted">
                Zaakceptowane
              </option>

              <option value="rejected">
                Odrzucone
              </option>

              <option value="all">
                Wszystkie
              </option>
            </select>
          </div>

          <button
            className="retro-button"
            type="submit"
          >
            Szukaj
          </button>

          <a
            className="retro-button"
            href="/admin/zgloszenia"
          >
            Wyczyść
          </a>
        </form>
      </section>

      <section className={styles.window}>
        <div className={styles.titleBar}>
          <span>
            📨 Odebrane zgłoszenia
          </span>

          <span aria-hidden="true">×</span>
        </div>

        {error ? (
          <div className={styles.error}>
            Nie udało się pobrać zgłoszeń:{" "}
            {error.message}
          </div>
        ) : suggestions.length > 0 ? (
          <div className={styles.list}>
            {suggestions.map(
              (suggestion) => {
                const category =
                  getCategory(suggestion);

                return (
                  <article
                    className={styles.suggestion}
                    key={suggestion.id}
                  >
                    <div
                      className={
                        styles.suggestionHeader
                      }
                    >
                      <div
                        className={
                          styles.suggestionIcon
                        }
                        aria-hidden="true"
                      >
                        {category?.icon ?? "💡"}
                      </div>

                      <div
                        className={
                          styles.suggestionTitle
                        }
                      >
                        <p>
                          {category?.name ??
                            "Bez kategorii"}
                        </p>

                        <h2>
                          {suggestion.title}
                        </h2>

                        <small>
                          Otrzymano:{" "}
                          {new Intl.DateTimeFormat(
                            "pl-PL",
                            {
                              dateStyle:
                                "medium",
                              timeStyle:
                                "short",
                            },
                          ).format(
                            new Date(
                              suggestion.created_at,
                            ),
                          )}
                        </small>
                      </div>

                      <span
                        className={`${styles.status} ${
                          styles[
                            `status_${suggestion.status}`
                          ]
                        }`}
                      >
                        {
                          statusIcons[
                            suggestion.status
                          ]
                        }{" "}
                        {
                          statusLabels[
                            suggestion.status
                          ]
                        }
                      </span>
                    </div>

                    <p
                      className={
                        styles.description
                      }
                    >
                      {suggestion.description}
                    </p>

                    <div
                      className={
                        styles.metadata
                      }
                    >
                      <span>
                        📅 Rok:{" "}
                        {suggestion.approximate_year ??
                          "nie podano"}
                      </span>

                      <span>
                        👤 Autor:{" "}
                        {suggestion.submitter_name ??
                          "anonimowy"}
                      </span>

                      <span>
                        ✉️ E-mail:{" "}
                        {suggestion.submitter_email ??
                          "nie podano"}
                      </span>

                      {suggestion.source_url ? (
                        <a
                          href={
                            suggestion.source_url
                          }
                          rel="noreferrer"
                          target="_blank"
                        >
                          🔗 Link pomocniczy
                        </a>
                      ) : null}
                    </div>

                    <div className={styles.actions}>
                      <a
                        className="retro-button retro-button--primary"
                        href={`/admin/zgloszenia/${suggestion.id}/edytuj`}
                      >
                        ✏️ Edytuj
                      </a>

                      {suggestion.created_memory_id ? (
                        <a
                          className="retro-button"
                          href={`/admin/wspomnienia/${suggestion.created_memory_id}/edytuj`}
                        >
                          💾 Otwórz szkic
                        </a>
                      ) : (
                        <form
                          action={createDraftFromSuggestion.bind(
                            null,
                            suggestion.id,
                          )}
                        >
                          <button
                            className="retro-button"
                            type="submit"
                          >
                            💾 Utwórz szkic
                          </button>
                        </form>
                      )}

                      {suggestion.status !==
                      "accepted" ? (
                        <form
                          action={changeSuggestionStatus.bind(
                            null,
                            suggestion.id,
                            "accepted",
                          )}
                        >
                          <button
                            className="retro-button"
                            type="submit"
                          >
                            ✅ Akceptuj
                          </button>
                        </form>
                      ) : null}

                      {suggestion.status !==
                      "rejected" ? (
                        <form
                          action={changeSuggestionStatus.bind(
                            null,
                            suggestion.id,
                            "rejected",
                          )}
                        >
                          <button
                            className="retro-button"
                            type="submit"
                          >
                            ❌ Odrzuć
                          </button>
                        </form>
                      ) : null}

                      <form
                        action={deleteSuggestion.bind(
                          null,
                          suggestion.id,
                        )}
                      >
                        <button
                          className="retro-button"
                          type="submit"
                        >
                          🗑️ Usuń
                        </button>
                      </form>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        ) : (
          <div className={styles.empty}>
            <span aria-hidden="true">📭</span>

            <strong>
              Brak zgłoszeń
            </strong>

            <p>
              Nie znaleziono zgłoszeń pasujących
              do wybranych filtrów.
            </p>
          </div>
        )}

        <div className={styles.statusBar}>
          <span>
            {suggestions.length} obiektów
          </span>

          <span>
            Folder: {selectedStatus}
          </span>
        </div>
      </section>
    </main>
  );
}