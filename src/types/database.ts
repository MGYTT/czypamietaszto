export type MemoryStatus = "draft" | "published" | "archived";

export type DatabaseCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type DatabaseMemory = {
  id: string;
  category_id: string | null;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  year: number | null;
  icon: string;
  cover_image_url: string | null;
  status: MemoryStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DatabaseMemoryFact = {
  id: string;
  memory_id: string;
  content: string;
  sort_order: number;
  created_at: string;
};

export type DatabaseTag = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type DatabaseMemoryTag = {
  memory_id: string;
  tag_id: string;
  created_at: string;
};

export type MemoryWithCategory = DatabaseMemory & {
  category: Pick<
    DatabaseCategory,
    "id" | "name" | "slug" | "icon"
  > | null;
};

export type FullMemory = MemoryWithCategory & {
  facts: DatabaseMemoryFact[];
  tags: DatabaseTag[];
};