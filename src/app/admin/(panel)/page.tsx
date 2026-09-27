import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import styles from "./Dashboard.module.css";

export const metadata: Metadata = {
  title: "Panel administratora",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    memoriesResult,
    publishedResult,
    draftsResult,
    categoriesResult,
  ] = await Promise.all([
    supabase
      .from("memories")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("memories")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("status", "published"),

    supabase
      .from("memories")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("status", "draft"),

    supabase
      .from("categories")
      .select("*", {
        count: "exact",
        head: true,
      }),
  ]);

  const statistics = [
    {
      label: "Wszystkie wspomnienia",
      value: memoriesResult.count ?? 0,
      icon: "💾",
      href: "/admin/wspomnienia",
    },
    {
      label: "Opublikowane",
      value: publishedResult.count ?? 0,
      icon: "🌐",
      href: "/admin/wspomnienia?status=published",
    },
    {
      label: "Szkice",
      value: draftsResult.count ?? 0,
      icon: "📝",
      href: "/admin/wspomnienia?status=draft",
    },
    {
      label: "Kategorie",
      value: categoriesResult.count ?? 0,
      icon: "📁",
      href: "/admin/kategorie",
    },
  ];

  return (
    <main>
      <header className={styles.pageHeader}>
        <div>
          <p>&gt; PANEL STEROWANIA</p>
          <h1>Pulpit administratora</h1>
          <span>
            Zarządzaj wspomnieniami publikowanymi na stronie
            CzyPamiętaszTo.pl.
          </span>
        </div>

        <div className={styles.clock}>
          <span aria-hidden="true">🕒</span>

          <div>
            <strong>
              {new Intl.DateTimeFormat("pl-PL", {
                dateStyle: "long",
              }).format(new Date())}
            </strong>

            <small>System działa prawidłowo</small>
          </div>
        </div>
      </header>

      <section className={styles.statistics}>
        {statistics.map((statistic) => (
          <a
            className={styles.statistic}
            href={statistic.href}
            key={statistic.label}
          >
            <span className={styles.statisticIcon} aria-hidden="true">
              {statistic.icon}
            </span>

            <div>
              <strong>{statistic.value}</strong>
              <span>{statistic.label}</span>
            </div>
          </a>
        ))}
      </section>

      <div className={styles.dashboardGrid}>
        <section className={styles.window}>
          <div className={styles.windowTitle}>
            <span>📝 Szybkie działania</span>
            <span aria-hidden="true">×</span>
          </div>

          <div className={styles.windowContent}>
            <a href="/admin/wspomnienia/nowe">
              <span aria-hidden="true">📄</span>

              <div>
                <strong>Dodaj nowe wspomnienie</strong>
                <small>
                  Utwórz wpis, dodaj opis, ciekawostki i zdjęcie.
                </small>
              </div>
            </a>

            <a href="/admin/kategorie">
              <span aria-hidden="true">📁</span>

              <div>
                <strong>Zarządzaj kategoriami</strong>
                <small>
                  Dodawaj i zmieniaj kategorie widoczne na stronie.
                </small>
              </div>
            </a>

            <a href="/">
              <span aria-hidden="true">🌐</span>

              <div>
                <strong>Otwórz stronę publiczną</strong>
                <small>
                  Sprawdź, jak opublikowane treści widzą użytkownicy.
                </small>
              </div>
            </a>
          </div>
        </section>

        <section className={styles.window}>
          <div className={styles.windowTitle}>
            <span>ℹ️ Informacje o systemie</span>
            <span aria-hidden="true">×</span>
          </div>

          <div className={styles.systemInfo}>
            <dl>
              <div>
                <dt>System:</dt>
                <dd>CzyPamiętaszTo CMS</dd>
              </div>

              <div>
                <dt>Wersja:</dt>
                <dd>1.0.0</dd>
              </div>

              <div>
                <dt>Framework:</dt>
                <dd>Next.js</dd>
              </div>

              <div>
                <dt>Baza danych:</dt>
                <dd>Supabase PostgreSQL</dd>
              </div>

              <div>
                <dt>Status:</dt>
                <dd>
                  <span className={styles.online}>● Online</span>
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </div>
    </main>
  );
}