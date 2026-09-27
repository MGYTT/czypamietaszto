import type { Memory } from "@/data/memories";
import styles from "./MemoryCard.module.css";

type MemoryWithOptionalCover = Memory & {
  coverImageUrl?: string | null;
};

type MemoryCardProps = {
  memory: MemoryWithOptionalCover;
};

export function MemoryCard({
  memory,
}: MemoryCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.titleBar}>
        <span>📄 {memory.slug}.html</span>
        <span aria-hidden="true">×</span>
      </div>

      <a
        aria-label={`Otwórz wspomnienie: ${memory.title}`}
        className={styles.preview}
        href={`/wspomnienia/${memory.slug}`}
      >
        <span className={styles.year}>
          {memory.year}
        </span>

        {memory.coverImageUrl ? (
          <>
            <img
              alt=""
              className={styles.coverImage}
              src={memory.coverImageUrl}
            />

            <span
              className={styles.imageBadge}
              aria-hidden="true"
            >
              JPG
            </span>
          </>
        ) : (
          <span
            className={styles.icon}
            aria-hidden="true"
          >
            {memory.icon}
          </span>
        )}
      </a>

      <div className={styles.content}>
        <p className={styles.category}>
          {memory.categoryName}
        </p>

        <h3>
          <a href={`/wspomnienia/${memory.slug}`}>
            {memory.title}
          </a>
        </h3>

        <p className={styles.excerpt}>
          {memory.excerpt}
        </p>

        {memory.tags.length > 0 ? (
          <div className={styles.tags}>
            {memory.tags.slice(0, 3).map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        ) : null}

        <a
          className={`retro-button ${styles.button}`}
          href={`/wspomnienia/${memory.slug}`}
        >
          Otwórz plik
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  );
}