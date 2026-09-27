"use client";

import { useActionState } from "react";
import type {
  AdminSuggestionActionState,
  SuggestionStatus,
} from "@/actions/admin-suggestions";
import styles from "./AdminSuggestionForm.module.css";

export type AdminSuggestionFormValues = {
  title: string;
  categoryId: string;
  approximateYear: number | null;
  description: string;
  submitterName: string;
  submitterEmail: string;
  sourceUrl: string;
  suggestionStatus: SuggestionStatus;
  adminNotes: string;
};

type AdminSuggestionFormAction = (
  previousState: AdminSuggestionActionState,
  formData: FormData,
) => Promise<AdminSuggestionActionState>;

type SuggestionCategory = {
  id: string;
  name: string;
  icon: string;
};

type AdminSuggestionFormProps = {
  action: AdminSuggestionFormAction;
  categories: SuggestionCategory[];
  initialValues: AdminSuggestionFormValues;
  createdMemoryId: string | null;
};

const initialActionState: AdminSuggestionActionState = {
  status: "idle",
  message: "",
};

export function AdminSuggestionForm({
  action,
  categories,
  initialValues,
  createdMemoryId,
}: AdminSuggestionFormProps) {
  const [state, formAction, isPending] =
    useActionState(
      action,
      initialActionState,
    );

  return (
    <form
      action={formAction}
      className={styles.form}
    >
      {state.status === "error" ? (
        <div
          className={styles.error}
          role="alert"
        >
          <span aria-hidden="true">⚠️</span>

          <div>
            <strong>
              Nie udało się zapisać zgłoszenia
            </strong>

            <p>{state.message}</p>
          </div>
        </div>
      ) : null}

      {createdMemoryId ? (
        <div className={styles.memoryNotice}>
          <span aria-hidden="true">💾</span>

          <div>
            <strong>
              Z tego zgłoszenia utworzono już szkic
            </strong>

            <p>
              Możesz przejść bezpośrednio do edycji
              powiązanego wspomnienia.
            </p>
          </div>

          <a
            className="retro-button"
            href={`/admin/wspomnienia/${createdMemoryId}/edytuj`}
          >
            Otwórz szkic
          </a>
        </div>
      ) : null}

      <section className={styles.window}>
        <div className={styles.titleBar}>
          <span>
            📄 Treść zgłoszenia
          </span>

          <span aria-hidden="true">×</span>
        </div>

        <div className={styles.content}>
          <div className={styles.field}>
            <label htmlFor="title">
              Nazwa propozycji <strong>*</strong>
            </label>

            <input
              defaultValue={initialValues.title}
              id="title"
              maxLength={150}
              name="title"
              required
              type="text"
            />

            {state.fieldErrors?.title ? (
              <small className={styles.fieldError}>
                {state.fieldErrors.title}
              </small>
            ) : null}
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="categoryId">
                Kategoria <strong>*</strong>
              </label>

              <select
                defaultValue={
                  initialValues.categoryId
                }
                id="categoryId"
                name="categoryId"
                required
              >
                <option disabled value="">
                  -- wybierz kategorię --
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.icon}{" "}
                      {category.name}
                    </option>
                  ),
                )}
              </select>

              {state.fieldErrors?.category ? (
                <small className={styles.fieldError}>
                  {
                    state.fieldErrors
                      .category
                  }
                </small>
              ) : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="approximateYear">
                Przybliżony rok
              </label>

              <input
                defaultValue={
                  initialValues.approximateYear ??
                  ""
                }
                id="approximateYear"
                max={2100}
                min={1900}
                name="approximateYear"
                type="number"
              />

              {state.fieldErrors?.approximateYear ? (
                <small className={styles.fieldError}>
                  {
                    state.fieldErrors
                      .approximateYear
                  }
                </small>
              ) : null}
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="description">
              Opis propozycji <strong>*</strong>
            </label>

            <textarea
              defaultValue={
                initialValues.description
              }
              id="description"
              maxLength={5000}
              name="description"
              required
              rows={12}
            />

            {state.fieldErrors?.description ? (
              <small className={styles.fieldError}>
                {
                  state.fieldErrors
                    .description
                }
              </small>
            ) : null}
          </div>

          <div className={styles.field}>
            <label htmlFor="sourceUrl">
              Link pomocniczy
            </label>

            <input
              defaultValue={
                initialValues.sourceUrl
              }
              id="sourceUrl"
              name="sourceUrl"
              type="url"
            />

            {state.fieldErrors?.sourceUrl ? (
              <small className={styles.fieldError}>
                {
                  state.fieldErrors
                    .sourceUrl
                }
              </small>
            ) : null}
          </div>
        </div>
      </section>

      <section className={styles.window}>
        <div className={styles.titleBar}>
          <span>
            👤 Dane zgłaszającego
          </span>

          <span aria-hidden="true">×</span>
        </div>

        <div className={styles.content}>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="submitterName">
                Imię lub pseudonim
              </label>

              <input
                defaultValue={
                  initialValues.submitterName
                }
                id="submitterName"
                maxLength={100}
                name="submitterName"
                type="text"
              />

              {state.fieldErrors?.submitterName ? (
                <small className={styles.fieldError}>
                  {
                    state.fieldErrors
                      .submitterName
                  }
                </small>
              ) : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="submitterEmail">
                Adres e-mail
              </label>

              <input
                defaultValue={
                  initialValues.submitterEmail
                }
                id="submitterEmail"
                name="submitterEmail"
                type="email"
              />

              {state.fieldErrors?.submitterEmail ? (
                <small className={styles.fieldError}>
                  {
                    state.fieldErrors
                      .submitterEmail
                  }
                </small>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.window}>
        <div className={styles.titleBar}>
          <span>
            🛡️ Moderacja
          </span>

          <span aria-hidden="true">×</span>
        </div>

        <div className={styles.content}>
          <div className={styles.field}>
            <label htmlFor="suggestionStatus">
              Status zgłoszenia
            </label>

            <select
              defaultValue={
                initialValues.suggestionStatus
              }
              id="suggestionStatus"
              name="suggestionStatus"
            >
              <option value="pending">
                🕒 Oczekujące
              </option>

              <option value="accepted">
                ✅ Zaakceptowane
              </option>

              <option value="rejected">
                ❌ Odrzucone
              </option>
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="adminNotes">
              Prywatne notatki administratora
            </label>

            <textarea
              defaultValue={
                initialValues.adminNotes
              }
              id="adminNotes"
              maxLength={5000}
              name="adminNotes"
              placeholder="Notatki widoczne wyłącznie w panelu..."
              rows={7}
            />

            {state.fieldErrors?.adminNotes ? (
              <small className={styles.fieldError}>
                {
                  state.fieldErrors
                    .adminNotes
                }
              </small>
            ) : (
              <small>
                Te informacje nie będą publicznie
                widoczne.
              </small>
            )}
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
            : "💾 Zapisz zmiany"}
        </button>

        <a
          className="retro-button"
          href="/admin/zgloszenia"
        >
          Anuluj
        </a>
      </div>
    </form>
  );
}