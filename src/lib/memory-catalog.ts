import "server-only";

import type { PublicMemory } from "@/lib/public-content";
import { getPublishedMemories } from "@/lib/public-content";

export type CatalogSort =
  | "newest"
  | "year-desc"
  | "year-asc"
  | "title-asc";

export type MemoryCatalogFilters = {
  query: string;
  category: string;
  fromYear: number | null;
  toYear: number | null;
  sort: CatalogSort;
  page: number;
  pageSize: number;
};

export type MemoryCatalogResult = {
  memories: PublicMemory[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};

function normalizeSearchValue(
  value: string,
): string {
  return value
    .trim()
    .toLocaleLowerCase("pl-PL")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function matchesSearchQuery(
  memory: PublicMemory,
  query: string,
): boolean {
  if (!query) {
    return true;
  }

  const normalizedQuery =
    normalizeSearchValue(query);

  const searchableValues = [
    memory.title,
    memory.excerpt,
    memory.categoryName,
    memory.categorySlug,
    String(memory.year),
    ...memory.tags,
  ];

  return searchableValues.some((value) =>
    normalizeSearchValue(value).includes(
      normalizedQuery,
    ),
  );
}

function sortMemories(
  memories: PublicMemory[],
  sort: CatalogSort,
): PublicMemory[] {
  const sortedMemories = [...memories];

  switch (sort) {
    case "year-desc":
      return sortedMemories.sort(
        (firstMemory, secondMemory) =>
          secondMemory.year - firstMemory.year,
      );

    case "year-asc":
      return sortedMemories.sort(
        (firstMemory, secondMemory) =>
          firstMemory.year - secondMemory.year,
      );

    case "title-asc":
      return sortedMemories.sort(
        (firstMemory, secondMemory) =>
          firstMemory.title.localeCompare(
            secondMemory.title,
            "pl",
          ),
      );

    case "newest":
    default:
      return sortedMemories;
  }
}

export async function getMemoryCatalog(
  filters: MemoryCatalogFilters,
): Promise<MemoryCatalogResult> {
  const allMemories =
    await getPublishedMemories();

  const filteredMemories = allMemories.filter(
    (memory) => {
      if (
        !matchesSearchQuery(
          memory,
          filters.query,
        )
      ) {
        return false;
      }

      if (
        filters.category &&
        memory.categorySlug !== filters.category
      ) {
        return false;
      }

      if (
        filters.fromYear !== null &&
        memory.year < filters.fromYear
      ) {
        return false;
      }

      if (
        filters.toYear !== null &&
        memory.year > filters.toYear
      ) {
        return false;
      }

      return true;
    },
  );

  const sortedMemories = sortMemories(
    filteredMemories,
    filters.sort,
  );

  const totalItems = sortedMemories.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / filters.pageSize),
  );

  const currentPage = Math.min(
    Math.max(filters.page, 1),
    totalPages,
  );

  const startIndex =
    (currentPage - 1) * filters.pageSize;

  const memories = sortedMemories.slice(
    startIndex,
    startIndex + filters.pageSize,
  );

  return {
    memories,
    totalItems,
    totalPages,
    currentPage,
    pageSize: filters.pageSize,
  };
}