import type { ReactNode } from "react";
import { logoutAdmin } from "@/actions/auth";
import styles from "./AdminShell.module.css";

type AdminShellProps = {
  adminEmail: string;
  children: ReactNode;
};

const navigationItems = [
  {
    label: "Pulpit",
    href: "/admin",
    icon: "🏠",
  },
  {
    label: "Wspomnienia",
    href: "/admin/wspomnienia",
    icon: "💾",
  },
  {
    label: "Dodaj wspomnienie",
    href: "/admin/wspomnienia/nowe",
    icon: "📝",
  },
  {
    label: "Zgłoszenia",
    href: "/admin/zgloszenia",
    icon: "📨",
  },
  {
    label: "Kategorie",
    href: "/admin/kategorie",
    icon: "📁",
  },
  {
    label: "Tagi",
    href: "/admin/tagi",
    icon: "🏷️",
  },
  {
    label: "Ustawienia",
    href: "/admin/ustawienia",
    icon: "⚙️",
  },
  {
    label: "Strona publiczna",
    href: "/",
    icon: "🌐",
  },
];

export function AdminShell({
  adminEmail,
  children,
}: AdminShellProps) {
  return (
    <div className={styles.desktop}>
      <header className={styles.header}>
        <div className={styles.titleBar}>
          <div className={styles.brand}>
            <span aria-hidden="true">🖥️</span>

            <span>
              CzyPamiętaszTo.pl — Panel administratora
            </span>
          </div>

          <div
            className={styles.windowControls}
            aria-hidden="true"
          >
            <span>_</span>
            <span>□</span>
            <span>×</span>
          </div>
        </div>

        <div className={styles.menuBar}>
          <span>
            <u>P</u>lik
          </span>

          <span>
            <u>E</u>dycja
          </span>

          <span>
            <u>W</u>idok
          </span>

          <span>
            <u>N</u>arzędzia
          </span>

          <span>
            <u>P</u>omoc
          </span>
        </div>

        <div className={styles.toolbar}>
          <a href="/admin">
            <span aria-hidden="true">🏠</span>
            Pulpit
          </a>

          <a href="/admin/wspomnienia/nowe">
            <span aria-hidden="true">📝</span>
            Nowy wpis
          </a>

          <a href="/admin/zgloszenia">
            <span aria-hidden="true">📨</span>
            Zgłoszenia
          </a>

          <a href="/admin/ustawienia">
            <span aria-hidden="true">⚙️</span>
            Ustawienia
          </a>

          <a href="/">
            <span aria-hidden="true">🌐</span>
            Zobacz stronę
          </a>
        </div>
      </header>

      <div className={styles.workspace}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <span aria-hidden="true">💿</span>

            <div>
              <strong>Administrator</strong>
              <small>{adminEmail}</small>
            </div>
          </div>

          <nav
            className={styles.navigation}
            aria-label="Panel administratora"
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

          <form
            action={logoutAdmin}
            className={styles.logout}
          >
            <button type="submit">
              <span aria-hidden="true">🚪</span>
              Wyloguj się
            </button>
          </form>
        </aside>

        <div className={styles.content}>
          {children}
        </div>
      </div>

      <footer className={styles.statusBar}>
        <span>Gotowe</span>

        <span>
          Zalogowano jako: {adminEmail}
        </span>

        <span>
          🔒 Połączenie zabezpieczone
        </span>
      </footer>
    </div>
  );
}