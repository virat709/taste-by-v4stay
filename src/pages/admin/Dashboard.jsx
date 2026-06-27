import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, Grid2x2, LogOut, Bell, BarChart3, Settings, ExternalLink, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { doc, onSnapshot, collection, query, orderBy, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { printReceipt } from '../../components/ReceiptTemplate';
import { getEffectivePlan, getTrialDaysRemaining, PLAN_LABELS } from '../../lib/subscription';

// ─── Shared Layout ─────────────────────────────────────────────────────────────
export function AdminLayout({ children, restaurantName }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => { await logout(); navigate('/auth'); };

  const navItems = [
    { to: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/admin/menu', icon: <UtensilsCrossed size={20} />, label: 'Menu Manager' },
    { to: '/admin/tables', icon: <Grid2x2 size={20} />, label: 'Tables & QR' },
    { to: '/admin/analytics', icon: <BarChart3 size={20} />, label: 'Analytics' },
    { to: '/admin/feedback', icon: <MessageSquare size={20} />, label: 'Feedback' },
    { to: '/admin/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  const sidebar = (inDrawer) => (
    <div style={{ padding: inDrawer ? '0' : '24px 12px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: inDrawer ? '24px 12px 16px' : '8px 12px', marginBottom: inDrawer ? '0' : '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>
          <img src="/v4-logo.png" alt="v4stay" style={{ height: '32px' }} />
          <span>Taste</span>
        </div>
        {restaurantName && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '500' }}>{restaurantName}</div>}
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map(item => {
          const active = pathname === item.to;
          return (
            <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '12px',
              textDecoration: 'none', fontWeight: '600', fontSize: '0.92rem', transition: 'all 0.2s',
              background: active ? 'rgba(255,71,87,0.1)' : 'transparent',
              color: active ? 'var(--primary)' : 'var(--text-muted)',
            }}>
              {item.icon} {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
        <div style={{ padding: '8px 14px', fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
        <div style={{ display: 'flex', gap: '8px', padding: '4px 14px 8px', fontSize: '0.75rem' }}>
          <span style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => window.open('/terms', '_blank')}>Terms</span>
          <span style={{ color: 'var(--text-muted)' }}>·</span>
          <span style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => window.open('/privacy', '_blank')}>Privacy</span>
          <span style={{ color: 'var(--text-muted)' }}>·</span>
          <span style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => window.open('/contact', '_blank')}>Contact</span>
        </div>
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '12px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.92rem', width: '100%', fontFamily: 'inherit' }}>
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-color)', fontFamily: 'Outfit, sans-serif' }}>
      {/* Sidebar Overlay (mobile) */}
      <div className={`admin-sidebar-overlay ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar (desktop) + Drawer (mobile) */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`} style={{ width: '250px', minWidth: '250px', background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        {sidebar(false)}
      </aside>

      {/* Mobile Header */}
      <div className="admin-header-mobile" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '12px 16px', display: 'none', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--text-main)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '1.2rem' }}>
          <img src="/v4-logo.png" alt="v4stay" style={{ height: '24px' }} />
          <span>Taste</span>
        </div>
        <div style={{ width: '36px' }} />
      </div>

      <main className="admin-main" style={{ flex: 1, padding: '36px', overflowY: 'auto', minHeight: '100vh' }}>
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: 'var(--surface)', borderTop: '1px solid var(--border)', display: 'none', padding: '4px 0', paddingBottom: 'env(safe-area-inset-bottom, 4px)' }}
        className="admin-bottom-nav">
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          {navItems.slice(0, 5).map(item => {
            const active = pathname === item.to;
            return (
              <Link key={item.to} to={item.to} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '6px 8px', textDecoration: 'none', fontSize: '0.65rem', fontWeight: active ? '700' : '500', color: active ? 'var(--primary)' : 'var(--text-muted)', transition: 'color 0.15s' }}>
                {item.icon} {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Page ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(
      doc(db, 'restaurants', user.uid),
      (snap) => {
        if (snap.exists()) {
          setRestaurant(snap.data());
        } else {
          const defaultData = {
            ownerId: user.uid,
            name: 'My Restaurant',
            currency: '₹',
            taxRate: 0,
            createdAt: serverTimestamp()
          };
          setDoc(doc(db, 'restaurants', user.uid), defaultData).catch(() => {});
          setRestaurant(defaultData);
        }
      },
      (err) => console.error('Restaurant snapshot error:', err)
    );
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'restaurants', user.uid, 'orders'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      snap => setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      (err) => {
        console.error('Orders snapshot error:', err);
        if (err.code === 'FAILED_PRECONDITION') {
          const projectId = 'restaurant-saas-menu-automaion';
          console.warn(`Create the required Firestore composite index in the Firebase Console for project: ${projectId}`);
        }
      }
    );
  }, [user]);

  const currency = restaurant?.currency || '₹';
  const todayOrders = orders.filter(o => {
    const d = o.createdAt?.toDate?.();
    return d && d.toDateString() === new Date().toDateString();
  });
  const todayRevenue = todayOrders.reduce((s, o) => s + (o.total || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending');

  const updateStatus = async (orderId, status) => {
    await updateDoc(doc(db, 'restaurants', user.uid, 'orders', orderId), { status });
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <AdminLayout restaurantName={restaurant?.name}>
      {/* Plan Banner */}
      {restaurant && (() => {
        const effective = getEffectivePlan(restaurant);
        const planLabel = PLAN_LABELS[effective]?.label || 'Free';
        const daysLeft = getTrialDaysRemaining(restaurant);
        if (effective === 'paid') return null;
        return (
          <div style={{ marginBottom: '20px', padding: '14px 20px', borderRadius: '16px', background: effective === 'trial' ? 'rgba(30,144,255,0.08)' : 'rgba(255,71,87,0.08)', border: `1px solid ${effective === 'trial' ? 'rgba(30,144,255,0.2)' : 'rgba(255,71,87,0.2)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: '700', fontSize: '0.9rem', color: effective === 'trial' ? '#1e90ff' : '#ff4757' }}>{effective === 'trial' ? `🔷 Free Trial — ${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining` : '⚠️ Trial Expired — Free Plan'}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {effective === 'free' && (
                <button onClick={() => navigate('/admin/settings')} style={{ padding: '8px 20px', background: 'linear-gradient(135deg, #ff4757, #ff6b81)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Upgrade to Premium — ₹14,999/yr
                </button>
              )}
            </div>
          </div>
        );
      })()}

      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: '800', marginBottom: '4px' }}>
            {greeting}, {restaurant?.name || 'Restaurant'} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Here's a snapshot of today's activity.</p>
        </div>
        <button onClick={() => window.open(`/menu/${user.uid}/1`, '_blank')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ExternalLink size={18} /> Preview Menu
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <StatCard label="Today's Orders" value={todayOrders.length} sub={`${pendingOrders.length} pending`} color="#ff4757" />
        <StatCard label="Today's Revenue" value={`${currency}${todayRevenue.toFixed(2)}`} sub="Today total" color="#2ed573" />
        <StatCard label="Total Orders" value={orders.length} sub="All time" color="#1e90ff" />
      </div>

      {/* Live Orders */}
      <div style={{ background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Live Orders</h2>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <span style={{ width: '8px', height: '8px', background: '#2ed573', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            Real-time
          </span>
        </div>
        {orders.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Bell size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
            <h3 style={{ marginBottom: '8px', fontWeight: '600' }}>No orders yet</h3>
            <p>Orders placed by guests will appear here in real time.</p>
          </div>
        ) : (
          orders.slice(0, 20).map(order => (
            <OrderRow key={order.id} order={order} restaurant={restaurant} currency={currency} onUpdateStatus={updateStatus} />
          ))
        )}
      </div>
    </AdminLayout>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: '18px', padding: '22px 24px', border: '1px solid var(--border)', borderLeft: `4px solid ${color}` }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>{label}</p>
      <p style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px', lineHeight: 1 }}>{value}</p>
      <span style={{ background: `${color}18`, color, borderRadius: '50px', padding: '3px 10px', fontSize: '0.76rem', fontWeight: '700' }}>{sub}</span>
    </div>
  );
}

function OrderRow({ order, restaurant, currency, onUpdateStatus }) {
  const statusConfig = {
    pending: { label: 'Pending', color: '#ff9f43', next: 'preparing', nextLabel: 'Start Preparing' },
    preparing: { label: 'Preparing', color: '#1e90ff', next: 'ready', nextLabel: 'Mark Ready' },
    ready: { label: 'Ready', color: '#2ed573', next: 'completed', nextLabel: 'Serve & Complete' },
    completed: { label: 'Done', color: '#a4b0be', next: null },
    cancelled: { label: 'Cancelled', color: '#ff4757', next: null },
  };
  const cfg = statusConfig[order.status] || statusConfig.pending;
  const time = order.createdAt?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '4px' }}>Table {order.tableNumber}</div>
        <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
          {order.items?.map(i => (
            <div key={i.id || i.name} style={{ marginBottom: '2px' }}>
              {i.name} ×{i.qty}
              {i.modifiers?.length > 0 && (
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                  ({i.modifiers.map(m => m.optionName).join(', ')})
                </span>
              )}
            </div>
          ))}
        </div>
        {order.instructions && (
          <div style={{ marginTop: '6px', fontSize: '0.85rem', background: 'rgba(255,71,87,0.06)', padding: '6px 10px', borderRadius: '8px', color: 'var(--text-muted)', display: 'inline-block' }}>
            📝 {order.instructions}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>{currency}{(order.total || 0).toFixed(2)}</span>
        <span style={{ background: `${cfg.color}18`, color: cfg.color, borderRadius: '50px', padding: '6px 16px', fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase' }}>{cfg.label}</span>
        
        {cfg.next && (
          <button onClick={() => onUpdateStatus(order.id, cfg.next)} style={{ background: cfg.next === 'ready' ? '#2ed573' : cfg.next === 'completed' ? '#a4b0be' : 'var(--primary)', border: 'none', borderRadius: '12px', padding: '10px 24px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '800', fontFamily: 'inherit', color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            {cfg.nextLabel}
          </button>
        )}
        
        {order.status === 'pending' && (
          <button onClick={() => onUpdateStatus(order.id, 'cancelled')} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '12px', padding: '8px 16px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', fontFamily: 'inherit', color: 'var(--text-muted)' }}>
            Cancel
          </button>
        )}

        <button onClick={() => printReceipt(order, restaurant)} style={{ background: 'var(--bg-color)', border: '2px solid var(--border)', borderRadius: '12px', padding: '8px 20px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '700', fontFamily: 'inherit', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🖨️ Print
        </button>

        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>{time}</span>
      </div>
    </div>
  );
}
