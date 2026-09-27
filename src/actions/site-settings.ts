"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type SiteSettingsActionState = {
  status: "idle" | "error";
  message: string;
  fieldErrors?: {
    siteName?: string;
    siteDescription?: string;
    heroEyebrow?: string;
    heroTitle?: string;
    heroHighlight?: string;
    heroDescription?: string;
    announcement?: string;
    tiktokUrl?: string;
    contactEmail?: string;
    footerText?: string;
  };
};

function getString(
  formData: FormData,
  key: string,
): string {
  const value = formData.get(key);

  return typeof value === "string"
    ? value.trim()
    : "";
}

function isValidOptionalUrl(value: string): boolean {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}

function isValidOptionalEmail(
  value: string,
): boolean {
  if (!value) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function updateSiteSettings(
  _previousState: SiteSettingsActionState,
  formData: FormData,
): Promise<SiteSettingsActionState> {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return {
      status: "error",
      message:
        "Sesja administratora wygasła. Zaloguj się ponownie.",
    };
  }

  const siteName = getString(
    formData,
    "siteName",
  );

  const siteDescription = getString(
    formData,
    "siteDescription",
  );

  const heroEyebrow = getString(
    formData,
    "heroEyebrow",
  );

  const heroTitle = getString(
    formData,
    "heroTitle",
  );

  const heroHighlight = getString(
    formData,
    "heroHighlight",
  );

  const heroDescription = getString(
    formData,
    "heroDescription",
  );

  const announcement = getString(
    formData,
    "announcement",
  );

  const tiktokUrl = getString(
    formData,
    "tiktokUrl",
  );

  const contactEmail = getString(
    formData,
    "contactEmail",
  );

  const footerText = getString(
    formData,
    "footerText",
  );

  const fieldErrors: SiteSettingsActionState["fieldErrors"] =
    {};

  if (siteName.length < 2) {
    fieldErrors.siteName =
      "Nazwa strony musi mieć przynajmniej 2 znaki.";
  }

  if (siteDescription.length < 10) {
    fieldErrors.siteDescription =
      "Opis strony musi mieć przynajmniej 10 znaków.";
  }

  if (heroEyebrow.length < 2) {
    fieldErrors.heroEyebrow =
      "Tekst nad nagłówkiem jest wymagany.";
  }

  if (heroTitle.length < 2) {
    fieldErrors.heroTitle =
      "Nagłówek musi mieć przynajmniej 2 znaki.";
  }

  if (heroHighlight.length < 1) {
    fieldErrors.heroHighlight =
      "Wyróżniona część nagłówka jest wymagana.";
  }

  if (heroDescription.length < 10) {
    fieldErrors.heroDescription =
      "Opis sekcji głównej musi mieć przynajmniej 10 znaków.";
  }

  if (announcement.length < 5) {
    fieldErrors.announcement =
      "Komunikat musi mieć przynajmniej 5 znaków.";
  }

  if (!isValidOptionalUrl(tiktokUrl)) {
    fieldErrors.tiktokUrl =
      "Wpisz pełny adres rozpoczynający się od http:// lub https://.";
  }

  if (!isValidOptionalEmail(contactEmail)) {
    fieldErrors.contactEmail =
      "Wpisz prawidłowy adres e-mail.";
  }

  if (footerText.length < 2) {
    fieldErrors.footerText =
      "Treść stopki jest wymagana.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Popraw błędy w formularzu.",
      fieldErrors,
    };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("site_settings")
    .upsert(
      {
        id: true,
        site_name: siteName,
        site_description: siteDescription,
        hero_eyebrow: heroEyebrow,
        hero_title: heroTitle,
        hero_highlight: heroHighlight,
        hero_description: heroDescription,
        announcement,
        tiktok_url: tiktokUrl || null,
        contact_email: contactEmail || null,
        footer_text: footerText,
      },
      {
        onConflict: "id",
      },
    );

  if (error) {
    return {
      status: "error",
      message:
        `Nie udało się zapisać ustawień: ${error.message}`,
    };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin");
  revalidatePath("/admin/ustawienia");

  redirect("/admin/ustawienia?saved=1");
}