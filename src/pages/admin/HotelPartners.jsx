import React, { useEffect, useState } from 'react';
import { AdminLayout } from './Dashboard';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import {
  doc, onSnapshot, collection, updateDoc, deleteDoc,
  serverTimestamp, query, orderBy
} from 'firebase/firestore';
import {
  Hotel, Link2, Trash2, CheckCircle2, Clock, XCircle,
  Copy, Check, RefreshCw, Eye, EyeOff, AlertCircle, Building2
} from 'lucide-react';

function genKey(uid) {
  const rand = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `DP-${uid.slice(0, 6).toUpperCase()}-${rand}`;
}

function StatusBadge({ status }) {
  const map = {
    pending:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Pending',  icon: <Clock size={11} /> },
    approved: { color: '#10b981', bg: 'rgba(16,185,129,0.12)',  label: 'Approved', icon: <CheckCircle2 size={11} /> },
    rejected: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   label: 'Rejected', icon: <XCircle size={11} /> },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem',
      fontWeight: '700', color: s.color, background: s.bg,
      padding: '3px 8px', borderRadius: '20px', border: `1px solid ${s.color}30`
    }}>
      {s.icon} {s.label}
    </span>
  );
}

export default function HotelPartners() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [partners, setPartners] = useState([]);
  const [myKey, setMyKey] = useState('');
  const [keyVisible, setKeyVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hotelOrders, setHotelOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingKey, setGeneratingKey] = useState(false);
  const [tab, setTab] = useState('partners');

  useEffect(() => {
    if (!user) return;
    return onSnapshot(doc(db, 'restaurants', user.uid), snap => {
      if (snap.exists()) {
        const d = snap.data();
        setRestaurant(d);
        setMyKey(d?.integrationKey || '');
      }
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'restaurants', user.uid, 'hotelPartners'),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, snap => {
      setPartners(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'restaurants', user.uid, 'orders'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setHotelOrders(all.filter(o => o.source === 'hotel'));
    });
  }, [user]);

  const generateKey = async () => {
    if (!user) return;
    setGeneratingKey(true);
    try {
      const key = genKey(user.uid);
      await updateDoc(doc(db, 'restaurants', user.uid), {
        integrationKey: key,
        integrationKeyGeneratedAt: serverTimestamp(),
      });
    } finally {
      setGeneratingKey(false);
    }
  };

  const copyKey = () => {
    if (!myKey) return;
    navigator.clipboard.writeText(myKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const approvePartner = id =>
    updateDoc(doc(db, 'restaurants', user.uid, 'hotelPartners', id), {
      status: 'approved', approvedAt: serverTimestamp(),
    });

  const rejectPartner = id =>
    updateDoc(doc(db, 'restaurants', user.uid, 'hotelPartners', id), {
      status: 'rejected', rejectedAt: serverTimestamp(),
    });

  const removePartner = id =>
    deleteDoc(doc(db, 'restaurants', user.uid, 'hotelPartners', id));

  const updateOrderStatus = (orderId, status) =>
    updateDoc(doc(db, 'restaurants', user.uid, 'orders', orderId), {
      status, updatedAt: serverTimestamp(),
    });

  const currency = restaurant?.currency || '₹';

  const tabItems = [
    { key: 'partners', label: `Partners (${partners.length})` },
    { key: 'orders',   label: `Hotel Orders (${hotelOrders.length})` },
  ];

  return (
    <AdminLayout restaurantName={restaurant?.name}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #d97706, #f59e0b)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Hotel size={20} color="#060709" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0 }}>Hotel Partners</h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              Manage V4Stay hotel integrations — let hotel guests order from your menu
            </p>
          </div>
        </div>

        {/* Integration Key Card */}
        <div style={{ background: 'var(--surface)', borderRadius: '20px', padding: '24px',
          border: '1px solid var(--border)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Link2 size={16} color="#f59e0b" />
            <h2 style={{ fontSize: '1rem', fontWeight: '700', margin: 0 }}>Your Integration Key</h2>
          </div>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.55' }}>
            Share this key with hotel managers using <strong>V4Stay</strong>. They paste it in their admin
            panel to send you a partnership request — approve it below to go live.
          </p>

          {myKey ? (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px', background: 'var(--bg-color)',
                border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 16px',
                fontFamily: 'monospace', fontSize: '0.95rem', letterSpacing: '1px', fontWeight: '700',
                filter: keyVisible ? 'none' : 'blur(5px)', transition: 'filter 0.2s',
                userSelect: keyVisible ? 'text' : 'none' }}>
                {myKey}
              </div>
              <button onClick={() => setKeyVisible(v => !v)}
                style={{ background: 'var(--bg-color)', border: '1px solid var(--border)',
                  borderRadius: '10px', padding: '10px 14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem',
                  fontWeight: '600', color: 'var(--text-muted)', fontFamily: 'inherit' }}>
                {keyVisible ? <EyeOff size={15} /> : <Eye size={15} />}
                {keyVisible ? 'Hide' : 'Show'}
              </button>
              <button onClick={copyKey}
                style={{ background: copied ? 'rgba(16,185,129,0.1)' : 'var(--bg-color)',
                  border: `1px solid ${copied ? '#10b981' : 'var(--border)'}`,
                  borderRadius: '10px', padding: '10px 14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem',
                  fontWeight: '600', color: copied ? '#10b981' : 'var(--text-muted)',
                  fontFamily: 'inherit', transition: 'all 0.2s' }}>
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={generateKey} disabled={generatingKey}
                style={{ background: 'var(--bg-color)', border: '1px solid var(--border)',
                  borderRadius: '10px', padding: '10px 14px', cursor: generatingKey ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem',
                  fontWeight: '600', color: 'var(--text-muted)', fontFamily: 'inherit' }}>
                <RefreshCw size={15} /> Regenerate
              </button>
            </div>
          ) : (
            <button onClick={generateKey} disabled={generatingKey} className="btn-primary"
              style={{ padding: '12px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Link2 size={16} /> {generatingKey ? 'Generating…' : 'Generate Integration Key'}
            </button>
          )}

          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'flex-start', gap: '6px',
            fontSize: '0.78rem', color: 'var(--text-muted)',
            background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
            borderRadius: '10px', padding: '10px 12px' }}>
            <AlertCircle size={13} style={{ flexShrink: 0, marginTop: '1px' }} color="#f59e0b" />
            Keep this key private. If compromised, regenerate it — existing approved partners remain linked.
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px',
          background: 'var(--surface)', borderRadius: '12px', padding: '4px',
          border: '1px solid var(--border)', width: 'fit-content' }}>
          {tabItems.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding: '8px 18px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontWeight: '700', fontSize: '0.85rem', transition: 'all 0.2s',
                background: tab === t.key ? 'linear-gradient(135deg,#d97706,#f59e0b)' : 'transparent',
                color: tab === t.key ? '#060709' : 'var(--text-muted)' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Partners Tab */}
        {tab === 'partners' && (
          loading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>Loading…</div>
          ) : partners.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '56px 24px',
              background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--border)' }}>
              <Building2 size={36} color="var(--text-muted)" style={{ marginBottom: '12px', opacity: 0.5 }} />
              <h3 style={{ fontWeight: '700', marginBottom: '8px' }}>No Hotel Partners Yet</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '360px', margin: '0 auto' }}>
                Share your Integration Key with V4Stay hotel admins. Once they add it, their request appears here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {partners.map(p => (
                <div key={p.id} style={{ background: 'var(--surface)', borderRadius: '16px', padding: '18px 20px',
                  border: `1px solid ${p.status === 'approved' ? 'rgba(16,185,129,0.25)' : p.status === 'rejected' ? 'rgba(239,68,68,0.2)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                    background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.15))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Hotel size={20} color="#818cf8" />
                  </div>
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <div style={{ fontWeight: '800', fontSize: '0.95rem', marginBottom: '3px' }}>
                      {p.hotelName || 'Unknown Hotel'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Hotel ID: <code style={{ fontFamily: 'monospace' }}>{p.hotelId || '—'}</code>
                    </div>
                    {p.createdAt && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Requested {new Date(p.createdAt?.toDate?.() || p.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    )}
                  </div>
                  <StatusBadge status={p.status} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {p.status === 'pending' && <>
                      <button onClick={() => approvePartner(p.id)} className="btn-primary"
                        style={{ padding: '7px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <CheckCircle2 size={13} /> Approve
                      </button>
                      <button onClick={() => rejectPartner(p.id)} className="btn-secondary"
                        style={{ padding: '7px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '5px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>
                        <XCircle size={13} /> Reject
                      </button>
                    </>}
                    {p.status === 'approved' && (
                      <button onClick={() => rejectPartner(p.id)} className="btn-secondary"
                        style={{ padding: '7px 14px', fontSize: '0.82rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>
                        Revoke
                      </button>
                    )}
                    <button onClick={() => removePartner(p.id)}
                      style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: '8px', padding: '7px 10px', cursor: 'pointer', color: '#ef4444',
                        display: 'flex', alignItems: 'center' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Hotel Orders Tab */}
        {tab === 'orders' && (
          hotelOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '56px 24px',
              background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--border)' }}>
              <Hotel size={36} color="var(--text-muted)" style={{ marginBottom: '12px', opacity: 0.5 }} />
              <h3 style={{ fontWeight: '700', marginBottom: '8px' }}>No Hotel Room Orders Yet</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '360px', margin: '0 auto' }}>
                When hotel guests order from your menu via V4Stay, orders appear here with room details.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {hotelOrders.map(o => {
                const sc = ({
                  pending:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
                  confirmed: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
                  preparing: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
                  delivered: { color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
                  cancelled: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
                })[o.status] || { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' };
                return (
                  <div key={o.id} style={{ background: 'var(--surface)', borderRadius: '16px',
                    border: '1px solid var(--border)', padding: '18px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                      marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: '800', fontSize: '0.95rem' }}>
                            🏨 Room {o.roomNumber} — {o.hotelName || 'Hotel'}
                          </span>
                          <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#818cf8',
                            background: 'rgba(129,140,248,0.1)', padding: '2px 8px', borderRadius: '20px',
                            border: '1px solid rgba(129,140,248,0.2)' }}>
                            ROOM DELIVERY
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Guest: <strong>{o.guestName}</strong>&nbsp;·&nbsp;
                          {o.createdAt?.toDate
                            ? new Date(o.createdAt.toDate()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                            : ''}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: sc.color, background: sc.bg,
                        padding: '4px 10px', borderRadius: '20px', border: `1px solid ${sc.color}30`,
                        textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {o.status}
                      </span>
                    </div>
                    <div style={{ marginBottom: '14px' }}>
                      {(o.items || []).map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between',
                          fontSize: '0.85rem', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                          <span>{item.name} <span style={{ color: 'var(--text-muted)' }}>×{item.qty}</span></span>
                          <span style={{ fontWeight: '700' }}>{currency}{(parseFloat(item.price || 0) * item.qty).toFixed(0)}</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px',
                        fontWeight: '800', fontSize: '0.95rem' }}>
                        <span>Total</span>
                        <span style={{ color: '#f59e0b' }}>{currency}{o.total || '—'}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {o.status === 'pending' && (
                        <button onClick={() => updateOrderStatus(o.id, 'confirmed')} className="btn-primary"
                          style={{ padding: '8px 18px', fontSize: '0.82rem' }}>
                          ✓ Confirm Order
                        </button>
                      )}
                      {o.status === 'confirmed' && (
                        <button onClick={() => updateOrderStatus(o.id, 'preparing')} className="btn-primary"
                          style={{ padding: '8px 18px', fontSize: '0.82rem',
                            background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', color: 'white' }}>
                          🍳 Start Preparing
                        </button>
                      )}
                      {o.status === 'preparing' && (
                        <button onClick={() => updateOrderStatus(o.id, 'delivered')} className="btn-primary"
                          style={{ padding: '8px 18px', fontSize: '0.82rem',
                            background: 'linear-gradient(135deg,#059669,#10b981)', color: 'white' }}>
                          🛵 Mark Delivered to Room {o.roomNumber}
                        </button>
                      )}
                      {!['delivered', 'cancelled'].includes(o.status) && (
                        <button onClick={() => updateOrderStatus(o.id, 'cancelled')} className="btn-secondary"
                          style={{ padding: '8px 14px', fontSize: '0.82rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

      </div>
    </AdminLayout>
  );
}
