import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

export default function StaffLogin() {
  // A shareable portal link (/staff/:restaurantId) preloads the restaurant —
  // waiters skip step 1 entirely and go straight to "select your name".
  const { restaurantId: paramId } = useParams();
  const [step, setStep] = useState(paramId ? 2 : 1);
  const [restaurantId, setRestaurantId] = useState(paramId || '');
  const [restaurantName, setRestaurantName] = useState('');
  const [pin, setPin] = useState('');
  const [waiters, setWaiters] = useState([]);
  const [waiterId, setWaiterId] = useState('');
  const [waiterPin, setWaiterPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingLink, setLoadingLink] = useState(!!paramId);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Portal link mode: preload restaurant + waiters automatically
  useEffect(() => {
    if (!paramId) return;
    let subscribed = true;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'restaurants', paramId));
        if (!snap.exists()) {
          if (subscribed) setError('This restaurant link is invalid or the restaurant no longer exists.');
          setLoadingLink(false);
          return;
        }
        const data = snap.data();
        const waitersSnap = await getDocs(collection(db, 'restaurants', paramId, 'staff'));
        const list = waitersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (!subscribed) return;
        if (list.length === 0) {
          setError('No waiters have been added yet. Ask the manager to add waiters in DinePulse Admin → Waiters.');
        } else {
          setRestaurantName(data.name || '');
          setWaiters(list);
        }
      } catch (err) {
        console.error('Portal link load failed:', err);
        if (subscribed) setError('Could not load the portal. Please try again later.');
      }
      setLoadingLink(false);
    })();
    return () => { subscribed = false; };
  }, [paramId]);

  // Step 1 (legacy /staff flow): verify restaurant + shared access PIN
  const handleRestaurantLogin = async (e) => {
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

      if (data.staffPin !== pin.trim()) {
        setError('Incorrect PIN.');
        setLoading(false);
        return;
      }

      const waitersSnap = await getDocs(collection(db, 'restaurants', restaurantId.trim(), 'staff'));
      const list = waitersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      if (list.length === 0) {
        setError('No waiters have been added yet. Ask the manager to add waiters in DinePulse Admin → Waiters.');
        setLoading(false);
        return;
      }

      setRestaurantName(data.name);
      setWaiters(list);
      setStep(2);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(
        err?.code === 'permission-denied'
          ? 'Access blocked: publish the "staff" Firestore rules first (see DinePulse Admin → Waiters → setup note).'
          : 'An error occurred. Please try again.'
      );
      setLoading(false);
    }
  };

  // Step 2: waiter identifies themselves with personal PIN
  const handleWaiterLogin = (e) => {
    e.preventDefault();
    setError('');
    if (!waiters.find(w => w.id === waiterId)) {
      setError('Please select your name.');
      return;
    }

    try {
      setLoading(true);
      // Validate personal PIN against the waiter's record
      const waiter = waiters.find(w => w.id === waiterId);
      if (!waiter || waiter.pin !== waiterPin.trim()) {
        setError('Incorrect personal PIN.');
        setLoading(false);
        return;
      }

      localStorage.setItem('staffSession', JSON.stringify({
        restaurantId: restaurantId.trim(),
        restaurantName: restaurantName,
        staffId: waiter.id,
        staffName: waiter.name
      }));
      navigate('/staff/dashboard');
    } catch (err) {
      console.error(err);
      setError('Login failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)', padding: '20px' }}>
      <div style={{ background: 'var(--surface)', padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '400px', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: '800', fontSize: '2rem', letterSpacing: '-0.5px', marginBottom: '8px' }}>
            <img src="/logo.png" alt="DinePulse" style={{ height: '36px', width: 'auto', borderRadius: '8px' }} />
            DinePulse <span className="text-gradient">Staff</span>
          </h1>
          {paramId ? (
            <p style={{ color: 'var(--text-muted)', fontWeight: '700' }}>
              {restaurantName || (loadingLink ? 'Loading portal...' : '')}
            </p>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>
              {step === 1 ? 'Enter your restaurant credentials.' : 'Who is on duty? Select your name.'}
            </p>
          )}
        </div>

        {loadingLink ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : step === 1 ? (
          <form onSubmit={handleRestaurantLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
              {loading ? 'Verifying...' : 'Next'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleWaiterLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Select your name</label>
              <select
                className="input-field"
                value={waiterId}
                onChange={e => setWaiterId(e.target.value)}
                required
                style={{ padding: '12px 14px' }}
              >
                <option value="" disabled>Choose waiter...</option>
                {waiters.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Your personal PIN</label>
              <input
                className="input-field"
                type="password"
                pattern="\d{4}"
                maxLength={4}
                value={waiterPin}
                onChange={e => setWaiterPin(e.target.value)}
                placeholder="••••"
                style={{ letterSpacing: '4px', fontSize: '1.2rem' }}
                required
              />
            </div>

            {error && <div style={{ color: '#ff4757', fontSize: '0.85rem', fontWeight: '600', textAlign: 'center' }}>{error}</div>}

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginTop: '10px' }}>
              {loading ? 'Signing in...' : 'Clock In 🤝'}
            </button>

            {!paramId && (
              <button type="button" onClick={() => { setStep(1); setError(''); setWaiterPin(''); }}
                style={{ width: '100%', padding: '10px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem' }}>
                ← Back to restaurant login
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
