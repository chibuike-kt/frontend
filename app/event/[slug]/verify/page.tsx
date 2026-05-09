"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import axios from "@/lib/axios";

export default function GuestVerifyPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;

  const reference = searchParams.get("reference") || "";
  const guestName =
    searchParams.get("guest_name") ||
    sessionStorage.getItem("owambe_guest_name") ||
    "";
  const fundAmount =
    searchParams.get("fund_amount") ||
    sessionStorage.getItem("owambe_fund_amount") ||
    "0";

  const [status, setStatus] = useState<"verifying" | "success" | "failed">(
    "verifying",
  );
  const [message, setMessage] = useState("");
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    if (!reference || !guestName) {
      setStatus("failed");
      setMessage("Missing payment reference or guest name.");
      return;
    }

    axios
      .post(`/api/events/${slug}/verify-guest`, {
        reference,
        guest_name: guestName,
        fund_amount: parseFloat(fundAmount),
      })
      .then((res) => {
        // Store session for spray room
        sessionStorage.setItem("owambe_guest_name", guestName);
        sessionStorage.setItem("owambe_guest_token", res.data.guest_token);
        sessionStorage.setItem("owambe_wallet_id", res.data.wallet_id);
        sessionStorage.setItem("owambe_balance", String(res.data.balance));
        sessionStorage.setItem("owambe_event_slug", slug);

        const bal = parseFloat(res.data.balance);
        setBalance(
          `₦${bal.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`,
        );
        setStatus("success");
        setMessage(res.data.message);
      })
      .catch((err) => {
        setStatus("failed");
        setMessage(
          err.response?.data?.message ?? "Payment verification failed.",
        );
      });
  }, [slug, reference, guestName, fundAmount]);

  const spin: React.CSSProperties = {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: "3px solid #E4E4E8",
    borderTopColor: "#7C6FE0",
    animation: "spin 0.7s linear infinite",
    margin: "0 auto 20px",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F2F2F4",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
        padding: "24px",
      }}
    >
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          border: "1px solid #E4E4E8",
          boxShadow: "0 4px 24px rgba(0,0,0,.06)",
          padding: "40px 36px",
          maxWidth: "380px",
          width: "100%",
          textAlign: "center",
        }}
      >
        {status === "verifying" && (
          <>
            <div style={spin} />
            <p
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#16151F",
                marginBottom: "6px",
              }}
            >
              Confirming your payment…
            </p>
            <p style={{ fontSize: "13px", color: "#A09DB8" }}>
              Please wait while we set up your spray wallet.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div
              style={{
                width: "56px",
                height: "56px",
                background: "#F0FAF5",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#30A46C"
                  strokeWidth="1.5"
                />
                <path
                  d="M8 12l3 3 5-5"
                  stroke="#30A46C"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#16151F",
                marginBottom: "6px",
              }}
            >
              Payment confirmed!
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "#A09DB8",
                marginBottom: "8px",
              }}
            >
              Welcome, <strong style={{ color: "#16151F" }}>{guestName}</strong>{" "}
              🎊
            </p>
            {balance && (
              <p
                style={{
                  fontSize: "28px",
                  fontWeight: 700,
                  color: "#30A46C",
                  letterSpacing: "-0.04em",
                  marginBottom: "4px",
                }}
              >
                {balance}
              </p>
            )}
            <p
              style={{
                fontSize: "12px",
                color: "#A09DB8",
                marginBottom: "28px",
              }}
            >
              ready to spray
            </p>
            <button
              onClick={() => router.push(`/event/${slug}/spray`)}
              style={{
                width: "100%",
                padding: "13px",
                fontSize: "14px",
                fontWeight: 700,
                color: "#fff",
                background: "#7C6FE0",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Enter the celebration 💸
            </button>
          </>
        )}

        {status === "failed" && (
          <>
            <div
              style={{
                width: "56px",
                height: "56px",
                background: "#FFF0F0",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#E5484D"
                  strokeWidth="1.5"
                />
                <path
                  d="M12 7v5M12 16h.01"
                  stroke="#E5484D"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#16151F",
                marginBottom: "6px",
              }}
            >
              Payment failed
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "#A09DB8",
                marginBottom: "28px",
              }}
            >
              {message}
            </p>
            <button
              onClick={() => router.push(`/event/${slug}`)}
              style={{
                width: "100%",
                padding: "13px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#6B687E",
                background: "#F2F2F4",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Try again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
