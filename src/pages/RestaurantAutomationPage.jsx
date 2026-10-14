import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, RefreshCw, BarChart2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function RestaurantAutomationPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Helmet>
        <title>#1 Restaurant Automation Software & Systems | DinePulse</title>
        <meta name="description" content="Automate your restaurant front-of-house, QR table ordering, kitchen dispatch, and sales analytics with DinePulse restaurant automation software." />
        <meta name="keywords" content="restaurant automation, restaurant automation software, restaurant automation system, food service automation, automated QR menu" />
        <link rel="canonical" href="https://taste.v4stay.com/restaurant-automation" />

        <meta property="og:title" content="#1 Restaurant Automation Software & Systems | DinePulse" />
        <meta property="og:description" content="Automate dining table service and kitchen operations with DinePulse." />
        <meta property="og:url" content="https://taste.v4stay.com/restaurant-automation" />
        <meta property="og:image" content="https://taste.v4stay.com/logo.png" />
      </Helmet>

      {/* Header */}
      <header style={{ padding: '14px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800', fontSize: '1.25rem', letterSpacing: '-0.5px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/logo.png" alt="DinePulse Restaurant Automation Logo" style={{ height: '26px', width: 'auto', borderRadius: '6px' }} />
          <span>DinePulse</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={() => navigate('/auth')} className="btn-secondary" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>Sign In</button>
          <button onClick={() => navigate('/auth')} className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.88rem' }}>Get Started Free <ArrowRight size={14} /></button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '70px 40px 50px', textAlign: 'center', maxWidth: '950px', margin: '0 auto' }}>
        <span style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', borderRadius: '50px', padding: '5px 16px', fontSize: '0.8rem', fontWeight: '700', display: 'inline-block', marginBottom: '20px', border: '1px solid rgba(245,158,11,0.28)' }}>
          🤖 Automated Dining Room Operations
        </span>
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: '800', lineHeight: '1.15', marginBottom: '20px', letterSpacing: '-1px' }}>
          Complete <span className="text-gradient-gold">Restaurant Automation</span> System
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.65', maxWidth: '680px', margin: '0 auto 32px' }}>
          DinePulse delivers end-to-end <strong>restaurant automation software</strong>. Streamline table QR ordering, eliminate waiter bottlenecks, auto-route tickets to kitchen display screens, and gain real-time sales clarity.
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" style={{ padding: '14px 32px', fontSize: '0.98rem' }} onClick={() => navigate('/auth')}>
            Automate Your Restaurant Now <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* Grid */}
      <section style={{ padding: '50px 40px', maxWidth: '1050px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: '800', marginBottom: '40px' }}>How DinePulse Automates Your Restaurant</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div style={{ background: 'var(--surface)', padding: '26px', borderRadius: '18px', border: '1px solid var(--border)' }}>
            <Zap size={18} color="#f59e0b" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '10px' }}>Automated QR Table Ordering</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.92rem' }}>Guests scan a table QR code and submit orders directly to your system without waiting for waitstaff.</p>
          </div>

          <div style={{ background: 'var(--surface)', padding: '26px', borderRadius: '18px', border: '1px solid var(--border)' }}>
            <RefreshCw size={18} color="#f59e0b" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '10px' }}>Instant Kitchen Dispatch</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.92rem' }}>Orders automatically appear on kitchen monitors divided by table numbers, speeding up preparation times.</p>
          </div>

          <div style={{ background: 'var(--surface)', padding: '26px', borderRadius: '18px', border: '1px solid var(--border)' }}>
            <BarChart2 size={18} color="#f59e0b" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '10px' }}>Automated Sales & Profit Analytics</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.92rem' }}>Real-time revenue charts and top dish performance tracking automate your business reporting.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '70px 40px', textAlign: 'center', background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#060709', marginBottom: '14px' }}>Ready to Automate Your Restaurant?</h2>
        <p style={{ color: '#060709', opacity: 0.9, fontSize: '1.05rem', marginBottom: '28px' }}>Start your 14-day free trial today.</p>
        <button onClick={() => navigate('/auth')} style={{ background: '#060709', color: '#f59e0b', border: 'none', padding: '14px 34px', borderRadius: '50px', fontWeight: '800', fontSize: '0.98rem', cursor: 'pointer', fontFamily: 'inherit' }}>
          Start Free Trial →
        </button>
      </section>

      {/* Footer */}
      <footer style={{ padding: '28px 40px', background: 'var(--surface)', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        © 2026 DinePulse — #1 Restaurant Automation Software Platform
      </footer>
    </div>
  );
}
