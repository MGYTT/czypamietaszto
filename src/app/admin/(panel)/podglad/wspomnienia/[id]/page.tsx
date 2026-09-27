import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MemoryDetails } from "@/components/memories/MemoryDetails";
import { getMemoryForAdminPreview } from "@/lib/admin-memory-preview";
import styles from "./Preview.module.css";

type AdminMemoryPreviewPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const statusLabels = {
  draft: "Szkic",
  published: "Opublikowany",
  archived: "Zarchiwizowany",
};

const statusIcons = {
  draft: "📝",
  published: "🌐",
  archived: "📦",
};

export const metadata: Metadata = {
  title: "Podgląd wspomnienia",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminMemoryPreviewPage({
  params,
}: AdminMemoryPreviewPageProps) {
  const { id } = await params;

  const memory =
    await getMemoryForAdminPreview(id);

  if (!memory) {
    notFound();
  }

  return (
    <main>
      <section className={styles.previewBar}>
        <div className={styles.previewInformation}>
          <span
            className={styles.previewIcon}
            aria-hidden="true"
          >
            👁️
          </span>

          <div>
            <strong>
              Tryb podglądu administratora
            </strong>

            <p>
              Ten widok nie jest publicznie dostępny.
              Możesz sprawdzić wygląd wpisu przed
              publikacją.
            </p>
          </div>
        </div>

        <div className={styles.previewActions}>
          <span
            className={`${styles.status} ${
              styles[`status_${memory.status}`]
            }`}
          >
            {statusIcons[memory.status]}{" "}
            {statusLabels[memory.status]}
          </span>

          <a
            className="retro-button retro-button--primary"
            href={`/admin/wspomnienia/${memory.id}/edytuj`}
          >
            ✏️ Wróć do edycji
          </a>

          <a
            className="retro-button"
            href="/admin/wspomnienia"
          >
            Zamknij podgląd
          </a>
        </div>
      </section>

      <div className={styles.previewFrame}>
        <MemoryDetails memory={memory} />
      </div>
    </main>
  );
}