import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { updateCategory } from "@/actions/categories";
import {
  CategoryForm,
  type CategoryFormValues,
} from "@/components/admin/categories/CategoryForm";
import { createClient } from "@/lib/supabase/server";
import styles from "../../AdminCategories.module.css";

type EditCategoryPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  is_active: boolean;
  sort_order: number;
};

export const metadata: Metadata = {
  title: "Edytuj kategorię",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select(`
      id,
      name,
      slug,
      icon,
      description,
      is_active,
      sort_order
    `)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const category = data as CategoryRow;

  const initialValues: CategoryFormValues = {
    name: category.name,
    slug: category.slug,
    icon: category.icon,
    description: category.description,
    sortOrder: category.sort_order,
    isActive: category.is_active,
  };

  const updateAction = updateCategory.bind(
    null,
    category.id,
  );

  return (
    <main>
      <div className={styles.breadcrumbs}>
        <a href="/admin">Panel administratora</a>
        <span>›</span>
        <a href="/admin/kategorie">Kategorie</a>
        <span>›</span>
        <strong>{category.name}</strong>
      </div>

      <header className={styles.pageHeader}>
        <div>
          <p>&gt; WŁAŚCIWOŚCI FOLDERU</p>
          <h1>Edytuj kategorię</h1>

          <span>
            Zmieniasz kategorię „{category.name}”.
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
        action={updateAction}
        initialValues={initialValues}
        submitLabel="Zapisz zmiany"
      />
    </main>
  );
}