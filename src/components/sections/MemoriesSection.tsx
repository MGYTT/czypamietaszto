import { MemoryCard } from "@/components/memories/MemoryCard";
import { RetroWindow } from "@/components/retro/RetroWindow";
import { getPublishedMemories } from "@/lib/public-content";
import styles from "./MemoriesSection.module.css";

export async function MemoriesSection() {
  const memories = await getPublishedMemories(6);

  return (
    <section className={styles.section} id="wspomnienia">
      <RetroWindow
        title="Eksplorator Windows — Najnowsze wspomnienia"
        icon="💾"
      >
        <div className={styles.toolbar}>
          <a href="#start">Wstecz</a>
          <span aria-hidden="true">|</span>
          <a href="/szukaj">Wyszukaj</a>
          <span aria-hidden="true">|</span>
          <span>Widok: miniatury</span>
        </div>

        <div className={styles.addressBar}>
          <strong>Adres:</strong>

          <div>
            C:\Moje dokumenty\Wspomnienia\Najnowsze
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.heading}>
            <div>
              <p>&gt; OSTATNIO DODANE PLIKI</p>
              <h2>Najnowsze wspomnienia</h2>
            </div>

            <p>
              Kliknij wybrany plik, aby przypomnieć sobie
              jego historię i najważniejsze ciekawostki.
            </p>
          </div>

          {memories.length > 0 ? (
            <div className={styles.grid}>
              {memories.map((memory) => (
                <MemoryCard
                  memory={memory}
                  key={memory.slug}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <span aria-hidden="true">📂</span>
              <strong>Ten folder jest pusty.</strong>

              <p>
                Opublikuj pierwsze wspomnienie w panelu
                administratora.
              </p>

              <a
                className="retro-button"
                href="/admin/wspomnienia/nowe"
              >
                Otwórz panel administratora
              </a>
            </div>
          )}
        </div>

        <div className={styles.statusBar}>
          <span>{memories.length} obiektów</span>
          <span>Wybrano: 0 obiektów</span>
          <span>Mój komputer</span>
        </div>
      </RetroWindow>
    </section>
  );
}