import { getSiteSettings } from "@/lib/site-settings";
import styles from "./SiteFooter.module.css";

export async function SiteFooter() {
  const settings = await getSiteSettings();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <a
          className={styles.brand}
          href="/#start"
        >
          <span aria-hidden="true">💿</span>
          <strong>{settings.siteName}</strong>
        </a>

        <nav
          className={styles.links}
          aria-label="Nawigacja w stopce"
        >
          <a href="/wspomnienia">
            Wspomnienia
          </a>

          <a href="/#kategorie">
            Kategorie
          </a>

          <a href="/szukaj">
            Wyszukiwarka
          </a>

          <a href="/losuj">
            Losuj
          </a>

          <a href="/zaproponuj">
            Zaproponuj
          </a>

          <a href="/#o-projekcie">
            O projekcie
          </a>
        </nav>
      </div>

      <div className={styles.divider} />

      <div className={styles.bottom}>
        <p>
          © {currentYear} {settings.siteName}.{" "}
          {settings.footerText}
        </p>

        <div className={styles.socialLinks}>
          {settings.tiktokUrl ? (
            <a
              href={settings.tiktokUrl}
              rel="noreferrer"
              target="_blank"
            >
              🎵 TikTok
            </a>
          ) : null}

          {settings.contactEmail ? (
            <a
              href={`mailto:${settings.contactEmail}`}
            >
              ✉️ Kontakt
            </a>
          ) : null}
        </div>
      </div>
    </footer>
  );
}