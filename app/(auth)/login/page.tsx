"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/ui/Logo";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email, password });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F4] flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-[400px]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Card */}
        <div className="bg-white rounded-[20px] border border-[#E4E4E8] shadow-card p-9">
          <Logo size="md" className="mb-7" />

          <div className="mb-6">
            <h1 className="text-[22px] font-bold text-[#16151F] tracking-[-0.04em] leading-none mb-1.5">
              Welcome back
            </h1>
            <p className="text-[13px] text-[#A09DB8]">
              Sign in to manage your events
            </p>
          </div>

          {error && (
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
              <p className="text-[13px] text-[#E5484D]">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
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
                    Sign in <ArrowRight size={15} strokeWidth={2} />
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-[#F2F2F4] text-center">
            <p className="text-[13px] text-[#A09DB8]">
              No account?{" "}
              <Link
                href="/register"
                className="text-[#7C6FE0] font-semibold hover:text-[#6B5FD0] transition-colors"
              >
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
