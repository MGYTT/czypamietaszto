import type { Metadata } from "next";
import { createMemory } from "@/actions/memories";
import { MemoryForm } from "@/components/admin/memories/MemoryForm";
import { createClient } from "@/lib/supabase/server";
import type { DatabaseCategory } from "@/types/database";
import styles from "../AdminMemories.module.css";

export const metadata: Metadata = {
  title: "Dodaj wspomnienie",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function NewMemoryPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select(
      "id, name, slug, icon, description, is_active, sort_order, created_at, updated_at",
    )
    .eq("is_active", true)
    .order("sort_order", {
      ascending: true,
    });

  const categories = (data ?? []) as DatabaseCategory[];

  return (
    <main>
      <div className={styles.breadcrumbs}>
        <a href="/admin">Panel administratora</a>
        <span>›</span>
        <a href="/admin/wspomnienia">Wspomnienia</a>
        <span>›</span>
        <strong>Nowe wspomnienie</strong>
      </div>

      <header className={styles.pageHeader}>
        <div>
          <p>&gt; NOWY PLIK</p>
          <h1>Dodaj wspomnienie</h1>

          <span>
            Uzupełnij formularz, aby dodać nową treść do
            strony.
          </span>
        </div>

        <a
          className="retro-button"
          href="/admin/wspomnienia"
        >
          ◀ Powrót do listy
        </a>
      </header>

      {error ? (
        <div className={styles.messageError}>
          Nie udało się pobrać kategorii:{" "}
          {error.message}
        </div>
      ) : null}

      {categories.length > 0 ? (
        <MemoryForm
          action={createMemory}
          categories={categories}
          submitLabel="Zapisz wspomnienie"
        />
      ) : (
        <div className={styles.messageError}>
          Nie znaleziono aktywnych kategorii. Najpierw dodaj
          kategorię.
        </div>
      )}
    </main>
  );
}