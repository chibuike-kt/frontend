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
      "inline-flex items-center justify-center font-semibold tracking-tight",
      "rounded-[10px] transition-all duration-150 select-none cursor-pointer",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#18FF6D]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]",
      "disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none",
    ].join(" ");

    const variants: Record<Variant, string> = {
      primary: "bg-[#18FF6D] text-black hover:bg-[#00F060] active:scale-[0.98]",
      secondary:
        "bg-[#161616] text-white border border-[#2A2A2A] hover:bg-[#1E1E1E] hover:border-[#333] active:scale-[0.98]",
      ghost:
        "text-[#888] hover:text-white hover:bg-[#161616] active:scale-[0.98]",
      danger: "bg-[#FF4444] text-white hover:bg-[#FF2222] active:scale-[0.98]",
    };

    const sizes: Record<Size, string> = {
      sm: "text-[12px] px-3 py-1.5 gap-1.5",
      md: "text-[13px] px-4 py-2.5 gap-2",
      lg: "text-[14px] px-5 py-3 gap-2",
    };

    return (
      <motion.button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(base, variants[variant], sizes[size], className)}
        whileTap={disabled || isLoading ? {} : { scale: 0.97 }}
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
                className="opacity-20"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-80"
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
