import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MemoryCard } from "@/components/memories/MemoryCard";
import { RetroWindow } from "@/components/retro/RetroWindow";
import { searchPublishedMemories } from "@/lib/search-memories";
import styles from "./Search.module.css";

export const metadata: Metadata = {
  title: "Wyszukiwarka wspomnień",
  description:
    "Znajdź gry, piosenki, portale, słodycze i pozostałe wspomnienia z dzieciństwa.",
};

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  const results =
    query.length >= 2
      ? await searchPublishedMemories(query)
      : [];

  return (
    <div className="site-shell">
      <SiteHeader />

      <main className={styles.main}>
        <div className={styles.breadcrumbs}>
          <a href="/">Strona główna</a>
          <span>›</span>
          <strong>Wyszukiwarka</strong>
        </div>

        <RetroWindow
          title="Wyszukaj — CzyPamiętaszTo.pl"
          icon="🔍"
        >
          <div className={styles.toolbar}>
            <a href="/">◀ Wstecz</a>
            <span aria-hidden="true">|</span>
            <a href="/#wspomnienia">
              Wszystkie wspomnienia
            </a>
          </div>

          <div className={styles.searchArea}>
            <div className={styles.searchAssistant}>
              <span
                className={styles.assistantIcon}
                aria-hidden="true"
              >
                🐕
              </span>

              <div>
                <h1>Co chcesz sobie przypomnieć?</h1>

                <p>
                  Wpisz nazwę gry, piosenki, portalu,
                  słodyczy albo dowolne hasło związane
                  z dzieciństwem.
                </p>
              </div>
            </div>

            <form
              action="/szukaj"
              className={styles.searchForm}
              method="get"
            >
              <label htmlFor="q">
                Wyszukaj wspomnienie:
              </label>

              <div className={styles.searchControls}>
                <input
                  autoFocus
                  defaultValue={query}
                  id="q"
                  minLength={2}
                  name="q"
                  placeholder="np. Gadu-Gadu, gry.pl, MP3..."
                  required
                  type="search"
                />

                <button
                  className="retro-button retro-button--primary"
                  type="submit"
                >
                  🔍 Szukaj
                </button>
              </div>

              <small>
                Wpisz przynajmniej 2 znaki.
              </small>
            </form>
          </div>

          <div className={styles.results}>
            {!query ? (
              <div className={styles.initialState}>
                <span aria-hidden="true">🔎</span>

                <strong>
                  Wpisz szukane hasło
                </strong>

                <p>
                  Wyniki pojawią się w tym miejscu.
                </p>
              </div>
            ) : query.length < 2 ? (
              <div className={styles.message}>
                <span aria-hidden="true">⚠️</span>

                <div>
                  <strong>
                    Wpisane hasło jest za krótkie
                  </strong>

                  <p>
                    Wyszukiwanie wymaga przynajmniej
                    2 znaków.
                  </p>
                </div>
              </div>
            ) : results.length > 0 ? (
              <>
                <div className={styles.resultsHeader}>
                  <div>
                    <p>&gt; WYNIKI WYSZUKIWANIA</p>

                    <h2>
                      Znaleziono: {results.length}
                    </h2>
                  </div>

                  <span>
                    Hasło: „{query}”
                  </span>
                </div>

                <div className={styles.grid}>
                  {results.map((memory) => (
                    <MemoryCard
                      memory={memory}
                      key={memory.slug}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className={styles.noResults}>
                <span aria-hidden="true">📂</span>

                <strong>
                  Nie znaleziono wyników
                </strong>

                <p>
                  Nie znaleźliśmy wspomnienia pasującego
                  do hasła „{query}”.
                </p>

                <div>
                  <a
                    className="retro-button"
                    href="/szukaj"
                  >
                    Wyczyść wyszukiwanie
                  </a>

                  <a
                    className="retro-button"
                    href="/losuj"
                  >
                    🎲 Wylosuj wspomnienie
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className={styles.statusBar}>
            <span>
              {query.length >= 2
                ? `${results.length} wyników`
                : "Gotowe"}
            </span>

            <span>Strefa: Internet</span>
          </div>
        </RetroWindow>
      </main>

      <SiteFooter />
    </div>
  );
}