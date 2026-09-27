import "server-only";

import { cache } from "react";
import type { Category } from "@/data/categories";
import type { Memory } from "@/data/memories";
import { createClient } from "@/lib/supabase/server";

type UnknownRecord = Record<string, unknown>;

type NormalizedCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string;
};

type NormalizedTag = {
  name: string;
  slug: string;
};

export type PublicMemory = Memory & {
  coverImageUrl: string | null;
};

function isRecord(value: unknown): value is UnknownRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function getString(
  object: UnknownRecord,
  key: string,
  fallback = "",
): string {
  const value = object[key];

  return typeof value === "string" ? value : fallback;
}

function getNullableNumber(
  object: UnknownRecord,
  key: string,
): number | null {
  const value = object[key];

  return typeof value === "number" ? value : null;
}

function normalizeSingleRelation(
  value: unknown,
): UnknownRecord | null {
  if (Array.isArray(value)) {
    const firstValue = value[0];

    return isRecord(firstValue) ? firstValue : null;
  }

  return isRecord(value) ? value : null;
}

function normalizeCategory(
  value: unknown,
): NormalizedCategory | null {
  const category = normalizeSingleRelation(value);

  if (!category) {
    return null;
  }

  const id = getString(category, "id");
  const name = getString(category, "name");
  const slug = getString(category, "slug");
  const icon = getString(category, "icon", "📁");

  if (!id || !name || !slug) {
    return null;
  }

  return {
    id,
    name,
    slug,
    icon,
  };
}

function normalizeTag(
  value: unknown,
): NormalizedTag | null {
  const tag = normalizeSingleRelation(value);

  if (!tag) {
    return null;
  }

  const name = getString(tag, "name");
  const slug = getString(tag, "slug");

  if (!name || !slug) {
    return null;
  }

  return {
    name,
    slug,
  };
}

function splitContentIntoParagraphs(
  content: string,
): string[] {
  return content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function mapMemoryRow(
  row: UnknownRecord,
  facts: string[] = [],
  tags: string[] = [],
): PublicMemory {
  const category = normalizeCategory(row.category);
  const content = getString(row, "content");
  const year = getNullableNumber(row, "year");
  const coverImageUrl =
    getString(row, "cover_image_url") || null;

  return {
    slug: getString(row, "slug"),
    title: getString(row, "title", "Bez tytułu"),
    categoryName: category?.name ?? "Bez kategorii",
    categorySlug: category?.slug ?? "bez-kategorii",
    icon: getString(row, "icon", "💾"),
    year: year ?? new Date().getFullYear(),
    excerpt: getString(row, "excerpt"),
    description: splitContentIntoParagraphs(content),
    facts,
    tags,
    coverImageUrl,
  };
}

const memoryListSelect = `
  id,
  title,
  slug,
  excerpt,
  content,
  year,
  icon,
  cover_image_url,
  published_at,
  category:categories (
    id,
    name,
    slug,
    icon
  )
`;

export const getPublishedMemories = cache(
  async (
    limit?: number,
  ): Promise<PublicMemory[]> => {
    const supabase = await createClient();

    let query = supabase
      .from("memories")
      .select(memoryListSelect)
      .eq("status", "published")
      .order("published_at", {
        ascending: false,
      });

    if (typeof limit === "number") {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error || !data) {
      console.error(
        "Nie udało się pobrać wspomnień:",
        error?.message,
      );

      return [];
    }

    return data
      .filter(isRecord)
      .map((row) => mapMemoryRow(row));
  },
);

export const getPublishedMemoriesByCategory = cache(
  async (
    categorySlug: string,
  ): Promise<PublicMemory[]> => {
    const supabase = await createClient();

    const { data: category, error: categoryError } =
      await supabase
        .from("categories")
        .select("id")
        .eq("slug", categorySlug)
        .eq("is_active", true)
        .maybeSingle();

    if (categoryError || !category) {
      return [];
    }

    const { data, error } = await supabase
      .from("memories")
      .select(memoryListSelect)
      .eq("status", "published")
      .eq("category_id", category.id)
      .order("published_at", {
        ascending: false,
      });

    if (error || !data) {
      console.error(
        "Nie udało się pobrać wspomnień kategorii:",
        error?.message,
      );

      return [];
    }

    return data
      .filter(isRecord)
      .map((row) => mapMemoryRow(row));
  },
);

export const getPublishedMemoryBySlug = cache(
  async (
    slug: string,
  ): Promise<PublicMemory | null> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("memories")
      .select(memoryListSelect)
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error || !data || !isRecord(data)) {
      return null;
    }

    const memoryId = getString(data, "id");

    if (!memoryId) {
      return null;
    }

    const [factsResult, tagsResult] = await Promise.all([
      supabase
        .from("memory_facts")
        .select("content, sort_order")
        .eq("memory_id", memoryId)
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
        .eq("memory_id", memoryId),
    ]);

    const facts = (factsResult.data ?? [])
      .filter(isRecord)
      .map((fact) => getString(fact, "content"))
      .filter(Boolean);

    const tags = (tagsResult.data ?? [])
      .filter(isRecord)
      .map((relation) => normalizeTag(relation.tag))
      .filter(
        (tag): tag is NormalizedTag =>
          tag !== null,
      )
      .map((tag) => tag.name);

    return mapMemoryRow(data, facts, tags);
  },
);

export const getPublicCategories = cache(
  async (): Promise<Category[]> => {
    const supabase = await createClient();

    const [categoriesResult, memoriesResult] =
      await Promise.all([
        supabase
          .from("categories")
          .select(`
            id,
            name,
            slug,
            icon,
            description,
            sort_order
          `)
          .eq("is_active", true)
          .order("sort_order", {
            ascending: true,
          }),

        supabase
          .from("memories")
          .select("category_id")
          .eq("status", "published"),
      ]);

    if (
      categoriesResult.error ||
      !categoriesResult.data
    ) {
      console.error(
        "Nie udało się pobrać kategorii:",
        categoriesResult.error?.message,
      );

      return [];
    }

    const memoryCounts = new Map<string, number>();

    for (const memory of memoriesResult.data ?? []) {
      if (!isRecord(memory)) {
        continue;
      }

      const categoryId = getString(
        memory,
        "category_id",
      );

      if (!categoryId) {
        continue;
      }

      memoryCounts.set(
        categoryId,
        (memoryCounts.get(categoryId) ?? 0) + 1,
      );
    }

    return categoriesResult.data
      .filter(isRecord)
      .map((category) => {
        const id = getString(category, "id");

        return {
          name: getString(
            category,
            "name",
            "Bez nazwy",
          ),
          slug: getString(category, "slug"),
          icon: getString(category, "icon", "📁"),
          description: getString(
            category,
            "description",
          ),
          itemCount: memoryCounts.get(id) ?? 0,
        };
      })
      .filter((category) => category.slug.length > 0);
  },
);

export const getPublicCategoryBySlug = cache(
  async (
    slug: string,
  ): Promise<Category | null> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("categories")
      .select(`
        id,
        name,
        slug,
        icon,
        description
      `)
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data || !isRecord(data)) {
      return null;
    }

    const categoryId = getString(data, "id");

    const { count } = await supabase
      .from("memories")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("category_id", categoryId)
      .eq("status", "published");

    return {
      name: getString(data, "name", "Bez nazwy"),
      slug: getString(data, "slug"),
      icon: getString(data, "icon", "📁"),
      description: getString(data, "description"),
      itemCount: count ?? 0,
    };
  },
);