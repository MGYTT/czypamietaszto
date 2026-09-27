import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MemoryDetails } from "@/components/memories/MemoryDetails";
import { getPublishedMemoryBySlug } from "@/lib/public-content";

type MemoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: MemoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const memory = await getPublishedMemoryBySlug(slug);

  if (!memory) {
    return {
      title: "Nie znaleziono wspomnienia",
    };
  }

  return {
    title: memory.title,
    description: memory.excerpt,
  };
}

export default async function MemoryPage({
  params,
}: MemoryPageProps) {
  const { slug } = await params;
  const memory = await getPublishedMemoryBySlug(slug);

  if (!memory) {
    notFound();
  }

  return (
    <div className="site-shell">
      <SiteHeader />
      <MemoryDetails memory={memory} />
      <SiteFooter />
    </div>
  );
}