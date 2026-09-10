export const categoryStyles: Record<
  string,
  { gradient: string; icon: string; accent: string }
> = {
  'Tech Fest': {
    gradient: 'from-indigo-600 to-violet-700',
    icon: '⚡',
    accent: 'text-indigo-600',
  },
  Workshop: {
    gradient: 'from-teal-500 to-emerald-600',
    icon: '🛠',
    accent: 'text-teal-600',
  },
  Cultural: {
    gradient: 'from-rose-500 to-orange-500',
    icon: '🎭',
    accent: 'text-rose-600',
  },
};

export function getCategoryStyle(category: string) {
  return categoryStyles[category] ?? {
    gradient: 'from-gray-500 to-gray-700',
    icon: '📌',
    accent: 'text-gray-600',
  };
}