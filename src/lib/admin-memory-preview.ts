import "server-only";

import type { PublicMemory } from "@/lib/public-content";
import { createClient } from "@/lib/supabase/server";

type UnknownRecord = Record<string, unknown>;

export type AdminPreviewMemory = PublicMemory & {
  id: string;
  status: "draft" | "published" | "archived";
};

function isRecord(
  value: unknown,
): value is UnknownRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function getString(
  record: UnknownRecord,
  key: string,
  fallback = "",
): string {
  const value = record[key];

  return typeof value === "string"
    ? value
    : fallback;
}

function getNullableNumber(
  record: UnknownRecord,
  key: string,
): number | null {
  const value = record[key];

  return typeof value === "number"
    ? value
    : null;
}

function getSingleRelation(
  value: unknown,
): UnknownRecord | null {
  if (Array.isArray(value)) {
    const first = value[0];

    return isRecord(first) ? first : null;
  }

  return isRecord(value) ? value : null;
}

function getStatus(
  value: unknown,
): AdminPreviewMemory["status"] {
  if (
    value === "published" ||
    value === "archived"
  ) {
    return value;
  }

  return "draft";
}

function splitParagraphs(
  content: string,
): string[] {
  return content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export async function getMemoryForAdminPreview(
  memoryId: string,
): Promise<AdminPreviewMemory | null> {
  const supabase = await createClient();

  const { data: memoryData, error: memoryError } =
    await supabase
      .from("memories")
      .select(`
        id,
        title,
        slug,
        excerpt,
        content,
        year,
        icon,
        cover_image_url,
        status,
        category:categories (
          name,
          slug,
          icon
        )
      `)
      .eq("id", memoryId)
      .maybeSingle();

  if (
    memoryError ||
    !memoryData ||
    !isRecord(memoryData)
  ) {
    return null;
  }

  const id = getString(memoryData, "id");

  if (!id) {
    return null;
  }

  const [factsResult, tagsResult] =
    await Promise.all([
      supabase
        .from("memory_facts")
        .select("content, sort_order")
        .eq("memory_id", id)
        .order("sort_order", {
          ascending: true,
        }),

      supabase
        .from("memory_tags")
        .select(`
          tag:tags (
            name,
            slug
          )
        `)
        .eq("memory_id", id),
    ]);

  const category = getSingleRelation(
    memoryData.category,
  );

  const categoryName = category
    ? getString(
        category,
        "name",
        "Bez kategorii",
      )
    : "Bez kategorii";

  const categorySlug = category
    ? getString(
        category,
        "slug",
        "bez-kategorii",
      )
    : "bez-kategorii";

  const facts = (factsResult.data ?? [])
    .filter(isRecord)
    .map((fact) =>
      getString(fact, "content"),
    )
    .filter(Boolean);

  const tags = (tagsResult.data ?? [])
    .filter(isRecord)
    .map((relation) =>
      getSingleRelation(relation.tag),
    )
    .filter(
      (tag): tag is UnknownRecord =>
        tag !== null,
    )
    .map((tag) => getString(tag, "name"))
    .filter(Boolean);

  const content = getString(
    memoryData,
    "content",
  );

  const year = getNullableNumber(
    memoryData,
    "year",
  );

  return {
    id,
    slug: getString(memoryData, "slug"),
    title: getString(
      memoryData,
      "title",
      "Bez tytułu",
    ),
    categoryName,
    categorySlug,
    icon: getString(
      memoryData,
      "icon",
      "💾",
    ),
    year:
      year ?? new Date().getFullYear(),
    excerpt: getString(
      memoryData,
      "excerpt",
    ),
    description: splitParagraphs(content),
    facts,
    tags,
    coverImageUrl:
      getString(
        memoryData,
        "cover_image_url",
      ) || null,
    status: getStatus(memoryData.status),
  };
}