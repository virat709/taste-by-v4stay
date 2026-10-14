import { useNavigate } from 'react-router-dom';
import { ArrowRight, Utensils, Cpu, ShieldCheck } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function FoodSoftwarePage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Helmet>
        <title>Food Software & Digital Menu Automation System | DinePulse</title>
        <meta name="description" content="Discover DinePulse, the premier food software for digital menus, table QR ordering, cloud kitchens, and restaurant food service automation." />
        <meta name="keywords" content="food software, food management software, food ordering software, restaurant food software, digital food menu" />
        <link rel="canonical" href="https://taste.v4stay.com/food-software" />

        <meta property="og:title" content="Food Software & Digital Menu Automation System | DinePulse" />
        <meta property="og:description" content="Streamline food ordering and kitchen workflows with DinePulse food software." />
        <meta property="og:url" content="https://taste.v4stay.com/food-software" />
        <meta property="og:image" content="https://taste.v4stay.com/logo.png" />
      </Helmet>

      {/* Header */}
      <header style={{ padding: '14px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800', fontSize: '1.25rem', letterSpacing: '-0.5px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/logo.png" alt="DinePulse Food Software Logo" style={{ height: '26px', width: 'auto', borderRadius: '6px' }} />
          <span>DinePulse</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={() => navigate('/auth')} className="btn-secondary" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>Sign In</button>
          <button onClick={() => navigate('/auth')} className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.88rem' }}>Get Started Free <ArrowRight size={14} /></button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '70px 40px 50px', textAlign: 'center', maxWidth: '950px', margin: '0 auto' }}>
        <span style={{ background: 'rgba(20,184,166,0.12)', color: '#14b8a6', borderRadius: '50px', padding: '5px 16px', fontSize: '0.8rem', fontWeight: '700', display: 'inline-block', marginBottom: '20px', border: '1px solid rgba(20,184,166,0.28)' }}>
          🍲 Smart Food Ordering & Management Software
        </span>
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: '800', lineHeight: '1.15', marginBottom: '20px', letterSpacing: '-1px' }}>
          Modern <span className="text-gradient-gold">Food Software</span> for Dining & Hospitality
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.65', maxWidth: '680px', margin: '0 auto 32px' }}>
          DinePulse is powerful <strong>food management software</strong> designed to digitize dining menus, speed up table ordering, and sync kitchen workflows seamlessly.
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" style={{ padding: '14px 32px', fontSize: '0.98rem' }} onClick={() => navigate('/auth')}>
            Start Free Trial <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* Pillars */}
      <section style={{ padding: '50px 40px', maxWidth: '1050px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: '800', marginBottom: '40px' }}>Smart Food Software Features</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div style={{ background: 'var(--surface)', padding: '26px', borderRadius: '18px', border: '1px solid var(--border)' }}>
            <Utensils size={18} color="#14b8a6" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '10px' }}>Interactive Digital Food Menus</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.92rem' }}>Showcase high-res food photography, Veg/Non-Veg badges, dietary filters, and allergen disclosures effortlessly.</p>
          </div>

          <div style={{ background: 'var(--surface)', padding: '26px', borderRadius: '18px', border: '1px solid var(--border)' }}>
            <Cpu size={18} color="#14b8a6" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '10px' }}>Instant Kitchen Order Dispatch</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.92rem' }}>Eliminate manual order entry errors. Food orders flow straight from guest mobile screens to kitchen preparation monitors.</p>
          </div>

          <div style={{ background: 'var(--surface)', padding: '26px', borderRadius: '18px', border: '1px solid var(--border)' }}>
            <ShieldCheck size={18} color="#14b8a6" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '10px' }}>100% Contactless & Hygiene First</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.92rem' }}>Guests scan and order on their own phones, ensuring a hygienic and modern food service experience.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '70px 40px', textAlign: 'center', background: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'white', marginBottom: '14px' }}>Ready to Elevate Your Food Service?</h2>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.05rem', marginBottom: '28px' }}>Join food businesses using DinePulse food software today.</p>
        <button onClick={() => navigate('/auth')} style={{ background: 'white', color: '#0f766e', border: 'none', padding: '14px 34px', borderRadius: '50px', fontWeight: '800', fontSize: '0.98rem', cursor: 'pointer', fontFamily: 'inherit' }}>
          Get Started Free →
        </button>
      </section>

      {/* Footer */}
      <footer style={{ padding: '28px 40px', background: 'var(--surface)', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        © 2026 DinePulse — Premier Food Software & Automation System
      </footer>
    </div>
  );
}
