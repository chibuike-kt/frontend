'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from '@/lib/axios'
import Matter from 'matter-js'
import Pusher from 'pusher-js'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SprayEvent {
  id: string
  guest_name: string
  amount: number
  note_type: string
}

interface NoteBody extends Matter.Body {
  noteType?: string
  sprayed?: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

// Display size of each note in physics world (pixels)
const NOTE_W = 120
const NOTE_H = 62

const NOTE_IMAGES: Record<string, string> = {
  '100':  '/notes/100-naira.png',
  '200':  '/notes/200-naira.jpeg',
  '500':  '/notes/500-naira.jpg',
  '1000': '/notes/1000-naira.jpg',
}

// Cache: denom → scaled data URL at NOTE_W × NOTE_H
const scaledCache: Record<string, string> = {}

// ─── Scale image to exact display size ───────────────────────────────────────

function scaleNoteImage(src: string, denom: string): Promise<string> {
  if (scaledCache[denom]) return Promise.resolve(scaledCache[denom])

  return new Promise((resolve, reject) => {
    const img    = new Image()
    img.crossOrigin = 'anonymous'
    img.onload   = () => {
      const canvas  = document.createElement('canvas')
      canvas.width  = NOTE_W
      canvas.height = NOTE_H
      const ctx     = canvas.getContext('2d')!
      // Draw note horizontally scaled to exact NOTE_W × NOTE_H
      ctx.drawImage(img, 0, 0, NOTE_W, NOTE_H)
      const url = canvas.toDataURL('image/png')
      scaledCache[denom] = url
      resolve(url)
    }
    img.onerror  = reject
    img.src      = src
  })
}

async function preloadAll(): Promise<void> {
  await Promise.all(
    Object.entries(NOTE_IMAGES).map(([denom, src]) => scaleNoteImage(src, denom))
  )
}

// ─── Break balance into note denominations ────────────────────────────────────

function calcNotes(balance: number): Array<{ denom: string; value: number; count: number }> {
  const result: Array<{ denom: string; value: number; count: number }> = []
  let rem  = Math.floor(balance)
  const ds = [1000, 500, 200, 100]
  for (const d of ds) {
    if (rem >= d) {
      const count = Math.floor(rem / d)
      result.push({ denom: String(d), value: d, count })
      rem -= count * d
    }
  }
  return result
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SprayPage() {
  const params = useParams()
  const router = useRouter()
  const slug   = params.slug as string

  const wrapRef       = useRef<HTMLDivElement>(null)
  const engineRef     = useRef<Matter.Engine   | null>(null)
  const renderRef     = useRef<Matter.Render   | null>(null)
  const runnerRef     = useRef<Matter.Runner   | null>(null)
  const notesRef      = useRef<NoteBody[]>([])
  const balRef        = useRef(0)
  const swipeRef      = useRef<{ x: number; y: number; t: number } | null>(null)
  const processingRef = useRef(false)
  const imagesReady   = useRef(false)

  const [guestName,  setGuestName]  = useState('')
  const [guestToken, setGuestToken] = useState('')
  const [balance,    setBalance]    = useState(0)
  const [eventTitle, setEventTitle] = useState('')
  const [feedItems,  setFeedItems]  = useState<SprayEvent[]>([])
  const [noSession,  setNoSession]  = useState(false)
  const [pileReady,  setPileReady]  = useState(false)
  const [msg,        setMsg]        = useState('')
  const [msgType,    setMsgType]    = useState<'success' | 'error'>('success')

  useEffect(() => { balRef.current = balance }, [balance])

  // ── Session load ────────────────────────────────────────────────────────────

  useEffect(() => {
    const name   = sessionStorage.getItem('owambe_guest_name')
    const token  = sessionStorage.getItem('owambe_guest_token')
    const bal    = sessionStorage.getItem('owambe_balance')
    const evSlug = sessionStorage.getItem('owambe_event_slug')

    if (!name || !token || evSlug !== slug) { setNoSession(true); return }

    setGuestName(name)
    setGuestToken(token)

    axios.get(`/api/events/${slug}`).then(r => setEventTitle(r.data.event.title))
    axios.get(`/api/events/${slug}/sprays`).then(r => setFeedItems(r.data.sprays.slice(0, 15)))

    // Preload + scale all images before setting balance
    preloadAll().then(() => {
      imagesReady.current = true
      const b = parseFloat(bal || '0')
      balRef.current = b
      setBalance(b)
    })
  }, [slug])

  // ── Physics setup ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!wrapRef.current || noSession) return

    const { Engine, Render, Runner, Bodies, World } = Matter
    const W = wrapRef.current.offsetWidth  || window.innerWidth
    const H = wrapRef.current.offsetHeight || window.innerHeight

    const engine = Engine.create({ gravity: { y: 2.2 } })
    const render = Render.create({
      element: wrapRef.current,
      engine,
      options: { width: W, height: H, wireframes: false, background: 'transparent' },
    })

    const walls = [
      Bodies.rectangle(W / 2, H + 25,  W * 3, 50,   { isStatic: true, render: { fillStyle: 'transparent' } }),
      Bodies.rectangle(-25,   H / 2,   50,    H * 3, { isStatic: true, render: { fillStyle: 'transparent' } }),
      Bodies.rectangle(W + 25, H / 2,  50,    H * 3, { isStatic: true, render: { fillStyle: 'transparent' } }),
    ]
    World.add(engine.world, walls)

    const runner = Runner.create()
    Runner.run(runner, engine)
    Render.run(render)

    render.canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;'

    engineRef.current = engine
    renderRef.current = render
    runnerRef.current = runner

    return () => {
      Render.stop(render)
      Runner.stop(runner)
      Engine.clear(engine)
      if (render.canvas?.parentNode) render.canvas.remove()
      notesRef.current = []
    }
  }, [noSession])

