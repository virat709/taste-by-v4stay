import React, { useEffect, useState } from 'react';
import { AdminLayout } from './Dashboard';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import {
  collection, doc, onSnapshot, addDoc, deleteDoc, updateDoc,
  query, orderBy, limit, serverTimestamp
} from 'firebase/firestore';
import { UserPlus, Trash2, Users, Circle, ShieldCheck, Clock, PackageCheck, Link2, Copy, Check, ChevronDown } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const todayKey = () => new Date().toISOString().slice(0, 10);

function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${m}m ${String(s % 60).padStart(2, '0')}s`;
}

const timeLabel = (ts) => ts?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '—';

const STALE_ONLINE_MS = 90 * 1000; // no heartbeat for 90s → treat as offline

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StaffManagement() {
  const { user } = useAuth();
  const restaurantId = user?.uid;

  const [restaurant, setRestaurant] = useState(null);
  const [waiters, setWaiters] = useState([]);
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  // Shown only when a real permission-denied error occurs — the rules setup
  // note is hidden otherwise so it doesn't read as an active problem.
  const [permDenied, setPermDenied] = useState(false);

  // Restaurant doc (name display)
  useEffect(() => {
    if (!restaurantId) return;
    return onSnapshot(doc(db, 'restaurants', restaurantId), snap => {
      if (snap.exists()) setRestaurant(snap.data());
    });
  }, [restaurantId]);

  // Live waiter list
  useEffect(() => {
    if (!restaurantId) return;
    return onSnapshot(collection(db, 'restaurants', restaurantId, 'staff'), snap => {
      setWaiters(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [restaurantId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    const cleanName = name.trim();
    const cleanPin = pin.trim();
    if (!cleanName || !/^\d{4}$/.test(cleanPin)) {
      setError('Enter a name and a 4-digit PIN.');
      return;
    }
    setAdding(true);
    try {
      await addDoc(collection(db, 'restaurants', restaurantId, 'staff'), {
        name: cleanName,
        pin: cleanPin,
        isOnline: false,
        lastActive: null,
        onlineSince: null,
        onlineSeconds: 0,
        ordersPicked: 0,
        statsDate: todayKey(),
        createdAt: serverTimestamp(),
      });
      setName('');
      setPin('');
    } catch (err) {
      console.error('Add waiter failed:', err);
      if (err?.code === 'permission-denied') {
        setPermDenied(true);
        setError('Firestore rules are blocking the "staff" collection. Publish the staff rules shown in the setup note below, then try again.');
      } else {
        setError('Could not add waiter. Please try again.');
      }
    }
    setAdding(false);
  };

  const handleRemove = async (id, waiterName) => {
    if (!window.confirm(`Remove ${waiterName}? They will lose portal access immediately.`)) return;
    setError('');
    try {
      await deleteDoc(doc(db, 'restaurants', restaurantId, 'staff', id));
    } catch (err) {
      console.error('Remove waiter failed:', err);
      if (err?.code === 'permission-denied') {
        setPermDenied(true);
        setError('Firestore rules are blocking the "staff" collection. Publish the staff rules shown in the setup note below, then try again.');
      } else {
        setError('Could not remove waiter. Please try again.');
      }
    }
  };

  // Waiter portal link (also works after deploy — uses current origin)
  const portalLink = restaurantId ? `${window.location.origin}/staff/${restaurantId}` : '';

  return (
    <AdminLayout restaurantName={restaurant?.name}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '6px' }}>Waiters & Staff</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.92rem' }}>
        Add your waiters, then share the portal link with them. They clock in when their shift starts, pick up live orders, and clock out when it ends — every shift is logged here.
      </p>

      {/* Waiter portal link */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px',
        padding: '18px 20px', marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '0.9rem', marginBottom: '10px' }}>
          <Link2 size={16} color="#f59e0b" /> Waiter Portal Link
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input readOnly value={portalLink} onClick={(e) => e.target.select()}
            style={{ flex: 1, minWidth: '220px', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-color)', color: 'var(--text-main)', fontSize: '0.85rem', fontFamily: 'monospace' }} />
          <CopyButton text={portalLink} />
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '10px 0 0' }}>
          Send this to your waiters (WhatsApp etc.). They open it, pick their name, enter their PIN, and clock in — the old <b>/staff</b> login also still works.
        </p>
      </div>

      {/* Add Waiter Form */}
      <form onSubmit={handleAdd} style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px',
        padding: '20px', marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end'
      }}>
        <div style={{ flex: 2, minWidth: '180px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)' }}>Waiter Name</label>
          <input className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ramesh Kumar" required />
        </div>
        <div style={{ flex: 1, minWidth: '120px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)' }}>4-Digit PIN</label>
          <input className="input-field" type="password" inputMode="numeric" pattern="\d{4}" maxLength={4}
            value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
            placeholder="••••" style={{ letterSpacing: '3px' }} required />
        </div>
        <button type="submit" disabled={adding} style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
          background: 'linear-gradient(135deg, #d97706, #f59e0b)', color: '#060709', border: 'none',
          borderRadius: '12px', fontWeight: '800', fontSize: '0.92rem', cursor: adding ? 'not-allowed' : 'pointer', fontFamily: 'inherit'
        }}>
          <UserPlus size={16} /> {adding ? 'Adding...' : 'Add Waiter'}
        </button>
      </form>
      {error && <div style={{ color: '#ff4757', fontWeight: '600', marginTop: '-14px', marginBottom: '18px', fontSize: '0.85rem' }}>{error}</div>}

      {/* Waiter List */}
      {waiters.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: '18px', color: 'var(--text-muted)' }}>
          <Users size={48} style={{ opacity: 0.25, marginBottom: '12px' }} />
          <h3 style={{ fontWeight: '700', marginBottom: '6px' }}>No waiters added yet</h3>
          <p style={{ fontSize: '0.9rem' }}>Add your first waiter above, then share the portal link with them.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '860px' }}>
          {waiters.map(w => <WaiterRow key={w.id} restaurantId={restaurantId} waiter={w} onRemove={handleRemove} />)}
        </div>
      )}

      {/* One-time Firestore rules setup note — shown only after a permission-denied error */}
      {permDenied && (
      <details style={{
        background: 'rgba(30,144,255,0.05)', border: '1px solid rgba(30,144,255,0.25)',
        borderRadius: '14px', padding: '14px 18px', marginTop: '24px', maxWidth: '860px'
      }}>
        <summary style={{ cursor: 'pointer', fontWeight: '800', color: '#1e90ff', fontSize: '0.9rem' }}>
          One-time setup: allow the waiters list in Firestore Rules
        </summary>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '12px 0 8px' }}>
          If adding or removing waiters fails with a permissions error, open
          <b> Firebase Console → Firestore Database → Rules</b>, paste this block inside your existing rules
          (before the final closing <code>{'}'}</code>) and click <b>Publish</b>:
        </p>
        <pre style={{ background: 'var(--bg-color)', padding: '12px 16px', borderRadius: '10px', overflowX: 'auto', fontSize: '0.8rem', lineHeight: 1.5, margin: 0 }}>
{`  match /restaurants/{rid}/staff/{staffId} {
    allow read: if true;
    allow create, delete: if request.auth != null && request.auth.uid == rid;
    allow update: if true;

    match /shifts/{shiftId} {
      allow read, write: if true;
    }
  }`}
        </pre>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '10px 0 0' }}>
          The complete rules file with everything included is also available in the project: <b>firestore.rules</b>
        </p>
      </details>
      )}
    </AdminLayout>
  );
}

// ─── Copy Button ──────────────────────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard API unavailable (http / old browser) — fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} style={{
      display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
      background: copied ? 'linear-gradient(135deg, #2ed573, #26af5f)' : 'linear-gradient(135deg, #d97706, #f59e0b)',
      color: copied ? 'white' : '#060709', border: 'none', borderRadius: '10px',
      fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'inherit'
    }}>
      {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Copied!' : 'Copy Link'}
    </button>
  );
}

// ─── Waiter Row (live stats + shift history) ──────────────────────────────────
function WaiterRow({ restaurantId, waiter, onRemove }) {
  const [expanded, setExpanded] = useState(false);
  const [shifts, setShifts] = useState([]);
  const [closingId, setClosingId] = useState(null);

  // Live shift history (most recent 8)
  useEffect(() => {
    if (!restaurantId) return;
    const q = query(
      collection(db, 'restaurants', restaurantId, 'staff', waiter.id, 'shifts'),
      orderBy('startedAt', 'desc'),
      limit(8)
    );
    return onSnapshot(q, snap => {
      setShifts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [restaurantId, waiter.id]);

  const isToday = waiter.statsDate === todayKey();
  const pickedToday = isToday ? (waiter.ordersPicked || 0) : 0;
  const secondsToday = isToday ? (waiter.onlineSeconds || 0) : 0;

  // Heartbeat freshness: "Online" only if flag on AND lastActive is recent
  const lastActiveMs = waiter.lastActive?.toDate?.()?.getTime?.() || 0;
  // Presence must be evaluated live on every render — lint purity check acknowledged
  // eslint-disable-next-line react-hooks/purity
  const recentlyActive = Date.now() - lastActiveMs < STALE_ONLINE_MS;
  const online = waiter.isOnline && recentlyActive;

  // Today's shifts
  const todayShifts = (shifts || []).filter(s => s.startedAt?.toDate?.()?.toDateString?.() === new Date().toDateString());
  const hasOpenShift = todayShifts.some(s => !s.endedAt);

  // Manager: force-close an abandoned shift
  const handleCloseShift = async (shiftId) => {
    if (!window.confirm('Close this shift now? Use this if the waiter forgot to clock out.')) return;
    setClosingId(shiftId);
    try {
      await updateDoc(
        doc(db, 'restaurants', restaurantId, 'staff', waiter.id, 'shifts', shiftId),
        { endedAt: serverTimestamp() }
      );
    } catch (err) {
      console.error('Close shift failed:', err);
    }
    setClosingId(null);
  };

  return (
    <div style={{
      background: 'var(--surface)', border: `1px solid ${online ? 'rgba(46,213,115,0.35)' : 'var(--border)'}`,
      borderLeftWidth: '4px', borderLeftColor: online ? '#2ed573' : 'var(--border)',
      borderRadius: '16px', padding: '16px 20px'
    }}>
      {/* Main row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        {/* Identity */}
        <div style={{ flex: 1, minWidth: '160px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800', fontSize: '1rem' }}>
            <Circle size={11} fill={online ? '#2ed573' : '#a4b0be'} color={online ? '#2ed573' : '#a4b0be'} />
            {waiter.name}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '3px' }}>
            {online ? 'On duty now' : hasOpenShift ? 'Shift open — not clocked out' : 'Off duty'}
          </div>
        </div>

        {/* Online time today */}
        <StatChip icon={<Clock size={14} />} label="Online today" value={formatDuration(secondsToday)} color="#1e90ff" />
        {/* Orders picked today */}
        <StatChip icon={<PackageCheck size={14} />} label="Picked up" value={`${pickedToday} order${pickedToday === 1 ? '' : 's'}`} color="#2ed573" />
        {/* PIN indicator */}
        <StatChip icon={<ShieldCheck size={14} />} label="PIN set" value="Yes" color="#a4b0be" />

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setExpanded(e => !e)} title="Shift history"
            style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '700' }}>
            <ChevronDown size={15} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            Shifts
          </button>
          <button onClick={() => onRemove(waiter.id, waiter.name)} title="Remove waiter"
            style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#ff4757', display: 'flex' }}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Shift history */}
      {expanded && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed var(--border)' }}>
          {todayShifts.length === 0 ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '8px' }}>
              No shifts today.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {todayShifts.map(s => {
                const open = !s.endedAt;
                const duration = open
                  ? formatDuration(s.onlineSeconds || 0)
                  : formatDuration(s.onlineSeconds || 0);
                return (
                  <div key={s.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
                    background: 'var(--bg-color)', border: '1px solid var(--border)',
                    borderRadius: '12px', padding: '10px 14px'
                  }}>
                    {/* Clock in → out */}
                    <div style={{ fontWeight: '800', fontSize: '0.88rem', minWidth: '150px' }}>
                      🕒 {timeLabel(s.startedAt)} → {open ? 'now' : timeLabel(s.endedAt)}
                    </div>
                    {/* Duration */}
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1e90ff' }}>
                      {duration}
                    </span>
                    {/* Orders picked in this shift */}
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#2ed573' }}>
                      {s.ordersPicked || 0} picked
                    </span>
                    {/* Status */}
                    {open ? (
                      <>
                        <span style={{ background: 'rgba(46,213,115,0.1)', color: '#2ed573', padding: '3px 10px', borderRadius: '50px', fontSize: '0.72rem', fontWeight: '800' }}>
                          ON DUTY
                        </span>
                        <button onClick={() => handleCloseShift(s.id)} disabled={closingId === s.id}
                          style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', color: '#ff9f43', fontWeight: '700', fontSize: '0.78rem', fontFamily: 'inherit' }}>
                          {closingId === s.id ? 'Closing...' : 'Force close'}
                        </button>
                      </>
                    ) : (
                      <span style={{ background: 'rgba(164,176,190,0.12)', color: '#a4b0be', padding: '3px 10px', borderRadius: '50px', fontSize: '0.72rem', fontWeight: '800' }}>
                        ENDED
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatChip({ icon, label, value, color }) {
  return (
    <div style={{ background: `${color}08`, border: `1px solid ${color}20`, borderRadius: '12px', padding: '8px 14px', minWidth: '110px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: '0.95rem', fontWeight: '800', color, marginTop: '2px' }}>{value}</div>
    </div>
  );
}
