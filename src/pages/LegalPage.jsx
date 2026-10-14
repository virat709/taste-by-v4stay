import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const pages = {
  terms: {
    title: 'Terms & Conditions',
    updated: 'July 2026',
    draftNotice: 'This is a draft legal document. Please have a qualified lawyer in your jurisdiction review it before publishing.',
    content: [
      { h: '1. Acceptance of Terms', p: 'By signing up for or using the DinePulse platform accessible via taste.v4stay.com ("Service"), provided by v4stay ("we", "us", "our"), you agree to be bound by these Terms & Conditions. If you do not agree, do not use the Service.' },
      { h: '2. Description of Service', p: 'DinePulse provides a cloud digital menu and QR-code contactless ordering SaaS platform for restaurants, hotels, cafes, and cloud kitchens. The Service includes menu management, QR code generation, guest table ordering, kitchen display workflows, analytics, and staff management.' },
      { h: '3. Account Registration & Security', p: 'You must provide accurate, current, and complete information during registration. You are solely responsible for safeguarding your account credentials and for all activities occurring under your account. Notify us immediately at v4services.in@gmail.com of any unauthorized access.' },
      { h: '4. Subscription Plans & Billing', p: 'The Service offers a Free Plan with standard features and a Premium Plan priced at ₹14,999 per year. Payment is due upfront. All fees are non-refundable except as explicitly required by applicable law or detailed in our Refund Policy. We reserve the right to revise pricing with 30 days advance notice.' },
      { h: '5. 14-Day Free Trial', p: 'New accounts receive a 14-day free trial with full Premium feature access. At trial expiration, the account converts to the Free Plan unless a Premium subscription is purchased.' },
      { h: '6. Restaurant Owner Content Responsibilities', p: 'You retain ownership of all menu data, images, prices, descriptions, and branding uploaded to the platform. You represent that your content is accurate, complies with food safety and consumer protection laws, and does not infringe third-party intellectual property.' },
      { h: '7. Order & Refund Disputes between Restaurant and Guest', p: 'DinePulse functions strictly as a technology SaaS provider facilitating digital menu viewing and table order routing. All food sales, quality standards, allergen notices, order fulfillment, and refund requests are transactions directly between the restaurant and the diner.' },
      { h: '8. Acceptable Use Policy', p: 'You agree not to: (a) use the Service for any unlawful purpose; (b) attempt to disrupt, hack, or reverse-engineer the Service; (c) upload malicious code; (d) bypass account access controls or usage limits.' },
      { h: '9. Third-Party Services', p: 'The Service utilizes Google Firebase for database, storage, and authentication infrastructure. Use of the platform is subject to Google Cloud Terms of Service and Privacy Policies.' },
      { h: '10. Intellectual Property', p: 'The DinePulse name, logo, source code, UI designs, and trademarks belong exclusively to v4stay. You may not copy, modify, or create derivative works without explicit written consent.' },
      { h: '11. Limitation of Liability', p: 'To the maximum extent permitted by law, DinePulse and v4stay shall not be liable for indirect, incidental, or consequential damages. Maximum cumulative liability for any claim shall not exceed the subscription fees paid by you in the 12 months preceding the claim.' },
      { h: '12. Indemnification', p: 'You agree to indemnify and hold harmless v4stay, its officers, and employees from any claims arising from your use of the Service, your menu content, or violation of these Terms.' },
      { h: '13. Account Termination', p: 'We reserve the right to suspend or terminate accounts for violations of these Terms. You may cancel your subscription at any time from Admin Settings. Upon termination, account data will be purged within 30 days.' },
      { h: '14. Data Deletion', p: 'You may request permanent deletion of your account and associated data by contacting support. Personal data will be erased within 30 days, subject to legal record retention requirements.' },
      { h: '15. Changes to Terms', p: 'We may update these Terms from time to time. Material updates will be communicated via email or dashboard notifications. Continued use after changes constitutes acceptance.' },
      { h: '16. Governing Law & Jurisdiction', p: 'These Terms are governed by the laws of India. Any legal proceedings shall be subject to the exclusive jurisdiction of the courts located in Gujarat, India.' },
      { h: '17. Contact Information', p: 'For questions regarding these Terms, contact us at v4services.in@gmail.com or via the Contact page.' },
    ]
  },
  privacy: {
    title: 'Privacy Policy',
    updated: 'July 2026',
    draftNotice: 'This draft policy includes compliance considerations for India DPDP Act 2023 & IT Act 2000. Have a legal expert review before deployment.',
    content: [
      { h: '1. Introduction', p: 'v4stay ("we", "us", "our") respects your privacy. This Privacy Policy outlines how DinePulse (taste.v4stay.com) collects, processes, stores, and safeguards personal data from restaurant subscribers and dining guests.' },
      { h: '2. Data We Collect', p: 'We collect: (a) Restaurant account details: name, business email, phone number, restaurant address; (b) Billing information: payment transaction reference UTR numbers; (c) Guest order data: table numbers, selected menu items, order time, and voluntary feedback ratings; (d) Technical telemetry: IP address, browser type, and device information.' },
      { h: '3. Legal Basis & Purpose of Processing', p: 'In accordance with India\'s Digital Personal Data Protection (DPDP) Act 2023 and global privacy frameworks, data is processed to: provide QR menu services, route orders to kitchen dashboards, manage billing subscriptions, and ensure system security.' },
      { h: '4. Third-Party Data Processors', p: 'We do not sell personal data. Data is processed securely by third-party infrastructure providers: (a) Google Firebase for secure database, storage, and authentication; (b) payment gateways for processing subscription payments.' },
      { h: '5. Security Measures', p: 'We implement SSL/TLS encryption in transit, encrypted storage at rest, strict access controls, and security reviews. Users remain responsible for maintaining the security of their login credentials.' },
      { h: '6. Data Retention & Erasure', p: 'Data is retained for the active period of your restaurant account. Upon account deletion request, personal data is permanently erased within 30 days, except where retention is required by tax or legal obligations.' },
      { h: '7. Rights of Data Principals', p: 'Under applicable privacy laws, users have the right to access, correct, port, or request erasure of their personal data, or withdraw processing consent at any time.' },
      { h: '8. Essential & Analytical Cookies', p: 'We use session cookies for authentication, active guest cart ordering, and user preferences. Cookie settings can be managed via browser options.' },
      { h: '9. Children\'s Data Protection', p: 'DinePulse is intended for commercial business use. We do not knowingly collect personal data from individuals under 18 years of age.' },
      { h: '10. International Transfers', p: 'Data may be stored on secure cloud servers, including Google Firebase infrastructure located in India and globally, with appropriate safeguards in place.' },
      { h: '11. Changes to Privacy Policy', p: 'Material changes to this policy will be notified via dashboard alerts or email. Continued use of DinePulse constitutes acceptance of the revised policy.' },
      { h: '12. Grievance Officer (India DPDP Act Requirement)', p: 'For data privacy queries or complaints, contact our designated Grievance Officer under Indian IT Rules & DPDP Act 2023: Email: v4services.in@gmail.com, Phone: +91 9714056759. Complaints are acknowledged within 24 hours and addressed within 30 days.' },
    ]
  },
  cookies: {
    title: 'Cookie Policy',
    updated: 'July 2026',
    draftNotice: 'This is a standalone policy explaining cookie usage on DinePulse.',
    content: [
      { h: '1. What Are Cookies?', p: 'Cookies are small text files placed on your computer or mobile device when you browse websites. They help websites recognize your device and remember your preferences.' },
      { h: '2. How DinePulse Uses Cookies', p: 'We use cookies for: (a) Essential Authentication: keeping restaurant managers logged in; (b) Active Table Ordering: storing guest cart selections during a dining session; (c) Preferences: remembering UI light/dark theme choices.' },
      { h: '3. Managing Cookie Preferences', p: 'You can block or delete cookies through your web browser settings. Note that disabling essential cookies will prevent table QR code ordering from functioning properly.' },
    ]
  },
  refund: {
    title: 'Refund & Cancellation Policy',
    updated: 'July 2026',
    draftNotice: 'Applies to DinePulse Premium Plan subscriptions.',
    content: [
      { h: '1. 14-Day Free Trial', p: 'All new accounts include a 14-day free trial with access to all Premium features. No payment details are required to initiate the trial.' },
      { h: '2. Subscription Cancellations', p: 'You may cancel your annual Premium Plan subscription at any time via Admin Settings. Upon cancellation, your Premium access remains active until the end of your prepaid billing period.' },
      { h: '3. Refund Terms', p: 'Annual subscription payments are non-refundable once activated. In the event of an inadvertent duplicate payment or billing calculation error, contact support at v4services.in@gmail.com within 7 days for a full refund of the excess amount.' },
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
      <Helmet>
        <title>{data.title} | DinePulse</title>
        <meta name="description" content={`Read our ${data.title} to understand our policies.`} />
        <link rel="canonical" href={`https://taste.v4stay.com/${page}`} />
      </Helmet>
      {/* Header */}
      <header style={{ padding: '16px 40px', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '6px', display: 'flex' }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800', fontSize: '1.3rem', letterSpacing: '-0.5px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/logo.png" alt="DinePulse" style={{ height: '28px', width: 'auto', borderRadius: '6px' }} />
          <span>DinePulse</span>
        </div>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px 80px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }}>{data.title}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>Last updated: {data.updated}</p>

        {data.draftNotice && (
          <div style={{ background: 'rgba(255, 171, 0, 0.1)', border: '1px solid rgba(255, 171, 0, 0.3)', color: '#ffab00', padding: '12px 16px', borderRadius: '12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>{data.draftNotice}</span>
          </div>
        )}

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
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <span style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: '600' }} onClick={() => navigate('/about')}>About</span>
          <span style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: '600' }} onClick={() => navigate('/terms')}>Terms</span>
          <span style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: '600' }} onClick={() => navigate('/privacy')}>Privacy</span>
          <span style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: '600' }} onClick={() => navigate('/cookies')}>Cookies</span>
          <span style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: '600' }} onClick={() => navigate('/refund')}>Refund Policy</span>
          <span style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: '600' }} onClick={() => navigate('/contact')}>Contact</span>
        </div>
        © 2026 DinePulse — Smart Restaurant Automation
      </footer>
    </div>
  );
}