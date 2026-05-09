"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@/lib/axios";
import Matter from "matter-js";
import Pusher from "pusher-js";

interface SprayEvent {
  id: string;
  guest_name: string;
  amount: number;
  note_type: string;
  message?: string;
}

// Naira note colors by denomination
const NOTE_COLORS: Record<string, string> = {
  "100": "#3D9970",
  "200": "#7C6FE0",
  "500": "#E67E22",
  "1000": "#C0392B",
};

const NOTE_LABELS: Record<string, string> = {
  "100": "₦100",
  "200": "₦200",
  "500": "₦500",
  "1000": "₦1000",
};

// Quick spray amounts
const SPRAY_AMOUNTS = [
  { label: "₦100", amount: 100, note: "100" },
  { label: "₦200", amount: 200, note: "200" },
  { label: "₦500", amount: 500, note: "500" },
  { label: "₦1000", amount: 1000, note: "1000" },
];

export default function SprayPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const canvasRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);

  const [guestName, setGuestName] = useState("");
  const [guestToken, setGuestToken] = useState("");
  const [balance, setBalance] = useState(0);
  const [eventTitle, setEventTitle] = useState("");
  const [spraying, setSpraying] = useState(false);
  const [lastSpray, setLastSpray] = useState<string | null>(null);
  const [feedItems, setFeedItems] = useState<SprayEvent[]>([]);
  const [noSession, setNoSession] = useState(false);

  // Load session from storage
  useEffect(() => {
    const name = sessionStorage.getItem("owambe_guest_name");
    const token = sessionStorage.getItem("owambe_guest_token");
    const bal = sessionStorage.getItem("owambe_balance");
    const evSlug = sessionStorage.getItem("owambe_event_slug");

    if (!name || !token || evSlug !== slug) {
      setNoSession(true);
      return;
    }

    setGuestName(name);
    setGuestToken(token);
    setBalance(parseFloat(bal || "0"));

    // Fetch event title
    axios
      .get(`/api/events/${slug}`)
      .then((r) => setEventTitle(r.data.event.title));

    // Load recent sprays
    axios
      .get(`/api/events/${slug}/sprays`)
      .then((r) => setFeedItems(r.data.sprays.slice(0, 10)));
  }, [slug]);

  // Setup Matter.js physics
  useEffect(() => {
    if (!canvasRef.current || noSession) return;

    const { Engine, Render, Runner, Bodies, World, Body } = Matter;

    const W = canvasRef.current.offsetWidth || 600;
    const H = canvasRef.current.offsetHeight || 400;

    const engine = Engine.create({ gravity: { y: 0.8 } });
    const render = Render.create({
      element: canvasRef.current,
      engine,
      options: {
        width: W,
        height: H,
        wireframes: false,
        background: "transparent",
      },
    });

    // Floor
    const floor = Bodies.rectangle(W / 2, H + 25, W, 50, {
      isStatic: true,
      render: { fillStyle: "transparent" },
    });
    World.add(engine.world, [floor]);

    const runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);

    engineRef.current = engine;
    renderRef.current = render;
    runnerRef.current = runner;

    return () => {
      Render.stop(render);
      Runner.stop(runner);
      Engine.clear(engine);
      render.canvas.remove();
    };
  }, [noSession]);

  // Spawn notes on the canvas
  const spawnNotes = useCallback((amount: number, noteType: string) => {
    if (!engineRef.current) return;
    const { Bodies, World, Body } = Matter;

    const W = canvasRef.current?.offsetWidth || 600;
    const count = Math.min(Math.ceil(amount / parseInt(noteType)), 20);
    const color = NOTE_COLORS[noteType] || "#7C6FE0";
    const label = NOTE_LABELS[noteType] || `₦${noteType}`;

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const x = Math.random() * W;
        const note = Bodies.rectangle(x, -20, 56, 28, {
          restitution: 0.4,
          friction: 0.3,
          render: {
            fillStyle: color,
            strokeStyle: "rgba(255,255,255,0.2)",
            lineWidth: 1,
          },
        });

        // Random spin and velocity
        Body.setVelocity(note, {
          x: (Math.random() - 0.5) * 8,
          y: Math.random() * 4 + 2,
        });
        Body.setAngularVelocity(note, (Math.random() - 0.5) * 0.3);

        World.add(engineRef.current!.world, note);

        // Remove note after 4 seconds so canvas doesn't fill up
        setTimeout(() => {
          World.remove(engineRef.current!.world, note);
        }, 4000);
      }, i * 60);
    }
  }, []);

  // Subscribe to Reverb for real-time sprays
  useEffect(() => {
    if (noSession || !guestToken) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_REVERB_APP_KEY!, {
      wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || "localhost",
      wsPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || "8080"),
      forceTLS: false,
      disableStats: true,
      enabledTransports: ["ws"],
      cluster: "mt1",
    });

    const channel = pusher.subscribe(`event.${slug}`);

    channel.bind("money.sprayed", (data: SprayEvent) => {
      spawnNotes(data.amount, data.note_type);
      setFeedItems((prev) => [data, ...prev].slice(0, 20));
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`event.${slug}`);
      pusher.disconnect();
    };
  }, [slug, guestToken, noSession, spawnNotes]);

  const handleSpray = async (amount: number, noteType: string) => {
    if (balance < amount) {
      setLastSpray(
        `Insufficient balance. You have ₦${balance.toLocaleString()}.`,
      );
      return;
    }

    setSpraying(true);
    setLastSpray(null);

    try {
      const res = await axios.post(`/api/events/${slug}/spray`, {
        guest_token: guestToken,
        amount,
        note_type: noteType,
      });

      setBalance(res.data.remaining_balance);
      sessionStorage.setItem(
        "owambe_balance",
        String(res.data.remaining_balance),
      );
      spawnNotes(amount, noteType);
      setLastSpray(`✓ ₦${amount.toLocaleString()} sprayed!`);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setLastSpray(err.response?.data?.message ?? "Spray failed.");
    } finally {
      setSpraying(false);
    }
  };

  if (noSession) {
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
          <p style={{ fontSize: "36px", marginBottom: "12px" }}>🎊</p>
          <p
            style={{
              fontSize: "15px",
              fontWeight: 700,
              color: "#16151F",
              marginBottom: "6px",
            }}
          >
            No session found
          </p>
          <p
            style={{ fontSize: "13px", color: "#A09DB8", marginBottom: "20px" }}
          >
            Please join the event first.
          </p>
          <button
            onClick={() => router.push(`/event/${slug}`)}
            style={{
              padding: "10px 24px",
              fontSize: "13px",
              fontWeight: 600,
              color: "#fff",
              background: "#7C6FE0",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Go back to event
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#16151F",
        fontFamily: "Inter, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Nav */}
      <header
        style={{
          padding: "0 20px",
          height: "52px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #2A2A2A",
          flexShrink: 0,
        }}
      >
        <div>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            {eventTitle || "Loading…"}
          </p>
          <p style={{ fontSize: "11px", color: "#555", marginTop: "2px" }}>
            Hey, {guestName} 👋
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "11px", color: "#555", marginBottom: "1px" }}>
            Balance
          </p>
          <p
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#7C6FE0",
              letterSpacing: "-0.03em",
            }}
          >
            ₦{balance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </header>

      {/* Physics canvas */}
      <div
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          minHeight: "280px",
        }}
      >
        <div
          ref={canvasRef}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            inset: 0,
          }}
        />

        {/* Overlay hint */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <p style={{ fontSize: "36px", marginBottom: "8px" }}>💸</p>
          <p style={{ fontSize: "13px", color: "#555", fontWeight: 500 }}>
            Tap to spray money
          </p>
        </div>
      </div>

      {/* Spray controls */}
      <div
        style={{
          background: "#1A1A1A",
          borderTop: "1px solid #2A2A2A",
          padding: "16px 20px",
          flexShrink: 0,
        }}
      >
        {lastSpray && (
          <p
            style={{
              fontSize: "12px",
              color: lastSpray.startsWith("✓") ? "#30A46C" : "#E5484D",
              marginBottom: "10px",
              textAlign: "center",
              fontWeight: 500,
            }}
          >
            {lastSpray}
          </p>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: "8px",
            marginBottom: "10px",
          }}
        >
          {SPRAY_AMOUNTS.map(({ label, amount, note }) => {
            const color = NOTE_COLORS[note];
            const canAfford = balance >= amount;
            return (
              <button
                key={note}
                onClick={() => handleSpray(amount, note)}
                disabled={spraying || !canAfford}
                style={{
                  padding: "12px 6px",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: canAfford ? "#fff" : "#444",
                  background: canAfford ? color : "#1E1E1E",
                  border: "none",
                  borderRadius: "10px",
                  cursor: canAfford && !spraying ? "pointer" : "not-allowed",
                  fontFamily: "inherit",
                  opacity: spraying ? 0.7 : 1,
                  transition: "all .15s",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <p style={{ fontSize: "11px", color: "#333", textAlign: "center" }}>
          Each tap sprays one denomination · Balance auto-deducted
        </p>
      </div>

      {/* Live feed */}
      {feedItems.length > 0 && (
        <div
          style={{
            background: "#111",
            borderTop: "1px solid #1E1E1E",
            padding: "12px 20px",
            maxHeight: "140px",
            overflowY: "auto",
            flexShrink: 0,
          }}
        >
          <p
            style={{
              fontSize: "10px",
              fontWeight: 600,
              color: "#444",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "8px",
            }}
          >
            Live sprays
          </p>
          {feedItems.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "6px",
              }}
            >
              <p style={{ fontSize: "12px", color: "#888" }}>
                <span style={{ color: "#ccc", fontWeight: 600 }}>
                  {item.guest_name}
                </span>{" "}
                sprayed
              </p>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: NOTE_COLORS[item.note_type] || "#7C6FE0",
                }}
              >
                ₦{item.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
