import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MemoryCard } from "@/components/memories/MemoryCard";
import { RetroWindow } from "@/components/retro/RetroWindow";
import {
  getMemoryCatalog,
  type CatalogSort,
} from "@/lib/memory-catalog";
import { getPublicCategories } from "@/lib/public-content";
import styles from "./Catalog.module.css";

export const metadata: Metadata = {
  title: "Katalog wspomnień",
  description:
    "Przeglądaj gry, piosenki, słodycze, zabawki, portale i pozostałe wspomnienia z dzieciństwa.",
};

export const dynamic = "force-dynamic";

type CatalogPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    from?: string;
    to?: string;
    sort?: string;
    page?: string;
  }>;
};

function parseOptionalYear(
  value: string | undefined,
): number | null {
  if (!value) {
    return null;
  }

  const parsedValue = Number.parseInt(
    value,
    10,
  );

  if (
    Number.isNaN(parsedValue) ||
    parsedValue < 1900 ||
    parsedValue > 2100
  ) {
    return null;
  }

  return parsedValue;
}

function parsePage(
  value: string | undefined,
): number {
  if (!value) {
    return 1;
  }

  const parsedValue = Number.parseInt(
    value,
    10,
  );

  if (
    Number.isNaN(parsedValue) ||
    parsedValue < 1
  ) {
    return 1;
  }

  return parsedValue;
}

function parseSort(
  value: string | undefined,
): CatalogSort {
  if (
    value === "year-desc" ||
    value === "year-asc" ||
    value === "title-asc"
  ) {
    return value;
  }

  return "newest";
}

