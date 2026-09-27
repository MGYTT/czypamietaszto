import { RetroWindow } from "@/components/retro/RetroWindow";
import type { Memory } from "@/data/memories";
import styles from "./MemoryDetails.module.css";

type MemoryWithOptionalCover = Memory & {
  coverImageUrl?: string | null;
};

type MemoryDetailsProps = {
  memory: MemoryWithOptionalCover;
};

export function MemoryDetails({
  memory,
}: MemoryDetailsProps) {
  const currentYear = new Date().getFullYear();
  const yearsAgo = currentYear - memory.year;

  return (
    <main className={styles.main}>
      <div className={styles.breadcrumbs}>
        <a href="/">Strona główna</a>
        <span>›</span>

        <a href="/#wspomnienia">
          Wspomnienia
        </a>

        <span>›</span>
        <strong>{memory.title}</strong>
      </div>

      <RetroWindow
        title={`${memory.title} — Czy pamiętasz to?`}
        icon={memory.icon}
      >
        <div className={styles.toolbar}>
          <a href="/#wspomnienia">
            ◀ Wstecz
          </a>

          <a href={`/kategorie/${memory.categorySlug}`}>
            📁 {memory.categoryName}
          </a>

          <button type="button">
            ☆ Dodaj do ulubionych
          </button>

          <button type="button">
            🖨 Drukuj
          </button>
        </div>

        <article className={styles.article}>
          {memory.coverImageUrl ? (
            <div className={styles.cover}>
              <img
                alt={memory.title}
                src={memory.coverImageUrl}
              />

              <div className={styles.coverCaption}>
                <span>
                  {memory.icon} {memory.title}
                </span>

                <span>
                  Obraz wspomnienia
                </span>
              </div>
            </div>
          ) : null}

          <header className={styles.hero}>
            <div className={styles.iconBox}>
              <span aria-hidden="true">
                {memory.icon}
              </span>
            </div>

            <div className={styles.heroContent}>
              <p className={styles.category}>
                {memory.categoryName} / {memory.year}
              </p>

              <h1>{memory.title}</h1>

              <p className={styles.excerpt}>
                {memory.excerpt}
              </p>

              <div className={styles.age}>
                <strong>{yearsAgo}</strong>
                <span>lat od premiery</span>
              </div>
            </div>
          </header>

          <div className={styles.layout}>
            <div className={styles.mainContent}>
              <section>
                <div className={styles.sectionTitle}>
                  <span aria-hidden="true">📄</span>
                  <h2>Co to było?</h2>
                </div>

                {memory.description.length > 0 ? (
                  memory.description.map(
                    (paragraph, index) => (
                      <p key={`${index}-${paragraph}`}>
                        {paragraph}
                      </p>
                    ),
                  )
                ) : (
                  <p>
                    Opis tego wspomnienia zostanie dodany
                    wkrótce.
                  </p>
                )}
              </section>

              {memory.facts.length > 0 ? (
                <section>
                  <div className={styles.sectionTitle}>
                    <span aria-hidden="true">💡</span>
                    <h2>Czy wiesz, że...</h2>
                  </div>

                  <ul className={styles.facts}>
                    {memory.facts.map(
                      (fact, index) => (
                        <li key={`${index}-${fact}`}>
                          {fact}
                        </li>
                      ),
                    )}
                  </ul>
                </section>
              ) : null}
            </div>

            <aside className={styles.sidebar}>
              <div className={styles.infoBox}>
                <div className={styles.infoTitle}>
                  WŁAŚCIWOŚCI PLIKU
                </div>

                <dl>
                  <div>
                    <dt>Nazwa:</dt>
                    <dd>{memory.title}</dd>
                  </div>

                  <div>
                    <dt>Rok:</dt>
                    <dd>{memory.year}</dd>
                  </div>

                  <div>
                    <dt>Kategoria:</dt>
                    <dd>{memory.categoryName}</dd>
                  </div>

                  <div>
                    <dt>Typ:</dt>
                    <dd>Wspomnienie</dd>
                  </div>

                  <div>
                    <dt>Obraz:</dt>
                    <dd>
                      {memory.coverImageUrl
                        ? "Dostępny"
                        : "Brak"}
                    </dd>
                  </div>
                </dl>
              </div>

              {memory.tags.length > 0 ? (
                <div className={styles.tagsBox}>
                  <strong>TAGI:</strong>

                  <div>
                    {memory.tags.map((tag) => (
                      <span key={tag}>#{tag}</span>
                    ))}
                  </div>
                </div>
              ) : null}

              <a
                className={`retro-button ${styles.backButton}`}
                href="/#wspomnienia"
              >
                Zamknij i wróć
              </a>
            </aside>
          </div>
        </article>

        <div className={styles.statusBar}>
          <span>Gotowe</span>
          <span>
            Rozmiar wspomnienia: bezcenny
          </span>
        </div>
      </RetroWindow>
    </main>
  );
}