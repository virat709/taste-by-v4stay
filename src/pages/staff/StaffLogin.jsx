import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function StaffLogin() {
  const [restaurantId, setRestaurantId] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const snap = await getDoc(doc(db, 'restaurants', restaurantId.trim()));
      if (!snap.exists()) {
        setError('Restaurant not found. Please check the ID.');
        setLoading(false);
        return;
      }

      const data = snap.data();
      if (!data.staffPin) {
        setError('Staff access is not configured for this restaurant.');
        setLoading(false);
        return;
      }

      if (data.staffPin === pin.trim()) {
        localStorage.setItem('staffSession', JSON.stringify({
          restaurantId: restaurantId.trim(),
          restaurantName: data.name
        }));
        navigate('/staff/dashboard');
      } else {
        setError('Incorrect PIN.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)', padding: '20px' }}>
      <div style={{ background: 'var(--surface)', padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '400px', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: '800', fontSize: '2rem', letterSpacing: '-0.5px', marginBottom: '8px' }}>
            <img src="/v4-logo.png" alt="v4stay" style={{ height: '36px' }} />
            Taste <span className="text-gradient">Staff</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Enter your restaurant credentials to view live orders.</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Restaurant ID</label>
            <input 
              className="input-field" 
              value={restaurantId} 
              onChange={e => setRestaurantId(e.target.value)} 
              placeholder="e.g. abcd1234efgh"
              required 
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>4-Digit PIN</label>
            <input 
              className="input-field" 
              type="password"
              pattern="\d{4}"
              maxLength={4}
              value={pin} 
              onChange={e => setPin(e.target.value)} 
              placeholder="••••"
              style={{ letterSpacing: '4px', fontSize: '1.2rem' }}
              required 
            />
          </div>

          {error && <div style={{ color: '#ff4757', fontSize: '0.85rem', fontWeight: '600', textAlign: 'center' }}>{error}</div>}

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginTop: '10px' }}>
            {loading ? 'Verifying...' : 'Access Live Orders'}
          </button>
        </form>
      </div>
    </div>
  );
}
