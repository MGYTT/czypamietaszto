"use client";

import { useActionState } from "react";
import type { CategoryActionState } from "@/actions/categories";
import styles from "./CategoryForm.module.css";

export type CategoryFormValues = {
  name: string;
  slug: string;
  icon: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
};

type CategoryFormAction = (
  previousState: CategoryActionState,
  formData: FormData,
) => Promise<CategoryActionState>;

type CategoryFormProps = {
  action: CategoryFormAction;
  initialValues?: CategoryFormValues;
  submitLabel?: string;
};

const initialActionState: CategoryActionState = {
  status: "idle",
  message: "",
};

const emptyValues: CategoryFormValues = {
  name: "",
  slug: "",
  icon: "📁",
  description: "",
  sortOrder: 0,
  isActive: true,
};

export function CategoryForm({
  action,
  initialValues = emptyValues,
  submitLabel = "Zapisz kategorię",
}: CategoryFormProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    initialActionState,
  );

  return (
    <form action={formAction} className={styles.form}>
      {state.status === "error" ? (
        <div className={styles.error} role="alert">
          <span aria-hidden="true">⚠️</span>

          <div>
            <strong>Nie udało się zapisać kategorii</strong>
            <p>{state.message}</p>
          </div>
        </div>
      ) : null}

      <section className={styles.window}>
        <div className={styles.titleBar}>
          <span>📁 Właściwości kategorii</span>
          <span aria-hidden="true">×</span>
        </div>

        <div className={styles.content}>
          <div className={styles.preview}>
            <span aria-hidden="true">
              {initialValues.icon || "📁"}
            </span>

            <strong>Folder kategorii</strong>

            <small>
              Ikona zostanie wyświetlona na stronie publicznej.
            </small>
          </div>

          <div className={styles.fields}>
            <div className={styles.field}>
              <label htmlFor="name">
                Nazwa kategorii <strong>*</strong>
              </label>

              <input
                defaultValue={initialValues.name}
                id="name"
                name="name"
                placeholder="np. Gry komputerowe"
                required
                type="text"
              />

              {state.fieldErrors?.name ? (
                <small className={styles.fieldError}>
                  {state.fieldErrors.name}
                </small>
              ) : null}
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="slug">
                  Adres kategorii
                </label>

                <div className={styles.slugInput}>
                  <span>/kategorie/</span>

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
                    Zostaw puste, aby wygenerować z nazwy.
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
                  placeholder="📁"
                  type="text"
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="description">
                Opis kategorii
              </label>

              <textarea
                defaultValue={initialValues.description}
                id="description"
                maxLength={500}
                name="description"
                placeholder="Krótko opisz zawartość kategorii..."
                rows={5}
              />

              {state.fieldErrors?.description ? (
                <small className={styles.fieldError}>
                  {state.fieldErrors.description}
                </small>
              ) : (
                <small>
                  Maksymalnie 500 znaków.
                </small>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="sortOrder">
                Kolejność wyświetlania
              </label>

              <input
                defaultValue={initialValues.sortOrder}
                id="sortOrder"
                max={10000}
                min={0}
                name="sortOrder"
                type="number"
              />

              {state.fieldErrors?.sortOrder ? (
                <small className={styles.fieldError}>
                  {state.fieldErrors.sortOrder}
                </small>
              ) : (
                <small>
                  Kategorie z mniejszą wartością pojawią się wcześniej.
                </small>
              )}
            </div>

            <label className={styles.checkbox}>
              <input
                defaultChecked={initialValues.isActive}
                name="isActive"
                type="checkbox"
              />

              <span>
                Kategoria aktywna i widoczna na stronie
              </span>
            </label>
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

        <a
          className="retro-button"
          href="/admin/kategorie"
        >
          Anuluj
        </a>
      </div>
    </form>
  );
}