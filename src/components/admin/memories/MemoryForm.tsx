"use client";

import { useActionState } from "react";
import type {
  MemoryActionState,
} from "@/actions/memories";
import { MemoryImageUpload } from "@/components/admin/memories/MemoryImageUpload";
import type { DatabaseCategory } from "@/types/database";
import styles from "./MemoryForm.module.css";

export type MemoryFormValues = {
  title: string;
  slug: string;
  categoryId: string;
  excerpt: string;
  content: string;
  icon: string;
  year: number | null;
  coverImageUrl: string | null;
  status: "draft" | "published" | "archived";
  facts: string[];
  tags: string[];
};

type MemoryFormAction = (
  previousState: MemoryActionState,
  formData: FormData,
) => Promise<MemoryActionState>;

type MemoryFormProps = {
  categories: DatabaseCategory[];
  action: MemoryFormAction;
  initialValues?: MemoryFormValues;
  submitLabel?: string;
  cancelHref?: string;
};

const initialMemoryActionState: MemoryActionState = {
  status: "idle",
  message: "",
};

const emptyValues: MemoryFormValues = {
  title: "",
  slug: "",
  categoryId: "",
  excerpt: "",
  content: "",
  icon: "💾",
  year: null,
  coverImageUrl: null,
  status: "draft",
  facts: [],
  tags: [],
};

export function MemoryForm({
  categories,
  action,
  initialValues = emptyValues,
  submitLabel = "Zapisz wspomnienie",
  cancelHref = "/admin/wspomnienia",
}: MemoryFormProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    initialMemoryActionState,
  );

  return (
    <form action={formAction} className={styles.form}>
      {state.status === "error" ? (
        <div className={styles.error} role="alert">
          <span aria-hidden="true">⚠️</span>

          <div>
            <strong>Nie udało się zapisać wpisu</strong>
            <p>{state.message}</p>
          </div>
        </div>
      ) : null}

      <section className={styles.window}>
        <div className={styles.titleBar}>
          <span>📄 Podstawowe informacje</span>
          <span aria-hidden="true">×</span>
        </div>

        <div className={styles.windowContent}>
          <div className={styles.field}>
            <label htmlFor="title">
              Tytuł wpisu <strong>*</strong>
            </label>

            <input
              aria-describedby={
                state.fieldErrors?.title
                  ? "title-error"
                  : undefined
              }
              defaultValue={initialValues.title}
              id="title"
              name="title"
              placeholder="np. Gadu-Gadu"
              required
              type="text"
            />

            {state.fieldErrors?.title ? (
              <small
                className={styles.fieldError}
                id="title-error"
              >
                {state.fieldErrors.title}
              </small>
            ) : null}
          </div>

          <div className={styles.fieldsRow}>
            <div className={styles.field}>
              <label htmlFor="slug">
                Adres wpisu
              </label>

              <div className={styles.slugInput}>
                <span>/wspomnienia/</span>

                <input
                  defaultValue={initialValues.slug}
                  id="slug"
                  name="slug"
                  placeholder="generowany automatycznie"
                  type="text"
                />
              </div>

              {state.fieldErrors?.slug ? (
                <small className={styles.fieldError}>
                  {state.fieldErrors.slug}
                </small>
              ) : (
                <small>
                  Zostaw puste, aby wygenerować z tytułu.
                </small>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="icon">
                Ikona
              </label>

              <input
                defaultValue={initialValues.icon}
                id="icon"
                maxLength={10}
                name="icon"
                placeholder="💾"
                type="text"
              />
            </div>
          </div>

          <div className={styles.fieldsRow}>
            <div className={styles.field}>
              <label htmlFor="categoryId">
                Kategoria <strong>*</strong>
              </label>

              <select
                defaultValue={initialValues.categoryId}
                id="categoryId"
                name="categoryId"
                required
              >
                <option disabled value="">
                  -- wybierz kategorię --
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>

              {state.fieldErrors?.category ? (
                <small className={styles.fieldError}>
                  {state.fieldErrors.category}
                </small>
              ) : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="year">
                Rok
              </label>

              <input
                defaultValue={initialValues.year ?? ""}
                id="year"
                max={2100}
                min={1900}
                name="year"
                placeholder="np. 2006"
                type="number"
              />

              {state.fieldErrors?.year ? (
                <small className={styles.fieldError}>
                  {state.fieldErrors.year}
                </small>
              ) : null}
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="excerpt">
              Krótki opis
            </label>

            <textarea
              defaultValue={initialValues.excerpt}
              id="excerpt"
              name="excerpt"
              placeholder="Krótki opis widoczny na karcie wspomnienia..."
              rows={3}
            />

            <small>
              Zalecana długość: od 100 do 180 znaków.
            </small>
          </div>
        </div>
      </section>

      <section className={styles.window}>
        <div className={styles.titleBar}>
          <span>📝 Treść wspomnienia</span>
          <span aria-hidden="true">×</span>
        </div>

        <div className={styles.windowContent}>
          <div className={styles.field}>
            <label htmlFor="content">
              Główna treść <strong>*</strong>
            </label>

            <textarea
              defaultValue={initialValues.content}
              id="content"
              name="content"
              placeholder={`Napisz historię wspomnienia...\n\nKażdy nowy akapit oddziel pustą linią.`}
              required
              rows={14}
            />

            {state.fieldErrors?.content ? (
              <small className={styles.fieldError}>
                {state.fieldErrors.content}
              </small>
            ) : (
              <small>
                Akapity rozdzielaj pustą linią.
              </small>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="facts">
              Ciekawostki
            </label>

            <textarea
              defaultValue={initialValues.facts.join("\n")}
              id="facts"
              name="facts"
              placeholder={`Pierwsza ciekawostka\nDruga ciekawostka\nTrzecia ciekawostka`}
              rows={7}
            />

            <small>
              Każdą ciekawostkę wpisz w osobnym wierszu.
            </small>
          </div>

          <div className={styles.field}>
            <label htmlFor="tags">
              Tagi
            </label>

            <input
              defaultValue={initialValues.tags.join(", ")}
              id="tags"
              name="tags"
              placeholder="internet, komunikator, lata 2000"
              type="text"
            />

            <small>
              Oddziel tagi przecinkami.
            </small>
          </div>
        </div>
      </section>

      <section className={styles.window}>
        <div className={styles.titleBar}>
          <span>🖼️ Obraz i publikacja</span>
          <span aria-hidden="true">×</span>
        </div>

        <div className={styles.windowContent}>
          <div className={styles.field}>
            <label>Obraz główny</label>

            <MemoryImageUpload
              initialUrl={initialValues.coverImageUrl}
              inputName="coverImageUrl"
            />

            <small>
              Obraz zostanie zapisany w Supabase Storage.
            </small>
          </div>

          <div className={styles.field}>
            <label htmlFor="status">
              Status wpisu
            </label>

            <select
              defaultValue={initialValues.status}
              id="status"
              name="status"
            >
              <option value="draft">
                📝 Szkic
              </option>

              <option value="published">
                🌐 Opublikowany
              </option>

              <option value="archived">
                📦 Zarchiwizowany
              </option>
            </select>

            <small>
              Opublikowane wpisy będą widoczne na stronie.
            </small>
          </div>
        </div>
      </section>

      <div className={styles.actions}>
        <button
          className="retro-button retro-button--primary"
          disabled={isPending}
          type="submit"
        >
          {isPending
            ? "Zapisywanie..."
            : `💾 ${submitLabel}`}
        </button>

        <a className="retro-button" href={cancelHref}>
          Anuluj
        </a>
      </div>
    </form>
  );
}