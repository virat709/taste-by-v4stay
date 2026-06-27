import React, { useEffect, useState } from 'react';
import { AdminLayout } from './Dashboard';
import { useAuth } from '../../context/AuthContext';
import { db, storage } from '../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Save, UploadCloud, Settings as SettingsIcon, Crown, CheckCircle } from 'lucide-react';
import { getEffectivePlan, getTrialDaysRemaining, PLAN_LABELS, PLAN_FEATURES } from '../../lib/subscription';

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
            {getEffectivePlan(formData) !== 'paid' && (
              <button type="button" onClick={() => window.open('https://your-upgrade-link.com', '_blank')} style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #ff4757, #ff6b81)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(255,71,87,0.3)' }}>
                Upgrade to Premium — ₹9,999/year
              </button>
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
