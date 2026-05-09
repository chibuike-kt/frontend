"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@/lib/axios";

interface EventData {
  id: string;
  title: string;
  slug: string;
  status: string;
  host_name: string;
}

export default function EventPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [event, setEvent] = useState<EventData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [fundAmount, setFundAmount] = useState("");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState<Record<string, string>>({});

  useEffect(() => {
    axios
      .get(`/api/events/${slug}`)
      .then((r) => setEvent(r.data.event))
      .catch(() => setNotFound(true));
  }, [slug]);

  const handleJoin = async () => {
    const errs: Record<string, string> = {};
    if (!guestName.trim()) errs.name = "Enter your name.";
    if (!fundAmount || parseFloat(fundAmount) < 100)
      errs.amount = "Minimum is ₦100.";
    if (Object.keys(errs).length) {
      setFieldError(errs);
      return;
    }

    setJoining(true);
    setError("");
    setFieldError({});

    try {
      const res = await axios.post(`/api/events/${slug}/join`, {
        guest_name: guestName.trim(),
        fund_amount: parseFloat(fundAmount),
      });

      // Store session data for the spray room
      sessionStorage.setItem("owambe_guest_name", guestName.trim());
      sessionStorage.setItem("owambe_guest_token", res.data.guest_token);
      sessionStorage.setItem("owambe_wallet_id", res.data.wallet_id);
      sessionStorage.setItem("owambe_balance", String(res.data.balance));
      sessionStorage.setItem("owambe_event_slug", slug);

      router.push(`/event/${slug}/spray`);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(
        err.response?.data?.message ?? "Failed to join. Please try again.",
      );
    } finally {
      setJoining(false);
    }
  };

  if (notFound)
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
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "40px", marginBottom: "12px" }}>🎊</p>
          <p
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#16151F",
              marginBottom: "6px",
            }}
          >
            Event not found
          </p>
          <p style={{ fontSize: "13px", color: "#A09DB8" }}>
            This link may have expired or is invalid.
          </p>
        </div>
      </div>
    );

  if (!event)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#F2F2F4",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            border: "2px solid #E4E4E8",
            borderTopColor: "#7C6FE0",
            animation: "spin 0.7s linear infinite",
          }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );

  const isEnded = event.status === "ended";
  const netAmount =
    fundAmount && parseFloat(fundAmount) >= 100
      ? (parseFloat(fundAmount) * 0.98).toLocaleString("en-NG", {
          minimumFractionDigits: 2,
        })
      : null;

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
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              background: "#7C6FE0",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              fontSize: "26px",
            }}
          >
            💸
          </div>
          <p
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#A09DB8",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            OwambePay · You&apos;re invited
          </p>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "20px",
            border: "1px solid #E4E4E8",
            boxShadow: "0 4px 24px rgba(0,0,0,.06)",
            padding: "32px",
          }}
        >
          <div
            style={{
              marginBottom: "24px",
              paddingBottom: "20px",
              borderBottom: "1px solid #F2F2F4",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: isEnded ? "#A09DB8" : "#7C6FE0",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "6px",
              }}
            >
              {isEnded ? "Event ended" : "● Live now"}
            </p>
            <h1
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#16151F",
                letterSpacing: "-0.03em",
                marginBottom: "4px",
                lineHeight: 1.3,
              }}
            >
              {event.title}
            </h1>
            <p style={{ fontSize: "13px", color: "#A09DB8" }}>
              Hosted by{" "}
              <span style={{ color: "#6B687E", fontWeight: 600 }}>
                {event.host_name}
              </span>
            </p>
          </div>

          {isEnded ? (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <p style={{ fontSize: "36px", marginBottom: "10px" }}>🎉</p>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#16151F",
                  marginBottom: "4px",
                }}
              >
                This event has ended
              </p>
              <p style={{ fontSize: "13px", color: "#A09DB8" }}>
                Thank you for celebrating with us!
              </p>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              {error && (
                <div
                  style={{
                    padding: "11px 14px",
                    background: "#FFF0F0",
                    border: "1px solid #FCCFD0",
                    borderRadius: "10px",
                    fontSize: "13px",
                    color: "#E5484D",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Name */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: "5px" }}
              >
                <label
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#6B687E",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Your name
                </label>
                <input
                  value={guestName}
                  onChange={(e) => {
                    setGuestName(e.target.value);
                    setFieldError((p) => ({ ...p, name: "" }));
                  }}
                  placeholder="Chidi Okeke"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    fontSize: "14px",
                    color: "#16151F",
                    background: "#F8F8FA",
                    border: `1.5px solid ${fieldError.name ? "#E5484D" : "#E4E4E8"}`,
                    borderRadius: "10px",
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                />
                {fieldError.name && (
                  <p style={{ fontSize: "12px", color: "#E5484D" }}>
                    {fieldError.name}
                  </p>
                )}
              </div>

              {/* Fund amount */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: "5px" }}
              >
                <label
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#6B687E",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  How much do you want to spray?
                </label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "13px",
                      color: "#A09DB8",
                      pointerEvents: "none",
                    }}
                  >
                    ₦
                  </span>
                  <input
                    type="number"
                    value={fundAmount}
                    onChange={(e) => {
                      setFundAmount(e.target.value);
                      setFieldError((p) => ({ ...p, amount: "" }));
                    }}
                    placeholder="0.00"
                    style={{
                      width: "100%",
                      padding: "10px 14px 10px 28px",
                      fontSize: "14px",
                      color: "#16151F",
                      background: "#F8F8FA",
                      border: `1.5px solid ${fieldError.amount ? "#E5484D" : "#E4E4E8"}`,
                      borderRadius: "10px",
                      outline: "none",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
                {fieldError.amount && (
                  <p style={{ fontSize: "12px", color: "#E5484D" }}>
                    {fieldError.amount}
                  </p>
                )}
                {netAmount && (
                  <p style={{ fontSize: "12px", color: "#30A46C" }}>
                    ✓ You&apos;ll have ₦{netAmount} to spray after 2% fee
                  </p>
                )}
              </div>

              {/* Quick amounts */}
              <div style={{ display: "flex", gap: "6px" }}>
                {["500", "1000", "2000", "5000"].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setFundAmount(amt)}
                    style={{
                      flex: 1,
                      padding: "7px 0",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: fundAmount === amt ? "#7C6FE0" : "#6B687E",
                      background: fundAmount === amt ? "#EFEDFA" : "#F8F8FA",
                      border: `1.5px solid ${fundAmount === amt ? "#7C6FE0" : "#E4E4E8"}`,
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    ₦{parseInt(amt).toLocaleString()}
                  </button>
                ))}
              </div>

              <button
                onClick={handleJoin}
                disabled={joining}
                style={{
                  width: "100%",
                  padding: "13px",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#fff",
                  background: joining ? "#B8B0F0" : "#7C6FE0",
                  border: "none",
                  borderRadius: "10px",
                  cursor: joining ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  marginTop: "4px",
                }}
              >
                {joining ? "Setting up…" : "Enter & start spraying 🎊"}
              </button>

              <p
                style={{
                  fontSize: "11px",
                  color: "#C4C2D4",
                  textAlign: "center",
                }}
              >
                2% platform fee applies on funding
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
