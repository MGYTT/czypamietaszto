import { RetroWindow } from "@/components/retro/RetroWindow";
import { getSiteSettings } from "@/lib/site-settings";
import styles from "./HeroSection.module.css";

export async function HeroSection() {
  const settings = await getSiteSettings();

  return (
    <section className={styles.section}>
      <RetroWindow
        title={`Internet Explorer — ${settings.siteName}`}
        icon="🌐"
        contentClassName={styles.windowContent}
      >
        <div className={styles.browserToolbar}>
          <a
            aria-label="Wróć do poprzedniej strony"
            href="/"
          >
            ◀ Wstecz
          </a>

          <a
            aria-label="Przejdź do wspomnień"
            href="/#wspomnienia"
          >
            Dalej ▶
          </a>

          <a
            aria-label="Odśwież stronę"
            href="/"
          >
            🔄
          </a>

          <a
            aria-label="Strona główna"
            href="/"
          >
            🏠
          </a>
        </div>

        <div className={styles.addressBar}>
          <span>Adres:</span>

          <div>
            https://www.czypamietaszto.pl/start
          </div>

          <a href="/">
            Przejdź
          </a>
        </div>

        <div className={styles.page}>
          <div className={styles.content}>
            <p className={styles.eyebrow}>
              &gt;&gt;&gt;{" "}
              {settings.heroEyebrow.toUpperCase()}{" "}
              &lt;&lt;&lt;
            </p>

            <h1>
              {settings.heroTitle}{" "}
              <span>
                {settings.heroHighlight}
              </span>
            </h1>

            <p className={styles.description}>
              {settings.heroDescription}
            </p>

            <div className={styles.actions}>
              <a
                className="retro-button retro-button--primary"
                href="#wspomnienia"
              >
                💾 Otwórz wspomnienia
              </a>

              <a
                className="retro-button"
                href="#kategorie"
              >
                📁 Przeglądaj kategorie
              </a>

              <a
                className="retro-button"
                href="/losuj"
              >
                🎲 Losuj wspomnienie
              </a>
            </div>

            <p className={styles.compatibility}>
              ★ Strona zoptymalizowana dla wspomnień
              z lat 1995–2015 ★
            </p>
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.sidebarTitle}>
              SZYBKIE MENU
            </div>

            <div
              className={styles.memoryIcon}
              aria-hidden="true"
            >
              💾
            </div>

            <h2>Archiwum nostalgii</h2>

            <p>
              Gry, muzyka, portale, słodycze
              i technologia sprzed lat.
            </p>

            <a href="/losuj">
              [WYLOSUJ WSPOMNIENIE]
            </a>
          </aside>
        </div>

        <div className={styles.statusBar}>
          <span>Gotowe</span>
          <span>🌐 Internet</span>
        </div>
      </RetroWindow>
    </section>
  );
}