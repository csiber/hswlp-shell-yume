interface MarketplaceComponent {
  id: string;
  name: string;
  description: string;
  credits: number;
  containerClass?: string;
  preview: () => React.ReactNode;
  type?: string;
  props?: Record<string, unknown>;
}

export const COMPONENTS: MarketplaceComponent[] = [
  {
    id: "highlight-post",
    name: "Poszt kiemelés",
    description:
      "A kiválasztott poszt kiemelten jelenik meg 24 órán keresztül.",
    credits: 50,
    preview: () => <div className="h-12 w-24 bg-yellow-200 rounded" />,
  },
  {
    id: "profile-frame",
    name: "Színes profilkeret",
    description: "Látható, színes profilkeret a kiemelt felhasználóknak.",
    credits: 100,
    preview: () => (
      <div className="h-12 w-12 rounded-full border-4 border-pink-500" />
    ),
  },
  {
    id: "custom-avatar",
    name: "Egyedi profil ikon (3 változat)",
    description: "Választható egyedi avatar ikon szettek közül.",
    credits: 150,
    preview: () => (
      <div className="h-12 w-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full" />
    ),
  },
  {
    id: "pin-post",
    name: "Poszt fixálás",
    description: "A kiválasztott poszt rögzítésre kerül a feed tetejére.",
    credits: 200,
    preview: () => <div className="h-8 w-8 bg-blue-300 rounded-full" />,
  },
  {
    id: "emoji-reactions",
    name: "Emoji reakciók kommentekhez",
    description:
      "Lehetővé teszi, hogy emoji reakciókat adj mások kommentjeihez.",
    credits: 80,
    preview: () => <div className="text-2xl">😀</div>,
  },
  {
    id: "daily-surprise",
    name: "Napi meglepetés",
    description:
      "Véletlenszerűen kapsz egy kis extrát: pl. kis keret, 10 pont vagy ritkán badge.",
    credits: 60,
    preview: () => <div className="h-8 w-20 bg-green-200 rounded" />,
  },
  {
    id: "storage-upgrade-500",
    type: "storage-upgrade",
    name: "+500 MB tárhely",
    description: "További 500 MB feltöltési keret.",
    credits: 100,
    preview: () => <div className="h-8 w-20 bg-purple-200 rounded" />,
    props: { addMb: 500 },
  },
];
