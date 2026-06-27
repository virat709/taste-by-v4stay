import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, MessageSquare, Send, CheckCircle } from 'lucide-react';

export default function Contact() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setLoading(true);
    // In production, send to your backend or email service
    await new Promise(r => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', padding: '20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <CheckCircle size={64} color="#2ed573" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontWeight: '800', marginBottom: '8px' }}>Message Sent!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.6' }}>
            Thank you for reaching out. We'll get back to you within 24 hours.
          </p>
          <button onClick={() => navigate('/')} className="btn-primary">Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <header style={{ padding: '16px 40px', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '6px', display: 'flex' }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800', fontSize: '1.3rem', letterSpacing: '-0.5px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/v4-logo.png" alt="v4stay" style={{ height: '28px' }} />
          <span>Taste</span>
        </div>
      </header>

      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 24px 80px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }}>Contact Us</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '40px', lineHeight: '1.6' }}>
          Have a question, feedback, or need help? We'd love to hear from you. We typically respond within 24 hours.
        </p>

        <div style={{ display: 'grid', gap: '20px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--surface)', padding: '18px 20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(30,144,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Mail size={20} color="#1e90ff" />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Email</div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>support@tastebyv4stay.com</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--surface)', padding: '18px 20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(46,213,115,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MessageSquare size={20} color="#2ed573" />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>WhatsApp</div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>+91-XXXXXXXXXX</div>
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--border)', padding: '28px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '20px' }}>Send us a message</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input className="input-field" placeholder="Your name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <input className="input-field" type="email" placeholder="Your email *" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            <textarea className="input-field" placeholder="Your message *" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={5} style={{ resize: 'vertical', fontFamily: 'inherit' }} required />
            <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '14px', fontSize: '1rem', marginTop: '8px' }}>
              <Send size={18} /> {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </main>

      <footer style={{ padding: '24px 40px', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', background: 'var(--surface)' }}>
        © 2026 Taste by v4stay — <span style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => navigate('/terms')}>Terms</span> · <span style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => navigate('/privacy')}>Privacy</span>
      </footer>
    </div>
  );
}