  // ── Spawn pile ──────────────────────────────────────────────────────────────

  const spawnPile = useCallback((bal: number) => {
    if (!engineRef.current || !wrapRef.current || !imagesReady.current) return

    const { Bodies, World, Body } = Matter
    const W  = wrapRef.current.offsetWidth
    const H  = wrapRef.current.offsetHeight
    const cx = W / 2

    const breakdown = calcNotes(bal)
    // Cap at 50 notes for performance
    const MAX = 50
    let total  = breakdown.reduce((s, b) => s + b.count, 0)
    const scale = total > MAX ? MAX / total : 1

    notesRef.current = []
    let idx = 0

    breakdown.forEach(({ denom, count }) => {
      const capped  = Math.max(1, Math.round(count * scale))
      const texture = scaledCache[denom]
      if (!texture) return

      for (let i = 0; i < capped; i++) {
        setTimeout(() => {
          if (!engineRef.current) return

          // Stack in overlapping rows at the bottom
          const col  = idx % 10
          const row  = Math.floor(idx / 10)
          const x    = cx - 5 * (NOTE_W * 0.7) + col * (NOTE_W * 0.7) + (Math.random() - 0.5) * 12
          const y    = H - NOTE_H * 0.5 - row * (NOTE_H * 0.55) + (Math.random() - 0.5) * 6

          const note = Bodies.rectangle(x, y, NOTE_W, NOTE_H, {
            restitution: 0.12,
            friction:    0.65,
            frictionAir: 0.028,
            density:     0.006,
            render: { sprite: { texture, xScale: 1, yScale: 1 } },
          }) as NoteBody

          note.noteType = denom
          note.sprayed  = false

          Body.setAngle(note, (Math.random() - 0.5) * 0.25)

          World.add(engineRef.current.world, note)
          notesRef.current.push(note)
          idx++

          if (idx >= Math.min(total, MAX)) setPileReady(true)
        }, idx * 25)
        idx++
      }
    })

    if (total === 0) setPileReady(true)
  }, [])

  useEffect(() => {
    if (balance <= 0 || !imagesReady.current) return
    const t = setTimeout(() => spawnPile(balance), 400)
    return () => clearTimeout(t)
  }, [balance, spawnPile])

  // ── Exit detection → spray API ──────────────────────────────────────────────

