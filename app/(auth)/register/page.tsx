"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/ui/Logo";

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "host" as const,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await register(form);
    } catch (err: unknown) {
      const ax = err as {
        response?: {
          data?: { errors?: Record<string, string[]>; message?: string };
        };
      };
      const raw = ax.response?.data?.errors ?? {};
      const flat: Record<string, string> = {};
      Object.entries(raw).forEach(([k, v]) => {
        flat[k] = Array.isArray(v) ? v[0] : v;
      });
      setErrors(
        Object.keys(flat).length
          ? flat
          : { general: ax.response?.data?.message ?? "Registration failed." },
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F4] flex items-center justify-center p-4 py-10">
      <motion.div
        className="w-full max-w-[420px]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="bg-white rounded-[20px] border border-[#E4E4E8] shadow-card p-9">
          <Logo size="md" className="mb-7" />

          <div className="mb-6">
            <h1 className="text-[22px] font-bold text-[#16151F] tracking-[-0.04em] leading-none mb-1.5">
              Create your account
            </h1>
            <p className="text-[13px] text-[#A09DB8]">
              Guests join via your event link — no account needed.
            </p>
          </div>

          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 flex items-start gap-2.5 px-4 py-3 bg-[#FFF0F0] border border-[#FCCFD0] rounded-[10px]"
            >
              <svg
                className="shrink-0 mt-0.5"
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
              >
                <circle
                  cx="8"
                  cy="8"
                  r="7"
                  stroke="#E5484D"
                  strokeWidth="1.4"
                />
                <path
                  d="M8 5v3.5M8 11h.01"
                  stroke="#E5484D"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <p className="text-[13px] text-[#E5484D]">{errors.general}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="name"
              label="Full name"
              placeholder="Adaeze Okonkwo"
              value={form.name}
              onChange={set("name")}
              error={errors.name}
              required
            />
            <Input
              id="email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              value={form.email}
              onChange={set("email")}
              error={errors.email}
              required
            />
            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="Minimum 8 characters"
              value={form.password}
              onChange={set("password")}
              error={errors.password}
              required
            />
            <Input
              id="password_confirmation"
              type="password"
              label="Confirm password"
              placeholder="Repeat your password"
              value={form.password_confirmation}
              onChange={set("password_confirmation")}
              required
            />
            <div className="pt-1">
              <Button
                type="submit"
                size="lg"
                className="w-full"
                isLoading={loading}
              >
                {!loading && (
                  <>
                    Create account <ArrowRight size={15} strokeWidth={2} />
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-[#F2F2F4] text-center">
            <p className="text-[13px] text-[#A09DB8]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#7C6FE0] font-semibold hover:text-[#6B5FD0] transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
