'use client'

import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'
import axios from '@/lib/axios'

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
  total_received: number
  spray_count: number
  starts_at: string
  created_at: string
}

function formatAmount(amount: string | number, currency = 'NGN'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return currency === 'NGN'
    ? `₦${num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const statusColors: Record<string, { bg: string; color: string; label: string }> = {
  active:    { bg: '#F0FAF5', color: '#30A46C', label: 'Active'    },
  ended:     { bg: '#F8F8FA', color: '#A09DB8', label: 'Ended'     },
  draft:     { bg: '#FFF8E6', color: '#D97706', label: 'Draft'     },
  cancelled: { bg: '#FFF0F0', color: '#E5484D', label: 'Cancelled' },
}

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()

  const [wallets,       setWallets]       = useState<Wallet[]>([])
  const [events,        setEvents]        = useState<Event[]>([])
  const [loadingData,   setLoadingData]   = useState(true)
  const [showCreateForm, setShowCreate]   = useState(false)
  const [showQr,        setShowQr]        = useState<Event | null>(null)
  const [eventTitle,    setEventTitle]    = useState('')
  const [eventDesc,     setEventDesc]     = useState('')
  const [creating,      setCreating]      = useState(false)
  const [createError,   setCreateError]   = useState('')
  const [funding,       setFunding]       = useState(false)
  const [fundAmt,       setFundAmt]       = useState('')
  const [fundMsg,       setFundMsg]       = useState('')

  useEffect(() => {
    if (!user) return
    Promise.all([
      axios.get('/api/wallets'),
      axios.get('/api/events'),
    ]).then(([walletRes, eventRes]) => {
      setWallets(walletRes.data.wallets)
      setEvents(eventRes.data.events)
    }).finally(() => setLoadingData(false))
  }, [user])

  const ngnWallet = wallets.find(w => w.currency === 'NGN')

  const handleFund = async () => {
    if (!fundAmt || parseFloat(fundAmt) < 100) {
      setFundMsg('Minimum funding amount is ₦100.')
      return
    }
    setFunding(true)
    setFundMsg('')
    try {
      const res = await axios.post('/api/wallets/fund', {
        amount: parseFloat(fundAmt), currency: 'NGN',
      })
      setWallets(prev => prev.map(w => w.id === res.data.wallet.id ? res.data.wallet : w))
      setFundAmt('')
      const credited = (parseFloat(fundAmt) * 0.98).toLocaleString('en-NG', { minimumFractionDigits: 2 })
      setFundMsg(`✓ ₦${credited} credited after 2% fee.`)
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setFundMsg(err.response?.data?.message ?? 'Funding failed.')
    } finally {
      setFunding(false)
    }
  }

  const handleCreateEvent = async () => {
    if (!eventTitle.trim()) { setCreateError('Event title is required.'); return }
    setCreating(true)
    setCreateError('')
    try {
      const res = await axios.post('/api/events', {
        title: eventTitle, description: eventDesc,
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

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url)
  }

  const spinnerStyle: React.CSSProperties = {
    width: '20px', height: '20px', borderRadius: '50%',
    border: '2px solid #E4E4E8', borderTopColor: '#7C6FE0',
    animation: 'spin 0.7s linear infinite',
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F2F2F4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
        <div style={spinnerStyle}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: '#F2F2F4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
        <p style={{ fontSize: '14px', color: '#A09DB8' }}>
          Not authenticated. <a href="/login" style={{ color: '#7C6FE0', fontWeight: 600 }}>Log in</a>
        </p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F2F2F4', fontFamily: 'Inter, sans-serif' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .hover-row:hover{background:#FAFAFA}`}</style>

      {/* Nav */}
      <header style={{ background: '#fff', borderBottom: '1px solid #E4E4E8', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', background: '#7C6FE0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7" stroke="#fff" strokeWidth="1.4"/>
              <path d="M6 9l2 2 4-4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#16151F', letterSpacing: '-0.03em' }}>OwambePay</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '30px', height: '30px', background: '#EFEDFA', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#7C6FE0' }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: '13px', fontWeight: 500, color: '#6B687E' }}>{user.name}</span>
          <button onClick={logout} style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600, color: '#6B687E', background: 'transparent', border: '1.5px solid #E4E4E8', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit' }}>
            Sign out
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Greeting */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#7C6FE0', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
            ● Host dashboard
          </p>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#16151F', letterSpacing: '-0.04em', lineHeight: 1.2, marginBottom: '6px' }}>
            Hey, {user.name.split(' ')[0]} 👋
          </h1>
          <p style={{ fontSize: '14px', color: '#A09DB8' }}>
            Manage your events and wallet from here.
          </p>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            {
              label: 'Wallet balance',
              value: ngnWallet ? formatAmount(ngnWallet.balance) : '₦0.00',
              note: ngnWallet?.status === 'active' ? '● Active' : '—',
              noteColor: '#30A46C',
            },
            {
              label: 'Events',
              value: String(events.length),
              note: `${events.filter(e => e.status === 'active').length} active`,
              noteColor: '#A09DB8',
            },
            {
              label: 'Total received',
              value: formatAmount(events.reduce((sum, e) => sum + e.total_received, 0)),
              note: `${events.reduce((sum, e) => sum + e.spray_count, 0)} sprays`,
              noteColor: '#A09DB8',
            },
          ].map(({ label, value, note, noteColor }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #E4E4E8', borderRadius: '14px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
              <p style={{ fontSize: '22px', fontWeight: 700, color: '#16151F', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '4px' }}>{value}</p>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#6B687E', marginBottom: '2px' }}>{label}</p>
              <p style={{ fontSize: '10px', color: noteColor }}>{note}</p>
            </div>
          ))}
        </div>

        {/* Fund wallet */}
        <div style={{ background: '#fff', border: '1px solid #E4E4E8', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,.04)', marginBottom: '16px' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#16151F', marginBottom: '3px' }}>Fund your wallet</p>
          <p style={{ fontSize: '12px', color: '#A09DB8', marginBottom: '14px' }}>2% platform fee applies · Minimum ₦100</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: '#A09DB8', pointerEvents: 'none' }}>₦</span>
              <input
                type="number" placeholder="0.00" value={fundAmt}
                onChange={e => setFundAmt(e.target.value)}
                style={{ width: '100%', padding: '10px 14px 10px 26px', fontSize: '14px', color: '#16151F', background: '#F8F8FA', border: '1.5px solid #E4E4E8', borderRadius: '10px', outline: 'none', fontFamily: 'inherit' }}
              />
            </div>
            <button onClick={handleFund} disabled={funding}
              style={{ padding: '10px 20px', background: funding ? '#B8B0F0' : '#7C6FE0', color: '#fff', fontSize: '13px', fontWeight: 600, border: 'none', borderRadius: '10px', cursor: funding ? 'not-allowed' : 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              {funding ? 'Processing…' : 'Fund wallet'}
            </button>
          </div>
          {fundMsg && (
            <p style={{ marginTop: '10px', fontSize: '12px', color: fundMsg.startsWith('✓') ? '#30A46C' : '#E5484D' }}>{fundMsg}</p>
          )}
        </div>

        {/* Events */}
        <div style={{ background: '#fff', border: '1px solid #E4E4E8', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,.04)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F2F2F4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#16151F' }}>Events</p>
            <button onClick={() => { setShowCreate(v => !v); setCreateError('') }}
              style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 600, color: '#fff', background: '#7C6FE0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit' }}>
              {showCreateForm ? 'Cancel' : '+ New event'}
            </button>
          </div>

          {/* Create event form */}
          {showCreateForm && (
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F2F2F4', background: '#FAFAFE' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#6B687E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Event title</label>
                  <input value={eventTitle} onChange={e => setEventTitle(e.target.value)}
                    placeholder="Adaeze & Emeka's Wedding"
                    style={{ width: '100%', padding: '10px 14px', fontSize: '14px', color: '#16151F', background: '#fff', border: '1.5px solid #E4E4E8', borderRadius: '10px', outline: 'none', fontFamily: 'inherit' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#6B687E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Description (optional)</label>
                  <input value={eventDesc} onChange={e => setEventDesc(e.target.value)}
                    placeholder="A brief description of the celebration"
                    style={{ width: '100%', padding: '10px 14px', fontSize: '14px', color: '#16151F', background: '#fff', border: '1.5px solid #E4E4E8', borderRadius: '10px', outline: 'none', fontFamily: 'inherit' }}
                  />
                </div>
                {createError && <p style={{ fontSize: '12px', color: '#E5484D' }}>{createError}</p>}
                <button onClick={handleCreateEvent} disabled={creating}
                  style={{ alignSelf: 'flex-start', padding: '10px 20px', fontSize: '13px', fontWeight: 600, color: '#fff', background: creating ? '#B8B0F0' : '#7C6FE0', border: 'none', borderRadius: '10px', cursor: creating ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                  {creating ? 'Creating…' : 'Create event'}
                </button>
              </div>
            </div>
          )}

          {/* Event list */}
          {loadingData ? (
            <div style={{ padding: '32px', display: 'flex', justifyContent: 'center' }}>
              <div style={spinnerStyle}/>
            </div>
          ) : events.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: '#A09DB8' }}>No events yet. Create your first event above.</p>
            </div>
          ) : (
            events.map((event, i) => {
              const st = statusColors[event.status]
              return (
                <div key={event.id} className="hover-row"
                  style={{ padding: '14px 20px', borderTop: i === 0 ? 'none' : '1px solid #F2F2F4', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#16151F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.title}</p>
                      <span style={{ flexShrink: 0, fontSize: '10px', fontWeight: 600, color: st.color, background: st.bg, padding: '2px 7px', borderRadius: '99px' }}>{st.label}</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#A09DB8' }}>
                      {formatAmount(event.total_received)} received · {event.spray_count} sprays
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button onClick={() => handleCopyLink(event.join_url)}
                      style={{ padding: '5px 10px', fontSize: '11px', fontWeight: 600, color: '#7C6FE0', background: '#EFEDFA', border: 'none', borderRadius: '7px', cursor: 'pointer', fontFamily: 'inherit' }}>
                      Copy link
                    </button>
                    <button onClick={() => setShowQr(event)}
                      style={{ padding: '5px 10px', fontSize: '11px', fontWeight: 600, color: '#6B687E', background: '#F2F2F4', border: 'none', borderRadius: '7px', cursor: 'pointer', fontFamily: 'inherit' }}>
                      QR code
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

      </main>

      {/* QR Modal */}
      {showQr && (
        <div onClick={() => setShowQr(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '24px' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: '20px', padding: '32px', maxWidth: '360px', width: '100%', textAlign: 'center' }}>
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#16151F', marginBottom: '4px' }}>{showQr.title}</p>
            <p style={{ fontSize: '12px', color: '#A09DB8', marginBottom: '20px' }}>Guests scan this to join</p>
            <img src={showQr.qr_code_url} alt="QR Code" style={{ width: '200px', height: '200px', margin: '0 auto 20px' }}/>
            <div style={{ background: '#F8F8FA', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px' }}>
              <p style={{ fontSize: '11px', color: '#A09DB8', marginBottom: '3px' }}>Join link</p>
              <p style={{ fontSize: '12px', color: '#7C6FE0', fontWeight: 500, wordBreak: 'break-all' }}>{showQr.join_url}</p>
            </div>
            <button onClick={() => handleCopyLink(showQr.join_url)}
              style={{ width: '100%', padding: '10px', fontSize: '13px', fontWeight: 600, color: '#fff', background: '#7C6FE0', border: 'none', borderRadius: '10px', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '8px' }}>
              Copy link
            </button>
            <button onClick={() => setShowQr(null)}
              style={{ width: '100%', padding: '10px', fontSize: '13px', fontWeight: 600, color: '#6B687E', background: '#F2F2F4', border: 'none', borderRadius: '10px', cursor: 'pointer', fontFamily: 'inherit' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
