"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

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
          maxWidth: "400px",
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
          Welcome back
        </h1>
        <p style={{ fontSize: "13px", color: "#A09DB8", marginBottom: "24px" }}>
          Sign in to manage your events
        </p>

        {/* Error */}
        {error && (
          <div
            style={{
              marginBottom: "20px",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              padding: "12px 14px",
              background: "#FFF0F0",
              border: "1px solid #FCCFD0",
              borderRadius: "10px",
              fontSize: "13px",
              color: "#E5484D",
            }}
          >
            <svg
              style={{ flexShrink: 0, marginTop: "1px" }}
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
            >
              <circle cx="8" cy="8" r="7" stroke="#E5484D" strokeWidth="1.4" />
              <path
                d="M8 5v3.5M8 11h.01"
                stroke="#E5484D"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          {[
            {
              id: "email",
              label: "Email address",
              type: "email",
              placeholder: "you@example.com",
              value: email,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value),
              autoComplete: "email",
            },
            {
              id: "password",
              label: "Password",
              type: "password",
              placeholder: "Your password",
              value: password,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value),
              autoComplete: "current-password",
            },
          ].map(
            ({
              id,
              label,
              type,
              placeholder,
              value,
              onChange,
              autoComplete,
            }) => (
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
                  value={value}
                  onChange={onChange}
                  autoComplete={autoComplete}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    fontSize: "14px",
                    color: "#16151F",
                    background: "#F8F8FA",
                    border: "1.5px solid #E4E4E8",
                    borderRadius: "10px",
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                />
              </div>
            ),
          )}

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
            {loading ? "Signing in…" : "Sign in →"}
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
          No account?{" "}
          <Link
            href="/register"
            style={{
              color: "#7C6FE0",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Create one free
          </Link>
        </div>
      </div>
    </div>
  );
}
