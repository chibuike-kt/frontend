"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

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
      setError(e.response?.data?.message ?? "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-[380px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
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
            OwambePay
          </h1>
          <p className="text-[13px] text-[#555]">
            Host portal · Sign in to your account
          </p>
        </div>

        {/* Form card */}
        <div className="bg-[#111] border border-[#1E1E1E] rounded-[16px] p-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 px-4 py-3 bg-[#2A0F0F] border border-[#FF4444]/20 rounded-[10px] text-[13px] text-[#FF4444]"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              type="email"
              label="Email"
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
                className="w-full"
                size="lg"
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
        </div>

        <p className="text-center text-[13px] text-[#444] mt-5">
          No account?{" "}
          <Link
            href="/register"
            className="text-[#18FF6D] hover:text-white transition-colors font-medium"
          >
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
