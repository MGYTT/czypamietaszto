import { RetroWindow } from "@/components/retro/RetroWindow";
import { getPublicCategories } from "@/lib/public-content";
import styles from "./CategoriesSection.module.css";

export async function CategoriesSection() {
  const categories = await getPublicCategories();

  return (
    <section className={styles.section} id="kategorie">
      <RetroWindow
        title="Moje dokumenty — Kategorie"
        icon="📁"
      >
        <div className={styles.toolbar}>
          <span>Plik</span>
          <span>Edycja</span>
          <span>Widok</span>
          <span>Ulubione</span>
          <span>Pomoc</span>
        </div>

        <div className={styles.content}>
          <div className={styles.heading}>
            <div>
              <p>&gt; KATALOG WSPOMNIEŃ</p>
              <h2>Wybierz kategorię</h2>
            </div>

            <span>{categories.length} folderów</span>
          </div>

          {categories.length > 0 ? (
            <div className={styles.grid}>
              {categories.map((category) => (
                <a
                  className={styles.category}
                  href={`/kategorie/${category.slug}`}
                  key={category.slug}
                >
                  <span
                    className={styles.icon}
                    aria-hidden="true"
                  >
                    {category.icon}
                  </span>

                  <div className={styles.categoryContent}>
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>

                    <span className={styles.count}>
                      {category.itemCount}{" "}
                      {category.itemCount === 1
                        ? "plik"
                        : "plików"}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p>
              Nie znaleziono aktywnych kategorii.
            </p>
          )}
        </div>

        <div className={styles.status}>
          <span>{categories.length} obiektów</span>
          <span>Źródło: Supabase</span>
        </div>
      </RetroWindow>
    </section>
  );
}