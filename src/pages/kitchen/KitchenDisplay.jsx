import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { doc, collection, onSnapshot, query, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ChefHat, Bell } from 'lucide-react';

export default function KitchenDisplay() {
  const { restaurantId } = useParams();
  const [orders, setOrders] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const prevCount = useRef(0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!restaurantId) return;
    const q = query(collection(db, 'restaurants', restaurantId, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      const allOrders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setOrders(allOrders);
    });
    return unsub;
  }, [restaurantId]);

  useEffect(() => {
    if (!restaurantId) return;
    return onSnapshot(doc(db, 'restaurants', restaurantId), snap => {
      if (snap.exists()) setRestaurant(snap.data());
    });
  }, [restaurantId]);

  const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'preparing');
  const currency = restaurant?.currency || '₹';

  useEffect(() => {
    if (activeOrders.length > prevCount.current && prevCount.current > 0) {
      try {
        audioRef.current?.play();
      } catch {}
    }
    prevCount.current = activeOrders.length;
  }, [activeOrders.length]);

  const updateStatus = async (orderId, status) => {
    await updateDoc(doc(db, 'restaurants', restaurantId, 'orders', orderId), { status });
  };

  if (!restaurantId) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#0d0f14', color: '#f1f2f6', fontFamily: 'Outfit, sans-serif', padding: '24px' }}>
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACAf39/f4B/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+A" preload="auto" />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ChefHat size={32} color="#ff4757" />
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Kitchen Display</h1>
          {restaurant?.name && <span style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '600' }}>— {restaurant.name}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {activeOrders.length > 0 && (
            <span style={{ background: '#ff4757', color: 'white', padding: '8px 20px', borderRadius: '50px', fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={20} />
              {activeOrders.length} Active
            </span>
          )}
        </div>
      </div>

      {/* Orders Grid */}
      {activeOrders.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh', color: '#6b7280' }}>
          <ChefHat size={80} style={{ opacity: 0.3, marginBottom: '20px' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>All Caught Up!</h2>
          <p style={{ fontSize: '1.1rem' }}>No pending orders. Waiting for the next one...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
          {activeOrders.map(order => (
            <div key={order.id} style={{
              background: order.status === 'pending' ? '#1a0f14' : '#0f141e',
              borderRadius: '20px',
              border: `2px solid ${order.status === 'pending' ? '#ff4757' : '#1e90ff'}`,
              padding: '24px',
              boxShadow: order.status === 'pending' ? '0 0 30px rgba(255,71,87,0.15)' : 'none'
            }}>
              {/* Order Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: '800' }}>Table {order.tableNumber}</span>
                  {order.status === 'pending' && <span style={{ background: '#ff4757', color: 'white', padding: '4px 12px', borderRadius: '50px', fontSize: '0.9rem', fontWeight: '800' }}>NEW</span>}
                  {order.status === 'preparing' && <span style={{ background: '#1e90ff', color: 'white', padding: '4px 12px', borderRadius: '50px', fontSize: '0.9rem', fontWeight: '800' }}>PREPARING</span>}
                </div>
                <span style={{ color: '#6b7280', fontSize: '0.95rem' }}>
                  {order.createdAt?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                {order.items?.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontWeight: '700', fontSize: '1.2rem' }}>
                        <span style={{ color: '#ff4757', marginRight: '8px' }}>{item.qty}×</span> {item.name}
                      </span>
                      {item.modifiers?.length > 0 && (
                        <div style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '4px', marginLeft: '36px' }}>
                          {item.modifiers.map(m => m.optionName).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Instructions */}
              {order.instructions && (
                <div style={{ marginBottom: '16px', background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: '12px', padding: '12px 16px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#ff4757', marginBottom: '4px' }}>📝 Instructions</div>
                  <div style={{ fontSize: '1.05rem' }}>{order.instructions}</div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px' }}>
                {order.status === 'pending' && (
                  <button onClick={() => updateStatus(order.id, 'preparing')} style={{ flex: 1, padding: '16px', background: '#1e90ff', border: 'none', borderRadius: '14px', color: 'white', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Start Preparing
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button onClick={() => updateStatus(order.id, 'ready')} style={{ flex: 1, padding: '16px', background: '#2ed573', border: 'none', borderRadius: '14px', color: 'white', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Mark Ready
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}