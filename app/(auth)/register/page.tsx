"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "host" as "host" | "guest",
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
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 py-10">
      <motion.div
        className="w-full max-w-[400px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mb-8">
          <div className="w-10 h-10 bg-[#18FF6D] rounded-[10px] flex items-center justify-center mb-5">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
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
          <h1 className="text-[24px] font-bold text-white tracking-[-0.04em] leading-none mb-1.5">
            Create host account
          </h1>
          <p className="text-[13px] text-[#555]">
            Guests don't need accounts — they join via your event link.
          </p>
        </div>

        <div className="bg-[#111] border border-[#1E1E1E] rounded-[16px] p-6">
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 px-4 py-3 bg-[#2A0F0F] border border-[#FF4444]/20 rounded-[10px] text-[13px] text-[#FF4444]"
            >
              {errors.general}
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
              label="Email"
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
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={set("password")}
              error={errors.password}
              required
            />
            <Input
              id="password_confirmation"
              type="password"
              label="Confirm password"
              placeholder="Repeat password"
              value={form.password_confirmation}
              onChange={set("password_confirmation")}
              required
            />
            <div className="pt-1">
              <Button
                type="submit"
                className="w-full"
                size="lg"
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
        </div>

        <p className="text-center text-[13px] text-[#444] mt-5">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#18FF6D] hover:text-white transition-colors font-medium"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
