import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryDetails } from "@/components/categories/CategoryDetails";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import {
  getPublicCategoryBySlug,
  getPublishedMemoriesByCategory,
} from "@/lib/public-content";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getPublicCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Nie znaleziono kategorii",
    };
  }

  return {
    title: category.name,
    description: category.description,
  };
}

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { slug } = await params;

  const [category, categoryMemories] =
    await Promise.all([
      getPublicCategoryBySlug(slug),
      getPublishedMemoriesByCategory(slug),
    ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="site-shell">
      <SiteHeader />

      <CategoryDetails
        category={category}
        memories={categoryMemories}
      />

      <SiteFooter />
    </div>
  );
}