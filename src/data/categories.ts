export type Category = {
  name: string;
  slug: string;
  icon: string;
  description: string;
  itemCount: number;
};

export const categories: Category[] = [
  {
    name: "Gry",
    slug: "gry",
    icon: "🎮",
    description:
      "Gry komputerowe, przeglądarkowe, konsolowe i pierwsze gry mobilne.",
    itemCount: 24,
  },
  {
    name: "Muzyka",
    slug: "muzyka",
    icon: "🎵",
    description:
      "Piosenki z odtwarzaczy MP3, szkolnych dyskotek i pierwszych teledysków.",
    itemCount: 18,
  },
  {
    name: "Słodycze",
    slug: "slodycze",
    icon: "🍬",
    description:
      "Produkty ze szkolnych sklepików i smaki, których już nie znajdziemy.",
    itemCount: 15,
  },
  {
    name: "Dawny internet",
    slug: "dawny-internet",
    icon: "🌐",
    description:
      "Komunikatory, portale społecznościowe, fora i strony z grami.",
    itemCount: 21,
  },
  {
    name: "Telewizja",
    slug: "telewizja",
    icon: "📺",
    description:
      "Kreskówki, seriale, programy i reklamy zapamiętane z dzieciństwa.",
    itemCount: 17,
  },
  {
    name: "Zabawki",
    slug: "zabawki",
    icon: "🧸",
    description:
      "Figurki, kolekcje, gadżety szkolne i zabawki, o których marzyliśmy.",
    itemCount: 13,
  },
  {
    name: "Technologia",
    slug: "technologia",
    icon: "💻",
    description:
      "Stare telefony, komputery, odtwarzacze i urządzenia używane przed laty.",
    itemCount: 16,
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}