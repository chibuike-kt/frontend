'use client'

import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'
import axios from '@/lib/axios'
import QRCode from 'qrcode'

interface Wallet {
  id: string
  currency: string
  balance: string
  available_balance: string
  status: string
}

interface Event {
  id: string
  title: string
  slug: string
  status: 'active' | 'ended' | 'draft' | 'cancelled'
  join_url: string
  qr_code_url: string
  total_received: number | null
  spray_count: number | null
  starts_at: string
  created_at: string
}

function fmt(amount: string | number | null | undefined, currency = 'NGN'): string {
  const raw = amount ?? 0
  const num = typeof raw === 'string' ? parseFloat(raw) || 0 : raw
  return currency === 'NGN'
    ? `₦${num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const STATUS: Record<string, { bg: string; color: string; label: string }> = {
  active:    { bg: '#F0FAF5', color: '#30A46C', label: 'Active'    },
  ended:     { bg: '#F8F8FA', color: '#A09DB8', label: 'Ended'     },
  draft:     { bg: '#FFF8E6', color: '#D97706', label: 'Draft'     },
  cancelled: { bg: '#FFF0F0', color: '#E5484D', label: 'Cancelled' },
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const page: React.CSSProperties = {
  minHeight: '100vh', background: '#F2F2F4', fontFamily: 'Inter, sans-serif',
}
const nav: React.CSSProperties = {
  background: '#fff', borderBottom: '1px solid #E4E4E8',
  padding: '0 24px', height: '56px',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  position: 'sticky', top: 0, zIndex: 10,
}
const navLeft: React.CSSProperties  = { display: 'flex', alignItems: 'center', gap: '8px' }
const navRight: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '12px' }
const logoBox: React.CSSProperties  = {
  width: '28px', height: '28px', background: '#7C6FE0',
  borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
}
const navName: React.CSSProperties  = { fontSize: '15px', fontWeight: 700, color: '#16151F', letterSpacing: '-0.03em' }
const avatar: React.CSSProperties   = {
  width: '30px', height: '30px', background: '#EFEDFA', borderRadius: '8px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '11px', fontWeight: 700, color: '#7C6FE0',
}
const signOutBtn: React.CSSProperties = {
  padding: '6px 12px', fontSize: '12px', fontWeight: 600, color: '#6B687E',
  background: 'transparent', border: '1.5px solid #E4E4E8', borderRadius: '8px',
  cursor: 'pointer', fontFamily: 'inherit',
}
const main: React.CSSProperties = { maxWidth: '720px', margin: '0 auto', padding: '40px 24px' }
const card: React.CSSProperties = {
  background: '#fff', border: '1px solid #E4E4E8',
  borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,.04)',
}
const input: React.CSSProperties = {
  width: '100%', padding: '10px 14px', fontSize: '14px', color: '#16151F',
  background: '#F8F8FA', border: '1.5px solid #E4E4E8', borderRadius: '10px',
  outline: 'none', fontFamily: 'inherit',
}
const label: React.CSSProperties = {
  fontSize: '11px', fontWeight: 600, color: '#6B687E',
  textTransform: 'uppercase', letterSpacing: '0.04em',
}
const primaryBtn = (disabled = false): React.CSSProperties => ({
  padding: '10px 20px', fontSize: '13px', fontWeight: 600,
  color: '#fff', background: disabled ? '#B8B0F0' : '#7C6FE0',
  border: 'none', borderRadius: '10px',
  cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
})
const ghostBtn: React.CSSProperties = {
  padding: '5px 10px', fontSize: '11px', fontWeight: 600,
  color: '#7C6FE0', background: '#EFEDFA', border: 'none',
  borderRadius: '7px', cursor: 'pointer', fontFamily: 'inherit',
}
const mutedBtn: React.CSSProperties = {
  padding: '5px 10px', fontSize: '11px', fontWeight: 600,
  color: '#6B687E', background: '#F2F2F4', border: 'none',
  borderRadius: '7px', cursor: 'pointer', fontFamily: 'inherit',
}
const spinner: React.CSSProperties = {
  width: '20px', height: '20px', borderRadius: '50%',
  border: '2px solid #E4E4E8', borderTopColor: '#7C6FE0',
  animation: 'spin 0.7s linear infinite',
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()

  const [wallets,      setWallets]      = useState<Wallet[]>([])
  const [events,       setEvents]       = useState<Event[]>([])
  const [dataLoading,  setDataLoading]  = useState(true)

  // Fund wallet
  const [fundAmt,   setFundAmt]   = useState('')
  const [funding,   setFunding]   = useState(false)
  const [fundMsg,   setFundMsg]   = useState('')

  // Create event
  const [showCreate,   setShowCreate]   = useState(false)
  const [eventTitle,   setEventTitle]   = useState('')
  const [eventDesc,    setEventDesc]    = useState('')
  const [creating,     setCreating]     = useState(false)
  const [createError,  setCreateError]  = useState('')

  // QR modal
  const [showQr,    setShowQr]    = useState<Event | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState('')

  // ── Data fetching ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!user) return
    Promise.all([
      axios.get('/api/wallets'),
      axios.get('/api/events'),
    ]).then(([wRes, eRes]) => {
      setWallets(wRes.data.wallets)
      setEvents(eRes.data.events)
    }).finally(() => setDataLoading(false))
  }, [user])

  // QR generation — runs whenever modal opens
  useEffect(() => {
    if (!showQr) { setQrDataUrl(''); return }
    QRCode.toDataURL(showQr.join_url, {
      width: 280, margin: 2,
      color: { dark: '#16151F', light: '#ffffff' },
    }).then(setQrDataUrl)
  }, [showQr])

  // ── Derived ────────────────────────────────────────────────────────────────

  const ngnWallet      = wallets.find(w => w.currency === 'NGN')
  const totalReceived  = events.reduce((s, e) => s + (e.total_received ?? 0), 0)
  const totalSprays    = events.reduce((s, e) => s + (e.spray_count    ?? 0), 0)
  const activeCount    = events.filter(e => e.status === 'active').length

  // ── Handlers ──────────────────────────────────────────────────────────────

const handleFund = async () => {
  if (!fundAmt || parseFloat(fundAmt) < 100) {
    setFundMsg("Minimum funding amount is ₦100.");
    return;
  }
  setFunding(true);
  setFundMsg("");
  try {
    const res = await axios.post("/api/wallets/initialize", {
      amount: parseFloat(fundAmt),
      currency: "NGN",
    });
    // Redirect to DevWallet payment page
    window.location.href = res.data.authorization_url;
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } };
    setFundMsg(err.response?.data?.message ?? "Failed to initialize payment.");
    setFunding(false);
  }
};

  const handleCreateEvent = async () => {
    if (!eventTitle.trim()) { setCreateError('Event title is required.'); return }
    setCreating(true)
    setCreateError('')
    try {
      const res = await axios.post('/api/events', {
        title: eventTitle.trim(), description: eventDesc.trim() || undefined,
      })
      setEvents(prev => [res.data.event, ...prev])
      setEventTitle('')
      setEventDesc('')
      setShowCreate(false)
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
      const errs = err.response?.data?.errors
      setCreateError(errs ? Object.values(errs)[0][0] : err.response?.data?.message ?? 'Failed to create event.')
    } finally {
      setCreating(false)
    }
  }

  const copyLink = (url: string) => navigator.clipboard.writeText(url)

  // ── Loading / unauthed states ──────────────────────────────────────────────

  if (loading) return (
    <div style={{ ...page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={spinner}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!user) return (
    <div style={{ ...page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: '14px', color: '#A09DB8' }}>
        Not authenticated. <a href="/login" style={{ color: '#7C6FE0', fontWeight: 600 }}>Log in</a>
      </p>
    </div>
  )

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={page}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .ev-row:hover{background:#FAFAFA}`}</style>

      {/* ── Nav ── */}
      <header style={nav}>
        <div style={navLeft}>
          <div style={logoBox}>
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
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
          <span style={navName}>OwambePay</span>
        </div>
        <div style={navRight}>
          <div style={avatar}>{user.name.charAt(0).toUpperCase()}</div>
          <span style={{ fontSize: "13px", fontWeight: 500, color: "#6B687E" }}>
            {user.name}
          </span>
          <button style={signOutBtn} onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      <main style={main}>
        {/* ── Greeting ── */}
        <div style={{ marginBottom: "28px" }}>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#7C6FE0",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "8px",
            }}
          >
            ● Host dashboard
          </p>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 700,
              color: "#16151F",
              letterSpacing: "-0.04em",
              lineHeight: 1.2,
              marginBottom: "4px",
            }}
          >
            Hey, {user.name.split(" ")[0]} 👋
          </h1>
          <p style={{ fontSize: "14px", color: "#A09DB8" }}>
            Manage your events and wallet.
          </p>
        </div>

        {/* ── Stat cards ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          {[
            {
              label: "Wallet balance",
              value: ngnWallet ? fmt(ngnWallet.balance) : "₦0.00",
              note: ngnWallet?.status === "active" ? "● Active" : "—",
              noteColor: "#30A46C",
            },
            {
              label: "Events",
              value: String(events.length),
              note: `${activeCount} active`,
              noteColor: "#A09DB8",
            },
            {
              label: "Total received",
              value: fmt(totalReceived),
              note: `${totalSprays} sprays`,
              noteColor: "#A09DB8",
            },
          ].map(({ label, value, note, noteColor }) => (
            <div key={label} style={{ ...card, padding: "16px" }}>
              <p
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#16151F",
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                  marginBottom: "4px",
                }}
              >
                {value}
              </p>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#6B687E",
                  marginBottom: "2px",
                }}
              >
                {label}
              </p>
              <p style={{ fontSize: "10px", color: noteColor }}>{note}</p>
            </div>
          ))}
        </div>

        {/* ── Fund wallet ── */}
        <div style={{ ...card, padding: "20px", marginBottom: "16px" }}>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#16151F",
              marginBottom: "3px",
            }}
          >
            Fund your wallet
          </p>
          <p
            style={{ fontSize: "12px", color: "#A09DB8", marginBottom: "14px" }}
          >
            Powered by DevWallet · 2% platform fee · Minimum ₦100
          </p>

          <div style={{ display: "flex", gap: "8px" }}>
            <div style={{ flex: 1, position: "relative" }}>
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
                placeholder="0.00"
                value={fundAmt}
                onChange={(e) => {
                  setFundAmt(e.target.value);
                  setFundMsg("");
                }}
                style={{ ...input, paddingLeft: "26px" }}
              />
            </div>
            <button
              onClick={handleFund}
              disabled={funding}
              style={primaryBtn(funding)}
            >
              {funding ? "Redirecting…" : "Pay with DevWallet"}
            </button>
          </div>

          {/* Quick amounts */}
          <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
            {["1000", "2000", "5000", "10000"].map((amt) => (
              <button
                key={amt}
                onClick={() => setFundAmt(amt)}
                style={{
                  flex: 1,
                  padding: "6px 0",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: fundAmt === amt ? "#7C6FE0" : "#6B687E",
                  background: fundAmt === amt ? "#EFEDFA" : "#F8F8FA",
                  border: `1.5px solid ${fundAmt === amt ? "#7C6FE0" : "#E4E4E8"}`,
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                ₦{parseInt(amt).toLocaleString()}
              </button>
            ))}
          </div>

          {fundMsg && (
            <p
              style={{ marginTop: "10px", fontSize: "12px", color: "#E5484D" }}
            >
              {fundMsg}
            </p>
          )}

          {/* Fee preview */}
          {fundAmt && parseFloat(fundAmt) >= 100 && (
            <div
              style={{
                marginTop: "12px",
                padding: "10px 14px",
                background: "#F8F8FA",
                borderRadius: "10px",
                border: "1px solid #E4E4E8",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}
              >
                <span style={{ fontSize: "12px", color: "#A09DB8" }}>
                  Amount
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#16151F",
                    fontWeight: 500,
                  }}
                >
                  ₦{parseFloat(fundAmt).toLocaleString()}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}
              >
                <span style={{ fontSize: "12px", color: "#A09DB8" }}>
                  Platform fee (2%)
                </span>
                <span style={{ fontSize: "12px", color: "#E5484D" }}>
                  −₦
                  {(parseFloat(fundAmt) * 0.02).toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: "6px",
                  borderTop: "1px solid #E4E4E8",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#16151F",
                  }}
                >
                  You receive
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#30A46C",
                  }}
                >
                  ₦
                  {(parseFloat(fundAmt) * 0.98).toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Events ── */}
        <div style={{ ...card, overflow: "hidden" }}>
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #F2F2F4",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <p style={{ fontSize: "13px", fontWeight: 600, color: "#16151F" }}>
              Events
            </p>
            <button
              onClick={() => {
                setShowCreate((v) => !v);
                setCreateError("");
                setEventTitle("");
                setEventDesc("");
              }}
              style={primaryBtn(false)}
            >
              {showCreate ? "Cancel" : "+ New event"}
            </button>
          </div>

          {/* Create form */}
          {showCreate && (
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #F2F2F4",
                background: "#FAFAFE",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                  }}
                >
                  <span style={label}>Event title</span>
                  <input
                    value={eventTitle}
                    onChange={(e) => {
                      setEventTitle(e.target.value);
                      setCreateError("");
                    }}
                    placeholder="Adaeze & Emeka's Wedding"
                    style={input}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                  }}
                >
                  <span style={label}>Description (optional)</span>
                  <input
                    value={eventDesc}
                    onChange={(e) => setEventDesc(e.target.value)}
                    placeholder="A brief note about the celebration"
                    style={input}
                  />
                </div>
                {createError && (
                  <p style={{ fontSize: "12px", color: "#E5484D" }}>
                    {createError}
                  </p>
                )}
                <button
                  onClick={handleCreateEvent}
                  disabled={creating}
                  style={{ ...primaryBtn(creating), alignSelf: "flex-start" }}
                >
                  {creating ? "Creating…" : "Create event"}
                </button>
              </div>
            </div>
          )}

          {/* Event list */}
          {dataLoading ? (
            <div
              style={{
                padding: "40px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div style={spinner} />
            </div>
          ) : events.length === 0 ? (
            <div style={{ padding: "48px 20px", textAlign: "center" }}>
              <p style={{ fontSize: "28px", marginBottom: "10px" }}>🎊</p>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#16151F",
                  marginBottom: "4px",
                }}
              >
                No events yet
              </p>
              <p style={{ fontSize: "12px", color: "#A09DB8" }}>
                Create your first event to get started.
              </p>
            </div>
          ) : (
            events.map((event, i) => {
              const st = STATUS[event.status] ?? STATUS.draft;
              return (
                <div
                  key={event.id}
                  className="ev-row"
                  style={{
                    padding: "14px 20px",
                    borderTop: i === 0 ? "none" : "1px solid #F2F2F4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    transition: "background .1s",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "3px",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#16151F",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {event.title}
                      </p>
                      <span
                        style={{
                          flexShrink: 0,
                          fontSize: "10px",
                          fontWeight: 600,
                          color: st.color,
                          background: st.bg,
                          padding: "2px 8px",
                          borderRadius: "99px",
                        }}
                      >
                        {st.label}
                      </span>
                    </div>
                    <p style={{ fontSize: "12px", color: "#A09DB8" }}>
                      {fmt(event.total_received)} received ·{" "}
                      {event.spray_count ?? 0} sprays
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                    <button
                      onClick={() => copyLink(event.join_url)}
                      style={ghostBtn}
                    >
                      Copy link
                    </button>
                    <button onClick={() => setShowQr(event)} style={mutedBtn}>
                      QR code
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Account details ── */}
        <div style={{ ...card, overflow: "hidden", marginTop: "16px" }}>
          <div
            style={{ padding: "12px 20px", borderBottom: "1px solid #F2F2F4" }}
          >
            <p
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#A09DB8",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Account
            </p>
          </div>
          {[
            { label: "Name", value: user.name, mono: false },
            { label: "Email", value: user.email, mono: false },
            { label: "ID", value: user.id, mono: true },
          ].map(({ label: lbl, value, mono }, i) => (
            <div
              key={lbl}
              style={{
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                borderTop: i === 0 ? "none" : "1px solid #F2F2F4",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#A09DB8",
                  flexShrink: 0,
                }}
              >
                {lbl}
              </span>
              <span
                style={{
                  fontSize: mono ? "11px" : "13px",
                  fontWeight: 500,
                  color: mono ? "#6B687E" : "#16151F",
                  fontFamily: mono ? "ui-monospace,monospace" : "inherit",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  textAlign: "right",
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </main>

      {/* ── QR Modal ── */}
      {showQr && (
        <div
          onClick={() => setShowQr(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "24px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "32px",
              maxWidth: "340px",
              width: "100%",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#16151F",
                marginBottom: "4px",
              }}
            >
              {showQr.title}
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "#A09DB8",
                marginBottom: "20px",
              }}
            >
              Share this so guests can join
            </p>

            {/* QR code */}
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Code"
                style={{
                  width: "200px",
                  height: "200px",
                  margin: "0 auto 20px",
                  display: "block",
                  borderRadius: "8px",
                }}
              />
            ) : (
              <div
                style={{
                  width: "200px",
                  height: "200px",
                  margin: "0 auto 20px",
                  background: "#F8F8FA",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={spinner} />
              </div>
            )}

            {/* Join link */}
            <div
              style={{
                background: "#F8F8FA",
                borderRadius: "10px",
                padding: "10px 14px",
                marginBottom: "16px",
                textAlign: "left",
              }}
            >
              <p
                style={{
                  fontSize: "10px",
                  color: "#A09DB8",
                  marginBottom: "3px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  fontWeight: 600,
                }}
              >
                Join link
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "#7C6FE0",
                  fontWeight: 500,
                  wordBreak: "break-all",
                }}
              >
                {showQr.join_url}
              </p>
            </div>

            <button
              onClick={() => copyLink(showQr.join_url)}
              style={{
                ...primaryBtn(false),
                width: "100%",
                justifyContent: "center",
                marginBottom: "8px",
                display: "flex",
              }}
            >
              Copy link
            </button>
            <button
              onClick={() => setShowQr(null)}
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#6B687E",
                background: "#F2F2F4",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
