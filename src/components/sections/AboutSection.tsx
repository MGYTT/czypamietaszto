import { RetroWindow } from "@/components/retro/RetroWindow";
import { getSiteSettings } from "@/lib/site-settings";
import styles from "./AboutSection.module.css";

const features = [
  {
    icon: "💾",
    title: "Archiwum wspomnień",
    description:
      "Gromadzimy gry, piosenki, słodycze, zabawki i internetowe portale sprzed lat.",
  },
  {
    icon: "🕹️",
    title: "Powrót do dzieciństwa",
    description:
      "Przypominamy rzeczy, o których wiele osób nie myślało od bardzo dawna.",
  },
  {
    icon: "👥",
    title: "Społeczność nostalgii",
    description:
      "Projekt rozwija się razem z osobami obserwującymi profil i przesyłającymi pomysły.",
  },
];

export async function AboutSection() {
  const settings = await getSiteSettings();

  return (
    <section
      className={styles.section}
      id="o-projekcie"
    >
      <RetroWindow
        title={`Notatnik — O projekcie ${settings.siteName}`}
        icon="📝"
      >
        <div className={styles.menuBar}>
          <span>Plik</span>
          <span>Edycja</span>
          <span>Format</span>
          <span>Widok</span>
          <span>Pomoc</span>
        </div>

        <div className={styles.content}>
          <div className={styles.introduction}>
            <div className={styles.logo}>
              <span aria-hidden="true">💿</span>

              <div>
                <p>
                  &gt; INTERNETOWE ARCHIWUM NOSTALGII
                </p>

                <h2>{settings.siteName}</h2>
              </div>
            </div>

            <p className={styles.description}>
              {settings.siteDescription}
            </p>

            <p className={styles.additionalDescription}>
              To miejsce dla wszystkich, którzy chcą na
              chwilę wrócić do czasów dzieciństwa.
              Przypominamy przedmioty, programy, gry,
              piosenki i internetowe miejsca, które kiedyś
              były ważną częścią codzienności.
            </p>

            <div className={styles.actions}>
              {settings.tiktokUrl ? (
                <a
                  className="retro-button retro-button--primary"
                  href={settings.tiktokUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  🎵 Obserwuj na TikToku
                </a>
              ) : null}

              <a
                className="retro-button"
                href="/losuj"
              >
                🎲 Wylosuj wspomnienie
              </a>

              {settings.contactEmail ? (
                <a
                  className="retro-button"
                  href={`mailto:${settings.contactEmail}`}
                >
                  ✉️ Napisz do nas
                </a>
              ) : null}
            </div>
          </div>

          <div className={styles.features}>
            {features.map((feature) => (
              <article
                className={styles.feature}
                key={feature.title}
              >
                <span
                  className={styles.featureIcon}
                  aria-hidden="true"
                >
                  {feature.icon}
                </span>

                <div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className={styles.statusBar}>
          <span>Ln 1, Col 1</span>
          <span>100%</span>
          <span>Windows (CRLF)</span>
          <span>UTF-8</span>
        </div>
      </RetroWindow>
    </section>
  );
}