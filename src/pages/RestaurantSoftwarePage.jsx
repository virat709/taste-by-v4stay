import { useNavigate } from 'react-router-dom';
import { ArrowRight, Smartphone, Zap, BarChart3 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function RestaurantSoftwarePage() {
  const navigate = useNavigate();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DinePulse - Restaurant Software",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web, iOS, Android",
    "description": "All-in-one restaurant software and food management platform for cafes, fine dining, cloud kitchens, and hotels.",
    "offers": {
      "@type": "Offer",
      "price": "14999",
      "priceCurrency": "INR"
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Helmet>
        <title>#1 Restaurant Software & Management System | DinePulse</title>
        <meta name="description" content="Discover DinePulse, the ultimate restaurant software for table ordering, digital menus, kitchen displays, and sales analytics. Start your 14-day free trial!" />
        <meta name="keywords" content="restaurant software, restaurant management software, best restaurant software, food software, restaurant automation, QR menu software" />
        <link rel="canonical" href="https://taste.v4stay.com/restaurant-software" />

        <meta property="og:title" content="#1 Restaurant Software & Management System | DinePulse" />
        <meta property="og:description" content="Streamline operations with top-rated restaurant software. QR menus, live kitchen displays, and real-time sales reporting." />
        <meta property="og:url" content="https://taste.v4stay.com/restaurant-software" />
        <meta property="og:image" content="https://taste.v4stay.com/logo.png" />

        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>

      {/* Header */}
      <header style={{ padding: '14px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800', fontSize: '1.25rem', letterSpacing: '-0.5px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/logo.png" alt="DinePulse Restaurant Software Logo" style={{ height: '26px', width: 'auto', borderRadius: '6px' }} />
          <span>DinePulse</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={() => navigate('/auth')} className="btn-secondary" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>Sign In</button>
          <button onClick={() => navigate('/auth')} className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.88rem' }}>Get Started Free <ArrowRight size={14} /></button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '70px 40px 50px', textAlign: 'center', maxWidth: '950px', margin: '0 auto' }}>
        <span style={{ background: 'rgba(245,158,11,0.12)', color: 'var(--primary)', borderRadius: '50px', padding: '5px 16px', fontSize: '0.8rem', fontWeight: '700', display: 'inline-block', marginBottom: '20px', border: '1px solid rgba(245,158,11,0.28)' }}>
          ⚡ Next-Generation Restaurant Software
        </span>
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: '800', lineHeight: '1.15', marginBottom: '20px', letterSpacing: '-1px' }}>
          The #1 All-in-One <span className="text-gradient-gold">Restaurant Software</span> Platform
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.65', maxWidth: '680px', margin: '0 auto 32px' }}>
          DinePulse is modern <strong>restaurant management software</strong> built to replace clunky legacy systems. Simplify digital menus, QR ordering, kitchen display workflows, and real-time revenue tracking — all in one browser-based solution.
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" style={{ padding: '14px 32px', fontSize: '0.98rem' }} onClick={() => navigate('/auth')}>
            Try Free for 14 Days <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* Feature Breakdown */}
      <section style={{ padding: '50px 40px', maxWidth: '1050px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: '800', marginBottom: '40px' }}>Why DinePulse is the Best Restaurant Software in 2026</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div style={{ background: 'var(--surface)', padding: '26px', borderRadius: '18px', border: '1px solid var(--border)' }}>
            <Smartphone size={18} color="var(--primary)" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '10px' }}>Smart QR Table Ordering Software</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.92rem' }}>Let guests browse your menu and place orders from their mobile browsers. Eliminates staff waiting friction during peak hours.</p>
          </div>

          <div style={{ background: 'var(--surface)', padding: '26px', borderRadius: '18px', border: '1px solid var(--border)' }}>
            <Zap size={18} color="var(--primary)" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '10px' }}>Real-time Kitchen Display System (KDS)</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.92rem' }}>Send table orders directly to kitchen screens. Track preparing, ready, and served statuses with zero paper ticket clutter.</p>
          </div>

          <div style={{ background: 'var(--surface)', padding: '26px', borderRadius: '18px', border: '1px solid var(--border)' }}>
            <BarChart3 size={18} color="var(--primary)" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '10px' }}>Live Restaurant Analytics & Reporting</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.92rem' }}>Monitor daily revenue, peak sales hours, top-selling dishes, and customer feedback to optimize margins continuously.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '70px 40px', textAlign: 'center', background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#060709', marginBottom: '14px' }}>Upgrade Your Restaurant Operations Today</h2>
        <p style={{ color: '#060709', opacity: 0.9, fontSize: '1.05rem', marginBottom: '28px' }}>Experience the power of modern restaurant management software with zero hardware installation.</p>
        <button onClick={() => navigate('/auth')} style={{ background: '#060709', color: '#f59e0b', border: 'none', padding: '14px 34px', borderRadius: '50px', fontWeight: '800', fontSize: '0.98rem', cursor: 'pointer', fontFamily: 'inherit' }}>
          Start 14-Day Free Trial
        </button>
      </section>
    </div>
  );
}
