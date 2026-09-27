"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slugify";

export type CategoryActionState = {
  status: "idle" | "error";
  message: string;
  fieldErrors?: {
    name?: string;
    slug?: string;
    description?: string;
    sortOrder?: string;
  };
};

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function validateCategory(
  formData: FormData,
): {
  name: string;
  slug: string;
  icon: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  fieldErrors: CategoryActionState["fieldErrors"];
} {
  const name = getString(formData, "name");
  const customSlug = getString(formData, "slug");
  const slug = slugify(customSlug || name);
  const icon = getString(formData, "icon") || "📁";
  const description = getString(formData, "description");
  const sortOrderValue = getString(formData, "sortOrder");
  const isActive = formData.get("isActive") === "on";

  const fieldErrors: CategoryActionState["fieldErrors"] = {};

  if (name.length < 2) {
    fieldErrors.name =
      "Nazwa kategorii musi mieć przynajmniej 2 znaki.";
  }

  if (!slug) {
    fieldErrors.slug =
      "Nie udało się utworzyć adresu kategorii.";
  }

  if (description.length > 500) {
    fieldErrors.description =
      "Opis może mieć maksymalnie 500 znaków.";
  }

  let sortOrder = 0;

  if (sortOrderValue) {
    sortOrder = Number.parseInt(sortOrderValue, 10);

    if (
      Number.isNaN(sortOrder) ||
      sortOrder < 0 ||
      sortOrder > 10000
    ) {
      fieldErrors.sortOrder =
        "Kolejność musi być liczbą od 0 do 10000.";
    }
  }

  return {
    name,
    slug,
    icon,
    description,
    sortOrder,
    isActive,
    fieldErrors,
  };
}

export async function createCategory(
  _previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return {
      status: "error",
      message: "Sesja administratora wygasła.",
    };
  }

  const values = validateCategory(formData);

  if (
    values.fieldErrors &&
    Object.keys(values.fieldErrors).length > 0
  ) {
    return {
      status: "error",
      message: "Popraw błędy w formularzu.",
      fieldErrors: values.fieldErrors,
    };
  }

  const supabase = await createClient();

  const { data: existingCategory } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", values.slug)
    .maybeSingle();

  if (existingCategory) {
    return {
      status: "error",
      message: "Kategoria o takim adresie już istnieje.",
      fieldErrors: {
        slug: "Wybierz inny adres kategorii.",
      },
    };
  }

  const { error } = await supabase
    .from("categories")
    .insert({
      name: values.name,
      slug: values.slug,
      icon: values.icon,
      description: values.description,
      sort_order: values.sortOrder,
      is_active: values.isActive,
    });

  if (error) {
    return {
      status: "error",
      message: `Nie udało się utworzyć kategorii: ${error.message}`,
    };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/kategorie");

  redirect("/admin/kategorie?created=1");
}

export async function updateCategory(
  categoryId: string,
  _previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return {
      status: "error",
      message: "Sesja administratora wygasła.",
    };
  }

  if (!categoryId) {
    return {
      status: "error",
      message: "Nie podano identyfikatora kategorii.",
    };
  }

  const values = validateCategory(formData);

  if (
    values.fieldErrors &&
    Object.keys(values.fieldErrors).length > 0
  ) {
    return {
      status: "error",
      message: "Popraw błędy w formularzu.",
      fieldErrors: values.fieldErrors,
    };
  }

  const supabase = await createClient();

  const { data: currentCategory, error: currentCategoryError } =
    await supabase
      .from("categories")
      .select("id, slug")
      .eq("id", categoryId)
      .maybeSingle();

  if (currentCategoryError || !currentCategory) {
    return {
      status: "error",
      message: "Nie znaleziono kategorii do edycji.",
    };
  }

  const { data: conflictingCategory } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", values.slug)
    .neq("id", categoryId)
    .maybeSingle();

  if (conflictingCategory) {
    return {
      status: "error",
      message: "Inna kategoria posiada już taki adres.",
      fieldErrors: {
        slug: "Wybierz inny adres kategorii.",
      },
    };
  }

  const { error } = await supabase
    .from("categories")
    .update({
      name: values.name,
      slug: values.slug,
      icon: values.icon,
      description: values.description,
      sort_order: values.sortOrder,
      is_active: values.isActive,
    })
    .eq("id", categoryId);

  if (error) {
    return {
      status: "error",
      message: `Nie udało się zaktualizować kategorii: ${error.message}`,
    };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/kategorie");
  revalidatePath(`/kategorie/${currentCategory.slug}`);
  revalidatePath(`/kategorie/${values.slug}`);

  redirect("/admin/kategorie?updated=1");
}

export async function deleteCategory(categoryId: string) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/logowanie");
  }

  if (!categoryId) {
    redirect("/admin/kategorie?error=missing-id");
  }

  const supabase = await createClient();

  const { count, error: countError } = await supabase
    .from("memories")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("category_id", categoryId);

  if (countError) {
    redirect("/admin/kategorie?error=count-failed");
  }

  if ((count ?? 0) > 0) {
    redirect("/admin/kategorie?error=category-not-empty");
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId);

  if (error) {
    redirect("/admin/kategorie?error=delete-failed");
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/kategorie");

  redirect("/admin/kategorie?deleted=1");
}