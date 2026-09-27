import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { loginAdmin, type LoginErrorCode } from "@/actions/auth";
import { getCurrentAdmin } from "@/lib/supabase/admin";
import styles from "./Login.module.css";

export const metadata: Metadata = {
  title: "Logowanie administratora",
  robots: {
    index: false,
    follow: false,
  },
};

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

const errorMessages: Record<LoginErrorCode, string> = {
  "missing-fields": "Wpisz adres e-mail i hasło.",
  "invalid-credentials": "Nieprawidłowy adres e-mail lub hasło.",
  "not-admin": "To konto nie posiada uprawnień administratora.",
};

function getErrorMessage(error: string | undefined): string | null {
  if (!error) {
    return null;
  }

  if (error in errorMessages) {
    return errorMessages[error as LoginErrorCode];
  }

  return "Wystąpił nieoczekiwany błąd logowania.";
}

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const admin = await getCurrentAdmin();

  if (admin) {
    redirect("/admin");
  }

  const params = await searchParams;
  const errorMessage = getErrorMessage(params.error);

  return (
    <main className={styles.page}>
      <div className={styles.desktopIcon} aria-hidden="true">
        <span>🖥️</span>
        <small>Panel administratora</small>
      </div>

      <section className={styles.window}>
        <div className={styles.titleBar}>
          <div>
            <span aria-hidden="true">🔐</span>
            Logowanie administratora
          </div>

          <div className={styles.controls} aria-hidden="true">
            <span>_</span>
            <span>□</span>
            <span>×</span>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.brand}>
            <span className={styles.brandIcon} aria-hidden="true">
              💿
            </span>

            <div>
              <strong>
                CzyPamiętasz<span>To</span>.pl
              </strong>

              <small>System zarządzania wspomnieniami</small>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.introduction}>
            <span className={styles.keyIcon} aria-hidden="true">
              🔑
            </span>

            <div>
              <h1>Zaloguj się do panelu</h1>

              <p>
                Podaj dane konta administratora, aby zarządzać zawartością
                strony.
              </p>
            </div>
          </div>

          {errorMessage ? (
            <div className={styles.error} role="alert">
              <span aria-hidden="true">⚠️</span>
              <p>{errorMessage}</p>
            </div>
          ) : null}

          <form action={loginAdmin} className={styles.form}>
            <label htmlFor="email">Adres e-mail:</label>

            <input
              autoComplete="email"
              autoFocus
              id="email"
              name="email"
              placeholder="admin@example.com"
              required
              type="email"
            />

            <label htmlFor="password">Hasło:</label>

            <input
              autoComplete="current-password"
              id="password"
              name="password"
              required
              type="password"
            />

            <div className={styles.formActions}>
              <button className="retro-button retro-button--primary" type="submit">
                Zaloguj
              </button>

              <a className="retro-button" href="/">
                Anuluj
              </a>
            </div>
          </form>

          <div className={styles.security}>
            <span aria-hidden="true">🛡️</span>

            <p>
              Dostęp do panelu posiadają wyłącznie konta znajdujące się na
              liście administratorów.
            </p>
          </div>
        </div>

        <div className={styles.statusBar}>
          <span>Gotowe</span>
          <span>Bezpieczne połączenie</span>
        </div>
      </section>

      <p className={styles.footer}>
        CzyPamiętaszTo.pl Administration System
        <br />
        Wersja 1.0.0
      </p>
    </main>
  );
}