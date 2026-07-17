export interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;      // Tailwind class untuk background
  textColor: string;  // Tailwind class untuk text
  hoverColor: string; // Tailwind class untuk hover
}

export const CATEGORIES: Category[] = [
  {
    id: "makanan",
    name: "Makanan & Minuman",
    emoji: "🍔",
    color: "bg-rose-500",
    textColor: "text-rose-400",
    hoverColor: "hover:bg-rose-600",
  },
  {
    id: "transportasi",
    name: "Transportasi",
    emoji: "🚗",
    color: "bg-sky-500",
    textColor: "text-sky-400",
    hoverColor: "hover:bg-sky-600",
  },
  {
    id: "belanja",
    name: "Belanja",
    emoji: "🛍️",
    color: "bg-pink-500",
    textColor: "text-pink-400",
    hoverColor: "hover:bg-pink-600",
  },
  {
    id: "hiburan",
    name: "Hiburan",
    emoji: "🎬",
    color: "bg-purple-500",
    textColor: "text-purple-400",
    hoverColor: "hover:bg-purple-600",
  },
  {
    id: "tagihan",
    name: "Tagihan & Rutinitas",
    emoji: "💸",
    color: "bg-emerald-500",
    textColor: "text-emerald-400",
    hoverColor: "hover:bg-emerald-600",
  },
  {
    id: "lainnya",
    name: "Lainnya",
    emoji: "🧩",
    color: "bg-amber-500",
    textColor: "text-amber-400",
    hoverColor: "hover:bg-amber-600",
  },
];

export function getCategoryById(id: string): Category {
  return CATEGORIES.find((cat) => cat.id === id) || CATEGORIES[CATEGORIES.length - 1];
}
