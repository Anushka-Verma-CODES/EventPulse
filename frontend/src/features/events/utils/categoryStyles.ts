export const categoryStyles: Record<string, { accentBg: string; accentText: string; icon: string }> = {
  'Tech Fest': { accentBg: 'bg-signal-blue', accentText: 'text-signal-blue', icon: '⚡' },
  Workshop: { accentBg: 'bg-signal-green', accentText: 'text-signal-green', icon: '⚙' },
  Cultural: { accentBg: 'bg-signal-amber', accentText: 'text-signal-amber', icon: '✦' },
};

export function getCategoryStyle(category: string) {
  return categoryStyles[category] ?? { accentBg: 'bg-ink', accentText: 'text-ink', icon: '●' };
}