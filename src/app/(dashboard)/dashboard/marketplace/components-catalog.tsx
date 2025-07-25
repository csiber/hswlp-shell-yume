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
    name: "Highlight post",
    description:
      "Selected post appears prominently for 24 hours.",
    credits: 50,
    preview: () => <div className="h-12 w-24 bg-yellow-200 rounded" />,
  },
  {
    id: "profile-frame",
    name: "Colorful profile frame",
    description: "Visible, colorful profile frame for highlighted users.",
    credits: 100,
    preview: () => (
      <div className="h-12 w-12 rounded-full border-4 border-pink-500" />
    ),
  },
  {
    id: "custom-avatar",
    name: "Custom avatar icon (3 variants)",
    description: "Choose from custom avatar icon sets.",
    credits: 150,
    preview: () => (
      <div className="h-12 w-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full" />
    ),
  },
  {
    id: "pin-post",
    name: "Pin post",
    description: "Selected post is pinned to the top of the feed.",
    credits: 200,
    preview: () => <div className="h-8 w-8 bg-blue-300 rounded-full" />,
  },
  {
    id: "emoji-reactions",
    name: "Emoji reactions for comments",
    description:
      "Allows you to add emoji reactions to other people's comments.",
    credits: 80,
    preview: () => <div className="text-2xl">😀</div>,
  },
  {
    id: "daily-surprise",
    name: "Daily surprise",
    description:
      "Random small extra: e.g. small frame, 10 points or rarely a badge.",
    credits: 60,
    preview: () => <div className="h-8 w-20 bg-green-200 rounded" />,
  },
  {
    id: "storage-upgrade-500",
    type: "storage-upgrade",
    name: "+500 MB storage",
    description: "Additional 500 MB upload quota.",
    credits: 100,
    preview: () => <div className="h-8 w-20 bg-purple-200 rounded" />,
    props: { addMb: 500 },
  },
];
