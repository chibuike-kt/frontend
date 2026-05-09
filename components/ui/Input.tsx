'use client'

import { InputHTMLAttributes, forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, type, ...props }, ref) => {
    const [show, setShow] = useState(false)
    const isPassword = type === 'password'

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#444]">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={isPassword ? (show ? 'text' : 'password') : type}
            className={cn(
              'w-full px-3.5 py-2.5 text-[14px] text-white bg-[#0A0A0A]',
              'border rounded-[10px] outline-none transition-all duration-150',
              'placeholder:text-[#333]',
              'focus:ring-1 focus:ring-[#18FF6D]/50 focus:border-[#18FF6D]/60',
              isPassword && 'pr-10',
              error
                ? 'border-[#FF4444]/60 focus:ring-[#FF4444]/30'
                : 'border-[#1E1E1E] hover:border-[#2A2A2A]',
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShow(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#333] hover:text-[#888] transition-colors"
              tabIndex={-1}
            >
              {show ? <EyeOff size={15} strokeWidth={1.5}/> : <Eye size={15} strokeWidth={1.5}/>}
            </button>
          )}
        </div>
        {error && <p className="text-[12px] text-[#FF4444]">{error}</p>}
        {hint && !error && <p className="text-[12px] text-[#444]">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
