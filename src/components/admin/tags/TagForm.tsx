"use client";

import { useActionState } from "react";
import type { TagActionState } from "@/actions/tags";
import styles from "./TagForm.module.css";

export type TagFormValues = {
  name: string;
  slug: string;
};

type TagFormAction = (
  previousState: TagActionState,
  formData: FormData,
) => Promise<TagActionState>;

type TagFormProps = {
  action: TagFormAction;
  initialValues?: TagFormValues;
  submitLabel?: string;
};

const initialActionState: TagActionState = {
  status: "idle",
  message: "",
};

const emptyValues: TagFormValues = {
  name: "",
  slug: "",
};

export function TagForm({
  action,
  initialValues = emptyValues,
  submitLabel = "Zapisz tag",
}: TagFormProps) {
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
            <strong>Nie udało się zapisać tagu</strong>
            <p>{state.message}</p>
          </div>
        </div>
      ) : null}

      <section className={styles.window}>
        <div className={styles.titleBar}>
          <span>🏷️ Właściwości tagu</span>
          <span aria-hidden="true">×</span>
        </div>

        <div className={styles.content}>
          <div className={styles.preview}>
            <span>#</span>

            <strong>
              {initialValues.name || "nowy-tag"}
            </strong>

            <small>
              Podgląd oznaczenia widocznego przy wspomnieniu.
            </small>
          </div>

          <div className={styles.fields}>
            <div className={styles.field}>
              <label htmlFor="name">
                Nazwa tagu <strong>*</strong>
              </label>

              <input
                defaultValue={initialValues.name}
                id="name"
                maxLength={60}
                name="name"
                placeholder="np. lata 2000"
                required
                type="text"
              />

              {state.fieldErrors?.name ? (
                <small className={styles.fieldError}>
                  {state.fieldErrors.name}
                </small>
              ) : (
                <small>
                  Maksymalnie 60 znaków.
                </small>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="slug">
                Adres tagu
              </label>

              <div className={styles.slugInput}>
                <span>/tagi/</span>

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
          href="/admin/tagi"
        >
          Anuluj
        </a>
      </div>
    </form>
  );
}