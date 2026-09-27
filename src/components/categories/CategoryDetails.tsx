import { MemoryCard } from "@/components/memories/MemoryCard";
import { RetroWindow } from "@/components/retro/RetroWindow";
import type { Category } from "@/data/categories";
import type { Memory } from "@/data/memories";
import styles from "./CategoryDetails.module.css";

type CategoryDetailsProps = {
  category: Category;
  memories: Memory[];
};

export function CategoryDetails({
  category,
  memories,
}: CategoryDetailsProps) {
  return (
    <main className={styles.main}>
      <div className={styles.breadcrumbs}>
        <a href="/">Strona główna</a>
        <span>›</span>
        <a href="/#kategorie">Kategorie</a>
        <span>›</span>
        <strong>{category.name}</strong>
      </div>

      <RetroWindow
        title={`Eksplorator Windows — ${category.name}`}
        icon={category.icon}
      >
        <div className={styles.toolbar}>
          <a href="/#kategorie">◀ Wstecz</a>

          <span aria-hidden="true">|</span>

          <button type="button">🔍 Wyszukaj</button>
          <button type="button">📁 Nowy folder</button>
          <button type="button">▦ Widok</button>
        </div>

        <div className={styles.addressBar}>
          <strong>Adres:</strong>

          <div>
            C:\Moje dokumenty\Wspomnienia\Kategorie\{category.name}
          </div>

          <a href={`/kategorie/${category.slug}`}>Przejdź</a>
        </div>

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarSection}>
              <div className={styles.sidebarTitle}>
                Zadania plików i folderów
              </div>

              <a href="/#kategorie">
                <span aria-hidden="true">📁</span>
                Pokaż wszystkie kategorie
              </a>

              <a href="/#wspomnienia">
                <span aria-hidden="true">💾</span>
                Najnowsze wspomnienia
              </a>

              <a href="/">
                <span aria-hidden="true">🏠</span>
                Strona główna
              </a>
            </div>

            <div className={styles.sidebarSection}>
              <div className={styles.sidebarTitle}>Szczegóły</div>

              <div className={styles.categoryDetails}>
                <span aria-hidden="true">{category.icon}</span>

                <div>
                  <strong>{category.name}</strong>
                  <small>Folder systemowy</small>
                </div>
              </div>

              <p>
                Znaleziono: <strong>{memories.length}</strong>
              </p>
            </div>
          </aside>

          <section className={styles.content}>
            <header className={styles.heading}>
              <div className={styles.categoryIcon} aria-hidden="true">
                {category.icon}
              </div>

              <div>
                <p>&gt; KATEGORIA WSPOMNIEŃ</p>
                <h1>{category.name}</h1>
                <span>{category.description}</span>
              </div>
            </header>

            {memories.length > 0 ? (
              <div className={styles.grid}>
                {memories.map((memory) => (
                  <MemoryCard memory={memory} key={memory.slug} />
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyDialog}>
                  <div className={styles.emptyTitle}>
                    <span>Informacja</span>
                    <span aria-hidden="true">×</span>
                  </div>

                  <div className={styles.emptyContent}>
                    <span className={styles.emptyIcon} aria-hidden="true">
                      ℹ️
                    </span>

                    <div>
                      <strong>Ten folder jest jeszcze pusty.</strong>

                      <p>
                        Wspomnienia z kategorii „{category.name}” zostaną
                        dodane wkrótce.
                      </p>
                    </div>
                  </div>

                  <div className={styles.emptyActions}>
                    <a className="retro-button" href="/#kategorie">
                      OK
                    </a>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        <div className={styles.statusBar}>
          <span>{memories.length} obiektów</span>
          <span>Wybrano: 0 obiektów</span>
          <span>Strefa: Mój komputer</span>
        </div>
      </RetroWindow>
    </main>
  );
}