import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, onSnapshot, collection, query, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { LogOut, CheckCircle2 } from 'lucide-react';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);

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

  const handleLogout = () => {
    localStorage.removeItem('staffSession');
    navigate('/staff');
  };

  if (!session) return null;

  const currency = restaurant?.currency || '₹';
  const pendingOrders = orders.filter(o => o.status === 'pending');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', fontFamily: 'Outfit, sans-serif' }}>
      {/* Header */}
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '1.4rem', letterSpacing: '-0.5px' }}>
            <img src="/v4-logo.png" alt="v4stay" style={{ height: '28px' }} />
            <span>Taste Staff</span>
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
              <StaffOrderCard key={order.id} order={order} currency={currency} onUpdateStatus={updateStatus} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

function StaffOrderCard({ order, currency, onUpdateStatus }) {
  const statusConfig = {
    pending: { label: 'Pending', color: '#ff9f43', next: 'preparing', nextLabel: 'Start Preparing' },
    preparing: { label: 'Preparing', color: '#1e90ff', next: 'ready', nextLabel: 'Mark Ready' },
    ready: { label: 'Ready', color: '#2ed573', next: 'completed', nextLabel: 'Serve' },
    completed: { label: 'Done', color: '#a4b0be', next: null },
    cancelled: { label: 'Cancelled', color: '#ff4757', next: null },
  };
  const cfg = statusConfig[order.status] || statusConfig.pending;
  const time = order.createdAt?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ background: 'var(--surface)', border: `1px solid ${order.status === 'pending' ? '#ff4757' : order.status === 'preparing' ? '#1e90ff' : 'var(--border)'}`, borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', boxShadow: order.status === 'pending' ? '0 4px 16px rgba(255,71,87,0.1)' : order.status === 'preparing' ? '0 4px 16px rgba(30,144,255,0.1)' : 'none' }}>
      <div style={{ flex: 1, minWidth: '250px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{ fontWeight: '800', fontSize: '1.2rem' }}>Table {order.tableNumber}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{time}</span>
          <span style={{ background: `${cfg.color}18`, color: cfg.color, borderRadius: '50px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>{cfg.label}</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {order.items?.map((item, idx) => (
            <div key={idx} style={{ fontSize: '1rem' }}>
              <span style={{ fontWeight: '600' }}><span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>{item.qty}x</span> {item.name}</span>
              {item.modifiers?.length > 0 && (
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                  ({item.modifiers.map(m => m.optionName).join(', ')})
                </span>
              )}
            </div>
          ))}
        </div>

        {order.instructions && (
          <div style={{ marginTop: '8px', fontSize: '0.85rem', background: 'rgba(255,71,87,0.06)', padding: '6px 10px', borderRadius: '8px', color: 'var(--text-muted)', display: 'inline-block' }}>
            📝 {order.instructions}
          </div>
        )}
        
        {order.paymentMethod === 'UPI' && (
          <div style={{ marginTop: '12px', display: 'inline-block', background: 'rgba(46,213,115,0.1)', color: '#2ed573', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700' }}>
            Paid via UPI
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', borderLeft: '1px solid var(--border)', paddingLeft: '20px' }}>
        {cfg.next ? (
          <button onClick={() => onUpdateStatus(order.id, cfg.next)} style={{ background: cfg.next === 'ready' ? '#2ed573' : cfg.next === 'completed' ? '#a4b0be' : 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 24px', cursor: 'pointer', fontSize: '1rem', fontWeight: '700', fontFamily: 'inherit', width: '100%', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            {cfg.nextLabel}
          </button>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontWeight: '600', padding: '12px' }}>Order Completed</div>
        )}
      </div>
    </div>
  );
}
