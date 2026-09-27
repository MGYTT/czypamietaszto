import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type PublicSiteSettings = {
  siteName: string;
  siteDescription: string;
  heroEyebrow: string;
  heroTitle: string;
  heroHighlight: string;
  heroDescription: string;
  announcement: string;
  tiktokUrl: string | null;
  contactEmail: string | null;
  footerText: string;
};

export const defaultSiteSettings: PublicSiteSettings = {
  siteName: "CzyPamiętaszTo.pl",
  siteDescription:
    "Internetowe archiwum nostalgii, gier, muzyki, słodyczy i dawnego internetu.",
  heroEyebrow:
    "Internetowe archiwum nostalgii",
  heroTitle: "Czy pamiętasz",
  heroHighlight: "to?",
  heroDescription:
    "Wróć do czasów, kiedy internet łączył się przez modem, na komputerze królowały gry z płyt, a najlepsze piosenki przesyłaliśmy sobie przez Bluetooth.",
  announcement:
    "Witamy na stronie CzyPamiętaszTo.pl! Przypomnij sobie stare gry, piosenki, słodycze i portale internetowe.",
  tiktokUrl: null,
  contactEmail: null,
  footerText:
    "Internetowe Archiwum Nostalgii",
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

function mapSiteSettings(
  settings: SiteSettingsRow,
): PublicSiteSettings {
  return {
    siteName:
      settings.site_name ||
      defaultSiteSettings.siteName,

    siteDescription:
      settings.site_description ||
      defaultSiteSettings.siteDescription,

    heroEyebrow:
      settings.hero_eyebrow ||
      defaultSiteSettings.heroEyebrow,

    heroTitle:
      settings.hero_title ||
      defaultSiteSettings.heroTitle,

    heroHighlight:
      settings.hero_highlight ||
      defaultSiteSettings.heroHighlight,

    heroDescription:
      settings.hero_description ||
      defaultSiteSettings.heroDescription,

    announcement:
      settings.announcement ||
      defaultSiteSettings.announcement,

    tiktokUrl:
      settings.tiktok_url || null,

    contactEmail:
      settings.contact_email || null,

    footerText:
      settings.footer_text ||
      defaultSiteSettings.footerText,
  };
}

export const getSiteSettings = cache(
  async (): Promise<PublicSiteSettings> => {
    try {
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

      if (error || !data) {
        if (error) {
          console.error(
            "Nie udało się pobrać ustawień strony:",
            error.message,
          );
        }

        return defaultSiteSettings;
      }

      return mapSiteSettings(
        data as SiteSettingsRow,
      );
    } catch (error) {
      console.error(
        "Nieoczekiwany błąd ustawień strony:",
        error,
      );

      return defaultSiteSettings;
    }
  },
);