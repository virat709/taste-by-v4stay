import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, onSnapshot, collection, query, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { LogOut, CheckCircle2 } from 'lucide-react';
import { printKitchenTicket } from '../../components/ReceiptTemplate';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const audioRef = useRef(null);
  const prevPendingCount = useRef(0);

  useEffect(() => {
    const data = localStorage.getItem('staffSession');
    if (!data) {
      navigate('/staff');
      return;
    }
    setSession(JSON.parse(data));
  }, [navigate]);

  useEffect(() => {
    if (!session?.restaurantId) return;
    
    // Listen to restaurant details (currency etc)
    const unsubRest = onSnapshot(doc(db, 'restaurants', session.restaurantId), snap => {
      if (snap.exists()) setRestaurant(snap.data());
    });

    // Listen to live orders
    const q = query(collection(db, 'restaurants', session.restaurantId, 'orders'), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(q, snap => {
      // Only show orders from today for staff to keep it clean
      const today = new Date().toDateString();
      const allOrders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const todayOrders = allOrders.filter(o => {
        const d = o.createdAt?.toDate?.();
        return d && d.toDateString() === today;
      });
      setOrders(todayOrders);
    });

    return () => {
      unsubRest();
      unsubOrders();
    };
  }, [session]);

  const updateStatus = async (orderId, status) => {
    if (!session?.restaurantId) return;
    await updateDoc(doc(db, 'restaurants', session.restaurantId, 'orders', orderId), { status });
  };

  const markSentToKitchen = async (orderId) => {
    if (!session?.restaurantId) return;
    await updateDoc(doc(db, 'restaurants', session.restaurantId, 'orders', orderId), { sentToKitchen: true });
  };

  const handleLogout = () => {
    localStorage.removeItem('staffSession');
    navigate('/staff');
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');

  useEffect(() => {
    if (pendingOrders.length > prevPendingCount.current && prevPendingCount.current > 0) {
      try { audioRef.current?.play(); } catch {}
    }
    prevPendingCount.current = pendingOrders.length;
  }, [pendingOrders.length]);

  if (!session) return null;

  const currency = restaurant?.currency || '₹';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', fontFamily: 'Outfit, sans-serif' }}>
      {/* Header */}
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACAf39/f4B/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+Ag" />
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '1.4rem', letterSpacing: '-0.5px' }}>
            <img src="/logo.png" alt="DinePulse" style={{ height: '28px', width: 'auto', borderRadius: '6px' }} />
            <span>DinePulse Staff</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            {session.restaurantName}
          </div>
        </div>
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: '12px', cursor: 'pointer', color: 'var(--text-muted)', fontWeight: '600', fontFamily: 'inherit' }}>
          <LogOut size={16} /> Exit
        </button>
      </header>

      <main style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Live Orders</h1>
          {pendingOrders.length > 0 && (
            <span style={{ background: '#ff4757', color: 'white', padding: '4px 12px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', background: 'white', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
              {pendingOrders.length} New
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
              <StaffOrderCard key={order.id} order={order} currency={currency} onUpdateStatus={updateStatus} onMarkSentToKitchen={markSentToKitchen} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

function StaffOrderCard({ order, currency, onUpdateStatus, onMarkSentToKitchen }) {
  const statusConfig = {
    pending: { label: 'Pending', color: '#ff9f43', next: 'preparing', nextLabel: 'Start' },
    preparing: { label: 'Preparing', color: '#1e90ff', next: 'ready', nextLabel: 'Ready' },
    ready: { label: 'Ready', color: '#2ed573', next: 'completed', nextLabel: 'Serve' },
    completed: { label: 'Done', color: '#a4b0be', next: null },
    cancelled: { label: 'Cancelled', color: '#ff4757', next: null },
  };
  const cfg = statusConfig[order.status] || statusConfig.pending;
  const time = order.createdAt?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const isSent = order.sentToKitchen;
  const kitchenBtnBg = isSent 
    ? 'linear-gradient(135deg, #ff9f43, #ff6b35)' // Orange
    : 'linear-gradient(135deg, #2ed573, #26af5f)'; // Green
  const kitchenBtnShadow = isSent
    ? '0 2px 6px rgba(255,159,67,0.15)'
    : '0 2px 6px rgba(46,213,115,0.15)';
  const kitchenBtnText = isSent ? 'Sent' : 'Kitchen';

  const handleKitchenPrint = () => {
    printKitchenTicket(order);
    if (onMarkSentToKitchen) {
      onMarkSentToKitchen(order.id);
    }
  };

  return (
    <div style={{ background: 'var(--surface)', border: `1px solid ${order.status === 'pending' ? '#ff4757' : order.status === 'preparing' ? '#1e90ff' : 'var(--border)'}`, borderRadius: '12px', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'nowrap', minHeight: '56px', boxShadow: order.status === 'pending' ? '0 2px 8px rgba(255,71,87,0.05)' : 'none' }}>
      {/* Left side: Table Number & Items List */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
        {/* Table badge with icon */}
        <div style={{ 
          background: 'rgba(255, 71, 87, 0.08)', 
          color: 'var(--primary)', 
          padding: '5px 10px', 
          borderRadius: '8px', 
          fontSize: '0.88rem', 
          fontWeight: '800', 
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: '3px'
        }}>
          🪑 {order.tableNumber || '?'}
        </div>

        {/* Inline Items List */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '1px' }}>
            {order.instructions && (
              <span style={{ fontSize: '0.82rem', color: '#ff4757', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                📝 {order.instructions}
              </span>
            )}
            {order.paymentMethod === 'UPI' && (
              <span style={{ background: 'rgba(46,213,115,0.08)', color: '#2ed573', padding: '1px 5px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '700' }}>
                UPI Paid
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Actions & Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <span style={{ 
          background: `${cfg.color}10`, 
          color: cfg.color, 
          borderRadius: '6px', 
          padding: '4px 10px', 
          fontSize: '0.8rem', 
          fontWeight: '800', 
          textTransform: 'uppercase',
          border: `1px solid ${cfg.color}18`
        }}>
          {cfg.label}
        </span>
        
        {cfg.next ? (
          <button onClick={() => onUpdateStatus(order.id, cfg.next)} style={{ 
            background: cfg.next === 'ready' ? '#2ed573' : cfg.next === 'completed' ? '#a4b0be' : 'var(--primary)', 
            border: 'none', 
            borderRadius: '8px', 
            padding: '6px 14px', 
            cursor: 'pointer', 
            fontSize: '0.85rem', 
            fontWeight: '700', 
            fontFamily: 'inherit', 
            color: 'white', 
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
          }}>
            {cfg.nextLabel}
          </button>
        ) : (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>Done</span>
        )}

        <button onClick={handleKitchenPrint} style={{ 
          background: kitchenBtnBg, 
          border: 'none', 
          borderRadius: '8px', 
          padding: '6px 14px', 
          cursor: 'pointer', 
          fontSize: '0.85rem', 
          fontWeight: '700', 
          fontFamily: 'inherit', 
          color: 'white', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px', 
          boxShadow: kitchenBtnShadow 
        }}>
          {kitchenBtnText}
        </button>

        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500', minWidth: '60px', textAlign: 'right' }}>
          {time}
        </span>
      </div>
    </div>
  );
}
