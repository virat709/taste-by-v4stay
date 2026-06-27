import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const pages = {
  terms: {
    title: 'Terms & Conditions',
    updated: '27 June 2026',
    content: [
      { h: '1. Acceptance of Terms', p: 'By signing up for or using the Taste by v4stay platform ("Service"), you agree to be bound by these Terms & Conditions. If you do not agree, do not use the Service.' },
      { h: '2. Description of Service', p: 'Taste by v4stay provides a digital menu and QR-code ordering SaaS platform for restaurants. The Service includes menu management, QR code generation, guest ordering, analytics, and related features as described on the website.' },
      { h: '3. Account Registration', p: 'You must provide accurate, current, and complete information during registration. You are responsible for safeguarding your account credentials and for all activities under your account. You must notify us immediately of any unauthorized use.' },
      { h: '4. Subscription & Billing', p: 'The Service offers a Free Plan with limited features and a Premium Plan at ₹14,999 per year. Payment is due upfront. All fees are non-refundable except as required by law. We may change pricing with 30 days notice. Non-payment may result in account suspension.' },
      { h: '5. Free Trial', p: 'New accounts receive a 14-day free trial with full Premium features. At the end of the trial, the account converts to the Free Plan unless the Premium Plan has been purchased. We reserve the right to modify or cancel trials at any time.' },
      { h: '6. Restaurant Content', p: 'You retain ownership of all menu data, images, and content you upload. You grant us a license to host, display, and process this content solely to provide the Service. You represent that your content does not infringe any third-party rights.' },
      { h: '7. Guest Data', p: 'Orders and feedback submitted by your guests through the platform are processed on your behalf. You are responsible for how you use this data in compliance with applicable laws.' },
      { h: '8. Acceptable Use', p: 'You agree not to: (a) use the Service for any unlawful purpose; (b) attempt to disrupt, hack, or reverse-engineer the Service; (c) upload malicious code; (d) use the Service to store or transmit infringing material; (e) exceed usage limits or interfere with other users.' },
      { h: '9. Third-Party Services', p: 'The Service uses Firebase (Google) for authentication, database, and storage. Your use is subject to Google\'s Terms of Service and Privacy Policy. We are not responsible for any outages or data loss caused by third-party services.' },
      { h: '10. Intellectual Property', p: 'The Taste by v4stay name, logo, and platform code are our intellectual property. You may not copy, modify, distribute, or create derivative works without our written consent.' },
      { h: '11. Limitation of Liability', p: 'The Service is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the Service. Our total liability is limited to the amount you paid in the 12 months preceding the claim.' },
      { h: '12. Indemnification', p: 'You agree to indemnify and hold us harmless from any claims arising from your use of the Service, your content, or your violation of these Terms.' },
      { h: '13. Termination', p: 'We may suspend or terminate your account for violation of these Terms. You may cancel your account at any time from Settings. Upon termination, your data will be deleted within 30 days unless required otherwise by law.' },
      { h: '14. Data Deletion', p: 'You can request immediate deletion of your account and all associated data by contacting us. We will delete all personal data within 30 days of your request, subject to legal retention requirements.' },
      { h: '15. Changes to Terms', p: 'We may update these Terms from time to time. Material changes will be notified via email or through the Service. Continued use after changes constitutes acceptance.' },
      { h: '16. Governing Law', p: 'These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in India.' },
      { h: '17. Contact', p: 'For questions about these Terms, please contact us through the Contact page or email v4services.in@gmail.com.' },
    ]
  },
  privacy: {
    title: 'Privacy Policy',
    updated: '27 June 2026',
    content: [
      { h: '1. Introduction', p: 'Taste by v4stay ("we", "us", "our") respects your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.' },
      { h: '2. Information We Collect', p: 'We collect: (a) Account information: name, email, phone number, and restaurant details; (b) Payment information: processed securely through third-party gateways (we do not store card details); (c) Menu content: images, descriptions, prices, and categories you upload; (d) Order data: guest orders, table numbers, and feedback; (e) Usage data: pages visited, features used, and interactions with the Service.' },
      { h: '3. How We Use Your Information', p: 'We use your information to: (a) provide, maintain, and improve the Service; (b) process payments and manage subscriptions; (c) send service updates, billing reminders, and support communications; (d) analyze usage patterns to improve features; (e) comply with legal obligations.' },
      { h: '4. Information Sharing', p: 'We do not sell your personal information. We may share data with: (a) Firebase (Google) for hosting and database services; (b) payment processors for billing; (c) legal authorities if required by law; (d) third parties with your explicit consent.' },
      { h: '5. Data Security', p: 'We implement industry-standard security measures including encryption in transit (HTTPS) and at rest, access controls, and regular security reviews. However, no method of transmission is 100% secure. You are responsible for maintaining the confidentiality of your account credentials.' },
      { h: '6. Data Retention', p: 'We retain your data for as long as your account is active. Upon account deletion, we delete your data within 30 days. Guest order data may be retained in anonymized form for analytics. Backup data may persist for up to 90 days.' },
      { h: '7. Your Rights', p: 'You have the right to: (a) access your personal data; (b) correct inaccurate data; (c) delete your data; (d) export your data; (e) withdraw consent. To exercise these rights, contact us through the Contact page or update your account Settings.' },
      { h: '8. Cookies', p: 'We use essential cookies for authentication and service functionality. We may use analytics cookies to understand usage patterns. You can control cookies through your browser settings. Disabling cookies may affect service functionality.' },
      { h: '9. Third-Party Links', p: 'The Service may contain links to third-party websites (e.g., UPI payment apps). We are not responsible for their privacy practices. We encourage you to review their privacy policies.' },
      { h: '10. Children\'s Privacy', p: 'The Service is not intended for individuals under 18 years of age. We do not knowingly collect information from minors.' },
      { h: '11. International Data Transfers', p: 'Your data may be processed on servers located outside India, including through Firebase\'s global infrastructure. We ensure appropriate safeguards are in place for such transfers.' },
      { h: '12. Changes to This Policy', p: 'We may update this Privacy Policy. Material changes will be notified via email or through the Service. Your continued use constitutes acceptance of the updated policy.' },
      { h: '13. Grievance Officer', p: 'Under Indian IT Act and Rules, the Grievance Officer for this Service is: v4services.in@gmail.com, +91 9714056759. Complaints will be acknowledged within 24 hours and resolved within 30 days.' },
      { h: '14. Contact Us', p: 'For questions or concerns about this Privacy Policy, please contact us through the Contact page or email v4services.in@gmail.com.' },
    ]
  }
};

export default function LegalPage({ page }) {
  const navigate = useNavigate();
  const data = pages[page];

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', padding: '20px', background: 'var(--bg-color)' }}>
        <h2>Page Not Found</h2>
        <button onClick={() => navigate('/')} className="btn-primary">Go Home</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      {/* Header */}
      <header style={{ padding: '16px 40px', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '6px', display: 'flex' }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800', fontSize: '1.3rem', letterSpacing: '-0.5px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/v4-logo.png" alt="v4stay" style={{ height: '28px' }} />
          <span>Taste</span>
        </div>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px 80px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }}>{data.title}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '40px' }}>Last updated: {data.updated}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {data.content.map((section, i) => (
            <div key={i}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>{section.h}</h2>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.7', color: 'var(--text-muted)' }}>{section.p}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ padding: '24px 40px', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', background: 'var(--surface)' }}>
        © 2026 Taste by v4stay — <span style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => navigate('/terms')}>Terms</span> · <span style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => navigate('/privacy')}>Privacy</span> · <span style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => navigate('/contact')}>Contact</span>
      </footer>
    </div>
  );
}