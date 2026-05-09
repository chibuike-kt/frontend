"use client";

import { useState } from "react";
import Link from "next/link";
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
    role: "guest" as "host" | "guest",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      await register(form);
    } catch (err: unknown) {
      const axiosError = err as {
        response?: {
          data?: { errors?: Record<string, string[]>; message?: string };
        };
      };
      const apiErrors = axiosError.response?.data?.errors ?? {};
      const flat: Record<string, string> = {};
      Object.entries(apiErrors).forEach(([key, messages]) => {
        flat[key] = Array.isArray(messages) ? messages[0] : messages;
      });
      setErrors(
        Object.keys(flat).length > 0
          ? flat
          : {
              general:
                axiosError.response?.data?.message ?? "Registration failed.",
            },
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-orange-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-violet-600 rounded-2xl mb-4 shadow-lg shadow-violet-200">
            <span className="text-white text-2xl">💸</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">OwambePay</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create your account to get started
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Create an account
          </h2>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
              {errors.general}
            </div>
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

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="role"
                className="text-sm font-medium text-gray-700"
              >
                I am joining as
              </label>
              <select
                id="role"
                value={form.role}
                onChange={set("role")}
                className="w-full px-3.5 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 hover:border-gray-300 transition-colors"
              >
                <option value="guest">
                  Guest — I want to spray money at parties
                </option>
                <option value="host">
                  Host — I want to receive money at my event
                </option>
              </select>
            </div>

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
              placeholder="••••••••"
              value={form.password_confirmation}
              onChange={set("password_confirmation")}
              required
            />

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={loading}
              size="lg"
            >
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-violet-600 font-medium hover:text-violet-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
