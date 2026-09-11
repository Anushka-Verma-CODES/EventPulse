import { InputHTMLAttributes, forwardRef, useState } from "react";

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, id, className = "", ...rest }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-sm font-medium text-[#12173D]">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={visible ? "text" : "password"}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            className={`w-full rounded-xl border px-3.5 py-2.5 pr-10 text-sm text-[#12173D] outline-none transition-colors placeholder:text-[#9AA0C7] focus:border-[#3A63D6] focus:ring-2 focus:ring-[#3A63D6]/20 ${
              error ? "border-[#D64545]" : "border-[#E2E5F5]"
            } ${className}`}
            {...rest}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6A6F9A] hover:text-[#12173D]"
          >
            {visible ? (
              // eye-off icon
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.1A10.6 10.6 0 0112 5c5.5 0 9 5 10 7-.5.95-1.7 2.8-3.5 4.3M6.7 6.7C4.6 8.1 3.1 10.2 2 12c1 2 4.5 7 10 7 1.3 0 2.5-.25 3.6-.7" />
              </svg>
            ) : (
              // eye icon
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
        {error && (
          <p id={`${id}-error`} className="text-xs text-[#D64545]">
            {error}
          </p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
export default PasswordInput;
