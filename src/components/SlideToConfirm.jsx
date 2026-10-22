import React, { useRef, useState, useCallback, useEffect } from 'react';

// ─── SlideToConfirm ──────────────────────────────────────────────────────────
// Swipe-style confirmation control ("Slide to unlock" pattern) used by the
// staff portal: slide to go online / offline and slide to pick up an order.
// Works with touch (Pointer Events), mouse and keyboard (Enter / Space).
//
// The confirm fires the moment the thumb crosses the end of the track —
// one-handed and fast, no release needed. The thumb flashes the confirm
// state, then springs back.
export default function SlideToConfirm({
  onConfirm,
  label,
  confirmLabel = '✓',
  accent = '#2ed573',
  thumbIcon = null,
  disabled = false,
  width,          // optional fixed width (px); defaults to 100%
  height = 52,
}) {
  const trackRef = useRef(null);
  const draggingRef = useRef(null);      // { startX, moved }
  const resetTimer = useRef(null);
  const [offset, setOffset] = useState(0);
  const [confirming, setConfirming] = useState(false);
  // Max travel is captured event-time (pointer/tab arrival) — never read from
  // the track ref during render (react-hooks/refs). Falls back to 1 to avoid
  // division by zero before the first interaction.
  const [maxOffset, setMaxOffset] = useState(1);

  useEffect(() => () => { if (resetTimer.current) clearTimeout(resetTimer.current); }, []);

  const THUMB = 44;
  const PAD = 6;

  // Geometry: max travel = track width − thumb width − padding
  const getMax = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;
    return Math.max(0, track.clientWidth - THUMB - PAD * 2);
  }, []);

  const fire = useCallback(() => {
    setConfirming(true);
    setOffset(getMax()); // pin thumb to the end with the slide animation
    try { onConfirm(); } catch { /* handler owns its own error handling */ }
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => {
      setConfirming(false);
      setOffset(0);
    }, 900);
  }, [onConfirm, getMax]);

  const onPointerDown = (e) => {
    if (disabled || confirming) return;
    if (e.button != null && e.button !== 0) return;
    // Mobile-friendly grab: dragging can START anywhere on the slider, not
    // only on the thumb — the thumb jumps to the finger then follows it.
    let base = 0;
    const track = trackRef.current;
    if (track) {
      const rect = track.getBoundingClientRect();
      base = Math.max(0, Math.min(getMax(), e.clientX - rect.left - PAD - THUMB / 2));
    }
    draggingRef.current = { startX: e.clientX, base, moved: false };
    setMaxOffset(getMax());
    setOffset(base);
    e.preventDefault();
  };

  useEffect(() => {
    if (disabled) return;
    let raf = 0;                     // frame-throttle: one state update max per frame
    let pendingX = null;             // last pointermove clientX
    const flush = () => {
      raf = 0;
      if (pendingX == null) return;
      const d = draggingRef.current;
      if (!d || confirming) return;
      const max = getMax();
      const next = Math.max(0, Math.min(max, d.base + (pendingX - d.startX)));
      d.moved = next > 2;
      setOffset(next);
      // Auto-fire when the thumb crosses the end of the track
      if (next >= max - 2) {
        draggingRef.current = null;
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
        fire();
        return;
      }
    };
    const move = (e) => {
      const d = draggingRef.current;
      if (!d || confirming) return;
      pendingX = e.clientX;
      if (!raf) raf = requestAnimationFrame(flush);
    };
    const up = () => {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      pendingX = null;
      if (!draggingRef.current) return;
      draggingRef.current = null;
      // Spring back if released before the end
      setOffset(0);
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [confirming, disabled, fire, getMax]);

  const trackStyle = width != null ? { width, maxWidth: '100%' } : {};

  return (
    <div
      ref={trackRef}
      data-testid="slide-to-confirm"
      role="group"
      aria-label={label}
      onPointerDown={onPointerDown}
      onContextMenu={e => e.preventDefault()}
      style={{
        position: 'relative',
        height,
        borderRadius: height,
        background: 'rgba(0,0,0,0.25)',
        border: `1.5px solid ${accent}66`,
        overflow: 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        ...trackStyle,
      }}
    >
      {/* Centered hint — fades out while sliding */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        color: confirming ? '#fff' : `rgba(255,255,255,0.85)`,
        fontWeight: '800',
        fontSize: '0.9rem',
        letterSpacing: '0.3px',
        opacity: confirming ? 1 : Math.max(0.35, 1 - offset / Math.max(1, maxOffset)),
        maxWidth: '100%',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        padding: '0 52px',
        pointerEvents: 'none',
        fontFamily: 'inherit',
        textShadow: '0 1px 2px rgba(0,0,0,0.35)',
      }}>
        {confirming ? `${confirmLabel} Done!` : label}
      </div>

      {/* Fill — grows with the drag */}
      <div style={{
        position: 'absolute',
        top: 0, bottom: 0, left: 0,
        width: offset + THUMB + PAD,
        maxWidth: '100%',
        background: `linear-gradient(90deg, ${accent}CC, ${accent})`,
        transition: confirming ? 'width 0.15s ease-out' : 'none',
        pointerEvents: 'none',
      }} />

      {/* Thumb */}
      <div
        data-testid="slide-thumb"
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label={label}
        onKeyDown={e => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled && !confirming) {
            e.preventDefault();
            fire();
          }
        }}
        style={{
          position: 'absolute',
          top: PAD, bottom: PAD,
          left: PAD,
          width: THUMB,
          borderRadius: '50%',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
          cursor: confirming ? 'default' : 'grab',
          transform: `translateX(${offset}px)`,
          transition: confirming ? 'transform 0.15s ease-out' : 'none',
          touchAction: 'none',
        }}
      >
        {confirming ? <CheckMark accent={accent} /> : (thumbIcon || <Chevron accent={accent} />)}
      </div>
    </div>
  );
}

function CheckMark({ accent }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10.5l4 4 8-9" stroke={accent} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Chevron({ accent }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" style={{ opacity: 0.55 }}>
      <path d="M7 3l8 7-8 7" stroke={accent} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
