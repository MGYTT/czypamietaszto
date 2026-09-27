"use client";

import { useActionState } from "react";
import {
  updateSiteSettings,
  type SiteSettingsActionState,
} from "@/actions/site-settings";
import styles from "./SiteSettingsForm.module.css";

export type SiteSettingsFormValues = {
  siteName: string;
  siteDescription: string;
  heroEyebrow: string;
  heroTitle: string;
  heroHighlight: string;
  heroDescription: string;
  announcement: string;
  tiktokUrl: string;
  contactEmail: string;
  footerText: string;
};

type SiteSettingsFormProps = {
  initialValues: SiteSettingsFormValues;
};

const initialActionState: SiteSettingsActionState = {
  status: "idle",
  message: "",
};

export function SiteSettingsForm({
  initialValues,
}: SiteSettingsFormProps) {
  const [state, formAction, isPending] =
    useActionState(
      updateSiteSettings,
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
              Nie udało się zapisać ustawień
            </strong>

            <p>{state.message}</p>
          </div>
        </div>
      ) : null}

      <section className={styles.window}>
        <div className={styles.titleBar}>
          <span>
            🌐 Podstawowe informacje
          </span>

          <span aria-hidden="true">×</span>
        </div>

        <div className={styles.content}>
          <div className={styles.field}>
            <label htmlFor="siteName">
              Nazwa strony <strong>*</strong>
            </label>

            <input
              defaultValue={initialValues.siteName}
              id="siteName"
              name="siteName"
              required
              type="text"
            />

            {state.fieldErrors?.siteName ? (
              <small className={styles.fieldError}>
                {state.fieldErrors.siteName}
              </small>
            ) : null}
          </div>

          <div className={styles.field}>
            <label htmlFor="siteDescription">
              Opis strony <strong>*</strong>
            </label>

            <textarea
              defaultValue={
                initialValues.siteDescription
              }
              id="siteDescription"
              name="siteDescription"
              required
              rows={4}
            />

            {state.fieldErrors?.siteDescription ? (
              <small className={styles.fieldError}>
                {
                  state.fieldErrors
                    .siteDescription
                }
              </small>
            ) : (
              <small>
                Opis może być później używany również
                przez wyszukiwarki.
              </small>
            )}
          </div>
        </div>
      </section>

      <section className={styles.window}>
        <div className={styles.titleBar}>
          <span>
            🏠 Strona główna
          </span>

          <span aria-hidden="true">×</span>
        </div>

        <div className={styles.content}>
          <div className={styles.field}>
            <label htmlFor="announcement">
              Pasek aktualności <strong>*</strong>
            </label>

            <textarea
              defaultValue={
                initialValues.announcement
              }
              id="announcement"
              name="announcement"
              required
              rows={3}
            />

            {state.fieldErrors?.announcement ? (
              <small className={styles.fieldError}>
                {state.fieldErrors.announcement}
              </small>
            ) : (
              <small>
                Ten tekst będzie przesuwał się w
                nagłówku strony.
              </small>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="heroEyebrow">
              Tekst nad nagłówkiem
            </label>

            <input
              defaultValue={
                initialValues.heroEyebrow
              }
              id="heroEyebrow"
              name="heroEyebrow"
              required
              type="text"
            />

            {state.fieldErrors?.heroEyebrow ? (
              <small className={styles.fieldError}>
                {state.fieldErrors.heroEyebrow}
              </small>
            ) : null}
          </div>

          <div className={styles.twoColumns}>
            <div className={styles.field}>
              <label htmlFor="heroTitle">
                Główny nagłówek
              </label>

              <input
                defaultValue={
                  initialValues.heroTitle
                }
                id="heroTitle"
                name="heroTitle"
                required
                type="text"
              />

              {state.fieldErrors?.heroTitle ? (
                <small className={styles.fieldError}>
                  {state.fieldErrors.heroTitle}
                </small>
              ) : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="heroHighlight">
                Wyróżniona część
              </label>

              <input
                defaultValue={
                  initialValues.heroHighlight
                }
                id="heroHighlight"
                name="heroHighlight"
                required
                type="text"
              />

              {state.fieldErrors?.heroHighlight ? (
                <small className={styles.fieldError}>
                  {
                    state.fieldErrors
                      .heroHighlight
                  }
                </small>
              ) : null}
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="heroDescription">
              Opis głównej sekcji
            </label>

            <textarea
              defaultValue={
                initialValues.heroDescription
              }
              id="heroDescription"
              name="heroDescription"
              required
              rows={5}
            />

            {state.fieldErrors?.heroDescription ? (
              <small className={styles.fieldError}>
                {
                  state.fieldErrors
                    .heroDescription
                }
              </small>
            ) : null}
          </div>
        </div>
      </section>

      <section className={styles.window}>
        <div className={styles.titleBar}>
          <span>
            🔗 Kontakt i media społecznościowe
          </span>

          <span aria-hidden="true">×</span>
        </div>

        <div className={styles.content}>
          <div className={styles.field}>
            <label htmlFor="tiktokUrl">
              Adres profilu TikTok
            </label>

            <input
              defaultValue={initialValues.tiktokUrl}
              id="tiktokUrl"
              name="tiktokUrl"
              placeholder="https://www.tiktok.com/@..."
              type="url"
            />

            {state.fieldErrors?.tiktokUrl ? (
              <small className={styles.fieldError}>
                {state.fieldErrors.tiktokUrl}
              </small>
            ) : null}
          </div>

          <div className={styles.field}>
            <label htmlFor="contactEmail">
              Adres kontaktowy
            </label>

            <input
              defaultValue={
                initialValues.contactEmail
              }
              id="contactEmail"
              name="contactEmail"
              placeholder="kontakt@example.com"
              type="email"
            />

            {state.fieldErrors?.contactEmail ? (
              <small className={styles.fieldError}>
                {state.fieldErrors.contactEmail}
              </small>
            ) : null}
          </div>

          <div className={styles.field}>
            <label htmlFor="footerText">
              Tekst w stopce
            </label>

            <input
              defaultValue={
                initialValues.footerText
              }
              id="footerText"
              name="footerText"
              required
              type="text"
            />

            {state.fieldErrors?.footerText ? (
              <small className={styles.fieldError}>
                {state.fieldErrors.footerText}
              </small>
            ) : null}
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
            : "💾 Zapisz ustawienia"}
        </button>

        <a
          className="retro-button"
          href="/admin"
        >
          Anuluj
        </a>
      </div>
    </form>
  );
}