"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      children,
      disabled,
      onClick,
      ...props
    },
    ref,
  ) => {
    const base = [
      "inline-flex items-center justify-center font-semibold tracking-[-0.01em]",
      "rounded-[10px] transition-all duration-150 select-none cursor-pointer",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C6FE0]/40 focus-visible:ring-offset-2",
      "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
    ].join(" ");

    const variants: Record<Variant, string> = {
      primary:
        "bg-[#7C6FE0] text-white hover:bg-[#6B5FD0] shadow-[0_1px_3px_rgba(124,111,224,.25)]",
      secondary:
        "bg-white text-[#16151F] border border-[#E4E4E8] hover:bg-[#F8F8FA] hover:border-[#D4D4DA] shadow-sm",
      ghost: "text-[#6B687E] hover:text-[#16151F] hover:bg-[#F2F2F4]",
      danger: "bg-[#E5484D] text-white hover:bg-[#D43F44] shadow-sm",
    };

    const sizes: Record<Size, string> = {
      sm: "text-[12px] px-3 py-1.5 gap-1.5",
      md: "text-[13px] px-4 py-2.5 gap-2",
      lg: "text-[14px] px-5 py-[11px] gap-2",
    };

    return (
      <motion.button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(base, variants[variant], sizes[size], className)}
        whileTap={disabled || isLoading ? {} : { scale: 0.98 }}
        onClick={onClick}
        {...(props as HTMLMotionProps<"button">)}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Loading…
          </span>
        ) : (
          children
        )}
      </motion.button>
    );
  },
);
Button.displayName = "Button";
