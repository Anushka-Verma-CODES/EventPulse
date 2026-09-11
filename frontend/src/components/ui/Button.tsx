import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  isLoading?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  isLoading = false,
  disabled,
  children,
  className = "",
  ...rest
}: ButtonProps) {
  const base =
    "w-full rounded-xl px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

  const variants = {
    primary: "bg-[#12173D] text-white hover:bg-[#1A2050] focus-visible:outline-[#3A63D6]",
    secondary:
      "bg-white text-[#12173D] border border-[#E2E5F5] hover:bg-[#F4F6FC] focus-visible:outline-[#3A63D6]",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
            aria-hidden="true"
          />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
