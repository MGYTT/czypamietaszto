import type { Metadata } from "next";
import { createTag } from "@/actions/tags";
import { TagForm } from "@/components/admin/tags/TagForm";
import styles from "../AdminTags.module.css";

export const metadata: Metadata = {
  title: "Dodaj tag",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NewTagPage() {
  return (
    <main>
      <div className={styles.breadcrumbs}>
        <a href="/admin">Panel administratora</a>
        <span>›</span>
        <a href="/admin/tagi">Tagi</a>
        <span>›</span>
        <strong>Nowy tag</strong>
      </div>

      <header className={styles.pageHeader}>
        <div>
          <p>&gt; NOWA ETYKIETA</p>
          <h1>Dodaj tag</h1>

          <span>
            Utwórz oznaczenie, które można przypisywać do
            wspomnień.
          </span>
        </div>

        <a
          className="retro-button"
          href="/admin/tagi"
        >
          ◀ Powrót do listy
        </a>
      </header>

      <TagForm
        action={createTag}
        submitLabel="Utwórz tag"
      />
    </main>
  );
}