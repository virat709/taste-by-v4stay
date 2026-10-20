import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  doc, onSnapshot, collection, query, orderBy, updateDoc,
  getDoc, getDocs, addDoc, serverTimestamp, increment,
  writeBatch, limit
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { LogOut, CheckCircle2, Hand, Zap, Wifi, WifiOff, Package } from 'lucide-react';
import { printKitchenTicket } from '../../components/ReceiptTemplate';

const HEARTBEAT_MS = 30 * 1000; // every 30s: prove presence + add online seconds
const todayKey = () => new Date().toISOString().slice(0, 10);

function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${m}m ${String(s % 60).padStart(2, '0')}s`;
}

export default function StaffDashboard() {
  const navigate = useNavigate();
  // Session is loaded synchronously from localStorage — corrupt storage is
  // handled safely instead of crashing on JSON.parse
  const [session] = useState(() => {
    try {
      const data = localStorage.getItem('staffSession');
      return data ? JSON.parse(data) : null;
    } catch {
      localStorage.removeItem('staffSession');
      return null;
    }
  });
  const [orders, setOrders] = useState([]);
  const [waiter, setWaiter] = useState(null);     // live presence doc
  const [offDuty, setOffDuty] = useState(false);
  const [dutyError, setDutyError] = useState(''); // visible clock-in/off failure
  const audioRef = useRef(null);
  const prevUnclaimedCount = useRef(0);
  const shiftIdRef = useRef(null);

  // Redirect to the login screen when there is no valid session
  useEffect(() => {
    if (!session) navigate('/staff');
  }, [session, navigate]);

  // ── Shift helpers ─────────────────────────────────────────────────────────
  // Opens (or re-attaches to) the current duty shift. One doc per shift:
  // { startedAt, endedAt, onlineSeconds, ordersPicked } — the manager sees
  // these in DinePulse Admin → Waiters.
  const ensureShift = async (sess = session) => {
    if (!sess?.restaurantId || !sess?.staffId) return null;
    try {
      const shiftsCol = collection(db, 'restaurants', sess.restaurantId, 'staff', sess.staffId, 'shifts');
      // Recent shifts only (no composite index needed) then filter client-side
      const recent = await getDocs(query(shiftsCol, orderBy('startedAt', 'desc'), limit(3)));
      const open = recent.docs.find(d => !d.data().endedAt);
      if (open) {
        shiftIdRef.current = open.id;
        return open.id;
      }
      const created = await addDoc(shiftsCol, {
        startedAt: serverTimestamp(),
        endedAt: null,
        onlineSeconds: 0,
        ordersPicked: 0,
        date: todayKey(),
      });
      shiftIdRef.current = created.id;
      return created.id;
    } catch (err) {
      console.error('Open shift failed:', err);
      return null;
    }
  };

  const endShift = async () => {
    const id = shiftIdRef.current;
    if (!id || !session?.restaurantId || !session?.staffId) return;
    try {
      await updateDoc(
        doc(db, 'restaurants', session.restaurantId, 'staff', session.staffId, 'shifts', id),
        { endedAt: serverTimestamp() }
      );
    } catch (err) {
      console.error('End shift failed:', err);
    }
    shiftIdRef.current = null;
  };

  // ── Clock-in: go online + open shift (reset daily stats if needed) ────────
  useEffect(() => {
    if (!session?.staffId || !session?.restaurantId) return;
    const staffRef = doc(db, 'restaurants', session.restaurantId, 'staff', session.staffId);

    getDoc(staffRef).then(snap => {
      if (!snap.exists()) return navigate('/staff');
      const d = snap.data();
      const updates = {
        isOnline: true,
        onlineSince: serverTimestamp(),
        lastActive: serverTimestamp(),
      };
      if (d.statsDate !== todayKey()) {
        updates.statsDate = todayKey();
        updates.onlineSeconds = 0;
        updates.ordersPicked = 0;
      }
      updateDoc(staffRef, updates).catch(err => {
        console.error('Clock-in failed:', err);
        setDutyError(
          err?.code === 'permission-denied'
            ? 'Going online is blocked by Firestore rules. Ask the manager to publish the latest rules from DinePulse Admin → Waiters → setup note.'
            : 'Could not go online. Check your internet connection and open the portal again.'
        );
      });
      // Make sure a shift record exists (also handles refresh mid-shift)
      ensureShift(session);
    });
  }, [session, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Live presence + stats doc ─────────────────────────────────────────────
  useEffect(() => {
    if (!session?.restaurantId || !session?.staffId || offDuty) return;
    const staffRef = doc(db, 'restaurants', session.restaurantId, 'staff', session.staffId);
    return onSnapshot(staffRef, snap => {
      if (snap.exists()) setWaiter(snap.data());
    });
  }, [session, offDuty]);

  // ── Heartbeat: every 30s while on duty, add 30s to today's online counter
  //    (staff doc for quick stats + shift doc for exact shift duration) ──────
  useEffect(() => {
    if (!session?.restaurantId || !session?.staffId || offDuty) return;
    const staffRef = doc(db, 'restaurants', session.restaurantId, 'staff', session.staffId);
    const beat = () => {
      updateDoc(staffRef, {
        lastActive: serverTimestamp(),
        onlineSeconds: increment(HEARTBEAT_MS / 1000),
        statsDate: todayKey(),
      }).catch(() => {});
      if (shiftIdRef.current) {
        updateDoc(
          doc(db, 'restaurants', session.restaurantId, 'staff', session.staffId, 'shifts', shiftIdRef.current),
          { onlineSeconds: increment(HEARTBEAT_MS / 1000) }
        ).catch(() => {});
      }
    };
    beat();
    const iv = setInterval(beat, HEARTBEAT_MS);
    return () => clearInterval(iv);
  }, [session, offDuty]);

  // ── Live order feed ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!session?.restaurantId || offDuty) return;

    const q = query(collection(db, 'restaurants', session.restaurantId, 'orders'), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(q, snap => {
      const today = new Date().toDateString();
      const allOrders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const todayOrders = allOrders.filter(o => {
        const d = o.createdAt?.toDate?.();
        return d && d.toDateString() === today;
      });
      setOrders(todayOrders);
    });

    return () => {
      unsubOrders();
    };
  }, [session, offDuty]);

  const updateStatus = async (orderId, status) => {
    if (!session?.restaurantId) return;
    await updateDoc(doc(db, 'restaurants', session.restaurantId, 'orders', orderId), { status });
  };

  // 🤝 Swiggy-style claim: first waiter to tap wins, everyone else sees who got it
  const pickUpOrder = async (order) => {
    if (!session?.restaurantId || !session?.staffId) return;
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'restaurants', session.restaurantId, 'orders', order.id), {
        pickedBy: { id: session.staffId, name: session.staffName },
        pickedAt: serverTimestamp(),
      });
      batch.update(doc(db, 'restaurants', session.restaurantId, 'staff', session.staffId), {
        ordersPicked: increment(1),
        statsDate: todayKey(),
      });
      if (shiftIdRef.current) {
        batch.update(
          doc(db, 'restaurants', session.restaurantId, 'staff', session.staffId, 'shifts', shiftIdRef.current),
          { ordersPicked: increment(1) }
        );
      }
      await batch.commit();
    } catch (err) {
      console.error('Pick up failed:', err);
    }
  };

  const markSentToKitchen = async (orderId) => {
    if (!session?.restaurantId) return;
    await updateDoc(doc(db, 'restaurants', session.restaurantId, 'orders', orderId), { sentToKitchen: true });
  };

  // ── Go off duty (shift over) ──────────────────────────────────────────────
  const goOffDuty = async () => {
    if (!session?.restaurantId || !session?.staffId) return;
    await endShift();
    try {
      await updateDoc(doc(db, 'restaurants', session.restaurantId, 'staff', session.staffId), {
        isOnline: false,
        lastActive: serverTimestamp(),
      });
    } catch {}
    setOffDuty(true);
  };

  // ── Go back on duty ───────────────────────────────────────────────────────
  const goOnDuty = async () => {
    if (!session?.restaurantId || !session?.staffId) return;
    try {
      await updateDoc(doc(db, 'restaurants', session.restaurantId, 'staff', session.staffId), {
        isOnline: true,
        onlineSince: serverTimestamp(),
        lastActive: serverTimestamp(),
      });
    } catch {}
    setOffDuty(false);
    ensureShift();
  };

  const handleLogout = async () => {
    await endShift();
    if (session?.restaurantId && session?.staffId) {
      try {
        await updateDoc(doc(db, 'restaurants', session.restaurantId, 'staff', session.staffId), {
          isOnline: false,
          lastActive: serverTimestamp(),
        });
      } catch {}
    }
    localStorage.removeItem('staffSession');
    navigate('/staff');
  };

  const unclaimedCount = orders.filter(o => o.status === 'pending' && !o.pickedBy).length;

  // 🔔 Alert when new UNCLAIMED orders arrive
  useEffect(() => {
    const unclaimed = orders.filter(o => o.status === 'pending' && !o.pickedBy).length;
    if (unclaimed > prevUnclaimedCount.current && prevUnclaimedCount.current >= 0 && session && !offDuty) {
      try { audioRef.current?.play(); } catch {}
    }
    prevUnclaimedCount.current = unclaimed;
  }, [unclaimedCount, session, offDuty]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!session) return null;

  const myPickedToday = waiter ? (waiter.statsDate === todayKey() ? waiter.ordersPicked || 0 : 0) : 0;
  const onlineToday = waiter ? (waiter.statsDate === todayKey() ? waiter.onlineSeconds || 0 : 0) : 0;

  // Off-duty screen
  if (offDuty) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-color)', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <WifiOff size={56} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: '16px' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px' }}>You're off duty, {session.staffName}</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '28px' }}>Your shift has been recorded. New orders will not alert you until you clock back in.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={goOnDuty} style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 32px',
              background: 'linear-gradient(135deg, #2ed573, #26af5f)', color: 'white', border: 'none',
              borderRadius: '14px', fontWeight: '900', fontSize: '1.05rem', cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 6px 20px rgba(46,213,115,0.35)'
            }}>
              <Wifi size={18} /> Clock In — Start New Shift
            </button>
            <button onClick={handleLogout} style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 24px',
              background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)',
              borderRadius: '14px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit'
            }}>
              <LogOut size={16} /> Exit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', fontFamily: 'Outfit, sans-serif' }}>
      {/* Alert sound */}
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACAf39/f4B/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+Ag" />
      {/* Header */}
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '16px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10, flexWrap: 'wrap', gap: '10px', rowGap: '8px' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '1.2rem', letterSpacing: '-0.5px' }}>
            <img src="/logo.png" alt="DinePulse" style={{ height: '26px', width: 'auto', borderRadius: '6px' }} />
            <span>DinePulse Staff</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>{session.restaurantName}</span>
            {session.staffName} · {myPickedToday} picked · {formatDuration(onlineToday)} online
          </div>
        </div>
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1px solid var(--border)', padding: '8px 14px', borderRadius: '12px', cursor: 'pointer', color: 'var(--text-muted)', fontWeight: '600', fontFamily: 'inherit', flexShrink: 0 }}>
          <LogOut size={16} /> Exit
        </button>
      </header>

      <main style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
        {/* Duty failure banner */}
        {dutyError && (
          <div style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.35)', color: '#ff4757', fontWeight: '700', fontSize: '0.88rem', borderRadius: '14px', padding: '12px 18px', marginBottom: '16px' }}>
            ⚠️ {dutyError}
          </div>
        )}

        {/* Duty status card — the online/offline control */}
        <div style={{
          background: 'var(--surface)',
          border: '1.5px solid rgba(46,213,115,0.4)',
          borderRadius: '18px',
          padding: '16px 20px',
          marginBottom: '22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div style={{
              width: '46px', height: '46px', borderRadius: '50%', flexShrink: 0,
              background: 'rgba(46,213,115,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#2ed573', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: '900', fontSize: '1.05rem', color: '#2ed573' }}>You're Online</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                Picking up live orders · {formatDuration(onlineToday)} on duty · {myPickedToday} picked
              </div>
            </div>
          </div>
          <button onClick={goOffDuty} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,71,87,0.08)', border: '1.5px solid rgba(255,71,87,0.35)',
            padding: '12px 22px', borderRadius: '14px', cursor: 'pointer', color: '#ff4757',
            fontWeight: '800', fontFamily: 'inherit', fontSize: '0.95rem', flexShrink: 0
          }}>
            <WifiOff size={16} /> Shift Over — Go Offline
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Live Orders</h1>
          {unclaimedCount > 0 && (
            <span style={{ background: '#ff4757', color: 'white', padding: '4px 12px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', background: 'white', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
              {unclaimedCount} New — Claim Now!
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--border)' }}>
              <CheckCircle2 size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
              <h3 style={{ marginBottom: '8px', fontWeight: '600' }}>All caught up!</h3>
              <p>No orders for today yet.</p>
            </div>
          ) : (
            orders.map(order => (
              <StaffOrderCard
                key={`${order.id}-${order.pickedBy?.id || 'unclaimed'}`}
                order={order}
                isMine={order.pickedBy?.id === session.staffId}
                onUpdateStatus={updateStatus}
                onPickUp={pickUpOrder}
                onMarkSentToKitchen={markSentToKitchen}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────
function StaffOrderCard({ order, isMine, onUpdateStatus, onPickUp, onMarkSentToKitchen }) {
  const statusConfig = {
    pending: { label: 'Pending', color: '#ff9f43', next: 'preparing', nextLabel: 'Start' },
    preparing: { label: 'Preparing', color: '#1e90ff', next: 'ready', nextLabel: 'Ready' },
    ready: { label: 'Ready', color: '#2ed573', next: 'completed', nextLabel: 'Serve' },
    completed: { label: 'Done', color: '#a4b0be', next: null },
    cancelled: { label: 'Cancelled', color: '#ff4757', next: null },
  };
  const cfg = statusConfig[order.status] || statusConfig.pending;
  const time = order.createdAt?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const unclaimed = order.status === 'pending' && !order.pickedBy;
  const claimedByOther = order.status === 'pending' && order.pickedBy && !isMine;

  const isSent = order.sentToKitchen;
  const kitchenBtnBg = isSent
    ? 'linear-gradient(135deg, #ff9f43, #ff6b35)'
    : 'linear-gradient(135deg, #2ed573, #26af5f)';
  const kitchenBtnShadow = isSent
    ? '0 2px 6px rgba(255,159,67,0.15)'
    : '0 2px 6px rgba(46,213,115,0.15)';
  const kitchenBtnText = isSent ? 'Sent' : 'Kitchen';

  const handleKitchenPrint = () => {
    printKitchenTicket(order);
    if (onMarkSentToKitchen) onMarkSentToKitchen(order.id);
  };

  // ── UNCLAIMED: big Pick Up CTA (Swiggy-style race) ──
  if (unclaimed) {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid #ff4757', borderRadius: '16px', padding: '16px 20px', boxShadow: '0 4px 18px rgba(255,71,87,0.12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
            <div style={{ background: 'rgba(255,71,87,0.08)', color: 'var(--primary)', padding: '5px 10px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: '800', whiteSpace: 'nowrap' }}>
              🪑 {order.tableNumber || '?'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.94rem', fontWeight: '500', color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {order.items?.map((item, idx) => (
                  <span key={idx}>
                    {idx > 0 && ', '}
                    <span style={{ fontWeight: '700' }}>{item.qty}x</span> {item.name}
                    {item.modifiers?.length > 0 && ` (${item.modifiers.map(m => m.optionName).join(', ')})`}
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                {order.instructions && (
                  <span style={{ fontSize: '0.82rem', color: '#ff4757', fontWeight: '600' }}>📝 {order.instructions}</span>
                )}
                {(order.paymentMethod === 'UPI' || order.paymentStatus === 'paid') && (
                  <span style={{ background: 'rgba(46,213,115,0.08)', color: '#2ed573', padding: '1px 5px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '700' }}>
                    {order.paymentMethod === 'UPI' ? 'UPI Paid' : order.paymentMethod + ' ✓'}
                  </span>
                )}
                <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: '500' }}>{time}</span>
              </div>
            </div>
          </div>
          <button onClick={() => onPickUp(order)} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'linear-gradient(135deg, #2ed573, #26af5f)',
            border: 'none', borderRadius: '14px', padding: '14px 28px',
            cursor: 'pointer', color: 'white', fontWeight: '900', fontSize: '1rem', fontFamily: 'inherit',
            boxShadow: '0 6px 20px rgba(46,213,115,0.4)', whiteSpace: 'nowrap'
          }}>
            <Hand size={18} /> 🤝 Pick Up Order
          </button>
        </div>
      </div>
    );
  }

  // ── CLAIMED BY ANOTHER WAITER: "Order went to ..." ──
  if (claimedByOther) {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '14px', opacity: 0.75 }}>
        <div style={{ background: 'rgba(30,144,255,0.08)', color: '#1e90ff', padding: '5px 10px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: '800', whiteSpace: 'nowrap' }}>
          🪑 {order.tableNumber || '?'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.94rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {order.items?.[0]?.qty}x {order.items?.[0]?.name}{(order.items?.length || 0) > 1 ? ` +${order.items.length - 1} more` : ''}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1e90ff', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Zap size={13} /> Order went to <span style={{ fontWeight: '900' }}>{order.pickedBy.name}</span>
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{time}</span>
          </div>
        </div>
        <span style={{ background: `${cfg.color}10`, color: cfg.color, borderRadius: '6px', padding: '4px 10px', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', border: `1px solid ${cfg.color}18` }}>
          {cfg.label}
        </span>
      </div>
    );
  }

  // ── MINE (or claimed + past stages): normal control card ──
  return (
    <div style={{ background: 'var(--surface)', border: `1px solid ${order.status === 'pending' ? '#2ed573' : order.status === 'preparing' ? '#1e90ff' : 'var(--border)'}`, borderRadius: '16px', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'nowrap', boxShadow: '0 2px 8px rgba(46,213,115,0.08)' }}>
      {/* Left: table + items */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
        <div style={{ background: 'rgba(46,213,115,0.08)', color: '#2ed573', padding: '5px 10px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: '800', whiteSpace: 'nowrap' }}>
          🪑 {order.tableNumber || '?'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.94rem', fontWeight: '500', color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {order.items?.map((item, idx) => (
              <span key={idx}>
                {idx > 0 && ', '}
                <span style={{ fontWeight: '700' }}>{item.qty}x</span> {item.name}
                {item.modifiers?.length > 0 && ` (${item.modifiers.map(m => m.optionName).join(', ')})`}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
            {/* Who claimed it */}
            {order.pickedBy && (
              <span style={{ fontSize: '0.8rem', fontWeight: isMine ? '800' : '600', color: isMine ? '#2ed573' : '#1e90ff', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                {isMine ? <Package size={12} /> : <Zap size={12} />}
                {isMine ? 'You picked this' : `Picked by ${order.pickedBy.name}`}
              </span>
            )}
            {order.instructions && (
              <span style={{ fontSize: '0.82rem', color: '#ff4757', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                📝 {order.instructions}
              </span>
            )}
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>{time}</span>
          </div>
        </div>
      </div>

      {/* Right: status + actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <span style={{
          background: `${cfg.color}10`, color: cfg.color, borderRadius: '6px', padding: '4px 10px',
          fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', border: `1px solid ${cfg.color}18`
        }}>
          {cfg.label}
        </span>

        {cfg.next ? (
          <button onClick={() => onUpdateStatus(order.id, cfg.next)} style={{
            background: cfg.next === 'ready' ? '#2ed573' : cfg.next === 'completed' ? '#a4b0be' : 'var(--primary)',
            border: 'none', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer',
            fontSize: '0.85rem', fontWeight: '700', fontFamily: 'inherit', color: 'white',
            whiteSpace: 'nowrap', boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
          }}>
            {cfg.nextLabel}
          </button>
        ) : (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>Done</span>
        )}

        {order.status !== 'completed' && order.status !== 'cancelled' && (
          <button onClick={handleKitchenPrint} style={{
            background: kitchenBtnBg, border: 'none', borderRadius: '8px', padding: '6px 14px',
            cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700', fontFamily: 'inherit',
            color: 'white', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: kitchenBtnShadow
          }}>
            {kitchenBtnText}
          </button>
        )}
      </div>
    </div>
  );
}
