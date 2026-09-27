import { getSiteSettings } from "@/lib/site-settings";
import styles from "./SiteHeader.module.css";

const navigationItems = [
  {
    label: "Strona główna",
    href: "/#start",
    icon: "🏠",
  },
  {
    label: "Wspomnienia",
    href: "/wspomnienia",
    icon: "💾",
  },
  {
    label: "Kategorie",
    href: "/#kategorie",
    icon: "📁",
  },
  {
    label: "Wyszukaj",
    href: "/szukaj",
    icon: "🔍",
  },
  {
    label: "Losuj",
    href: "/losuj",
    icon: "🎲",
  },
  {
    label: "Zaproponuj",
    href: "/zaproponuj",
    icon: "💡",
  },
  {
    label: "O projekcie",
    href: "/#o-projekcie",
    icon: "❓",
  },
];

export async function SiteHeader() {
  const settings = await getSiteSettings();

  return (
    <header
      className={styles.header}
      id="start"
    >
      <div className={styles.top}>
        <a
          aria-label={`${settings.siteName} — strona główna`}
          className={styles.logo}
          href="/#start"
        >
          <span
            className={styles.logoIcon}
            aria-hidden="true"
          >
            💿
          </span>

          <span>{settings.siteName}</span>
        </a>

        <div className={styles.counter}>
          <span>LICZNIK ODWIEDZIN:</span>
          <strong>0001337</strong>
        </div>
      </div>

      <nav
        className={styles.navigation}
        aria-label="Główna nawigacja"
      >
        {navigationItems.map((item) => (
          <a
            href={item.href}
            key={item.href}
          >
            <span aria-hidden="true">
              {item.icon}
            </span>

            {item.label}
          </a>
        ))}
      </nav>

      <div className={styles.newsBar}>
        <strong>NOWOŚĆ:</strong>

        <div className={styles.newsViewport}>
          <p>
            {settings.announcement} ★
          </p>
        </div>
      </div>
    </header>
  );
}