"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { motion } from "framer-motion";
import { LogOut, Wallet, CalendarDays, Zap } from "lucide-react";

const stats = [
  {
    label: "Wallet balance",
    value: "₦0",
    note: "Unlocks Phase 2",
    icon: Wallet,
  },
  { label: "Total received", value: "₦0", note: "Unlocks Phase 4", icon: Zap },
  { label: "Events", value: "0", note: "Unlocks Phase 3", icon: CalendarDays },
];

const fade = (i: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28, delay: i * 0.055, ease: [0.22, 1, 0.36, 1] },
});

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F4] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-[#7C6FE0] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F2F2F4] flex items-center justify-center">
        <p className="text-sm text-[#A09DB8]">
          Not authenticated.{" "}
          <a href="/login" className="text-[#7C6FE0] font-medium">
            Log in
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F4]">
      {/* Nav */}
      <header className="bg-white border-b border-[#E4E4E8] px-6 h-14 flex items-center justify-between sticky top-0 z-10">
        <Logo size="sm" showName={true} />
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-7 h-7 rounded-[8px] bg-[#EFEDFA] flex items-center justify-center text-[11px] font-bold text-[#7C6FE0]">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-[13px] font-medium text-[#6B687E]">
              {user.name}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut size={14} strokeWidth={1.75} />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Greeting */}
        <motion.div {...fade(0)} className="mb-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#7C6FE0] mb-2">
            Host dashboard
          </p>
          <h1 className="text-[26px] font-bold text-[#16151F] tracking-[-0.04em] leading-tight">
            Hey, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="text-[14px] text-[#A09DB8] mt-1">
            Your workspace is ready. Features unlock phase by phase.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {stats.map(({ label, value, note, icon: Icon }, i) => (
            <motion.div
              key={label}
              {...fade(i + 1)}
              className="bg-white border border-[#E4E4E8] rounded-[14px] p-4 shadow-sm"
            >
              <div className="w-7 h-7 rounded-[8px] bg-[#EFEDFA] flex items-center justify-center mb-3">
                <Icon size={14} strokeWidth={1.75} className="text-[#7C6FE0]" />
              </div>
              <p className="text-[20px] font-bold text-[#16151F] tracking-[-0.04em] leading-none">
                {value}
              </p>
              <p className="text-[11px] font-medium text-[#6B687E] mt-1">
                {label}
              </p>
              <p className="text-[10px] text-[#C4C2D4] mt-0.5">{note}</p>
            </motion.div>
          ))}
        </div>

        {/* Account info */}
        <motion.div
          {...fade(4)}
          className="bg-white border border-[#E4E4E8] rounded-[14px] shadow-sm overflow-hidden"
        >
          <div className="px-5 py-3.5 border-b border-[#F2F2F4]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#A09DB8]">
              Account details
            </p>
          </div>
          {[
            { label: "Name", value: user.name, mono: false },
            { label: "Email", value: user.email, mono: false },
            { label: "ID", value: user.id, mono: true },
          ].map(({ label, value, mono }, i) => (
            <div
              key={label}
              className={`px-5 py-3.5 flex items-center justify-between gap-4 ${i > 0 ? "border-t border-[#F2F2F4]" : ""}`}
            >
              <span className="text-[12px] font-medium text-[#A09DB8] shrink-0">
                {label}
              </span>
              <span
                className={`truncate text-right ${mono ? "font-mono text-[11px] text-[#6B687E]" : "text-[13px] font-medium text-[#16151F]"}`}
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
