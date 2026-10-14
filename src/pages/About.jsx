import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Store, Heart } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function About() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Helmet>
        <title>About Us | DinePulse</title>
        <meta name="description" content="Learn about DinePulse, our mission to empower restaurants with smart digital automation and QR code ordering." />
        <link rel="canonical" href="https://dinepulse.com/about" />
      </Helmet>

      {/* Header */}
      <header style={{ padding: '14px 40px', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', display: 'flex' }}>
          <ArrowLeft size={16} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800', fontSize: '1.2rem', letterSpacing: '-0.5px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/logo.png" alt="DinePulse" style={{ height: '26px', width: 'auto', borderRadius: '6px' }} />
          <span>DinePulse</span>
        </div>
      </header>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '50px 24px 70px' }}>
        
        {/* Hero Section */}
        <section style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '14px', letterSpacing: '-1px' }}>Empowering Restaurants</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.6', maxWidth: '580px', margin: '0 auto' }}>
            We're on a mission to bring modern, frictionless dining experiences to restaurants of all sizes across India.
          </p>
        </section>

        {/* Story & Mission */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginBottom: '60px' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Store color="var(--primary)" size={18} /> Our Story
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', lineHeight: '1.65' }}>
              DinePulse started with a simple observation: dining out should be about the food and the company, not waving down a waiter for a menu or waiting for the check. We built this platform to give restaurant owners the tools they need to serve guests faster, reduce errors, and increase table turnover, all without requiring guests to download yet another app.
            </p>
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Heart color="var(--primary)" size={18} /> Our Mission
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', lineHeight: '1.65' }}>
              Our goal is to make digital transformation accessible and affordable. Whether you run a bustling cafe, a fine dining establishment, or a quick-service joint, our smart QR menus are designed to elevate your operations so you can focus on what you do best: creating amazing culinary experiences.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: 'var(--surface)', padding: '36px', borderRadius: '20px', border: '1px solid var(--border)', textAlign: 'center' }}>
          <Users size={22} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '12px' }}>Ready to transform your restaurant?</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '20px' }}>Join the growing community of restaurants using DinePulse.</p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
            <button className="btn-primary" onClick={() => navigate('/auth')} style={{ padding: '10px 22px', fontSize: '0.92rem' }}>Get Started Free</button>
            <button className="btn-secondary" onClick={() => navigate('/contact')} style={{ padding: '10px 22px', fontSize: '0.92rem' }}>Contact Us</button>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer style={{ padding: '20px 40px', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '18px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <span style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: '600' }} onClick={() => navigate('/about')}>About</span>
          <span style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: '600' }} onClick={() => navigate('/terms')}>Terms</span>
          <span style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: '600' }} onClick={() => navigate('/privacy')}>Privacy</span>
          <span style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: '600' }} onClick={() => navigate('/contact')}>Contact</span>
        </div>
        © 2026 DinePulse — Smart Restaurant Automation
      </footer>
    </div>
  );
}
