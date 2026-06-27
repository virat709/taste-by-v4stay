import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from './Dashboard';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Crown, Lock } from 'lucide-react';
import { getEffectivePlan } from '../../lib/subscription';

export default function Analytics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [timeframe, setTimeframe] = useState('week'); // week, month, year
  const [planChecked, setPlanChecked] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'restaurants', user.uid, 'orders'), orderBy('createdAt', 'asc'));
    return onSnapshot(q,
      snap => setOrders(snap.docs.map(d => ({ id: d.id, ...d.data(), date: d.data().createdAt?.toDate?.() || new Date() }))),
      err => console.error('Analytics orders snapshot error:', err)
    );
  }, [user]);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(doc(db, 'restaurants', user.uid), snap => {
      if (snap.exists()) {
        setRestaurant(snap.data());
        if (!planChecked) setPlanChecked(true);
      }
    });
  }, [user]);

  const currency = restaurant?.currency || '₹';

  const { chartData, topItems, totalRev, totalOrd } = useMemo(() => {
    const now = new Date();
    let startDate;
    if (timeframe === 'week') {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeframe === 'month') {
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      startDate = new Date(now);
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const filtered = orders.filter(o => o.date >= startDate && o.status !== 'cancelled');
    
    // Grouping
    const groups = {};
    const itemsMap = {};

    filtered.forEach(o => {
      // Group by day for week/month, month for year
      let key;
      if (timeframe === 'year') {
        key = o.date.toLocaleString('default', { month: 'short' });
      } else {
        key = o.date.toLocaleDateString('default', { month: 'short', day: 'numeric' });
      }

      if (!groups[key]) groups[key] = { name: key, revenue: 0, orders: 0 };
      groups[key].revenue += (o.total || 0);
      groups[key].orders += 1;

      // Items
      o.items?.forEach(i => {
        if (!itemsMap[i.name]) itemsMap[i.name] = { name: i.name, qty: 0, revenue: 0 };
        itemsMap[i.name].qty += i.qty;
        itemsMap[i.name].revenue += (i.price * i.qty);
      });
    });

    return {
      chartData: Object.values(groups),
      topItems: Object.values(itemsMap).sort((a,b) => b.qty - a.qty).slice(0, 5),
      totalRev: filtered.reduce((s, o) => s + (o.total || 0), 0),
      totalOrd: filtered.length
    };
  }, [orders, timeframe]);

  if (planChecked && restaurant && getEffectivePlan(restaurant) === 'free') {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', textAlign: 'center' }}>
          <Lock size={64} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px' }}>Analytics Locked</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', lineHeight: '1.6', marginBottom: '24px' }}>
            Sales analytics are available on the <strong>Premium plan</strong> at just ₹14,999/year.
          </p>
          <button onClick={() => navigate('/admin/settings')} style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #ff4757, #ff6b81)', border: 'none', borderRadius: '14px', color: 'white', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(255,71,87,0.3)' }}>
            <Crown size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Upgrade to Premium
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: '800', marginBottom: '4px' }}>Analytics</h1>
          <p style={{ color: 'var(--text-muted)' }}>Visualize your business performance.</p>
        </div>
        <div style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '4px' }}>
          {['week', 'month', 'year'].map(t => (
            <button key={t} onClick={() => setTimeframe(t)} style={{
              background: timeframe === t ? 'var(--primary)' : 'transparent',
              color: timeframe === t ? 'white' : 'var(--text-muted)',
              border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
              fontWeight: '600', fontSize: '0.85rem', textTransform: 'capitalize', transition: 'all 0.2s'
            }}>
              Last {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'var(--surface)', borderRadius: '18px', padding: '22px 24px', border: '1px solid var(--border)', borderLeft: `4px solid #2ed573` }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Revenue ({timeframe})</p>
          <p style={{ fontSize: '2.2rem', fontWeight: '800', lineHeight: 1 }}>{currency}{totalRev.toFixed(2)}</p>
        </div>
        <div style={{ background: 'var(--surface)', borderRadius: '18px', padding: '22px 24px', border: '1px solid var(--border)', borderLeft: `4px solid #1e90ff` }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Orders ({timeframe})</p>
          <p style={{ fontSize: '2.2rem', fontWeight: '800', lineHeight: 1 }}>{totalOrd}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Revenue Chart */}
        <div style={{ background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--border)', padding: '24px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '20px' }}>Revenue Trend</h2>
          <div style={{ height: '300px', width: '100%' }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2ed573" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2ed573" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} tickFormatter={v => `${currency}${v}`} />
                  <Tooltip contentStyle={{background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} itemStyle={{color: 'var(--text-main)', fontWeight: '700'}} />
                  <Area type="monotone" dataKey="revenue" stroke="#2ed573" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data for this period</div>
            )}
          </div>
        </div>

        {/* Orders Chart */}
        <div style={{ background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--border)', padding: '24px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '20px' }}>Order Volume</h2>
          <div style={{ height: '300px', width: '100%' }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} allowDecimals={false} />
                  <Tooltip contentStyle={{background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} itemStyle={{color: 'var(--text-main)', fontWeight: '700'}} cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                  <Bar dataKey="orders" fill="#1e90ff" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data for this period</div>
            )}
          </div>
        </div>
      </div>

      {/* Top Items */}
      <div style={{ background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Top Selling Items</h2>
        </div>
        {topItems.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>No item data available</div>
        ) : (
          <div style={{ padding: '0 24px' }}>
            {topItems.map((item, i) => (
              <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: i < topItems.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,71,87,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.9rem' }}>
                    #{i + 1}
                  </div>
                  <span style={{ fontWeight: '600' }}>{item.name}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '700' }}>{item.qty} sold</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{currency}{item.revenue.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