function createPageUrl(
  page: number,
  values: {
    query: string;
    category: string;
    fromYear: number | null;
    toYear: number | null;
    sort: CatalogSort;
  },
): string {
  const params = new URLSearchParams();

  if (values.query) {
    params.set("q", values.query);
  }

  if (values.category) {
    params.set(
      "category",
      values.category,
    );
  }

  if (values.fromYear !== null) {
    params.set(
      "from",
      String(values.fromYear),
    );
  }

  if (values.toYear !== null) {
    params.set(
      "to",
      String(values.toYear),
    );
  }

  if (values.sort !== "newest") {
    params.set("sort", values.sort);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const queryString = params.toString();

  return queryString
    ? `/wspomnienia?${queryString}`
    : "/wspomnienia";
}

export default async function MemoriesCatalogPage({
  searchParams,
}: CatalogPageProps) {
  const params = await searchParams;

  const query = params.q?.trim() ?? "";
  const category =
    params.category?.trim() ?? "";
  const fromYear = parseOptionalYear(
    params.from,
  );
  const toYear = parseOptionalYear(
    params.to,
  );
  const sort = parseSort(params.sort);
  const page = parsePage(params.page);

  const [catalog, categories] =
    await Promise.all([
      getMemoryCatalog({
        query,
        category,
        fromYear,
        toYear,
        sort,
        page,
        pageSize: 9,
      }),

      getPublicCategories(),
    ]);

  const filterValues = {
    query,
    category,
    fromYear,
    toYear,
    sort,
  };

  const hasActiveFilters =
    query.length > 0 ||
    category.length > 0 ||
    fromYear !== null ||
    toYear !== null ||
    sort !== "newest";

  return (
    <div className="site-shell">
      <SiteHeader />

      <main className={styles.main}>
        <div className={styles.breadcrumbs}>
          <a href="/">Strona główna</a>
          <span>›</span>
          <strong>Katalog wspomnień</strong>
        </div>

        <RetroWindow
          title="Eksplorator Windows — Wszystkie wspomnienia"
          icon="💾"
        >
          <div className={styles.toolbar}>
            <a href="/">◀ Wstecz</a>
            <span aria-hidden="true">|</span>
            <a href="/szukaj">
              🔍 Wyszukiwarka
            </a>
            <a href="/losuj">
              🎲 Losuj
            </a>
            <span aria-hidden="true">|</span>
            <span>Widok: miniatury</span>
          </div>

          <div className={styles.addressBar}>
            <strong>Adres:</strong>

            <div>
              C:\Moje dokumenty\Wspomnienia
            </div>
          </div>

          <div className={styles.layout}>
            <aside className={styles.sidebar}>
              <div className={styles.sidebarWindow}>
                <div className={styles.sidebarTitle}>
                  Wyszukiwanie
                </div>

                <form
                  action="/wspomnienia"
                  className={styles.filters}
                  method="get"
                >
                  <div className={styles.field}>
                    <label htmlFor="q">
                      Szukane hasło
                    </label>

                    <input
                      defaultValue={query}
                      id="q"
                      name="q"
                      placeholder="np. Gadu-Gadu"
                      type="search"
                    />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="category">
                      Kategoria
                    </label>

                    <select
                      defaultValue={category}
                      id="category"
                      name="category"
                    >
                      <option value="">
                        Wszystkie kategorie
                      </option>

                      {categories.map(
                        (categoryOption) => (
                          <option
                            key={
                              categoryOption.slug
                            }
                            value={
                              categoryOption.slug
                            }
                          >
                            {categoryOption.icon}{" "}
                            {categoryOption.name}
                          </option>
                        ),
                      )}
                    </select>
                  </div>

                  <div className={styles.yearFields}>
                    <div className={styles.field}>
                      <label htmlFor="from">
                        Rok od
                      </label>

                      <input
                        defaultValue={
                          fromYear ?? ""
                        }
                        id="from"
                        max={2100}
                        min={1900}
                        name="from"
                        placeholder="1995"
                        type="number"
                      />
                    </div>

                    <div className={styles.field}>
                      <label htmlFor="to">
                        Rok do
                      </label>

                      <input
                        defaultValue={
                          toYear ?? ""
                        }
                        id="to"
                        max={2100}
                        min={1900}
                        name="to"
                        placeholder="2015"
                        type="number"
                      />
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="sort">
                      Sortowanie
                    </label>

                    <select
                      defaultValue={sort}
                      id="sort"
                      name="sort"
                    >
                      <option value="newest">
                        Ostatnio dodane
                      </option>

                      <option value="year-desc">
                        Rok: od najnowszych
                      </option>

                      <option value="year-asc">
                        Rok: od najstarszych
                      </option>

                      <option value="title-asc">
                        Nazwa: A–Z
                      </option>
                    </select>
                  </div>

                  <button
                    className="retro-button retro-button--primary"
                    type="submit"
                  >
                    Zastosuj filtry
                  </button>

                  {hasActiveFilters ? (
                    <a
                      className="retro-button"
                      href="/wspomnienia"
                    >
                      Wyczyść
                    </a>
                  ) : null}
                </form>
              </div>

              <div className={styles.sidebarWindow}>
                <div className={styles.sidebarTitle}>
                  Informacje
                </div>

                <dl className={styles.information}>
                  <div>
                    <dt>Znaleziono:</dt>
                    <dd>
                      {catalog.totalItems}
                    </dd>
                  </div>

                  <div>
                    <dt>Strona:</dt>
                    <dd>
                      {catalog.currentPage} /{" "}
                      {catalog.totalPages}
                    </dd>
                  </div>

                  <div>
                    <dt>Na stronie:</dt>
                    <dd>
                      {catalog.memories.length}
                    </dd>
                  </div>
                </dl>
              </div>
            </aside>

            <section className={styles.content}>
              <header className={styles.heading}>
                <div>
                  <p>
                    &gt; KATALOG WSPOMNIEŃ
                  </p>

                  <h1>
                    Wszystkie wspomnienia
                  </h1>
                </div>

                <span>
                  {catalog.totalItems}{" "}
                  {catalog.totalItems === 1
                    ? "plik"
                    : "plików"}
                </span>
              </header>

              {catalog.memories.length > 0 ? (
                <>
                  <div className={styles.grid}>
                    {catalog.memories.map(
                      (memory) => (
                        <MemoryCard
                          memory={memory}
                          key={memory.slug}
                        />
                      ),
                    )}
                  </div>

                  {catalog.totalPages > 1 ? (
                    <nav
                      aria-label="Paginacja katalogu"
                      className={styles.pagination}
                    >
                      {catalog.currentPage > 1 ? (
                        <a
                          className="retro-button"
                          href={createPageUrl(
                            catalog.currentPage -
                              1,
                            filterValues,
                          )}
                        >
                          ◀ Poprzednia
                        </a>
                      ) : (
                        <span
                          className={`${styles.disabledButton} retro-button`}
                        >
                          ◀ Poprzednia
                        </span>
                      )}

                      <div
                        className={
                          styles.pageNumbers
                        }
                      >
                        {Array.from(
                          {
                            length:
                              catalog.totalPages,
                          },
                          (_, index) =>
                            index + 1,
                        ).map((pageNumber) => (
                          <a
                            aria-current={
                              pageNumber ===
                              catalog.currentPage
                                ? "page"
                                : undefined
                            }
                            className={
                              pageNumber ===
                              catalog.currentPage
                                ? styles.activePage
                                : ""
                            }
                            href={createPageUrl(
                              pageNumber,
                              filterValues,
                            )}
                            key={pageNumber}
                          >
                            {pageNumber}
                          </a>
                        ))}
                      </div>

                      {catalog.currentPage <
                      catalog.totalPages ? (
                        <a
                          className="retro-button"
                          href={createPageUrl(
                            catalog.currentPage +
                              1,
                            filterValues,
                          )}
                        >
                          Następna ▶
                        </a>
                      ) : (
                        <span
                          className={`${styles.disabledButton} retro-button`}
                        >
                          Następna ▶
                        </span>
                      )}
                    </nav>
                  ) : null}
                </>
              ) : (
                <div className={styles.empty}>
                  <span aria-hidden="true">
                    📂
                  </span>

                  <strong>
                    Nie znaleziono wspomnień
                  </strong>

                  <p>
                    Zmień filtry lub wyczyść
                    wyszukiwanie.
                  </p>

                  <a
                    className="retro-button"
                    href="/wspomnienia"
                  >
                    Wyczyść wszystkie filtry
                  </a>
                </div>
              )}
            </section>
          </div>

          <div className={styles.statusBar}>
            <span>
              {catalog.totalItems} obiektów
            </span>

            <span>
              Strona {catalog.currentPage} z{" "}
              {catalog.totalPages}
            </span>

            <span>Strefa: Internet</span>
          </div>
        </RetroWindow>
      </main>

      <SiteFooter />
    </div>
  );
}