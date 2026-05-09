"use client";

import { InputHTMLAttributes, forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, type, ...props }, ref) => {
    const [show, setShow] = useState(false);
    const isPassword = type === "password";

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#6B687E]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={isPassword ? (show ? "text" : "password") : type}
            className={cn(
              "w-full px-3.5 py-[10px] text-[14px] text-[#16151F]",
              "bg-[#F8F8FA] border-[1.5px] rounded-[10px] outline-none",
              "placeholder:text-[#C4C2D4]",
              "transition-all duration-150",
              "focus:bg-white focus:ring-3 focus:ring-[#7C6FE0]/12 focus:border-[#7C6FE0]",
              isPassword && "pr-10",
              error
                ? "border-[#E5484D] focus:border-[#E5484D] focus:ring-[#E5484D]/10"
                : "border-[#E4E4E8] hover:border-[#D4D4DA]",
              className,
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#C4C2D4] hover:text-[#6B687E] transition-colors"
              tabIndex={-1}
            >
              {show ? (
                <EyeOff size={15} strokeWidth={1.75} />
              ) : (
                <Eye size={15} strokeWidth={1.75} />
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="text-[12px] text-[#E5484D] flex items-center gap-1">
            {error}
          </p>
        )}
        {hint && !error && <p className="text-[12px] text-[#A09DB8]">{hint}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";
