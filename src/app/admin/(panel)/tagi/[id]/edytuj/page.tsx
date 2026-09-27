import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { updateTag } from "@/actions/tags";
import {
  TagForm,
  type TagFormValues,
} from "@/components/admin/tags/TagForm";
import { createClient } from "@/lib/supabase/server";
import styles from "../../AdminTags.module.css";

type EditTagPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type TagRow = {
  id: string;
  name: string;
  slug: string;
};

export const metadata: Metadata = {
  title: "Edytuj tag",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function EditTagPage({
  params,
}: EditTagPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tags")
    .select("id, name, slug")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const tag = data as TagRow;

  const initialValues: TagFormValues = {
    name: tag.name,
    slug: tag.slug,
  };

  const updateAction = updateTag.bind(null, tag.id);

  return (
    <main>
      <div className={styles.breadcrumbs}>
        <a href="/admin">Panel administratora</a>
        <span>›</span>
        <a href="/admin/tagi">Tagi</a>
        <span>›</span>
        <strong>{tag.name}</strong>
      </div>

      <header className={styles.pageHeader}>
        <div>
          <p>&gt; WŁAŚCIWOŚCI ETYKIETY</p>
          <h1>Edytuj tag</h1>

          <span>
            Zmieniasz tag „#{tag.name}”.
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
        action={updateAction}
        initialValues={initialValues}
        submitLabel="Zapisz zmiany"
      />
    </main>
  );
}