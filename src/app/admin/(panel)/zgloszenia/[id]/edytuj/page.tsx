import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { updateSuggestion } from "@/actions/admin-suggestions";
import {
  AdminSuggestionForm,
  type AdminSuggestionFormValues,
} from "@/components/admin/suggestions/AdminSuggestionForm";
import { createClient } from "@/lib/supabase/server";
import styles from "../../AdminSuggestions.module.css";

type EditSuggestionPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type SuggestionRow = {
  id: string;
  category_id: string | null;
  title: string;
  approximate_year: number | null;
  description: string;
  submitter_name: string | null;
  submitter_email: string | null;
  source_url: string | null;
  status:
    | "pending"
    | "accepted"
    | "rejected";
  admin_notes: string;
  created_memory_id: string | null;
  created_at: string;
};

type CategoryRow = {
  id: string;
  name: string;
  icon: string;
};

export const metadata: Metadata = {
  title: "Edytuj zgłoszenie",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function EditSuggestionPage({
  params,
}: EditSuggestionPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    suggestionResult,
    categoriesResult,
  ] = await Promise.all([
    supabase
      .from("suggestions")
      .select(`
        id,
        category_id,
        title,
        approximate_year,
        description,
        submitter_name,
        submitter_email,
        source_url,
        status,
        admin_notes,
        created_memory_id,
        created_at
      `)
      .eq("id", id)
      .maybeSingle(),

    supabase
      .from("categories")
      .select("id, name, icon")
      .order("sort_order", {
        ascending: true,
      }),
  ]);

  if (
    suggestionResult.error ||
    !suggestionResult.data
  ) {
    notFound();
  }

  const suggestion =
    suggestionResult.data as SuggestionRow;

  const categories =
    (categoriesResult.data ??
      []) as CategoryRow[];

  const initialValues: AdminSuggestionFormValues = {
    title: suggestion.title,
    categoryId:
      suggestion.category_id ?? "",
    approximateYear:
      suggestion.approximate_year,
    description:
      suggestion.description,
    submitterName:
      suggestion.submitter_name ?? "",
    submitterEmail:
      suggestion.submitter_email ?? "",
    sourceUrl:
      suggestion.source_url ?? "",
    suggestionStatus:
      suggestion.status,
    adminNotes:
      suggestion.admin_notes,
  };

  const updateAction =
    updateSuggestion.bind(
      null,
      suggestion.id,
    );

  return (
    <main>
      <div className={styles.breadcrumbs}>
        <a href="/admin">
          Panel administratora
        </a>

        <span>›</span>

        <a href="/admin/zgloszenia">
          Zgłoszenia
        </a>

        <span>›</span>
        <strong>{suggestion.title}</strong>
      </div>

      <header className={styles.pageHeader}>
        <div>
          <p>&gt; EDYCJA ZGŁOSZENIA</p>
          <h1>Edytuj zgłoszenie</h1>

          <span>
            Popraw treść przesłaną przez
            użytkownika przed utworzeniem
            wspomnienia.
          </span>
        </div>

        <a
          className="retro-button"
          href="/admin/zgloszenia"
        >
          ◀ Powrót do listy
        </a>
      </header>

      {categoriesResult.error ? (
        <div className={styles.error}>
          Nie udało się pobrać kategorii:{" "}
          {categoriesResult.error.message}
        </div>
      ) : null}

      <AdminSuggestionForm
        action={updateAction}
        categories={categories}
        createdMemoryId={
          suggestion.created_memory_id
        }
        initialValues={initialValues}
      />
    </main>
  );
}