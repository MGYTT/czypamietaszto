import type { Metadata } from "next";
import { createCategory } from "@/actions/categories";
import { CategoryForm } from "@/components/admin/categories/CategoryForm";
import styles from "../AdminCategories.module.css";

export const metadata: Metadata = {
  title: "Dodaj kategorię",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NewCategoryPage() {
  return (
    <main>
      <div className={styles.breadcrumbs}>
        <a href="/admin">Panel administratora</a>
        <span>›</span>
        <a href="/admin/kategorie">Kategorie</a>
        <span>›</span>
        <strong>Nowa kategoria</strong>
      </div>

      <header className={styles.pageHeader}>
        <div>
          <p>&gt; NOWY FOLDER</p>
          <h1>Dodaj kategorię</h1>

          <span>
            Utwórz nowy folder dla wspomnień.
          </span>
        </div>

        <a
          className="retro-button"
          href="/admin/kategorie"
        >
          ◀ Powrót do listy
        </a>
      </header>

      <CategoryForm
        action={createCategory}
        submitLabel="Utwórz kategorię"
      />
    </main>
  );
}