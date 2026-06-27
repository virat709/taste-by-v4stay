import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, QrCode, TrendingUp, ArrowRight, Smartphone, Zap, ShieldCheck, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      {/* Header */}
      <header style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '800', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>
          <img src="/v4-logo.png" alt="v4stay" style={{ height: '36px' }} />
          <span>Taste</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={() => navigate('/auth')} className="btn-secondary" style={{ padding: '10px 20px' }}>Sign In</button>
          <button onClick={() => navigate('/auth')} className="btn-primary" style={{ padding: '10px 20px' }}>Get Started Free <ArrowRight size={16} /></button>
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: '80px 40px 60px', textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
        <div className="animate-fade-in">
          <span style={{ background: 'rgba(255,71,87,0.1)', color: 'var(--primary)', borderRadius: '50px', padding: '6px 18px', fontSize: '0.85rem', fontWeight: '700', display: 'inline-block', marginBottom: '24px', border: '1px solid rgba(255,71,87,0.2)' }}>
            🚀 Built for Indian Restaurants
          </span>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '800', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-1px' }}>
            The Smartest Way to<br />
            <span className="text-gradient">Manage Your Menu</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '40px', lineHeight: '1.7', maxWidth: '600px', margin: '0 auto 40px' }}>
            Let your guests scan a QR code and browse your full menu, place orders, and pay — all from their phone. No app download needed.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ padding: '16px 36px', fontSize: '1.1rem' }} onClick={() => navigate('/auth')}>
              Start for Free <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '60px 40px', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: '800', marginBottom: '48px' }}>Everything your restaurant needs</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <FeatureCard icon="🍽️" title="Digital Menu Builder" description="Create beautiful categories and items with photos, descriptions, and veg/non-veg tags. Update anytime, instantly." />
          <FeatureCard icon="📲" title="Instant QR Codes" description="Auto-generate unique QR codes per table. Guests scan, browse, and order — no app install required." />
          <FeatureCard icon="⚡" title="Real-time Orders" description="See every order pop up on your dashboard the moment a guest places it. Never miss a table." />
          <FeatureCard icon="📊" title="Order Dashboard" description="Track pending, preparing, and completed orders. View today's revenue at a glance." />
          <FeatureCard icon="🛒" title="Guest Cart & Checkout" description="Guests can add multiple items, review their cart, and place an order in seconds." />
          <FeatureCard icon="🔒" title="Secure & Reliable" description="Firebase-powered backend ensures your data is safe, real-time, and always available." />
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '60px 40px', background: 'var(--surface)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '48px' }}>Get live in 3 steps</h2>
        <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '900px', margin: '0 auto' }}>
          <StepCard num="1" title="Sign up & add your menu" desc="Create your account, add categories and dishes with photos and prices." />
          <StepCard num="2" title="Add your tables" desc="Enter your table numbers — QR codes are generated automatically." />
          <StepCard num="3" title="Print & place QR codes" desc="Download QR codes, print them, and place on tables. You're live!" />
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: '80px 40px', textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '12px' }}>Simple, transparent pricing</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '48px' }}>Start free. Upgrade when you're ready to take orders online.</p>
        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {/* Free Plan */}
          <div style={{ flex: '1', minWidth: '280px', maxWidth: '380px', background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)', padding: '36px 28px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>Free</div>
            <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '20px' }}>14-day free trial, then limited</div>
            <div style={{ marginBottom: '28px', flex: 1 }}>
              {['Digital Menu Builder', 'Unlimited QR Codes', 'Guest Menu Viewing', '14-day full feature trial'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', fontSize: '0.92rem', textAlign: 'left' }}>
                  <CheckCircle size={18} color="#2ed573" style={{ flexShrink: 0 }} /> {f}
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/auth')} className="btn-secondary" style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>Get Started</button>
          </div>

          {/* Premium Plan */}
          <div style={{ flex: '1', minWidth: '280px', maxWidth: '380px', background: 'var(--surface)', borderRadius: '24px', border: '2px solid #ff4757', padding: '36px 28px', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 8px 32px rgba(255,71,87,0.12)' }}>
            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #ff4757, #ff6b81)', color: 'white', padding: '4px 18px', borderRadius: '50px', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Most Popular</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)', marginBottom: '4px' }}>Premium</div>
            <div style={{ marginBottom: '4px' }}>
              <span style={{ fontSize: '2.8rem', fontWeight: '800' }}>₹9,999</span>
              <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>/year</span>
            </div>
            <div style={{ marginBottom: '28px', flex: 1 }}>
              {['Everything in Free, plus:', 'Guest Ordering (Cash & UPI)', 'Real-time Order Dashboard', 'Staff Dashboard & Kitchen Display', 'Sales Analytics & Charts', 'Guest Feedback System', 'Order History & Receipts', 'Priority Support'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', fontSize: '0.92rem', textAlign: 'left', color: f.startsWith('Every') ? 'var(--text-muted)' : 'var(--text-main)' }}>
                  <CheckCircle size={18} color={f.startsWith('Every') ? 'var(--text-muted)' : '#2ed573'} style={{ flexShrink: 0 }} /> {f}
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/auth')} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>Start Free Trial</button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 40px', textAlign: 'center', background: 'linear-gradient(135deg, #ff4757 0%, #c0392b 100%)' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Ready to go digital?</h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', marginBottom: '32px' }}>Join restaurants already using Taste by v4stay to delight their guests.</p>
        <button onClick={() => navigate('/auth')} style={{ background: 'white', color: '#ff4757', border: 'none', padding: '16px 40px', borderRadius: '50px', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          Create Free Account →
        </button>
      </section>

      {/* Footer */}
      <footer style={{ padding: '24px 40px', background: 'var(--surface)', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <span style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: '600' }} onClick={() => navigate('/terms')}>Terms</span>
          <span style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: '600' }} onClick={() => navigate('/privacy')}>Privacy</span>
          <span style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: '600' }} onClick={() => navigate('/contact')}>Contact</span>
        </div>
        © 2026 Taste by v4stay — Smart Digital Menus for Restaurants
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: '20px', padding: '28px', border: '1px solid var(--border)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{icon}</div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '10px' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>{description}</p>
    </div>
  );
}

function StepCard({ num, title, desc }) {
  return (
    <div style={{ flex: 1, minWidth: '220px', maxWidth: '260px' }}>
      <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg, #ff4757, #ff9f43)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.3rem', color: 'white', margin: '0 auto 16px' }}>{num}</div>
      <h3 style={{ fontWeight: '700', marginBottom: '8px' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>{desc}</p>
    </div>
  );
}
