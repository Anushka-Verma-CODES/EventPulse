import { InputHTMLAttributes, ReactNode, forwardRef } from "react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, id, className = "", ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="flex cursor-pointer items-start gap-2 text-sm text-[#1E293B]">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            className={`mt-0.5 h-4 w-4 flex-shrink-0 rounded border-[#E2E8F0] text-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 ${className}`}
            {...rest}
          />
          <span className="leading-relaxed">{label}</span>
        </label>
        {error && <p className="text-xs text-[#DC2626]">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
export default Checkbox;
