export interface CategoryStyle {
  gradient: string;      // CSS gradient string
  bannerGradient: string; // tailwind gradient classes for banners
  icon: string;
  accent: string;        // text color class
  accentColor: string;   // raw hex for inline styles
  glowColor: string;     // rgba for box-shadow glow
  badgeVariant: 'violet' | 'teal' | 'blue' | 'amber' | 'red' | 'gray';
}

export const categoryStyles: Record<string, CategoryStyle> = {
  'Tech Fest': {
    gradient: '#171717',
    bannerGradient: 'from-neutral-900 to-neutral-900',
    icon: '',
    accent: 'text-red-500',
    accentColor: '#E50914',
    glowColor: 'transparent',
    badgeVariant: 'gray',
  },
  Workshop: {
    gradient: '#171717',
    bannerGradient: 'from-neutral-900 to-neutral-900',
    icon: '',
    accent: 'text-red-500',
    accentColor: '#E50914',
    glowColor: 'transparent',
    badgeVariant: 'gray',
  },
  Cultural: {
    gradient: '#171717',
    bannerGradient: 'from-neutral-900 to-neutral-900',
    icon: '',
    accent: 'text-red-500',
    accentColor: '#E50914',
    glowColor: 'transparent',
    badgeVariant: 'gray',
  },
  Sports: {
    gradient: '#171717',
    bannerGradient: 'from-neutral-900 to-neutral-900',
    icon: '',
    accent: 'text-red-500',
    accentColor: '#E50914',
    glowColor: 'transparent',
    badgeVariant: 'gray',
  },
  Seminar: {
    gradient: '#171717',
    bannerGradient: 'from-neutral-900 to-neutral-900',
    icon: '',
    accent: 'text-red-500',
    accentColor: '#E50914',
    glowColor: 'transparent',
    badgeVariant: 'gray',
  },
};

export function getCategoryStyle(category: string): CategoryStyle {
  return categoryStyles[category] ?? {
    gradient: '#171717',
    bannerGradient: 'from-neutral-900 to-neutral-900',
    icon: '',
    accent: 'text-neutral-400',
    accentColor: '#E50914',
    glowColor: 'transparent',
    badgeVariant: 'gray',
  };
}