  useEffect(() => {
    if (noSession) return

    const interval = setInterval(async () => {
      if (!engineRef.current || !wrapRef.current || processingRef.current) return

      const exited = notesRef.current.filter(n => !n.sprayed && n.position.y < -NOTE_H)
      if (!exited.length) return

      processingRef.current = true

      for (const note of exited) {
        const amount = parseInt(note.noteType || '100')

        // Hard balance check — never spray more than funded
        if (balRef.current < amount) {
          // Push note back into view instead of letting it exit
          note.sprayed = true
          setTimeout(() => {
            if (engineRef.current) Matter.World.remove(engineRef.current.world, note)
            notesRef.current = notesRef.current.filter(n => n !== note)
          }, 100)
          continue
        }

        note.sprayed = true

        try {
          const res    = await axios.post(`/api/events/${slug}/spray`, {
            guest_token: guestToken,
            amount,
            note_type:   note.noteType || '100',
          })

          const newBal       = res.data.remaining_balance
          balRef.current     = newBal
          setBalance(newBal)
          sessionStorage.setItem('owambe_balance', String(newBal))

          setMsg(`₦${amount.toLocaleString()} sprayed!`)
          setMsgType('success')
          setTimeout(() => setMsg(''), 1000)

          setFeedItems(prev => [{
            id:         Date.now().toString(),
            guest_name: guestName,
            amount,
            note_type:  note.noteType || '100',
          }, ...prev].slice(0, 20))

          setTimeout(() => {
            if (engineRef.current) Matter.World.remove(engineRef.current.world, note)
            notesRef.current = notesRef.current.filter(n => n !== note)
          }, 100)

        } catch (e: unknown) {
          const err = e as { response?: { data?: { message?: string } } }
          const errMsg = err.response?.data?.message ?? 'Spray failed'
          setMsg(errMsg)
          setMsgType('error')
          setTimeout(() => setMsg(''), 1500)
          note.sprayed = false
        }
      }

      processingRef.current = false
    }, 150)

    return () => clearInterval(interval)
  }, [slug, guestToken, guestName, noSession])

