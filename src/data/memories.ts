export type Memory = {
  slug: string;
  title: string;
  categoryName: string;
  categorySlug: string;
  icon: string;
  year: number;
  excerpt: string;
  description: string[];
  facts: string[];
  tags: string[];
};

export const memories: Memory[] = [
  {
    slug: "gadu-gadu",
    title: "Gadu-Gadu",
    categoryName: "Dawny internet",
    categorySlug: "dawny-internet",
    icon: "💬",
    year: 2000,
    excerpt:
      "Charakterystyczny dźwięk wiadomości, kolorowe statusy i pierwsze rozmowy po szkole.",
    description: [
      "Gadu-Gadu było jednym z najpopularniejszych polskich komunikatorów internetowych. Dla wielu osób stanowiło pierwszy sposób prowadzenia długich rozmów ze znajomymi przez internet.",
      "Każdy użytkownik otrzymywał własny numer GG. Ważną częścią komunikatora były opisy, statusy dostępności, emotikony oraz charakterystyczny dźwięk nadchodzącej wiadomości.",
      "Po powrocie ze szkoły uruchamialiśmy komputer, włączaliśmy komunikator i sprawdzaliśmy, kto jest dostępny. Niektóre rozmowy trwały przez całe popołudnie.",
    ],
    facts: [
      "Pierwsza wersja komunikatora pojawiła się w 2000 roku.",
      "Użytkownicy identyfikowani byli za pomocą numerów GG.",
      "Komunikator posiadał charakterystyczny żółty symbol słoneczka.",
      "Opisy pod statusem często zawierały fragmenty piosenek.",
    ],
    tags: ["komunikator", "internet", "rozmowy", "lata 2000"],
  },
  {
    slug: "nasza-klasa",
    title: "Nasza Klasa",
    categoryName: "Dawny internet",
    categorySlug: "dawny-internet",
    icon: "👥",
    year: 2006,
    excerpt:
      "Profile klasowe, szkolne zdjęcia, śledziki i odnajdywanie znajomych sprzed lat.",
    description: [
      "Nasza Klasa była polskim portalem społecznościowym, który pozwalał odnajdywać osoby ze swojej szkoły i klasy.",
      "Użytkownicy dodawali zdjęcia, uzupełniali informacje o ukończonych szkołach i odwiedzali profile znajomych.",
      "W czasach największej popularności konto na portalu posiadała ogromna część polskich internautów.",
    ],
    facts: [
      "Portal został uruchomiony w 2006 roku.",
      "Początkowo skupiał się na odnajdywaniu szkolnych znajomych.",
      "Jedną z funkcji portalu był mikroblog nazywany Śledzikiem.",
      "Później nazwa serwisu została skrócona do NK.pl.",
    ],
    tags: ["portal", "społeczność", "szkoła", "NK"],
  },
  {
    slug: "gry-pl",
    title: "Gry.pl",
    categoryName: "Gry",
    categorySlug: "gry",
    icon: "🕹️",
    year: 2004,
    excerpt:
      "Setki prostych gier przeglądarkowych uruchamianych bezpośrednio w przeglądarce.",
    description: [
      "Gry.pl było miejscem, w którym można było znaleźć setki darmowych gier przeglądarkowych.",
      "Na stronie znajdowały się gry zręcznościowe, wyścigowe, logiczne, sportowe oraz produkcje przeznaczone dla młodszych użytkowników.",
      "Wiele gier działało dzięki technologii Flash. Do zabawy wystarczała przeglądarka internetowa i w miarę szybkie połączenie.",
    ],
    facts: [
      "Duża część gier wykorzystywała technologię Adobe Flash.",
      "Nie trzeba było instalować gier na komputerze.",
      "Popularne były gry zręcznościowe, ubieranki i gry wyścigowe.",
      "Strona często była odwiedzana podczas lekcji informatyki.",
    ],
    tags: ["gry", "Flash", "przeglądarka", "informatyka"],
  },
  {
    slug: "farmville",
    title: "FarmVille",
    categoryName: "Gry",
    categorySlug: "gry",
    icon: "🌾",
    year: 2009,
    excerpt:
      "Wirtualna farma, prezenty od znajomych i powiadomienia pojawiające się na Facebooku.",
    description: [
      "FarmVille było grą społecznościową, w której użytkownicy prowadzili własną wirtualną farmę.",
      "Gracze sadzili rośliny, zbierali plony, kupowali zwierzęta i rozbudowywali gospodarstwo.",
      "Ważną częścią gry była współpraca ze znajomymi z Facebooka oraz wysyłanie im prezentów.",
    ],
    facts: [
      "Gra została wydana w 2009 roku.",
      "FarmVille działało jako aplikacja na Facebooku.",
      "Rośliny należało zebrać przed ich zwiędnięciem.",
      "Gra regularnie publikowała powiadomienia na profilach użytkowników.",
    ],
    tags: ["Facebook", "farma", "gry społecznościowe", "Zynga"],
  },
  {
    slug: "telefony-z-klawiatura",
    title: "Telefony z klawiaturą",
    categoryName: "Technologia",
    categorySlug: "technologia",
    icon: "📱",
    year: 2005,
    excerpt:
      "SMS-y pisane bez patrzenia na ekran, własne dzwonki i przesyłanie plików przez Bluetooth.",
    description: [
      "Zanim ekrany dotykowe stały się standardem, większość telefonów posiadała fizyczną klawiaturę numeryczną.",
      "Na jednym przycisku znajdowało się kilka liter. Mimo tego wiele osób potrafiło pisać wiadomości bez patrzenia na ekran.",
      "Telefony służyły do wysyłania SMS-ów, wykonywania połączeń, słuchania muzyki i grania w proste gry.",
    ],
    facts: [
      "Popularną metodą pisania był słownik T9.",
      "Pliki przesyłano przez podczerwień lub Bluetooth.",
      "Własny dzwonek był ważnym sposobem personalizacji telefonu.",
      "Jedną z najbardziej znanych gier mobilnych był Snake.",
    ],
    tags: ["telefon", "SMS", "Bluetooth", "T9"],
  },
  {
    slug: "odtwarzacze-mp3",
    title: "Odtwarzacze MP3",
    categoryName: "Muzyka",
    categorySlug: "muzyka",
    icon: "🎧",
    year: 2003,
    excerpt:
      "Małe urządzenie, przewodowe słuchawki i folder wypełniony ulubionymi piosenkami.",
    description: [
      "Przenośne odtwarzacze MP3 pozwalały zabrać ulubioną muzykę do szkoły, autobusu lub na wycieczkę.",
      "Użytkownicy samodzielnie kopiowali pliki muzyczne z komputera do pamięci urządzenia.",
      "Pojemność odtwarzacza była ograniczona, dlatego wybór piosenek często wymagał usunięcia wcześniejszych utworów.",
    ],
    facts: [
      "Popularne odtwarzacze posiadały niewielki ekran LCD.",
      "Urządzenia często były zasilane pojedynczą baterią AAA.",
      "Muzykę kopiowano za pomocą przewodu USB.",
      "Pojemność 128 MB lub 256 MB była kiedyś wystarczająca.",
    ],
    tags: ["muzyka", "MP3", "słuchawki", "USB"],
  },
];

export function getMemoryBySlug(slug: string): Memory | undefined {
  return memories.find((memory) => memory.slug === slug);
}