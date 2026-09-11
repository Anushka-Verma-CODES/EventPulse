import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant: 'blue' | 'green' | 'gray' | 'red' | 'amber' | 'violet' | 'teal';
  size?: 'sm' | 'md';
  dot?: boolean;
  glow?: boolean;
}

const variantStyles: Record<BadgeProps['variant'], string> = {
  blue:   'bg-blue-500/15 text-blue-400 border-blue-500/25',
  green:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  gray:   'bg-[#262626] text-[#a3a3a3] border-[#333333]',
  red:    'bg-[#E50914]/15 text-[#E50914] border-[#E50914]/30',
  amber:  'bg-amber-500/15 text-amber-400 border-amber-500/25',
  violet: 'bg-neutral-800 text-[#d4d4d4] border-neutral-700',
  teal:   'bg-teal-500/15 text-teal-400 border-teal-500/25',
};

const dotColors: Record<BadgeProps['variant'], string> = {
  blue:   'bg-blue-400',
  green:  'bg-emerald-400',
  gray:   'bg-neutral-400',
  red:    'bg-[#E50914]',
  amber:  'bg-amber-400',
  violet: 'bg-neutral-300',
  teal:   'bg-teal-400',
};

export function Badge({ children, variant, size = 'sm', dot = false }: BadgeProps) {
  const sizeClass = size === 'sm'
    ? 'text-[11px] px-2 py-0.5'
    : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium border rounded-[4px]
        ${variantStyles[variant]}
        ${sizeClass}
      `}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} shrink-0`}
        />
      )}
      {children}
    </span>
  );
}