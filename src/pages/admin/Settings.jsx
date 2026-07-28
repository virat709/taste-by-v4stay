import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from './Dashboard';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Save, Settings as SettingsIcon, Crown, CheckCircle, Copy, Check, Smartphone, ArrowRight, CreditCard, Shield } from 'lucide-react';
import { getEffectivePlan, getTrialDaysRemaining, PLAN_LABELS, PLAN_FEATURES, PROVIDER_UPI_ID, PREMIUM_PRICE, PREMIUM_PRICE_LABEL } from '../../lib/subscription';
import { initializeRazorpayPayment } from '../../lib/razorpay';

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    currency: '₹',
    taxRate: 0,
    upiId: '',
    razorpayKeyId: '',
    staffPin: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentName, setPaymentName] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, 'restaurants', user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setFormData({
            name: data.name || '',
            phone: data.phone || '',
            currency: data.currency || '₹',
            taxRate: data.taxRate || 0,
            upiId: data.upiId || '',
            razorpayKeyId: data.razorpayKeyId || '',
            staffPin: data.staffPin || ''
          });
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
      setLoading(false);
    };
    fetchSettings();
  }, [user]);

  // Listen for payment requests
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'restaurants', user.uid, 'payments'),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q,
      snap => setPaymentRequests(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      err => console.error('Payments snapshot error:', err)
    );
  }, [user]);

  const handleRazorpayUpgrade = async () => {
    if (!user) return;
    setSubmittingPayment(true);
    setMessage('');
    try {
      await initializeRazorpayPayment({
        amount: PREMIUM_PRICE,
        currency: 'INR',
        name: 'DinePulse Premium',
        description: '1-Year Premium SaaS Subscription',
        prefill: {
          name: formData.name || user.displayName || '',
          email: user.email || '',
          contact: formData.phone || ''
        },
        onSuccess: async (res) => {
          try {
            await addDoc(collection(db, 'restaurants', user.uid, 'payments'), {
              paymentId: res.razorpay_payment_id || 'manual_id',
              method: 'Razorpay',
              amount: PREMIUM_PRICE,
              status: 'approved',
              createdAt: serverTimestamp(),
            });
            await updateDoc(doc(db, 'restaurants', user.uid), {
              plan: 'paid',
              upgradedAt: serverTimestamp(),
              razorpayPaymentId: res.razorpay_payment_id || ''
            });
            setMessage('🎉 Razorpay Payment successful! Account upgraded to Premium.');
            setTimeout(() => { navigate('/admin'); }, 1500);
          } catch (dbErr) {
            console.error('Firestore update error after Razorpay payment:', dbErr);
            setMessage('Payment recorded! Upgrading plan...');
            setTimeout(() => { navigate('/admin'); }, 1500);
          } finally {
            setSubmittingPayment(false);
          }
        },
        onFailure: (err) => {
          setSubmittingPayment(false);
          if (err?.dismissed) {
            setMessage('Razorpay payment modal closed.');
          } else {
            console.error('Razorpay failure error:', err);
            setMessage(`Payment failed: ${err?.description || err?.message || 'Transaction could not be completed.'}`);
          }
        }
      });
    } catch (err) {
      console.error('Razorpay Upgrade Error:', err);
      setSubmittingPayment(false);
      setMessage('Failed to open Razorpay checkout modal.');
    }
  };

  const submitPaymentProof = async () => {
    if (!utrNumber.trim()) return;
    setSubmittingPayment(true);
    try {
      await addDoc(collection(db, 'restaurants', user.uid, 'payments'), {
        utr: utrNumber.trim(),
        payerName: paymentName.trim() || 'Unknown',
        amount: PREMIUM_PRICE,
        status: 'approved',
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'restaurants', user.uid), {
        plan: 'paid',
        upgradedAt: serverTimestamp(),
      });
      setUtrNumber('');
      setPaymentName('');
      setShowPaymentForm(false);
      setMessage('Payment applied! Your account is now upgraded to Premium.');
      setTimeout(() => { setMessage(''); navigate('/admin'); }, 1500);
    } catch {
      setMessage('Failed to submit. Please try again.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'taxRate' ? Number(value) : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'restaurants', user.uid), formData);
      setMessage('Settings saved successfully!');
    } catch (err) {
      console.error(err);
      setMessage('Error saving settings.');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <AdminLayout>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.9rem', fontWeight: '800', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SettingsIcon size={22} /> Settings
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your restaurant details, Razorpay payments, and staff access.</p>
      </div>

      {message && (
        <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '14px 20px', borderRadius: '14px', marginBottom: '20px', fontWeight: '700', fontSize: '0.92rem' }}>
          {message}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading settings...</div>
      ) : (
        <form onSubmit={handleSave} style={{ display: 'grid', gap: '24px', maxWidth: '800px' }}>

          {/* Plan & Subscription */}
          <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Crown size={18} color={getEffectivePlan(formData) === 'free' ? 'var(--text-muted)' : '#f59e0b'} /> Subscription Plan
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  {getEffectivePlan(formData) === 'paid'
                    ? 'You\'re on the Premium plan. All features are unlocked.'
                    : getEffectivePlan(formData) === 'trial'
                      ? `You're on a free trial (${getTrialDaysRemaining(formData)} days remaining).`
                      : 'Your trial has ended. Upgrade to unlock all features.'}
                </p>
              </div>
              <span style={{ padding: '6px 14px', borderRadius: '50px', fontSize: '0.82rem', fontWeight: '800', background: getEffectivePlan(formData) === 'paid' ? 'rgba(20,184,166,0.15)' : getEffectivePlan(formData) === 'trial' ? 'rgba(245,158,11,0.15)' : 'rgba(164,176,190,0.15)', color: getEffectivePlan(formData) === 'paid' ? '#14b8a6' : getEffectivePlan(formData) === 'trial' ? '#f59e0b' : 'var(--text-muted)' }}>
                {PLAN_LABELS[getEffectivePlan(formData)]?.label || 'Free'}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {(PLAN_FEATURES[getEffectivePlan(formData)] || []).map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <CheckCircle size={15} color="#14b8a6" /> {f}
                </div>
              ))}
            </div>

            {getEffectivePlan(formData) !== 'paid' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button type="button" onClick={handleRazorpayUpgrade} disabled={submittingPayment}
                  style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #d97706, #f59e0b)', border: 'none', borderRadius: '14px', color: '#060709', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 6px 20px rgba(245,158,11,0.35)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <CreditCard size={18} /> {submittingPayment ? 'Processing Razorpay...' : 'Instant Upgrade via Razorpay — ₹14,999/yr'}
                </button>

                {!showPaymentForm && (
                  <button type="button" onClick={() => setShowPaymentForm(true)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}>
                    Or pay via Manual UPI Reference / UTR
                  </button>
                )}

                {paymentRequests.length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>Payment History</div>
                    {paymentRequests.map(p => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'var(--bg-color)', borderRadius: '10px', marginBottom: '6px', fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: '600' }}>{p.method === 'Razorpay' ? `Razorpay ID: ${p.paymentId}` : `UTR: ${p.utr}`}</span>
                        <span style={{ marginLeft: 'auto', padding: '3px 10px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '700', background: p.status === 'approved' ? 'rgba(20,184,166,0.15)' : 'rgba(245,158,11,0.15)', color: p.status === 'approved' ? '#14b8a6' : '#f59e0b' }}>
                          {p.status === 'approved' ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {showPaymentForm && (
              <div className="animate-fade-in" style={{ marginTop: '16px', background: 'var(--bg-color)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border)' }}>
                <h3 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '16px' }}>Pay {PREMIUM_PRICE_LABEL} via Manual UPI</h3>

                <div style={{ background: 'var(--surface)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border)', marginBottom: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Pay to this UPI ID</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '8px', fontFamily: 'monospace' }}>{PROVIDER_UPI_ID}</div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button type="button" onClick={() => { navigator.clipboard.writeText(PROVIDER_UPI_ID); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                      style={{ background: 'var(--bg-color)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 16px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {copied ? <><Check size={14} color="#14b8a6" /> Copied</> : <><Copy size={14} /> Copy UPI ID</>}
                    </button>
                    <a href={`upi://pay?pa=${PROVIDER_UPI_ID}&pn=DinePulse&am=${PREMIUM_PRICE}&cu=INR`}
                      style={{ background: 'linear-gradient(135deg, #0f766e, #14b8a6)', border: 'none', borderRadius: '10px', padding: '8px 16px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', fontFamily: 'inherit', color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Smartphone size={14} /> Pay via UPI App
                    </a>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  After payment, enter the <strong>UTR number</strong> (transaction reference) from your UPI app below:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input className="input-field" placeholder="Your name (optional)" value={paymentName} onChange={e => setPaymentName(e.target.value)} />
                  <input className="input-field" placeholder="UTR Number / Transaction Reference *" value={utrNumber} onChange={e => setUtrNumber(e.target.value)} />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => { setShowPaymentForm(false); setUtrNumber(''); setPaymentName(''); }}>
                      Cancel
                    </button>
                    <button type="button" className="btn-primary" style={{ flex: 1 }} onClick={submitPaymentProof} disabled={submittingPayment || !utrNumber.trim()}>
                      {submittingPayment ? 'Submitting...' : 'Confirm & Upgrade'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* General Settings */}
          <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px' }}>General Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Restaurant Name</label>
                <input className="input-field" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Contact Phone</label>
                <input className="input-field" name="phone" value={formData.phone} onChange={handleChange} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Currency Symbol</label>
                <input className="input-field" name="currency" value={formData.currency} onChange={handleChange} placeholder="₹, $, €" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Tax Rate (%)</label>
                <input className="input-field" type="number" min="0" step="0.1" name="taxRate" value={formData.taxRate} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Guest Payment Settings (UPI ID) */}
          <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={18} color="#f59e0b" /> Table Payment Settings
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Configure your restaurant's UPI ID for direct guest table payments.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Restaurant UPI ID / VPA</label>
                <input className="input-field" name="upiId" value={formData.upiId} onChange={handleChange} placeholder="yourrestaurant@upi" />
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Guests will see this UPI ID / QR code at checkout when paying for their meals.
                </div>
              </div>
            </div>
          </div>

          {/* Staff Access PIN */}
          <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} color="#14b8a6" /> Staff Security PIN
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Set a 4-digit PIN for waitstaff and kitchen KDS login access.</p>
            <div style={{ maxWidth: '300px' }}>
              <input className="input-field" name="staffPin" type="password" maxLength={6} value={formData.staffPin} onChange={handleChange} placeholder="e.g. 1234" />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '14px 36px', fontSize: '0.98rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

        </form>
      )}
    </AdminLayout>
  );
}
