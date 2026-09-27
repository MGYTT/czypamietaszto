"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slugify";

export type SuggestionStatus =
  | "pending"
  | "accepted"
  | "rejected";

export type AdminSuggestionActionState = {
  status: "idle" | "error";
  message: string;
  fieldErrors?: {
    title?: string;
    category?: string;
    approximateYear?: string;
    description?: string;
    submitterName?: string;
    submitterEmail?: string;
    sourceUrl?: string;
    suggestionStatus?: string;
    adminNotes?: string;
  };
};

function getString(
  formData: FormData,
  key: string,
): string {
  const value = formData.get(key);

  return typeof value === "string"
    ? value.trim()
    : "";
}

function isValidOptionalEmail(
  value: string,
): boolean {
  if (!value) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidOptionalUrl(
  value: string,
): boolean {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}

function getSuggestionStatus(
  value: string,
): SuggestionStatus {
  if (
    value === "accepted" ||
    value === "rejected"
  ) {
    return value;
  }

  return "pending";
}

async function createUniqueMemorySlug(
  title: string,
): Promise<string> {
  const supabase = await createClient();

  const baseSlug =
    slugify(title) || "wspomnienie";

  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const { data } = await supabase
      .from("memories")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (!data) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

export async function updateSuggestion(
  suggestionId: string,
  _previousState: AdminSuggestionActionState,
  formData: FormData,
): Promise<AdminSuggestionActionState> {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return {
      status: "error",
      message:
        "Sesja administratora wygasła. Zaloguj się ponownie.",
    };
  }

  if (!suggestionId) {
    return {
      status: "error",
      message:
        "Nie podano identyfikatora zgłoszenia.",
    };
  }

  const title = getString(
    formData,
    "title",
  );

  const categoryId = getString(
    formData,
    "categoryId",
  );

  const approximateYearValue = getString(
    formData,
    "approximateYear",
  );

  const description = getString(
    formData,
    "description",
  );

  const submitterName = getString(
    formData,
    "submitterName",
  );

  const submitterEmail = getString(
    formData,
    "submitterEmail",
  );

  const sourceUrl = getString(
    formData,
    "sourceUrl",
  );

  const suggestionStatus =
    getSuggestionStatus(
      getString(
        formData,
        "suggestionStatus",
      ),
    );

  const adminNotes = getString(
    formData,
    "adminNotes",
  );

  const fieldErrors: AdminSuggestionActionState["fieldErrors"] =
    {};

  if (
    title.length < 2 ||
    title.length > 150
  ) {
    fieldErrors.title =
      "Nazwa musi mieć od 2 do 150 znaków.";
  }

  if (!categoryId) {
    fieldErrors.category =
      "Wybierz kategorię.";
  }

  let approximateYear: number | null = null;

  if (approximateYearValue) {
    approximateYear = Number.parseInt(
      approximateYearValue,
      10,
    );

    if (
      Number.isNaN(approximateYear) ||
      approximateYear < 1900 ||
      approximateYear > 2100
    ) {
      fieldErrors.approximateYear =
        "Rok musi mieścić się w zakresie od 1900 do 2100.";
    }
  }

  if (
    description.length < 20 ||
    description.length > 5000
  ) {
    fieldErrors.description =
      "Opis musi mieć od 20 do 5000 znaków.";
  }

  if (submitterName.length > 100) {
    fieldErrors.submitterName =
      "Imię lub pseudonim może mieć maksymalnie 100 znaków.";
  }

  if (
    !isValidOptionalEmail(
      submitterEmail,
    )
  ) {
    fieldErrors.submitterEmail =
      "Wpisz prawidłowy adres e-mail.";
  }

  if (!isValidOptionalUrl(sourceUrl)) {
    fieldErrors.sourceUrl =
      "Wpisz pełny adres rozpoczynający się od http:// lub https://.";
  }

  if (adminNotes.length > 5000) {
    fieldErrors.adminNotes =
      "Notatki mogą mieć maksymalnie 5000 znaków.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message:
        "Popraw błędy w formularzu.",
      fieldErrors,
    };
  }

  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("id", categoryId)
    .maybeSingle();

  if (!category) {
    return {
      status: "error",
      message:
        "Wybrana kategoria nie istnieje.",
      fieldErrors: {
        category:
          "Wybierz inną kategorię.",
      },
    };
  }

  const { error } = await supabase
    .from("suggestions")
    .update({
      title,
      category_id: categoryId,
      approximate_year:
        approximateYear,
      description,
      submitter_name:
        submitterName || null,
      submitter_email:
        submitterEmail || null,
      source_url: sourceUrl || null,
      status: suggestionStatus,
      admin_notes: adminNotes,
    })
    .eq("id", suggestionId);

  if (error) {
    return {
      status: "error",
      message:
        `Nie udało się zapisać zgłoszenia: ${error.message}`,
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/zgloszenia");
  revalidatePath(
    `/admin/zgloszenia/${suggestionId}/edytuj`,
  );

  redirect(
    "/admin/zgloszenia?updated=1",
  );
}

export async function changeSuggestionStatus(
  suggestionId: string,
  newStatus: SuggestionStatus,
) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/logowanie");
  }

  if (
    newStatus !== "pending" &&
    newStatus !== "accepted" &&
    newStatus !== "rejected"
  ) {
    redirect(
      "/admin/zgloszenia?error=invalid-status",
    );
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("suggestions")
    .update({
      status: newStatus,
    })
    .eq("id", suggestionId);

  if (error) {
    redirect(
      "/admin/zgloszenia?error=status-failed",
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/zgloszenia");

  redirect(
    `/admin/zgloszenia?statusChanged=${newStatus}`,
  );
}

export async function createDraftFromSuggestion(
  suggestionId: string,
) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/logowanie");
  }

  const supabase = await createClient();

  const {
    data: suggestion,
    error: suggestionError,
  } = await supabase
    .from("suggestions")
    .select(`
      id,
      title,
      category_id,
      approximate_year,
      description,
      submitter_name,
      created_memory_id
    `)
    .eq("id", suggestionId)
    .maybeSingle();

  if (
    suggestionError ||
    !suggestion
  ) {
    redirect(
      "/admin/zgloszenia?error=not-found",
    );
  }

  if (suggestion.created_memory_id) {
    redirect(
      `/admin/wspomnienia/${suggestion.created_memory_id}/edytuj`,
    );
  }

  const uniqueSlug =
    await createUniqueMemorySlug(
      suggestion.title,
    );

  const description =
    suggestion.description.trim();

  const excerpt =
    description.length > 180
      ? `${description.slice(0, 177).trim()}...`
      : description;

  const submitterInformation =
    suggestion.submitter_name
      ? `\n\nPropozycję przesłał użytkownik: ${suggestion.submitter_name}.`
      : "";

  const {
    data: createdMemory,
    error: memoryError,
  } = await supabase
    .from("memories")
    .insert({
      category_id:
        suggestion.category_id,
      title: suggestion.title,
      slug: uniqueSlug,
      excerpt,
      content:
        `${description}${submitterInformation}`,
      year:
        suggestion.approximate_year,
      icon: "💡",
      cover_image_url: null,
      status: "draft",
      published_at: null,
    })
    .select("id")
    .single();

  if (
    memoryError ||
    !createdMemory
  ) {
    redirect(
      "/admin/zgloszenia?error=draft-failed",
    );
  }

  const { error: relationError } =
    await supabase
      .from("suggestions")
      .update({
        status: "accepted",
        created_memory_id:
          createdMemory.id,
      })
      .eq("id", suggestionId);

  if (relationError) {
    await supabase
      .from("memories")
      .delete()
      .eq("id", createdMemory.id);

    redirect(
      "/admin/zgloszenia?error=relation-failed",
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/zgloszenia");
  revalidatePath("/admin/wspomnienia");

  redirect(
    `/admin/wspomnienia/${createdMemory.id}/edytuj`,
  );
}

export async function deleteSuggestion(
  suggestionId: string,
) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/logowanie");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("suggestions")
    .delete()
    .eq("id", suggestionId);

  if (error) {
    redirect(
      "/admin/zgloszenia?error=delete-failed",
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/zgloszenia");

  redirect(
    "/admin/zgloszenia?deleted=1",
  );
}