"use server";

import { createClient } from "@/lib/supabase/server";

export type SuggestionActionState = {
  status: "idle" | "error" | "success";
  message: string;
  fieldErrors?: {
    title?: string;
    category?: string;
    approximateYear?: string;
    description?: string;
    submitterName?: string;
    submitterEmail?: string;
    sourceUrl?: string;
    consent?: string;
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

function isValidOptionalEmail(
  value: string,
): boolean {
  if (!value) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidOptionalUrl(
  value: string,
): boolean {
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

export async function submitSuggestion(
  _previousState: SuggestionActionState,
  formData: FormData,
): Promise<SuggestionActionState> {
  const honeypot = getString(
    formData,
    "website",
  );

  if (honeypot) {
    return {
      status: "success",
      message:
        "Dziękujemy! Propozycja została przesłana.",
    };
  }

  const title = getString(
    formData,
    "title",
  );

  const categoryId = getString(
    formData,
    "categoryId",
  );

  const approximateYearValue = getString(
    formData,
    "approximateYear",
  );

  const description = getString(
    formData,
    "description",
  );

  const submitterName = getString(
    formData,
    "submitterName",
  );

  const submitterEmail = getString(
    formData,
    "submitterEmail",
  );

  const sourceUrl = getString(
    formData,
    "sourceUrl",
  );

  const consent =
    formData.get("consent") === "on";

  const fieldErrors: SuggestionActionState["fieldErrors"] =
    {};

  if (
    title.length < 2 ||
    title.length > 150
  ) {
    fieldErrors.title =
      "Nazwa musi mieć od 2 do 150 znaków.";
  }

  if (!categoryId) {
    fieldErrors.category =
      "Wybierz kategorię propozycji.";
  }

  let approximateYear: number | null = null;

  if (approximateYearValue) {
    approximateYear = Number.parseInt(
      approximateYearValue,
      10,
    );

    if (
      Number.isNaN(approximateYear) ||
      approximateYear < 1900 ||
      approximateYear > 2100
    ) {
      fieldErrors.approximateYear =
        "Wpisz rok od 1900 do 2100.";
    }
  }

  if (
    description.length < 20 ||
    description.length > 5000
  ) {
    fieldErrors.description =
      "Opis musi mieć od 20 do 5000 znaków.";
  }

  if (submitterName.length > 100) {
    fieldErrors.submitterName =
      "Imię lub pseudonim może mieć maksymalnie 100 znaków.";
  }

  if (
    !isValidOptionalEmail(
      submitterEmail,
    )
  ) {
    fieldErrors.submitterEmail =
      "Wpisz prawidłowy adres e-mail.";
  }

  if (!isValidOptionalUrl(sourceUrl)) {
    fieldErrors.sourceUrl =
      "Wpisz pełny adres rozpoczynający się od http:// lub https://.";
  }

  if (!consent) {
    fieldErrors.consent =
      "Musisz potwierdzić zgodę na przesłanie propozycji.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message:
        "Popraw zaznaczone pola formularza.",
      fieldErrors,
    };
  }

  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("id", categoryId)
    .eq("is_active", true)
    .maybeSingle();

  if (!category) {
    return {
      status: "error",
      message:
        "Wybrana kategoria nie istnieje lub została ukryta.",
      fieldErrors: {
        category:
          "Wybierz inną kategorię.",
      },
    };
  }

  const { error } = await supabase
    .from("suggestions")
    .insert({
      category_id: categoryId,
      title,
      approximate_year:
        approximateYear,
      description,
      submitter_name:
        submitterName || null,
      submitter_email:
        submitterEmail || null,
      source_url: sourceUrl || null,
      status: "pending",
      admin_notes: "",
    });

  if (error) {
    console.error(
      "Nie udało się zapisać propozycji:",
      error.message,
    );

    return {
      status: "error",
      message:
        "Nie udało się przesłać propozycji. Spróbuj ponownie za chwilę.",
    };
  }

  return {
    status: "success",
    message:
      "Dziękujemy! Propozycja została przesłana i czeka na sprawdzenie.",
  };
}