import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, MessageSquare, Send, CheckCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function Contact() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', padding: '20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '380px' }}>
          <CheckCircle size={32} color="#14b8a6" style={{ marginBottom: '14px' }} />
          <h2 style={{ fontWeight: '800', marginBottom: '8px', fontSize: '1.4rem' }}>Message Sent!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.6', fontSize: '0.92rem' }}>
            Thank you for reaching out. We'll get back to you within 24 hours.
          </p>
          <button onClick={() => navigate('/')} className="btn-primary" style={{ padding: '10px 22px', fontSize: '0.9rem' }}>Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Helmet>
        <title>Contact Us | DinePulse</title>
        <meta name="description" content="Get in touch with the DinePulse team. We're here to help you set up your smart restaurant automation." />
        <link rel="canonical" href="https://taste.v4stay.com/contact" />
      </Helmet>
      <header style={{ padding: '14px 40px', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', display: 'flex' }}>
          <ArrowLeft size={16} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800', fontSize: '1.2rem', letterSpacing: '-0.5px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/logo.png" alt="DinePulse" style={{ height: '26px', width: 'auto', borderRadius: '6px' }} />
          <span>DinePulse</span>
        </div>
      </header>

      <main style={{ maxWidth: '580px', margin: '0 auto', padding: '36px 24px 70px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px' }}>Contact Us</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.6', fontSize: '0.95rem' }}>
          Have a question, feedback, or need help? We'd love to hear from you. We typically respond within 24 hours.
        </p>

        <div style={{ display: 'grid', gap: '16px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--surface)', padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--border)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Mail size={15} color="#f59e0b" />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>Email</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>v4services.in@gmail.com</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--surface)', padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--border)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(20,184,166,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MessageSquare size={15} color="#14b8a6" />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>WhatsApp</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>+91 9714056759</div>
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', borderRadius: '18px', border: '1px solid var(--border)', padding: '24px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '16px' }}>Send us a message</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input className="input-field" placeholder="Your name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <input className="input-field" type="email" placeholder="Your email *" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            <textarea className="input-field" placeholder="Your message *" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={4} style={{ resize: 'vertical', fontFamily: 'inherit' }} required />
            <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '12px', fontSize: '0.9rem', marginTop: '6px' }}>
              <Send size={14} /> {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </main>

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