import { InputHTMLAttributes, forwardRef } from "react";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, id, className = "", ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-sm font-medium text-[#12173D]">
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`rounded-xl border px-3.5 py-2.5 text-sm text-[#12173D] outline-none transition-colors placeholder:text-[#9AA0C7] focus:border-[#3A63D6] focus:ring-2 focus:ring-[#3A63D6]/20 ${
            error ? "border-[#D64545]" : "border-[#E2E5F5]"
          } ${className}`}
          {...rest}
        />
        {error && (
          <p id={`${id}-error`} className="text-xs text-[#D64545]">
            {error}
          </p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";
export default AuthInput;
