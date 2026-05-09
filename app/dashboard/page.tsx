"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { LogOut, Wallet, CalendarDays, Zap, ChevronRight } from "lucide-react";

const stats = [
  {
    label: "Wallet balance",
    value: "₦0",
    sub: "Fund in Phase 2",
    icon: Wallet,
  },
  { label: "Total received", value: "₦0", sub: "Live in Phase 4", icon: Zap },
  { label: "Events", value: "0", sub: "Create in Phase 3", icon: CalendarDays },
];

const fade = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
});

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-[#18FF6D] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <p className="text-[#444] text-sm">
          Not authenticated.{" "}
          <a href="/login" className="text-[#18FF6D]">
            Log in
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Nav */}
      <header className="border-b border-[#1E1E1E] px-6 h-14 flex items-center justify-between sticky top-0 z-10 bg-[#0A0A0A]/90 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#18FF6D] rounded-[8px] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8z"
                stroke="#000"
                strokeWidth="1.5"
              />
              <path
                d="M7 10l2 2 4-4"
                stroke="#000"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-[15px] font-bold text-white tracking-[-0.04em]">
            OwambePay
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-7 h-7 bg-[#161616] border border-[#2A2A2A] rounded-[8px] flex items-center justify-center text-[11px] font-bold text-[#18FF6D]">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-[13px] text-[#888]">{user.name}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut size={14} strokeWidth={1.75} />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Greeting */}
        <motion.div {...fade(0)} className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#18FF6D]" />
            <span className="text-[11px] font-semibold text-[#18FF6D] uppercase tracking-[0.08em]">
              Host dashboard
            </span>
          </div>
          <h1 className="text-[28px] font-bold text-white tracking-[-0.04em] leading-tight">
            Hey, {user.name.split(" ")[0]}
          </h1>
          <p className="text-[14px] text-[#555] mt-1">
            Your OwambePay dashboard. More unlocks each phase.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {stats.map(({ label, value, sub, icon: Icon }, i) => (
            <motion.div
              key={label}
              {...fade(i + 1)}
              className="bg-[#111] border border-[#1E1E1E] rounded-[14px] p-4"
            >
              <Icon size={14} strokeWidth={1.75} className="text-[#444] mb-3" />
              <p className="text-[20px] font-bold text-white tracking-[-0.04em] leading-none mb-1">
                {value}
              </p>
              <p className="text-[11px] text-[#444] font-medium">{label}</p>
              <p className="text-[10px] text-[#333] mt-1">{sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Account card */}
        <motion.div
          {...fade(4)}
          className="bg-[#111] border border-[#1E1E1E] rounded-[14px] overflow-hidden"
        >
          <div className="px-5 py-3.5 border-b border-[#1E1E1E] flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#444] uppercase tracking-[0.07em]">
              Account
            </span>
            <ChevronRight size={14} className="text-[#333]" />
          </div>
          {[
            { label: "Name", value: user.name, mono: false },
            { label: "Email", value: user.email, mono: false },
            { label: "ID", value: user.id, mono: true },
          ].map(({ label, value, mono }, i) => (
            <div
              key={label}
              className={`px-5 py-3.5 flex items-center justify-between gap-4 ${i > 0 ? "border-t border-[#1E1E1E]" : ""}`}
            >
              <span className="text-[12px] text-[#444] font-medium shrink-0">
                {label}
              </span>
              <span
                className={`text-[13px] text-[#888] truncate text-right ${mono ? "font-mono text-[11px]" : ""}`}
              >
                {value}
              </span>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
