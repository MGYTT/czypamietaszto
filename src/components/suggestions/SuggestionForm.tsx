"use client";

import {
  useActionState,
  useEffect,
  useRef,
} from "react";
import {
  submitSuggestion,
  type SuggestionActionState,
} from "@/actions/suggestions";
import styles from "./SuggestionForm.module.css";

type SuggestionCategory = {
  id: string;
  name: string;
  icon: string;
};

type SuggestionFormProps = {
  categories: SuggestionCategory[];
};

const initialActionState: SuggestionActionState = {
  status: "idle",
  message: "",
};

export function SuggestionForm({
  categories,
}: SuggestionFormProps) {
  const formRef =
    useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] =
    useActionState(
      submitSuggestion,
      initialActionState,
    );

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  if (state.status === "success") {
    return (
      <div
        className={styles.successWindow}
        role="status"
      >
        <div className={styles.successTitle}>
          <span>
            Informacja
          </span>

          <span aria-hidden="true">×</span>
        </div>

        <div className={styles.successContent}>
          <span
            className={styles.successIcon}
            aria-hidden="true"
          >
            ✅
          </span>

          <div>
            <h2>Propozycja wysłana!</h2>
            <p>{state.message}</p>

            <p>
              Jeśli propozycja pasuje do projektu,
              pojawi się później jako nowe
              wspomnienie.
            </p>
          </div>
        </div>

        <div className={styles.successActions}>
          <a
            className="retro-button"
            href="/"
          >
            Wróć na stronę główną
          </a>

          <button
            className="retro-button retro-button--primary"
            onClick={() => {
              window.location.reload();
            }}
            type="button"
          >
            Wyślij kolejną propozycję
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className={styles.form}
      ref={formRef}
    >
      <div
        aria-hidden="true"
        className={styles.honeypot}
      >
        <label htmlFor="website">
          Twoja strona internetowa
        </label>

        <input
          autoComplete="off"
          id="website"
          name="website"
          tabIndex={-1}
          type="text"
        />
      </div>

      {state.status === "error" ? (
        <div
          className={styles.error}
          role="alert"
        >
          <span aria-hidden="true">⚠️</span>

          <div>
            <strong>
              Nie udało się wysłać propozycji
            </strong>

            <p>{state.message}</p>
          </div>
        </div>
      ) : null}

      <section className={styles.formSection}>
        <div className={styles.sectionTitle}>
          <span>
            📄 Informacje o propozycji
          </span>

          <span aria-hidden="true">×</span>
        </div>

        <div className={styles.sectionContent}>
          <div className={styles.field}>
            <label htmlFor="title">
              Co pamiętasz? <strong>*</strong>
            </label>

            <input
              id="title"
              maxLength={150}
              name="title"
              placeholder="np. gra, piosenka, słodycz albo portal"
              required
              type="text"
            />

            {state.fieldErrors?.title ? (
              <small className={styles.fieldError}>
                {state.fieldErrors.title}
              </small>
            ) : (
              <small>
                Wpisz nazwę rzeczy, którą chcesz
                zaproponować.
              </small>
            )}
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="categoryId">
                Kategoria <strong>*</strong>
              </label>

              <select
                defaultValue=""
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
                id="approximateYear"
                max={2100}
                min={1900}
                name="approximateYear"
                placeholder="np. 2008"
                type="number"
              />

              {state.fieldErrors?.approximateYear ? (
                <small className={styles.fieldError}>
                  {
                    state.fieldErrors
                      .approximateYear
                  }
                </small>
              ) : (
                <small>
                  Pole nie jest obowiązkowe.
                </small>
              )}
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="description">
              Opowiedz nam o tym{" "}
              <strong>*</strong>
            </label>

            <textarea
              id="description"
              maxLength={5000}
              name="description"
              placeholder="Napisz, co pamiętasz, kiedy było to popularne i dlaczego warto dodać to na stronę..."
              required
              rows={10}
            />

            {state.fieldErrors?.description ? (
              <small className={styles.fieldError}>
                {
                  state.fieldErrors
                    .description
                }
              </small>
            ) : (
              <small>
                Minimum 20, maksymalnie 5000
                znaków.
              </small>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="sourceUrl">
              Link pomocniczy
            </label>

            <input
              id="sourceUrl"
              name="sourceUrl"
              placeholder="https://..."
              type="url"
            />

            {state.fieldErrors?.sourceUrl ? (
              <small className={styles.fieldError}>
                {
                  state.fieldErrors
                    .sourceUrl
                }
              </small>
            ) : (
              <small>
                Możesz wkleić link do zdjęcia,
                filmu, piosenki lub artykułu.
              </small>
            )}
          </div>
        </div>
      </section>

      <section className={styles.formSection}>
        <div className={styles.sectionTitle}>
          <span>
            👤 Dane zgłaszającego
          </span>

          <span aria-hidden="true">×</span>
        </div>

        <div className={styles.sectionContent}>
          <div className={styles.optionalNotice}>
            <span aria-hidden="true">ℹ️</span>

            <p>
              Poniższe dane są opcjonalne.
              Możesz wysłać propozycję anonimowo.
            </p>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="submitterName">
                Imię lub pseudonim
              </label>

              <input
                id="submitterName"
                maxLength={100}
                name="submitterName"
                placeholder="Jak możemy Cię podpisać?"
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
                id="submitterEmail"
                name="submitterEmail"
                placeholder="email@example.com"
                type="email"
              />

              {state.fieldErrors?.submitterEmail ? (
                <small className={styles.fieldError}>
                  {
                    state.fieldErrors
                      .submitterEmail
                  }
                </small>
              ) : (
                <small>
                  Użyjemy go tylko w razie pytań
                  dotyczących propozycji.
                </small>
              )}
            </div>
          </div>
        </div>
      </section>

      <label className={styles.consent}>
        <input
          name="consent"
          type="checkbox"
        />

        <span>
          Potwierdzam, że przesłana propozycja
          może zostać wykorzystana do stworzenia
          materiału na stronie.{" "}
          <strong>*</strong>
        </span>
      </label>

      {state.fieldErrors?.consent ? (
        <small className={styles.consentError}>
          {state.fieldErrors.consent}
        </small>
      ) : null}

      <div className={styles.actions}>
        <button
          className="retro-button retro-button--primary"
          disabled={isPending}
          type="submit"
        >
          {isPending
            ? "Wysyłanie..."
            : "📨 Wyślij propozycję"}
        </button>

        <a
          className="retro-button"
          href="/"
        >
          Anuluj
        </a>
      </div>
    </form>
  );
}