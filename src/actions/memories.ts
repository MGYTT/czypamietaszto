"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slugify";

export type MemoryActionState = {
  status: "idle" | "error";
  message: string;
  fieldErrors?: {
    title?: string;
    category?: string;
    content?: string;
    year?: string;
    slug?: string;
  };
};

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getOptionalString(
  formData: FormData,
  key: string,
): string | null {
  const value = getString(formData, key);

  return value.length > 0 ? value : null;
}

export async function createMemory(
  _previousState: MemoryActionState,
  formData: FormData,
): Promise<MemoryActionState> {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return {
      status: "error",
      message: "Sesja administratora wygasła. Zaloguj się ponownie.",
    };
  }

  const title = getString(formData, "title");
  const customSlug = getString(formData, "slug");
  const generatedSlug = slugify(customSlug || title);
  const categoryId = getString(formData, "categoryId");
  const excerpt = getString(formData, "excerpt");
  const content = getString(formData, "content");
  const icon = getString(formData, "icon") || "💾";
  const yearValue = getString(formData, "year");
  const statusValue = getString(formData, "status");
  const coverImageUrl = getOptionalString(
    formData,
    "coverImageUrl",
  );
  const factsValue = getString(formData, "facts");
  const tagsValue = getString(formData, "tags");

  const status =
    statusValue === "published" ||
    statusValue === "archived"
      ? statusValue
      : "draft";

  const fieldErrors: MemoryActionState["fieldErrors"] = {};

  if (title.length < 2) {
    fieldErrors.title = "Tytuł musi mieć przynajmniej 2 znaki.";
  }

  if (!generatedSlug) {
    fieldErrors.slug = "Nie udało się utworzyć adresu wpisu.";
  }

  if (!categoryId) {
    fieldErrors.category = "Wybierz kategorię.";
  }

  if (content.length < 10) {
    fieldErrors.content =
      "Treść musi mieć przynajmniej 10 znaków.";
  }

  let year: number | null = null;

  if (yearValue) {
    year = Number.parseInt(yearValue, 10);

    if (
      Number.isNaN(year) ||
      year < 1900 ||
      year > 2100
    ) {
      fieldErrors.year =
        "Rok musi być liczbą od 1900 do 2100.";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Popraw błędy w formularzu.",
      fieldErrors,
    };
  }

  const supabase = await createClient();

  const { data: existingMemory } = await supabase
    .from("memories")
    .select("id")
    .eq("slug", generatedSlug)
    .maybeSingle();

  if (existingMemory) {
    return {
      status: "error",
      message: "Wpis o takim adresie już istnieje.",
      fieldErrors: {
        slug: "Wybierz inny slug lub zmień tytuł.",
      },
    };
  }

  const publishedAt =
    status === "published"
      ? new Date().toISOString()
      : null;

  const { data: createdMemory, error: memoryError } =
    await supabase
      .from("memories")
      .insert({
        title,
        slug: generatedSlug,
        category_id: categoryId,
        excerpt,
        content,
        icon,
        year,
        cover_image_url: coverImageUrl,
        status,
        published_at: publishedAt,
      })
      .select("id, slug")
      .single();

  if (memoryError || !createdMemory) {
    return {
      status: "error",
      message:
        memoryError?.message ??
        "Nie udało się utworzyć wspomnienia.",
    };
  }

  const facts = factsValue
    .split("\n")
    .map((fact) => fact.trim())
    .filter(Boolean);

  if (facts.length > 0) {
    const { error: factsError } = await supabase
      .from("memory_facts")
      .insert(
        facts.map((fact, index) => ({
          memory_id: createdMemory.id,
          content: fact,
          sort_order: index * 10,
        })),
      );

    if (factsError) {
      await supabase
        .from("memories")
        .delete()
        .eq("id", createdMemory.id);

      return {
        status: "error",
        message:
          "Nie udało się zapisać ciekawostek. Wpis nie został utworzony.",
      };
    }
  }

  const tagNames = Array.from(
    new Set(
      tagsValue
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  );

  if (tagNames.length > 0) {
    const tagRows = tagNames
      .map((name) => ({
        name,
        slug: slugify(name),
      }))
      .filter((tag) => tag.slug.length > 0);

    if (tagRows.length > 0) {
      const { data: savedTags, error: tagsError } =
        await supabase
          .from("tags")
          .upsert(tagRows, {
            onConflict: "slug",
          })
          .select("id, slug");

      if (tagsError || !savedTags) {
        await supabase
          .from("memories")
          .delete()
          .eq("id", createdMemory.id);

        return {
          status: "error",
          message:
            "Nie udało się zapisać tagów. Wpis nie został utworzony.",
        };
      }

      const { error: memoryTagsError } = await supabase
        .from("memory_tags")
        .insert(
          savedTags.map((tag) => ({
            memory_id: createdMemory.id,
            tag_id: tag.id,
          })),
        );

      if (memoryTagsError) {
        await supabase
          .from("memories")
          .delete()
          .eq("id", createdMemory.id);

        return {
          status: "error",
          message:
            "Nie udało się przypisać tagów. Wpis nie został utworzony.",
        };
      }
    }
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/wspomnienia");
  revalidatePath(`/wspomnienia/${createdMemory.slug}`);

  redirect("/admin/wspomnienia?created=1");
}

export async function deleteMemory(memoryId: string) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/logowanie");
  }

  if (!memoryId) {
    redirect("/admin/wspomnienia?error=missing-id");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("memories")
    .delete()
    .eq("id", memoryId);

  if (error) {
    redirect("/admin/wspomnienia?error=delete-failed");
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/wspomnienia");

  redirect("/admin/wspomnienia?deleted=1");
}