  // ── Swipe ───────────────────────────────────────────────────────────────────

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    swipeRef.current = { x: e.clientX, y: e.clientY, t: Date.now() }
  }, [])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!swipeRef.current || !engineRef.current || !wrapRef.current) return

    const dx = e.clientX - swipeRef.current.x
    const dy = e.clientY - swipeRef.current.y
    const dt = Math.max(Date.now() - swipeRef.current.t, 1)
    swipeRef.current = null

    // Must be upward swipe
    if (dy > -25 || Math.sqrt(dx * dx + dy * dy) < 25) return

    // Velocity proportional to swipe speed
    const vx = (dx / dt) * 38
    const vy = (dy / dt) * 38

    const rect   = wrapRef.current.getBoundingClientRect()
    const touchX = e.clientX - rect.left
    const touchY = e.clientY - rect.top

    const { Body } = Matter

    // Notes within 160px of swipe endpoint
    let targets = notesRef.current.filter(n => {
      if (n.sprayed) return false
      return Math.hypot(n.position.x - touchX, n.position.y - touchY) < 160
    })

    // Fallback — fling the closest notes regardless
    if (targets.length === 0) {
      targets = [...notesRef.current]
        .filter(n => !n.sprayed)
        .sort((a, b) =>
          Math.hypot(a.position.x - touchX, a.position.y - touchY) -
          Math.hypot(b.position.x - touchX, b.position.y - touchY)
        )
        .slice(0, 6)
    }

    targets.slice(0, 12).forEach((note, i) => {
      const fanSpread = (i - targets.length / 2) * 3.5
      const jitter    = (Math.random() - 0.5) * 5
      Body.setVelocity(note, {
        x: vx + fanSpread + jitter,
        y: Math.min(vy - Math.random() * 8, -14),
      })
      // Dramatic tumble
      Body.setAngularVelocity(note, (Math.random() - 0.5) * 0.8)
    })
  }, [])

  // ── Reverb ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (noSession || !guestToken) return

    const pusher = new Pusher(process.env.NEXT_PUBLIC_REVERB_APP_KEY!, {
      wsHost:            process.env.NEXT_PUBLIC_REVERB_HOST || 'localhost',
      wsPort:            parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8080'),
      forceTLS:          false,
      disableStats:      true,
      enabledTransports: ['ws'],
      cluster:           'mt1',
    })

    const ch = pusher.subscribe(`event.${slug}`)
    ch.bind('money.sprayed', (data: SprayEvent) => {
      setFeedItems(prev => [data, ...prev].slice(0, 20))
    })

    return () => {
      ch.unbind_all()
      pusher.unsubscribe(`event.${slug}`)
      pusher.disconnect()
    }
  }, [slug, guestToken, noSession])

  // ── No session state ────────────────────────────────────────────────────────

  if (noSession) return (
    <div style={{ minHeight: '100vh', background: '#F2F2F4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', padding: '24px' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '36px', marginBottom: '12px' }}>🎊</p>
        <p style={{ fontSize: '15px', fontWeight: 700, color: '#16151F', marginBottom: '6px' }}>No session found</p>
        <p style={{ fontSize: '13px', color: '#A09DB8', marginBottom: '20px' }}>Please join the event first.</p>
        <button onClick={() => router.push(`/event/${slug}`)}
          style={{ padding: '10px 24px', fontSize: '13px', fontWeight: 600, color: '#fff', background: '#7C6FE0', border: 'none', borderRadius: '10px', cursor: 'pointer', fontFamily: 'inherit' }}>
          Go back
        </button>
      </div>
    </div>
  )

  // ── Render ──────────────────────────────────────────────────────────────────

  const breakdown     = calcNotes(balance)
  const totalNotes    = notesRef.current.filter(n => !n.sprayed).length
  const isEmpty       = balance < 100 && pileReady

  return (
    <div style={{ height: '100dvh', background: '#0a0a0a', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translate(-50%,-4px)}to{opacity:1;transform:translate(-50%,0)}}`}</style>

      {/* ── Nav ── */}
      <header style={{ height: '56px', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#111', borderBottom: '1px solid #1e1e1e', flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>
            {eventTitle || '…'}
          </p>
          <p style={{ fontSize: '11px', color: '#555' }}>
            {guestName}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
          <p style={{ fontSize: '10px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Balance</p>
          <p style={{ fontSize: '20px', fontWeight: 800, color: balance > 0 ? '#7C6FE0' : '#444', letterSpacing: '-0.04em', lineHeight: 1, transition: 'color .3s' }}>
            ₦{balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </header>

      {/* ── Note breakdown ── */}
      {breakdown.length > 0 && (
        <div style={{ background: '#0d0d0d', borderBottom: '1px solid #1a1a1a', padding: '6px 20px', display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0, overflowX: 'auto' }}>
          {breakdown.map(({ denom, count }) => (
            <div key={denom} style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
              <div style={{ width: '32px', height: '16px', borderRadius: '2px', overflow: 'hidden', border: '1px solid #2a2a2a' }}>
                <img src={NOTE_IMAGES[denom]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#666' }}>×{count}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Physics stage ── */}
      <div
        ref={wrapRef}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#0a0a0a', touchAction: 'none', userSelect: 'none' }}
      >
        {/* Loading */}
        {!pileReady && balance > 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 5 }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: '2px solid #222', borderTopColor: '#7C6FE0', animation: 'spin 0.7s linear infinite', marginBottom: '10px' }}/>
            <p style={{ fontSize: '12px', color: '#333' }}>Preparing your notes…</p>
          </div>
        )}

        {/* Swipe hint — shows over the pile */}
        {pileReady && !isEmpty && (
          <div style={{ position: 'absolute', top: '16px', left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 5 }}>
            <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(4px)', borderRadius: '99px', padding: '6px 16px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p style={{ fontSize: '11px', color: '#555', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                ↑ Swipe up to spray
              </p>
            </div>
          </div>
        )}

        {/* Empty */}
        {isEmpty && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 5 }}>
            <p style={{ fontSize: '40px', marginBottom: '12px' }}>🎉</p>
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>All sprayed!</p>
            <p style={{ fontSize: '13px', color: '#444' }}>You&apos;ve used your entire balance.</p>
          </div>
        )}

        {/* Flash message */}
        {msg && (
          <div style={{
            position: 'absolute', top: '56px', left: '50%',
            transform: 'translateX(-50%)',
            background: msgType === 'success' ? 'rgba(48,164,108,0.95)' : 'rgba(229,72,77,0.95)',
            color: '#fff', padding: '7px 18px', borderRadius: '99px',
            fontSize: '13px', fontWeight: 700, pointerEvents: 'none',
            whiteSpace: 'nowrap', zIndex: 20,
            animation: 'fadeUp 0.15s ease',
          }}>
            {msgType === 'success' ? '💸 ' : '⚠ '}{msg}
          </div>
        )}

        {/* Floor fade */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(to top,#111 0%,transparent 100%)', pointerEvents: 'none', zIndex: 2 }}/>
      </div>

      {/* ── Live feed ── */}
      {feedItems.length > 0 && (
        <div style={{ background: '#080808', borderTop: '1px solid #161616', padding: '8px 20px', maxHeight: '88px', overflowY: 'auto', flexShrink: 0 }}>
          <p style={{ fontSize: '9px', fontWeight: 700, color: '#2a2a2a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
            Live
          </p>
          {feedItems.map((item, i) => (
            <div key={item.id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <p style={{ fontSize: '11px', color: '#555' }}>
                <span style={{ color: '#888', fontWeight: 600 }}>{item.guest_name}</span>
                {' '}sprayed
              </p>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#7C6FE0' }}>
                ₦{Number(item.amount).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
