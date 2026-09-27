"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { MemoryActionState } from "@/actions/memories";
import { getCurrentAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slugify";

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

export async function updateMemory(
  memoryId: string,
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

  if (!memoryId) {
    return {
      status: "error",
      message: "Nie podano identyfikatora wspomnienia.",
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

  const { data: currentMemory, error: currentMemoryError } =
    await supabase
      .from("memories")
      .select("id, slug, published_at")
      .eq("id", memoryId)
      .maybeSingle();

  if (currentMemoryError || !currentMemory) {
    return {
      status: "error",
      message: "Nie znaleziono wspomnienia do edycji.",
    };
  }

  const { data: conflictingMemory } = await supabase
    .from("memories")
    .select("id")
    .eq("slug", generatedSlug)
    .neq("id", memoryId)
    .maybeSingle();

  if (conflictingMemory) {
    return {
      status: "error",
      message: "Inny wpis posiada już taki adres.",
      fieldErrors: {
        slug: "Wybierz inny slug lub zmień tytuł.",
      },
    };
  }

  const publishedAt =
    status === "published"
      ? currentMemory.published_at ??
        new Date().toISOString()
      : null;

  const { error: updateError } = await supabase
    .from("memories")
    .update({
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
    .eq("id", memoryId);

  if (updateError) {
    return {
      status: "error",
      message: `Nie udało się zaktualizować wpisu: ${updateError.message}`,
    };
  }

  const facts = factsValue
    .split("\n")
    .map((fact) => fact.trim())
    .filter(Boolean);

  const { error: deleteFactsError } = await supabase
    .from("memory_facts")
    .delete()
    .eq("memory_id", memoryId);

  if (deleteFactsError) {
    return {
      status: "error",
      message:
        "Wpis został zaktualizowany, ale nie udało się zmienić ciekawostek.",
    };
  }

  if (facts.length > 0) {
    const { error: insertFactsError } = await supabase
      .from("memory_facts")
      .insert(
        facts.map((fact, index) => ({
          memory_id: memoryId,
          content: fact,
          sort_order: index * 10,
        })),
      );

    if (insertFactsError) {
      return {
        status: "error",
        message:
          "Wpis został zaktualizowany, ale nie udało się zapisać ciekawostek.",
      };
    }
  }

  const { error: removeTagsError } = await supabase
    .from("memory_tags")
    .delete()
    .eq("memory_id", memoryId);

  if (removeTagsError) {
    return {
      status: "error",
      message:
        "Wpis został zaktualizowany, ale nie udało się zmienić tagów.",
    };
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
          .select("id");

      if (tagsError || !savedTags) {
        return {
          status: "error",
          message:
            "Wpis został zaktualizowany, ale nie udało się zapisać tagów.",
        };
      }

      const { error: assignTagsError } = await supabase
        .from("memory_tags")
        .insert(
          savedTags.map((tag) => ({
            memory_id: memoryId,
            tag_id: tag.id,
          })),
        );

      if (assignTagsError) {
        return {
          status: "error",
          message:
            "Wpis został zaktualizowany, ale nie udało się przypisać tagów.",
        };
      }
    }
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/wspomnienia");
  revalidatePath(`/wspomnienia/${currentMemory.slug}`);
  revalidatePath(`/wspomnienia/${generatedSlug}`);

  redirect("/admin/wspomnienia?updated=1");
}