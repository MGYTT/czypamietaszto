import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { RetroWindow } from "@/components/retro/RetroWindow";
import { SuggestionForm } from "@/components/suggestions/SuggestionForm";
import { createClient } from "@/lib/supabase/server";
import styles from "./SuggestionPage.module.css";

export const metadata: Metadata = {
  title: "Zaproponuj wspomnienie",
  description:
    "Prześlij własną propozycję gry, piosenki, słodyczy, zabawki lub portalu, który warto przypomnieć.",
};

export const dynamic = "force-dynamic";

type CategoryRow = {
  id: string;
  name: string;
  icon: string;
};

export default async function SuggestionPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, icon")
    .eq("is_active", true)
    .order("sort_order", {
      ascending: true,
    });

  const categories =
    (data ?? []) as CategoryRow[];

  return (
    <div className="site-shell">
      <SiteHeader />

      <main className={styles.main}>
        <div className={styles.breadcrumbs}>
          <a href="/">Strona główna</a>
          <span>›</span>
          <strong>Zaproponuj wspomnienie</strong>
        </div>

        <RetroWindow
          title="Nowa wiadomość — Propozycja wspomnienia"
          icon="📨"
        >
          <div className={styles.toolbar}>
            <a href="/">◀ Wstecz</a>
            <span aria-hidden="true">|</span>
            <span>Nowa wiadomość</span>
          </div>

          <div className={styles.introduction}>
            <div className={styles.introductionIcon}>
              <span aria-hidden="true">💡</span>
            </div>

            <div>
              <p>
                &gt; POMÓŻ NAM ROZBUDOWAĆ ARCHIWUM
              </p>

              <h1>Zaproponuj wspomnienie</h1>

              <span>
                Pamiętasz grę, piosenkę, słodycz,
                zabawkę albo stronę internetową,
                której jeszcze u nas nie ma? Wyślij
                propozycję — nie musisz zakładać
                konta.
              </span>
            </div>
          </div>

          <div className={styles.rules}>
            <article>
              <span aria-hidden="true">1️⃣</span>
              <div>
                <strong>Wyślij propozycję</strong>
                <p>
                  Wypełnij formularz i opisz swoje
                  wspomnienie.
                </p>
              </div>
            </article>

            <article>
              <span aria-hidden="true">2️⃣</span>
              <div>
                <strong>Sprawdzimy zgłoszenie</strong>
                <p>
                  Każda propozycja przechodzi
                  moderację.
                </p>
              </div>
            </article>

            <article>
              <span aria-hidden="true">3️⃣</span>
              <div>
                <strong>Opublikujemy materiał</strong>
                <p>
                  Najciekawsze pomysły pojawią się
                  na stronie.
                </p>
              </div>
            </article>
          </div>

          <div className={styles.formArea}>
            {error ? (
              <div className={styles.error}>
                Nie udało się pobrać kategorii:{" "}
                {error.message}
              </div>
            ) : categories.length > 0 ? (
              <SuggestionForm
                categories={categories}
              />
            ) : (
              <div className={styles.error}>
                Formularz jest chwilowo niedostępny,
                ponieważ nie ma aktywnych kategorii.
              </div>
            )}
          </div>

          <div className={styles.statusBar}>
            <span>Gotowe</span>
            <span>Logowanie niewymagane</span>
            <span>Propozycje są moderowane</span>
          </div>
        </RetroWindow>
      </main>

      <SiteFooter />
    </div>
  );
}