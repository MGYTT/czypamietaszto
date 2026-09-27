"use client";

import {
  type ChangeEvent,
  useRef,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./MemoryImageUpload.module.css";

type MemoryImageUploadProps = {
  inputName: string;
  initialUrl?: string | null;
};

const allowedFileTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const maximumFileSize = 5 * 1024 * 1024;

function getFileExtension(file: File): string {
  const extensionFromName = file.name
    .split(".")
    .pop()
    ?.toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  if (extensionFromName) {
    return extensionFromName;
  }

  const extensionsByMimeType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };

  return extensionsByMimeType[file.type] ?? "jpg";
}

export function MemoryImageUpload({
  inputName,
  initialUrl = null,
}: MemoryImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageUrl, setImageUrl] = useState(
    initialUrl ?? "",
  );

  const [uploadedPath, setUploadedPath] = useState<
    string | null
  >(null);

  const [isUploading, setIsUploading] =
    useState(false);

  const [errorMessage, setErrorMessage] = useState<
    string | null
  >(null);

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setErrorMessage(null);

    if (!allowedFileTypes.includes(file.type)) {
      setErrorMessage(
        "Nieobsługiwany format. Wybierz JPG, PNG, WebP lub GIF.",
      );

      event.target.value = "";
      return;
    }

    if (file.size > maximumFileSize) {
      setErrorMessage(
        "Plik jest za duży. Maksymalny rozmiar to 5 MB.",
      );

      event.target.value = "";
      return;
    }

    setIsUploading(true);

    const supabase = createClient();
    const extension = getFileExtension(file);

    const currentDate = new Date();
    const directory = [
      currentDate.getFullYear(),
      String(currentDate.getMonth() + 1).padStart(
        2,
        "0",
      ),
    ].join("/");

    const filePath = `${directory}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("memory-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      setErrorMessage(
        `Nie udało się przesłać obrazu: ${uploadError.message}`,
      );

      setIsUploading(false);
      event.target.value = "";
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("memory-images")
      .getPublicUrl(filePath);

    if (uploadedPath) {
      await supabase.storage
        .from("memory-images")
        .remove([uploadedPath]);
    }

    setUploadedPath(filePath);
    setImageUrl(publicUrl);
    setIsUploading(false);
  }

  async function handleRemoveImage() {
    setErrorMessage(null);

    if (uploadedPath) {
      const supabase = createClient();

      const { error } = await supabase.storage
        .from("memory-images")
        .remove([uploadedPath]);

      if (error) {
        setErrorMessage(
          `Nie udało się usunąć obrazu: ${error.message}`,
        );

        return;
      }
    }

    setUploadedPath(null);
    setImageUrl("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  return (
    <div className={styles.wrapper}>
      <input
        name={inputName}
        type="hidden"
        value={imageUrl}
      />

      <input
        accept="image/jpeg,image/png,image/webp,image/gif"
        className={styles.hiddenInput}
        disabled={isUploading}
        onChange={handleFileChange}
        ref={fileInputRef}
        type="file"
      />

      <div className={styles.uploadWindow}>
        <div className={styles.titleBar}>
          <span>🖼️ Wybierz obraz wspomnienia</span>
          <span aria-hidden="true">×</span>
        </div>

        {imageUrl ? (
          <div className={styles.preview}>
            <img
              alt="Podgląd przesłanego obrazu"
              src={imageUrl}
            />

            <div className={styles.previewOverlay}>
              <span>Podgląd obrazu</span>
            </div>
          </div>
        ) : (
          <div className={styles.emptyPreview}>
            <span aria-hidden="true">🖼️</span>

            <strong>Brak wybranego obrazu</strong>

            <p>
              Kliknij przycisk „Przeglądaj”, aby wybrać plik
              z komputera.
            </p>
          </div>
        )}

        <div className={styles.fileField}>
          <span>Nazwa pliku:</span>

          <div>
            {imageUrl
              ? imageUrl.split("/").pop()
              : "Nie wybrano pliku"}
          </div>

          <button
            className="retro-button"
            disabled={isUploading}
            onClick={openFilePicker}
            type="button"
          >
            {isUploading
              ? "Wysyłanie..."
              : "Przeglądaj..."}
          </button>
        </div>

        <div className={styles.actions}>
          {imageUrl ? (
            <>
              <button
                className="retro-button"
                disabled={isUploading}
                onClick={openFilePicker}
                type="button"
              >
                🔄 Zmień obraz
              </button>

              <button
                className={`retro-button ${styles.removeButton}`}
                disabled={isUploading}
                onClick={handleRemoveImage}
                type="button"
              >
                🗑️ Usuń obraz
              </button>
            </>
          ) : (
            <button
              className="retro-button retro-button--primary"
              disabled={isUploading}
              onClick={openFilePicker}
              type="button"
            >
              📂 Wybierz obraz
            </button>
          )}
        </div>

        {isUploading ? (
          <div
            aria-label="Przesyłanie obrazu"
            className={styles.progress}
            role="progressbar"
          >
            <div />
          </div>
        ) : null}

        {errorMessage ? (
          <div className={styles.error} role="alert">
            <span aria-hidden="true">⚠️</span>
            {errorMessage}
          </div>
        ) : null}

        <div className={styles.information}>
          <span aria-hidden="true">ℹ️</span>

          <p>
            Obsługiwane formaty: JPG, PNG, WebP i GIF.
            Maksymalny rozmiar pliku: 5 MB.
          </p>
        </div>
      </div>
    </div>
  );
}