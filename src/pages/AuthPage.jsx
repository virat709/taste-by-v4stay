import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { login, signup, resetPassword, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { user } = await signup(email, password);
        const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
        await setDoc(doc(db, 'restaurants', user.uid), {
          ownerId: user.uid,
          name: restaurantName || 'My Restaurant',
          email: user.email,
          currency: '₹',
          plan: 'trial',
          trialStartedAt: serverTimestamp(),
          trialEndsAt: Timestamp.fromDate(trialEnd),
          createdAt: serverTimestamp(),
        });
      } else {
        await login(email, password);
      }
      navigate('/admin');
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/\(auth\/.*\)\.?/, '').trim());
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email address first.');
      return;
    }
    setError('');
    setResetting(true);
    try {
      await resetPassword(email.trim());
      setResetSent(true);
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/\(auth\/.*\)\.?/, '').trim());
    } finally {
      setResetting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/admin');
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/\(auth\/.*\)\.?/, '').trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      padding: '20px'
    }}>
      {/* Decorative blobs */}
      <div style={{ position: 'fixed', top: '-100px', right: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255,71,87,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-100px', left: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(46,213,115,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div className="animate-fade-in" style={{ width: '100%', maxWidth: '440px', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '28px', padding: '40px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', fontSize: '2rem', fontWeight: '800', color: 'white' }}>
            <img src="/v4-logo.png" alt="v4stay" style={{ height: '40px' }} />
            <span>Taste</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '8px', fontSize: '0.95rem' }}>
            {mode === 'login' ? 'Welcome back! Sign in to your dashboard.' : 'Create your restaurant account.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mode === 'signup' && (
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
              <input style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.07)', color: 'white', fontFamily: 'inherit', fontSize: '1rem', outline: 'none' }}
                placeholder="Restaurant Name" value={restaurantName} onChange={e => setRestaurantName(e.target.value)} required />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
            <input style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.07)', color: 'white', fontFamily: 'inherit', fontSize: '1rem', outline: 'none' }}
              type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
            <input style={{ width: '100%', padding: '14px 48px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.07)', color: 'white', fontFamily: 'inherit', fontSize: '1rem', outline: 'none' }}
              type={showPass ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {resetSent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ background: 'rgba(46,213,115,0.15)', border: '1px solid rgba(46,213,115,0.4)', borderRadius: '12px', padding: '16px', color: '#2ed573', fontSize: '0.88rem', textAlign: 'center', lineHeight: '1.5', marginBottom: '16px' }}>
                Reset link sent! Check your email (including spam) to reset your password.
              </div>
              <button type="button" onClick={() => { setResetSent(false); setError(''); }}
                style={{ background: 'none', border: 'none', color: '#ff4757', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', fontFamily: 'inherit', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                Back to Sign In
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div style={{ background: 'rgba(255,71,87,0.15)', border: '1px solid rgba(255,71,87,0.4)', borderRadius: '12px', padding: '12px 16px', color: '#ff6b81', fontSize: '0.88rem' }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} style={{ marginTop: '8px', padding: '16px', background: loading ? 'rgba(255,71,87,0.5)' : 'linear-gradient(135deg, #ff4757, #ff6b81)', color: 'white', border: 'none', borderRadius: '50px', fontWeight: '700', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(255,71,87,0.35)', transition: 'all 0.3s ease' }}>
                {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
                {!loading && <ArrowRight size={18} />}
              </button>

              {mode === 'login' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
                    <button type="button" onClick={handleForgotPassword} disabled={resetting}
                      style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500', fontFamily: 'inherit', padding: '8px', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                      {resetting ? 'Sending...' : 'Forgot password?'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', fontWeight: '500' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                  </div>

                  <button type="button" onClick={handleGoogleSignIn} disabled={loading}
                    style={{ width: '100%', padding: '14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50px', color: 'white', fontWeight: '600', fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                    <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
                    Sign in with Google
                  </button>
                </>
              )}
            </>
          )}
        </form>
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)' }}>
          By continuing, you agree to our{' '}
          <span onClick={() => window.open('/terms', '_blank')} style={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer', textDecoration: 'underline' }}>Terms</span>
          {' '}and{' '}
          <span onClick={() => window.open('/privacy', '_blank')} style={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer', textDecoration: 'underline' }}>Privacy Policy</span>
        </div>
      </div>
    </div>
  );
}
