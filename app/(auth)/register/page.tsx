"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

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
    <div
      style={{
        minHeight: "100vh",
        background: "#F2F2F4",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          borderRadius: "20px",
          border: "1px solid #E4E4E8",
          boxShadow: "0 1px 2px rgba(0,0,0,.04), 0 4px 20px rgba(0,0,0,.06)",
          padding: "36px",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              background: "#7C6FE0",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7" stroke="#fff" strokeWidth="1.4" />
              <path
                d="M6 9l2 2 4-4"
                stroke="#fff"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <p
              style={{
                fontSize: "17px",
                fontWeight: 700,
                color: "#16151F",
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              OwambePay
            </p>
            <p
              style={{
                fontSize: "10px",
                fontWeight: 600,
                color: "#A09DB8",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                marginTop: "3px",
              }}
            >
              Host portal
            </p>
          </div>
        </div>

        {/* Heading */}
        <h1
          style={{
            fontSize: "22px",
            fontWeight: 700,
            color: "#16151F",
            letterSpacing: "-0.04em",
            marginBottom: "4px",
          }}
        >
          Create your account
        </h1>
        <p style={{ fontSize: "13px", color: "#A09DB8", marginBottom: "24px" }}>
          Guests join via your event link — no account needed.
        </p>

        {/* Error */}
        {errors.general && (
          <div
            style={{
              marginBottom: "20px",
              padding: "12px 14px",
              background: "#FFF0F0",
              border: "1px solid #FCCFD0",
              borderRadius: "10px",
              fontSize: "13px",
              color: "#E5484D",
            }}
          >
            {errors.general}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          {[
            {
              id: "name",
              label: "Full name",
              type: "text",
              placeholder: "Adaeze Okonkwo",
              field: "name",
            },
            {
              id: "email",
              label: "Email address",
              type: "email",
              placeholder: "you@example.com",
              field: "email",
            },
            {
              id: "password",
              label: "Password",
              type: "password",
              placeholder: "Minimum 8 characters",
              field: "password",
            },
            {
              id: "password_confirmation",
              label: "Confirm password",
              type: "password",
              placeholder: "Repeat your password",
              field: "password_confirmation",
            },
          ].map(({ id, label, type, placeholder, field }) => (
            <div
              key={id}
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <label
                htmlFor={id}
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#6B687E",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {label}
              </label>
              <input
                id={id}
                type={type}
                placeholder={placeholder}
                value={form[field as keyof typeof form]}
                onChange={set(field)}
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  fontSize: "14px",
                  color: "#16151F",
                  background: "#F8F8FA",
                  border: `1.5px solid ${errors[field] ? "#E5484D" : "#E4E4E8"}`,
                  borderRadius: "10px",
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
              {errors[field] && (
                <p style={{ fontSize: "12px", color: "#E5484D" }}>
                  {errors[field]}
                </p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "4px",
              background: loading ? "#B8B0F0" : "#7C6FE0",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 600,
              border: "none",
              borderRadius: "10px",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              letterSpacing: "-0.01em",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            {loading ? "Creating account…" : "Create account →"}
          </button>
        </form>

        {/* Footer */}
        <div
          style={{
            marginTop: "24px",
            paddingTop: "20px",
            borderTop: "1px solid #F2F2F4",
            textAlign: "center",
            fontSize: "13px",
            color: "#A09DB8",
          }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            style={{
              color: "#7C6FE0",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
