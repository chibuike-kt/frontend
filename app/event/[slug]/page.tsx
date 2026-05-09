'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from '@/lib/axios'

interface Event {
  id: string
  title: string
  slug: string
  status: string
  host_name: string
  join_url: string
}

export default function EventPage() {
  const params   = useParams()
  const router   = useRouter()
  const slug     = params.slug as string

  const [event,     setEvent]     = useState<Event | null>(null)
  const [notFound,  setNotFound]  = useState(false)
  const [guestName, setGuestName] = useState('')
  const [joining,   setJoining]   = useState(false)
  const [error,     setError]     = useState('')

  useEffect(() => {
    axios.get(`/api/events/${slug}`)
      .then(r => setEvent(r.data.event))
      .catch(() => setNotFound(true))
  }, [slug])

  const handleJoin = () => {
    if (!guestName.trim()) { setError('Please enter your name.'); return }
    setJoining(true)
    // Store guest name in session storage — used by spray room in Phase 4
    sessionStorage.setItem('owambe_guest_name', guestName.trim())
    sessionStorage.setItem('owambe_event_slug', slug)
    router.push(`/event/${slug}/spray`)
  }

  const spinnerStyle: React.CSSProperties = {
    width: '20px', height: '20px', borderRadius: '50%',
    border: '2px solid #E4E4E8', borderTopColor: '#7C6FE0',
    animation: 'spin 0.7s linear infinite',
  }

  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', background: '#F2F2F4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', padding: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '32px', marginBottom: '12px' }}>🎊</p>
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#16151F', marginBottom: '6px' }}>Event not found</p>
          <p style={{ fontSize: '13px', color: '#A09DB8' }}>This event link may have expired or is invalid.</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div style={{ minHeight: '100vh', background: '#F2F2F4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
        <div style={spinnerStyle}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  const isEnded = event.status === 'ended'

  return (
    <div style={{ minHeight: '100vh', background: '#F2F2F4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Inter, sans-serif' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '48px', height: '48px', background: '#7C6FE0', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <span style={{ fontSize: '24px' }}>💸</span>
          </div>
          <p style={{ fontSize: '12px', fontWeight: 600, color: '#A09DB8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            OwambePay · You're invited
          </p>
        </div>

        <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #E4E4E8', boxShadow: '0 1px 2px rgba(0,0,0,.04), 0 4px 20px rgba(0,0,0,.06)', padding: '32px' }}>

          {/* Event info */}
          <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #F2F2F4' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#7C6FE0', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
              {isEnded ? 'Event ended' : '● Live now'}
            </p>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#16151F', letterSpacing: '-0.03em', marginBottom: '4px', lineHeight: 1.2 }}>
              {event.title}
            </h1>
            <p style={{ fontSize: '13px', color: '#A09DB8' }}>
              Hosted by <span style={{ color: '#6B687E', fontWeight: 500 }}>{event.host_name}</span>
            </p>
          </div>

          {isEnded ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <p style={{ fontSize: '32px', marginBottom: '10px' }}>🎉</p>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#16151F', marginBottom: '4px' }}>This event has ended</p>
              <p style={{ fontSize: '13px', color: '#A09DB8' }}>Thank you for celebrating with us!</p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#16151F', marginBottom: '6px' }}>
                Enter your name to join
              </p>
              <p style={{ fontSize: '12px', color: '#A09DB8', marginBottom: '16px' }}>
                No account needed. You'll be able to spray money once inside.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#6B687E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Your name
                </label>
                <input
                  value={guestName}
                  onChange={e => { setGuestName(e.target.value); setError('') }}
                  placeholder="Chidi Okeke"
                  onKeyDown={e => e.key === 'Enter' && handleJoin()}
                  style={{ width: '100%', padding: '11px 14px', fontSize: '14px', color: '#16151F', background: '#F8F8FA', border: `1.5px solid ${error ? '#E5484D' : '#E4E4E8'}`, borderRadius: '10px', outline: 'none', fontFamily: 'inherit' }}
                />
                {error && <p style={{ fontSize: '12px', color: '#E5484D' }}>{error}</p>}
              </div>
              <button
                onClick={handleJoin}
                disabled={joining}
                style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: 600, color: '#fff', background: joining ? '#B8B0F0' : '#7C6FE0', border: 'none', borderRadius: '10px', cursor: joining ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                {joining ? 'Joining…' : 'Join celebration 🎊'}
              </button>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#C4C2D4', marginTop: '20px' }}>
          Powered by OwambePay
        </p>
      </div>
    </div>
  )
}
