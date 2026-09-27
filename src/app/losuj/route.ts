import { type NextRequest, NextResponse } from "next/server";
import { getPublishedMemories } from "@/lib/public-content";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const memories = await getPublishedMemories();

  if (memories.length === 0) {
    const emptyUrl = new URL("/", request.url);

    emptyUrl.searchParams.set("random", "empty");
    emptyUrl.hash = "wspomnienia";

    return NextResponse.redirect(emptyUrl);
  }

  const randomIndex = Math.floor(
    Math.random() * memories.length,
  );

  const randomMemory = memories[randomIndex];

  const memoryUrl = new URL(
    `/wspomnienia/${randomMemory.slug}`,
    request.url,
  );

  return NextResponse.redirect(memoryUrl);
}