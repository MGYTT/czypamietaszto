import "server-only";

import type { Memory } from "@/data/memories";
import { getPublishedMemories } from "@/lib/public-content";

function normalizeSearchValue(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("pl-PL")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function memoryMatchesQuery(
  memory: Memory,
  normalizedQuery: string,
): boolean {
  const searchableValues = [
    memory.title,
    memory.excerpt,
    memory.categoryName,
    memory.categorySlug,
    String(memory.year),
    ...memory.tags,
  ];

  return searchableValues.some((value) =>
    normalizeSearchValue(value).includes(normalizedQuery),
  );
}

export async function searchPublishedMemories(
  query: string,
): Promise<Memory[]> {
  const normalizedQuery = normalizeSearchValue(query);

  if (normalizedQuery.length < 2) {
    return [];
  }

  const memories = await getPublishedMemories();

  return memories.filter((memory) =>
    memoryMatchesQuery(memory, normalizedQuery),
  );
}