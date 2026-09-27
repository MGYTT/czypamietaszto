"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slugify";

export type TagActionState = {
  status: "idle" | "error";
  message: string;
  fieldErrors?: {
    name?: string;
    slug?: string;
  };
};

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function validateTag(formData: FormData) {
  const name = getString(formData, "name");
  const customSlug = getString(formData, "slug");
  const slug = slugify(customSlug || name);

  const fieldErrors: TagActionState["fieldErrors"] = {};

  if (name.length < 2) {
    fieldErrors.name =
      "Nazwa tagu musi mieć przynajmniej 2 znaki.";
  }

  if (name.length > 60) {
    fieldErrors.name =
      "Nazwa tagu może mieć maksymalnie 60 znaków.";
  }

  if (!slug) {
    fieldErrors.slug =
      "Nie udało się utworzyć adresu tagu.";
  }

  return {
    name,
    slug,
    fieldErrors,
  };
}

export async function createTag(
  _previousState: TagActionState,
  formData: FormData,
): Promise<TagActionState> {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return {
      status: "error",
      message: "Sesja administratora wygasła.",
    };
  }

  const values = validateTag(formData);

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

  const { data: existingTag } = await supabase
    .from("tags")
    .select("id")
    .eq("slug", values.slug)
    .maybeSingle();

  if (existingTag) {
    return {
      status: "error",
      message: "Tag o takim adresie już istnieje.",
      fieldErrors: {
        slug: "Wybierz inny adres tagu.",
      },
    };
  }

  const { error } = await supabase
    .from("tags")
    .insert({
      name: values.name,
      slug: values.slug,
    });

  if (error) {
    return {
      status: "error",
      message: `Nie udało się utworzyć tagu: ${error.message}`,
    };
  }

  revalidatePath("/");
  revalidatePath("/admin/tagi");

  redirect("/admin/tagi?created=1");
}

export async function updateTag(
  tagId: string,
  _previousState: TagActionState,
  formData: FormData,
): Promise<TagActionState> {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return {
      status: "error",
      message: "Sesja administratora wygasła.",
    };
  }

  if (!tagId) {
    return {
      status: "error",
      message: "Nie podano identyfikatora tagu.",
    };
  }

  const values = validateTag(formData);

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

  const { data: currentTag, error: currentTagError } =
    await supabase
      .from("tags")
      .select("id")
      .eq("id", tagId)
      .maybeSingle();

  if (currentTagError || !currentTag) {
    return {
      status: "error",
      message: "Nie znaleziono tagu do edycji.",
    };
  }

  const { data: conflictingTag } = await supabase
    .from("tags")
    .select("id")
    .eq("slug", values.slug)
    .neq("id", tagId)
    .maybeSingle();

  if (conflictingTag) {
    return {
      status: "error",
      message: "Inny tag posiada już taki adres.",
      fieldErrors: {
        slug: "Wybierz inny adres tagu.",
      },
    };
  }

  const { error } = await supabase
    .from("tags")
    .update({
      name: values.name,
      slug: values.slug,
    })
    .eq("id", tagId);

  if (error) {
    return {
      status: "error",
      message: `Nie udało się zaktualizować tagu: ${error.message}`,
    };
  }

  revalidatePath("/");
  revalidatePath("/admin/tagi");

  redirect("/admin/tagi?updated=1");
}

export async function deleteTag(tagId: string) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/logowanie");
  }

  if (!tagId) {
    redirect("/admin/tagi?error=missing-id");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("tags")
    .delete()
    .eq("id", tagId);

  if (error) {
    redirect("/admin/tagi?error=delete-failed");
  }

  revalidatePath("/");
  revalidatePath("/admin/tagi");

  redirect("/admin/tagi?deleted=1");
}