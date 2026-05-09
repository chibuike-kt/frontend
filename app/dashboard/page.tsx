'use client'

import { useAuth } from '@/hooks/useAuth'

const S = {
  page: {
    minHeight: '100vh',
    background: '#F2F2F4',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  nav: {
    background: '#fff',
    borderBottom: '1px solid #E4E4E8',
    padding: '0 24px',
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
  },

  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  navLogoBox: {
    width: '28px',
    height: '28px',
    background: '#7C6FE0',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  } as React.CSSProperties,

  navName: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#16151F',
    letterSpacing: '-0.03em',
  },

  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  avatar: {
    width: '30px',
    height: '30px',
    background: '#EFEDFA',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 700,
    color: '#7C6FE0',
    flexShrink: 0,
  } as React.CSSProperties,

  userName: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#6B687E',
  },

  signOutBtn: {
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B687E',
    background: 'transparent',
    border: '1.5px solid #E4E4E8',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  } as React.CSSProperties,

  main: {
    maxWidth: '680px',
    margin: '0 auto',
    padding: '40px 24px',
  },

  eyebrow: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#7C6FE0',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },

  eyebrowDot: {
    width: '5px',
    height: '5px',
    background: '#7C6FE0',
    borderRadius: '50%',
    display: 'inline-block',
  },

  heading: {
    fontSize: '26px',
    fontWeight: 700,
    color: '#16151F',
    letterSpacing: '-0.04em',
    lineHeight: 1.2,
    marginBottom: '6px',
  },

  subheading: {
    fontSize: '14px',
    color: '#A09DB8',
    marginBottom: '32px',
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '16px',
  },

  statCard: {
    background: '#fff',
    border: '1px solid #E4E4E8',
    borderRadius: '14px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,.04)',
  },

  statIconBox: {
    width: '28px',
    height: '28px',
    background: '#EFEDFA',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
  } as React.CSSProperties,

  statValue: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#16151F',
    letterSpacing: '-0.04em',
    lineHeight: 1,
    marginBottom: '4px',
  },

  statLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B687E',
    marginBottom: '2px',
  },

  statNote: {
    fontSize: '10px',
    color: '#C4C2D4',
  },

  infoCard: {
    background: '#fff',
    border: '1px solid #E4E4E8',
    borderRadius: '14px',
    boxShadow: '0 1px 3px rgba(0,0,0,.04)',
    overflow: 'hidden',
    marginTop: '12px',
  },

  infoHeader: {
    padding: '12px 20px',
    borderBottom: '1px solid #F2F2F4',
  },

  infoHeaderText: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#A09DB8',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
  },

  infoRow: {
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    borderTop: '1px solid #F2F2F4',
  },

  infoLabel: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#A09DB8',
    flexShrink: 0,
  },

  infoValue: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#16151F',
    textAlign: 'right' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },

  infoValueMono: {
    fontSize: '11px',
    fontWeight: 400,
    color: '#6B687E',
    fontFamily: 'ui-monospace, monospace',
    textAlign: 'right' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
}

const stats = [
  {
    label: 'Wallet balance',
    value: '₦0',
    note: 'Unlocks Phase 2',
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="4" width="14" height="10" rx="2" stroke="#7C6FE0" strokeWidth="1.4"/>
        <path d="M11 9a1 1 0 110-2 1 1 0 010 2z" fill="#7C6FE0"/>
        <path d="M4 4V3a2 2 0 014 0v1" stroke="#7C6FE0" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    label: 'Total received',
    value: '₦0',
    note: 'Unlocks Phase 4',
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M8 1v14M1 8l7-7 7 7" stroke="#7C6FE0" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: 'Events',
    value: '0',
    note: 'Unlocks Phase 3',
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="3" width="14" height="12" rx="2" stroke="#7C6FE0" strokeWidth="1.4"/>
        <path d="M5 1v3M11 1v3M1 7h14" stroke="#7C6FE0" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()

  if (loading) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: '20px', height: '20px',
          borderRadius: '50%',
          border: '2px solid #E4E4E8',
          borderTopColor: '#7C6FE0',
          animation: 'spin 0.7s linear infinite',
        }}/>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '14px', color: '#A09DB8' }}>
          Not authenticated.{' '}
          <a href="/login" style={{ color: '#7C6FE0', fontWeight: 600 }}>Log in</a>
        </p>
      </div>
    )
  }

  return (
    <div style={S.page}>

      {/* Nav */}
      <header style={S.nav}>
        <div style={S.navLeft}>
          <div style={S.navLogoBox}>
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7" stroke="#fff" strokeWidth="1.4"/>
              <path d="M6 9l2 2 4-4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={S.navName}>OwambePay</span>
        </div>

        <div style={S.navRight}>
          <div style={S.avatar}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span style={S.userName}>{user.name}</span>
          <button style={S.signOutBtn} onClick={logout}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sign out
          </button>
        </div>
      </header>

      {/* Main */}
      <main style={S.main}>

        {/* Greeting */}
        <div style={S.eyebrow}>
          <span style={S.eyebrowDot}/>
          Host dashboard
        </div>
        <h1 style={S.heading}>
          Hey, {user.name.split(' ')[0]} 👋
        </h1>
        <p style={S.subheading}>
          Your workspace is ready. Features unlock phase by phase.
        </p>

        {/* Stats */}
        <div style={S.statsGrid}>
          {stats.map(({ label, value, note, icon }) => (
            <div key={label} style={S.statCard}>
              <div style={S.statIconBox}>{icon}</div>
              <p style={S.statValue}>{value}</p>
              <p style={S.statLabel}>{label}</p>
              <p style={S.statNote}>{note}</p>
            </div>
          ))}
        </div>

        {/* Account info */}
        <div style={S.infoCard}>
          <div style={S.infoHeader}>
            <p style={S.infoHeaderText}>Account details</p>
          </div>
          {[
            { label: 'Name',  value: user.name,  mono: false },
            { label: 'Email', value: user.email, mono: false },
            { label: 'ID',    value: user.id,    mono: true  },
          ].map(({ label, value, mono }) => (
            <div key={label} style={S.infoRow}>
              <span style={S.infoLabel}>{label}</span>
              <span style={mono ? S.infoValueMono : S.infoValue}>{value}</span>
            </div>
          ))}
        </div>

      </main>
    </div>
  )
}
