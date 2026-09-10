interface BadgeProps {
  children: React.ReactNode;
  variant: 'blue' | 'green' | 'gray' | 'red' | 'amber';
}

const variantStyles: Record<BadgeProps['variant'], string> = {
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  gray: 'bg-gray-200 text-gray-700',
  red: 'bg-red-100 text-red-700',
  amber: 'bg-amber-100 text-amber-700',
};

export function Badge({ children, variant }: BadgeProps) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded ${variantStyles[variant]}`}>
      {children}
    </span>
  );
}