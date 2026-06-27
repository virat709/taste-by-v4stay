import React, { useEffect, useState } from 'react';
import { AdminLayout } from './Dashboard';
import { useAuth } from '../../context/AuthContext';
import { db, storage } from '../../lib/firebase';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Save, UploadCloud, Settings as SettingsIcon, Crown, CheckCircle, Copy, Check, Smartphone } from 'lucide-react';
import { getEffectivePlan, getTrialDaysRemaining, PLAN_LABELS, PLAN_FEATURES, PROVIDER_UPI_ID, PREMIUM_PRICE, PREMIUM_PRICE_LABEL } from '../../lib/subscription';

export default function Settings() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    currency: '₹',
    taxRate: 0,
    upiId: '',
    staffPin: '',
    logoUrl: ''
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
      const snap = await getDoc(doc(db, 'restaurants', user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          currency: data.currency || '₹',
          taxRate: data.taxRate || 0,
          upiId: data.upiId || '',
          staffPin: data.staffPin || '',
          logoUrl: data.logoUrl || ''
        });
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
    return onSnapshot(q, snap => {
      setPaymentRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [user]);

  const submitPaymentProof = async () => {
    if (!utrNumber.trim()) return;
    setSubmittingPayment(true);
    try {
      await addDoc(collection(db, 'restaurants', user.uid, 'payments'), {
        utr: utrNumber.trim(),
        payerName: paymentName.trim() || 'Unknown',
        amount: PREMIUM_PRICE,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setUtrNumber('');
      setPaymentName('');
      setShowPaymentForm(false);
      setMessage('Payment proof submitted! We will verify and upgrade your account within 24 hours.');
      setTimeout(() => setMessage(''), 5000);
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

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    
    try {
      setMessage('Uploading image...');
      const storageRef = ref(storage, `restaurants/${user.uid}/${field}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFormData(prev => ({ ...prev, [field]: url }));
      setMessage('Upload successful!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Upload failed. Please check Firebase Storage rules.');
    }
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
          <SettingsIcon /> Settings
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your restaurant details, payments, and staff access.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading settings...</div>
      ) : (
        <form onSubmit={handleSave} style={{ display: 'grid', gap: '24px', maxWidth: '800px' }}>

          {/* Plan & Subscription */}
          <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Crown size={20} color={getEffectivePlan(formData) === 'free' ? 'var(--text-muted)' : '#feca57'} /> Plan
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  {getEffectivePlan(formData) === 'paid'
                    ? 'You\'re on the Premium plan. All features are unlocked.'
                    : getEffectivePlan(formData) === 'trial'
                      ? `You're on a free trial (${getTrialDaysRemaining(formData)} days remaining).`
                      : 'Your trial has ended. Upgrade to unlock all features.'}
                </p>
              </div>
              <span style={{ padding: '8px 16px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: '800', background: getEffectivePlan(formData) === 'paid' ? 'rgba(46,213,115,0.15)' : getEffectivePlan(formData) === 'trial' ? 'rgba(30,144,255,0.15)' : 'rgba(164,176,190,0.15)', color: getEffectivePlan(formData) === 'paid' ? '#2ed573' : getEffectivePlan(formData) === 'trial' ? '#1e90ff' : 'var(--text-muted)' }}>
                {PLAN_LABELS[getEffectivePlan(formData)]?.label || 'Free'}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {(PLAN_FEATURES[getEffectivePlan(formData)] || []).map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <CheckCircle size={16} color="#2ed573" /> {f}
                </div>
              ))}
            </div>
            {getEffectivePlan(formData) !== 'paid' && !showPaymentForm && (
              <div>
                <button type="button" onClick={() => setShowPaymentForm(true)} style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #ff4757, #ff6b81)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(255,71,87,0.3)' }}>
                  Upgrade to Premium — ₹9,999/year
                </button>

                {/* Show existing payment requests */}
                {paymentRequests.length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>Payment History</div>
                    {paymentRequests.map(p => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'var(--bg-color)', borderRadius: '10px', marginBottom: '6px', fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: '600' }}>UTR: {p.utr}</span>
                        <span style={{ marginLeft: 'auto', padding: '3px 10px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '700', background: p.status === 'approved' ? 'rgba(46,213,115,0.15)' : p.status === 'rejected' ? 'rgba(255,71,87,0.15)' : 'rgba(255,159,67,0.15)', color: p.status === 'approved' ? '#2ed573' : p.status === 'rejected' ? '#ff4757' : '#ff9f43' }}>
                          {p.status === 'approved' ? 'Approved' : p.status === 'rejected' ? 'Rejected' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {showPaymentForm && (
              <div className="animate-fade-in" style={{ marginTop: '16px', background: 'var(--bg-color)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border)' }}>
                <h3 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '16px' }}>Pay {PREMIUM_PRICE_LABEL} via UPI</h3>

                {/* UPI Details */}
                <div style={{ background: 'var(--surface)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border)', marginBottom: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Pay to this UPI ID</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '8px', fontFamily: 'monospace' }}>{PROVIDER_UPI_ID}</div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button type="button" onClick={() => { navigator.clipboard.writeText(PROVIDER_UPI_ID); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                      style={{ background: 'var(--bg-color)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 16px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {copied ? <><Check size={15} color="#2ed573" /> Copied</> : <><Copy size={15} /> Copy UPI ID</>}
                    </button>
                    <a href={`upi://pay?pa=${PROVIDER_UPI_ID}&pn=Taste%20by%20v4stay&am=${PREMIUM_PRICE}&cu=INR`}
                      style={{ background: '#7c3aed', border: 'none', borderRadius: '10px', padding: '8px 16px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', fontFamily: 'inherit', color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Smartphone size={15} /> Pay via UPI App
                    </a>
                  </div>
                </div>

                {/* Payment proof form */}
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
                      {submittingPayment ? 'Submitting...' : 'Submit Payment Proof'}
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
            
            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Logo URL</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input className="input-field" style={{ flex: 1 }} name="logoUrl" value={formData.logoUrl} onChange={handleChange} placeholder="https://..." />
                <label className="btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UploadCloud size={16} /> Upload
                  <input type="file" style={{ display: 'none' }} accept="image/*" onChange={e => handleFileUpload(e, 'logoUrl')} />
                </label>
              </div>
              {formData.logoUrl && <img src={formData.logoUrl} alt="Logo preview" style={{ height: '40px', marginTop: '12px', borderRadius: '8px' }} />}
            </div>
          </div>

          {/* Payment Settings */}
          <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px' }}>Guest Payments (UPI)</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>UPI ID (VPA)</label>
                <input className="input-field" name="upiId" value={formData.upiId} onChange={handleChange} placeholder="yourname@bank" />
              </div>
            </div>
          </div>

          {/* Staff Access */}
          <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>Staff Access</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Set a 4-digit PIN for your waiters. They can login at <strong>{window.location.origin}/staff</strong> using your Restaurant ID: <code style={{background: 'var(--bg-color)', padding: '2px 6px', borderRadius: '4px'}}>{user?.uid}</code>
            </p>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Staff PIN (4 digits)</label>
              <input className="input-field" name="staffPin" type="password" maxLength={4} pattern="\d{4}" value={formData.staffPin} onChange={handleChange} placeholder="e.g. 1234" style={{ maxWidth: '150px', letterSpacing: '4px', fontSize: '1.2rem', textAlign: 'center' }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button type="submit" className="btn-primary" disabled={saving}>
              <Save size={18} /> {saving ? 'Saving...' : 'Save Settings'}
            </button>
            {message && <span style={{ color: message.includes('failed') || message.includes('Error') ? '#ff4757' : '#2ed573', fontWeight: '600' }}>{message}</span>}
          </div>
        </form>
      )}
    </AdminLayout>
  );
}
