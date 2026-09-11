import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  primary: `
    bg-[#E50914] text-white font-semibold
    hover:bg-[#B81D24]
    active:scale-[0.98]
    disabled:bg-[#E50914]/40 disabled:cursor-not-allowed
  `,
  secondary: `
    bg-[#171717] border border-[#262626] text-[#e5e5e5] font-medium
    hover:bg-[#222222] hover:border-[#404040] hover:text-white
    active:scale-[0.98]
    disabled:opacity-40 disabled:cursor-not-allowed
  `,
  ghost: `
    bg-transparent text-[#a3a3a3] font-medium
    hover:bg-[#171717] hover:text-white
    active:scale-[0.98]
    disabled:opacity-40 disabled:cursor-not-allowed
  `,
  danger: `
    bg-[#E50914] text-white font-semibold
    hover:bg-[#B81D24]
    active:scale-[0.98]
    disabled:opacity-40 disabled:cursor-not-allowed
  `,
};

const sizeStyles: Record<string, string> = {
  sm: 'text-xs px-3 py-1.5 rounded-[4px] gap-1.5',
  md: 'text-sm px-4 py-2 rounded-[4px] gap-2',
  lg: 'text-base px-6 py-2.5 rounded-[4px] gap-2.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-150 cursor-pointer select-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
