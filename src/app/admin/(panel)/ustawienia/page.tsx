import type { Metadata } from "next";
import { SiteSettingsForm } from "@/components/admin/settings/SiteSettingsForm";
import { createClient } from "@/lib/supabase/server";
import styles from "./Settings.module.css";

export const metadata: Metadata = {
  title: "Ustawienia strony",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

type SettingsPageProps = {
  searchParams: Promise<{
    saved?: string;
  }>;
};

type SiteSettingsRow = {
  site_name: string;
  site_description: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_highlight: string;
  hero_description: string;
  announcement: string;
  tiktok_url: string | null;
  contact_email: string | null;
  footer_text: string;
};

const defaultSettings: SiteSettingsRow = {
  site_name: "CzyPamiętaszTo.pl",
  site_description:
    "Internetowe archiwum nostalgii, gier, muzyki, słodyczy i dawnego internetu.",
  hero_eyebrow:
    "Internetowe archiwum nostalgii",
  hero_title: "Czy pamiętasz",
  hero_highlight: "to?",
  hero_description:
    "Wróć do czasów, kiedy internet łączył się przez modem, na komputerze królowały gry z płyt, a najlepsze piosenki przesyłaliśmy sobie przez Bluetooth.",
  announcement:
    "Witamy na stronie CzyPamiętaszTo.pl! Przypomnij sobie stare gry, piosenki, słodycze i portale internetowe.",
  tiktok_url: null,
  contact_email: null,
  footer_text:
    "Internetowe Archiwum Nostalgii",
};

export default async function SettingsPage({
  searchParams,
}: SettingsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("site_settings")
    .select(`
      site_name,
      site_description,
      hero_eyebrow,
      hero_title,
      hero_highlight,
      hero_description,
      announcement,
      tiktok_url,
      contact_email,
      footer_text
    `)
    .eq("id", true)
    .maybeSingle();

  const settings =
    (data as SiteSettingsRow | null) ??
    defaultSettings;

  return (
    <main>
      <div className={styles.breadcrumbs}>
        <a href="/admin">
          Panel administratora
        </a>

        <span>›</span>
        <strong>Ustawienia</strong>
      </div>

      <header className={styles.pageHeader}>
        <div>
          <p>&gt; PANEL STEROWANIA</p>
          <h1>Ustawienia strony</h1>

          <span>
            Zmień teksty i podstawowe informacje
            wyświetlane na stronie publicznej.
          </span>
        </div>

        <a
          className="retro-button"
          href="/"
          target="_blank"
        >
          🌐 Zobacz stronę
        </a>
      </header>

      {params.saved === "1" ? (
        <div className={styles.success}>
          ✅ Ustawienia zostały zapisane.
        </div>
      ) : null}

      {error ? (
        <div className={styles.error}>
          ⚠️ Nie udało się pobrać ustawień:{" "}
          {error.message}
        </div>
      ) : null}

      <SiteSettingsForm
        initialValues={{
          siteName: settings.site_name,
          siteDescription:
            settings.site_description,
          heroEyebrow:
            settings.hero_eyebrow,
          heroTitle: settings.hero_title,
          heroHighlight:
            settings.hero_highlight,
          heroDescription:
            settings.hero_description,
          announcement:
            settings.announcement,
          tiktokUrl:
            settings.tiktok_url ?? "",
          contactEmail:
            settings.contact_email ?? "",
          footerText:
            settings.footer_text,
        }}
      />
    </main>
  );
}