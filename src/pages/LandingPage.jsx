import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, CheckCircle, Smartphone, BarChart3,
  HelpCircle, Star, Sparkles, ChefHat, ChevronRight,
  Plus, ShoppingBag, Flame, TrendingUp, Sun, Moon, Wine, Award, Menu, X
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function LandingPage() {
  const navigate = useNavigate();
  const [themeMode, setThemeMode] = useState('dark');
  const [activeTab, setActiveTab] = useState('menu');
  const [tablesCount, setTablesCount] = useState(45);
  const [cartCount, setCartCount] = useState(2);
  const [cartTotal, setCartTotal] = useState(1450);
  const [activeCategory, setActiveCategory] = useState('mains');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Indian Fine Dining Luxury Menu Items
  const menuItems = {
    starters: [
      { id: 1, name: 'Royal Awadhi Galouti Kebab', price: 650, tags: ['Non-Veg', 'Chef Special'], desc: 'Melt-in-mouth minced lamb kebabs infused with 32 rare spices, served on ulte tawe ka paratha.' },
      { id: 2, name: 'Paneer Tikka Zaffrani', price: 520, tags: ['Veg', 'Bestseller'], desc: 'Cottage cheese marinated in Kashmiri saffron, hung curd, and stone-ground yellow chillies.' }
    ],
    mains: [
      { id: 3, name: 'Hyderabadi Dum Gosht Biryani', price: 950, tags: ['Non-Veg', 'Must Try'], desc: 'Fragrant long-grain Basmati rice slow-cooked on dum with tender spiced mutton and saffron.' },
      { id: 4, name: 'Dal Makhani Bukhara', price: 580, tags: ['Veg', 'Signature'], desc: 'Black lentils slow-simmered overnight over charcoal with white butter and fresh cream.' }
    ],
    cocktails: [
      { id: 5, name: 'Royal Saffron Cardamom Sour', price: 650, tags: ['Signature Cocktail'], desc: 'Blended Scotch whisky infused with green cardamom, saffron syrup, and gold leaf.' },
      { id: 6, name: 'Rose Phirni Martini', price: 420, tags: ['Mocktail'], desc: 'Fragrant Kannauj rose extract, condensed milk, kewra water, and crushed pistachios.' }
    ]
  };

  const handleAddItem = (price) => {
    setCartCount(prev => prev + 1);
    setCartTotal(prev => prev + price);
  };

  const monthlyRevenueBoost = Math.round(tablesCount * 8500);
  const hoursSaved = Math.round(tablesCount * 5.5);

  // Structured data: Organization, WebSite, WebPage, BreadcrumbList,
  // SoftwareApplication, FAQPage & HowTo (all mirror visible on-page content)
  const jsonLdData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://taste.v4stay.com/#organization",
        "name": "v4stay",
        "alternateName": "DinePulse by v4stay",
        "url": "https://taste.v4stay.com/",
        "slogan": "The gold standard in restaurant automation and QR menus for Indian fine dining",
        "areaServed": ["IN"],
        "knowsAbout": [
          "Restaurant automation in India",
          "Restaurant QR menu software",
          "Contactless ordering for restaurants",
          "Kitchen display systems",
          "Cloud kitchen software in India",
          "Digital menu software for hotels"
        ],
        "logo": {
          "@type": "ImageObject",
          "url": "https://taste.v4stay.com/logo.png",
          "caption": "DinePulse by v4stay logo"
        },
        "description": "v4stay builds DinePulse, the luxury restaurant automation and QR-menu platform for Indian fine dining, heritage hotels, lounges, and cloud kitchens.",
        "sameAs": ["https://github.com/virat709/taste-by-v4stay"]
      },
      {
        "@type": "WebSite",
        "@id": "https://taste.v4stay.com/#website",
        "url": "https://taste.v4stay.com/",
        "name": "DinePulse by v4stay",
        "publisher": { "@id": "https://taste.v4stay.com/#organization" },
        "inLanguage": "en"
      },
      {
        "@type": "WebPage",
        "@id": "https://taste.v4stay.com/#webpage",
        "url": "https://taste.v4stay.com/",
        "name": "Best Restaurant Automation Software in India | DinePulse",
        "description": "DinePulse is the best restaurant automation software in India: restaurant QR menus, contactless table ordering, a live kitchen display, and revenue analytics for fine-dining restaurants, hotels, lounges, bars, and cloud kitchens.",
        "keywords": [
          "restaurant automation India",
          "restaurant QR menu",
          "best restaurant automation software in India",
          "QR code menu for restaurants",
          "contactless ordering software",
          "digital menu software India",
          "restaurant kitchen display system",
          "cloud kitchen software India",
          "table QR ordering"
        ],
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": [".key-takeaway", "h1", "#what-is-dinepulse"]
        },
        "isPartOf": { "@id": "https://taste.v4stay.com/#website" },
        "publisher": { "@id": "https://taste.v4stay.com/#organization" },
        "about": { "@id": "https://taste.v4stay.com/#software" },
        "primaryImageOfPage": "https://taste.v4stay.com/logo.png",
        "inLanguage": "en",
        "datePublished": "2026-01-10",
        "dateModified": "2026-10-24",
        "breadcrumb": { "@id": "https://taste.v4stay.com/#breadcrumb" }
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://taste.v4stay.com/#breadcrumb",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://taste.v4stay.com/"
          }
        ]
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://taste.v4stay.com/#software",
        "name": "DinePulse",
        "alternateName": ["Taste", "Taste by v4stay", "DinePulse Fine Dining OS"],
        "url": "https://taste.v4stay.com/",
        "logo": "https://taste.v4stay.com/logo.png",
        "operatingSystem": "Web, iOS, Android",
        "applicationCategory": "BusinessApplication",
        "provider": { "@id": "https://taste.v4stay.com/#organization" },
        "description": "DinePulse is the best restaurant automation software in India: a restaurant QR menu with photos and veg/non-veg tags, contactless table ordering, a live kitchen display system, staff management, and revenue analytics — built for Indian fine dining, hotels, lounges, bars, and cloud kitchens.",
        "keywords": "restaurant automation India, restaurant QR menu, best restaurant automation software in India, QR code menu, contactless ordering, kitchen display system, cloud kitchen software, hotel room service QR menu",
        "offers": {
          "@type": "Offer",
          "price": "14999",
          "priceCurrency": "INR"
        }
      },
      {
        "@type": "HowTo",
        "@id": "https://taste.v4stay.com/#howto-launch",
        "name": "How to launch contactless QR dining in your restaurant with DinePulse",
        "description": "Three steps to replace paper menus with contactless QR ordering using DinePulse by v4stay.",
        "totalTime": "P1D",
        "tool": [
          { "@type": "HowToTool", "name": "DinePulse free trial account" },
          { "@type": "HowToTool", "name": "Any smartphone with a camera" }
        ],
        "step": [
          {
            "@type": "HowToStep",
            "position": 1,
            "name": "Build your digital menu",
            "text": "Add your dishes, prices, photos, descriptions, and veg/non-veg tags in the DinePulse dashboard — no designer or developer required."
          },
          {
            "@type": "HowToStep",
            "position": 2,
            "name": "Print and place table QR standees",
            "text": "Download the auto-generated table QR codes and place one standee on every table, booth, or lounge seat."
          },
          {
            "@type": "HowToStep",
            "position": 3,
            "name": "Go live with the kitchen display",
            "text": "Open the Kitchen Display System on your kitchen screen so guest QR orders arrive instantly, colour-coded by urgency."
          }
        ]
      },
      {
        "@type": "FAQPage",
        "@id": "https://taste.v4stay.com/#faq-schema",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is a QR menu for restaurants?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "A QR menu is a digital menu accessible by scanning a QR code on a restaurant table with any smartphone camera. Guests view dishes, photos, and prices on their mobile browser and order directly without downloading an app."
            }
          },
          {
            "@type": "Question",
            "name": "How does restaurant automation work with DinePulse?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DinePulse automates table ordering by sending guest QR orders directly to kitchen displays and staff devices, eliminating manual order-taking and reducing wait times."
            }
          },
          {
            "@type": "Question",
            "name": "Is QR ordering safe and contactless for guests?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, QR ordering is 100% contactless. Guests use their own mobile devices, eliminating touch points with shared physical menus."
            }
          },
          {
            "@type": "Question",
            "name": "How much does DinePulse cost?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DinePulse offers a 14-day free trial with access to all features. Premium plans are ₹14,999 per year with unlimited digital menus, table QR code downloads, staff logins, and real-time analytics."
            }
          },
          {
            "@type": "Question",
            "name": "Do guests need to download an app to view the menu?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No app download is required! The digital menu opens instantly in Safari, Chrome, or Firefox upon scanning the table QR code."
            }
          },
          {
            "@type": "Question",
            "name": "Which is the best restaurant automation software in India?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DinePulse is the best restaurant automation software in India for fine-dining restaurants, heritage hotels, lounges, bars, and cloud kitchens. It combines a restaurant QR menu, contactless table ordering, a live kitchen display system, staff management, and revenue analytics at ₹14,999 per year with a 14-day free trial, and charges no commissions per order."
            }
          },
          {
            "@type": "Question",
            "name": "Does a restaurant QR menu work for cloud kitchens and hotel rooms in India?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. A restaurant QR menu works anywhere guests can scan a code — dine-in tables, cloud kitchen pickup counters, hotel rooms, lounge seats, and boutique bars. DinePulse supports unlimited table QR codes on one subscription, so a single account covers every corner of your venue."
            }
          }
        ]
      }
    ]
  };

  return (
    <div className={themeMode === 'light' ? 'light-theme' : ''} style={{ minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-main)', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Ambient Glow Overlays */}
      <div className="ambient-glow-top" />
      <div className="ambient-glow-center" />

      <Helmet>
        <title>Best Restaurant Automation Software in India | DinePulse</title>
        <meta name="description" content="DinePulse is the best restaurant automation software in India — table QR menus, contactless ordering, live KDS & revenue analytics. Free 14-day trial." />
        <meta name="keywords" content="restaurant automation India, restaurant QR menu, best restaurant automation software in India, QR code menu for restaurants, contactless ordering software, digital menu software India, restaurant kitchen display system, cloud kitchen software India, hotel restaurant management software, table QR ordering, restaurant POS alternative India, fine dining reservation and ordering software" />

        {/* Social sharing previews (Open Graph + Twitter) */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="DinePulse by v4stay" />
        <meta property="og:title" content="Best Restaurant Automation Software in India | DinePulse" />
        <meta property="og:description" content="DinePulse is the best restaurant automation software in India — restaurant QR menus, contactless ordering, live kitchen display & revenue analytics. Free 14-day trial." />
        <meta property="og:url" content="https://taste.v4stay.com/" />
        <meta property="og:image" content="https://taste.v4stay.com/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Best Restaurant Automation Software in India | DinePulse" />
        <meta name="twitter:description" content="Restaurant QR menus, contactless ordering, live KDS, and revenue analytics for fine-dining restaurants, hotels & cloud kitchens in India. Built by v4stay." />
        <meta name="twitter:image" content="https://taste.v4stay.com/logo.png" />

        <link rel="canonical" href="https://taste.v4stay.com/" />
        
        <script type="application/ld+json">
          {JSON.stringify(jsonLdData)}
        </script>
      </Helmet>

      {/* Glass Header */}
      <header style={{ padding: '14px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, background: 'var(--surface-glass)', backdropFilter: 'blur(28px)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/logo.png" alt="DinePulse Gold Logo" style={{ height: '28px', width: 'auto', borderRadius: '6px', boxShadow: '0 2px 10px var(--primary-glow)' }} />
          <span className="font-serif" style={{ fontSize: '1.35rem', fontWeight: '900', letterSpacing: '-0.5px' }}>DinePulse</span>
          <span className="header-badge" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '50px', padding: '3px 10px', fontSize: '0.72rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Award size={12} color="#f59e0b" /> Premium Indian Hospitality
          </span>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }} className="lp-header-actions">
          <nav style={{ display: 'flex', gap: '18px', fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-muted)' }}>
            <a href="#luxury-experience" style={{ color: 'inherit', textDecoration: 'none' }}>Experience</a>
            <a href="#interactive-demo" style={{ color: 'inherit', textDecoration: 'none' }}>Live Suite</a>
            <a href="#roi-calculator" style={{ color: 'inherit', textDecoration: 'none' }}>ROI Growth</a>
            <a href="#pricing" style={{ color: 'inherit', textDecoration: 'none' }}>Pricing</a>
            <a href="#faq" style={{ color: 'inherit', textDecoration: 'none' }}>FAQ</a>
          </nav>

          <button onClick={toggleTheme} className="lp-theme-toggle" style={{ background: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: '50px', padding: '6px 12px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}>
            {themeMode === 'dark' ? <><Sun size={13} color="#f59e0b" /><span className="lp-theme-label">Light</span></> : <><Moon size={13} color="#14b8a6" /><span className="lp-theme-label">Dark</span></>}
          </button>

          <button onClick={() => navigate('/auth')} className="btn-secondary lp-signin" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>Sign In</button>
          <button onClick={() => navigate('/auth')} className="btn-primary lp-cta" style={{ padding: '8px 20px', fontSize: '0.88rem' }}>Get Started Free <ArrowRight size={13} /></button>

          <button
            className="lp-hamburger"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lp-mobile-menu">
            <a href="#luxury-experience" onClick={closeMobileMenu}>Experience</a>
            <a href="#interactive-demo" onClick={closeMobileMenu}>Live Suite</a>
            <a href="#roi-calculator" onClick={closeMobileMenu}>ROI Growth</a>
            <a href="#pricing" onClick={closeMobileMenu}>Pricing</a>
            <a href="#faq" onClick={closeMobileMenu}>FAQ</a>
            <div className="lp-menu-actions">
              <button onClick={() => { closeMobileMenu(); navigate('/auth'); }} className="btn-primary">Get Started Free <ArrowRight size={13} /></button>
              <button onClick={() => { closeMobileMenu(); navigate('/auth'); }} className="btn-secondary">Sign In</button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section with Crisp 8K Indian Fine Dining Atmosphere Background */}
      <section className="section-pad" style={{ padding: '80px 40px 60px', maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        
        {/* Background Ultra-Sharp Indian Fine Dining Image Overlay */}
        <div className="hero-bg-image" style={{ position: 'absolute', top: 0, right: '-4%', width: '65%', height: '100%', opacity: 0.28, borderRadius: '40px', overflow: 'hidden', pointerEvents: 'none', maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, transparent 100%)' }}>
          <img src="/luxury-1.png" alt="Restaurant QR menu automation in action inside an Indian fine dining restaurant" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '50px', alignItems: 'center' }}>
          
          {/* Left Column Text */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '50px', padding: '6px 16px', color: '#fcd34d', fontSize: '0.82rem', fontWeight: '800', marginBottom: '22px' }}>
              <Sparkles size={13} color="#f59e0b" /> India's #1 Luxury Restaurant Automation Platform
            </div>
            
            <h1 className="font-serif" style={{ fontSize: 'clamp(2.4rem, 4.8vw, 4.2rem)', fontWeight: '900', lineHeight: '1.12', marginBottom: '22px', letterSpacing: '-1px' }}>
              The Gold Standard in <br />
              <span className="text-gradient-gold">Restaurant Automation &amp; QR Menus</span>
              <br /> for Indian Fine Dining
            </h1>

            <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.65', maxWidth: '560px' }}>
              Empower your dining room with a restaurant QR menu, instant contactless ordering, veg/non-veg dish tags, real-time kitchen display dispatch, and seamless table ordering — no app download needed.
            </p>

            {/* Key Takeaway — direct answer block for AEO / AI extraction */}
            <div className="key-takeaway" style={{ background: 'var(--surface-glass)', border: '1px solid var(--border)', borderLeft: '3px solid var(--primary)', borderRadius: '14px', padding: '14px 18px', maxWidth: '560px', marginBottom: '28px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '900', textTransform: 'uppercase', color: '#f59e0b', letterSpacing: '1px', marginBottom: '6px' }}>Key Takeaway</div>
              <p style={{ fontSize: '0.92rem', lineHeight: '1.6', margin: 0, color: 'var(--text-main)' }}>
                <strong>DinePulse by v4stay</strong> is the best restaurant automation software in India for fine-dining restaurants, heritage hotels, lounges &amp; bars, and cloud kitchens. It replaces paper menus and manual order-taking with a restaurant QR menu, contactless table ordering, and a live kitchen display — bottom line: faster table turns, bigger average tickets, and zero app downloads for guests. Free for 14 days, ₹14,999/year after, no per-order commissions.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '38px' }}>
              <button className="btn-primary" style={{ padding: '14px 32px', fontSize: '0.98rem' }} onClick={() => navigate('/auth')}>
                Start 14-Day Free Trial <ArrowRight size={15} />
              </button>
              <a href="#luxury-experience" className="btn-emerald" style={{ padding: '14px 26px', fontSize: '0.98rem' }}>
                <Wine size={14} /> Explore Luxury Features
              </a>
            </div>

            {/* Micro Metrics */}
            <div style={{ display: 'flex', gap: '32px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
              <div>
                <div style={{ fontSize: '1.7rem', fontWeight: '900', color: '#fcd34d' }}>₹50M+</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Indian Dining Orders Billed</div>
              </div>
              <div style={{ width: '1px', background: 'var(--border)' }} />
              <div>
                <div style={{ fontSize: '1.7rem', fontWeight: '900', color: '#14b8a6' }}>+32%</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Average Ticket Size</div>
              </div>
              <div style={{ width: '1px', background: 'var(--border)' }} />
              <div>
                <div style={{ fontSize: '1.7rem', fontWeight: '900', color: '#f59e0b' }}>0.3s</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Instant QR Scan Speed</div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Smartphone UI Demo Component */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            
            {/* Phone Frame Glass Showcase */}
            <div className="glass-panel-glow animate-float" style={{ width: '340px', padding: '14px', borderRadius: '36px', background: 'rgba(18, 20, 29, 0.96)', border: '1.5px solid rgba(245, 158, 11, 0.35)', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 35px rgba(245, 158, 11, 0.2)' }}>
              
              {/* Notch */}
              <div style={{ width: '100px', height: '14px', background: '#060709', borderRadius: '0 0 10px 10px', margin: '0 auto 12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ width: '30px', height: '3px', background: '#1c2232', borderRadius: '3px' }} />
              </div>

              {/* Mobile Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '0 4px' }}>
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: '900', color: '#fcd34d', fontFamily: 'Cinzel, serif' }}>Bukhara Royal Dining</div>
                  <div style={{ fontSize: '0.72rem', color: '#14b8a6', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#14b8a6' }} /> Table 14 · Royal Table Service
                  </div>
                </div>
                <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', padding: '4px 10px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShoppingBag size={11} /> {cartCount} Items
                </div>
              </div>

              {/* Category Pills */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', overflowX: 'auto', paddingBottom: '2px' }}>
                {[
                  { key: 'starters', label: 'Kebabs' },
                  { key: 'mains', label: 'Curries' },
                  { key: 'cocktails', label: 'Drinks' }
                ].map(cat => (
                  <button 
                    key={cat.key} 
                    onClick={() => setActiveCategory(cat.key)}
                    style={{
                      background: activeCategory === cat.key ? 'linear-gradient(135deg, #d97706, #f59e0b)' : 'rgba(255,255,255,0.05)',
                      color: activeCategory === cat.key ? '#060709' : 'var(--text-muted)',
                      border: 'none', padding: '5px 12px', borderRadius: '50px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', whiteSpace: 'nowrap'
                    }}>
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Menu Cards List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                {menuItems[activeCategory].map(dish => (
                  <div key={dish.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(245, 158, 11, 0.12)', borderRadius: '14px', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1, paddingRight: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'white' }}>{dish.name}</span>
                        {dish.tags.map(t => (
                          <span key={t} style={{ fontSize: '0.6rem', background: t.includes('Non-Veg') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: t.includes('Non-Veg') ? '#ef4444' : '#10b981', padding: '1px 5px', borderRadius: '4px', fontWeight: '800' }}>{t}</span>
                        ))}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{dish.desc}</div>
                      <div style={{ fontSize: '0.88rem', fontWeight: '900', color: '#f59e0b' }}>₹{dish.price}</div>
                    </div>
                    <button 
                      onClick={() => handleAddItem(dish.price)}
                      style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)', color: '#060709', border: 'none', width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: '900' }}>
                      <Plus size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Order Bar Button */}
              <div style={{ background: 'linear-gradient(135deg, #0f766e, #14b8a6)', color: 'white', padding: '11px 14px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', boxShadow: '0 6px 18px rgba(20, 184, 166, 0.35)' }} onClick={() => navigate('/auth')}>
                <div>
                  <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', opacity: 0.85, fontWeight: '800' }}>Instant Table Order</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '900' }}>₹{cartTotal.toLocaleString('en-IN')} ({cartCount} Items)</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontWeight: '900', fontSize: '0.82rem' }}>
                  Send to Kitchen <ArrowRight size={13} />
                </div>
              </div>

            </div>

            {/* Floating Glass Badges */}
            <div className="glass-panel hero-float-badge" style={{ position: 'absolute', top: '40px', left: '-30px', padding: '10px 14px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Flame size={15} color="#f59e0b" />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Kitchen Status</div>
                <div style={{ fontSize: '0.82rem', fontWeight: '800', color: 'white' }}>Live KDS Sync</div>
              </div>
            </div>

            <div className="glass-panel hero-float-badge" style={{ position: 'absolute', bottom: '50px', right: '-30px', padding: '10px 14px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', border: '1px solid rgba(20, 184, 166, 0.2)' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(20, 184, 166, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={15} color="#14b8a6" />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Table Revenue</div>
                <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#14b8a6' }}>+32% Per Seating</div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Definitions & Direct Answers (AEO/GEO) */}
      <section id="what-is-dinepulse" className="section-pad" style={{ padding: '64px 40px', maxWidth: '900px', margin: '0 auto' }}>
        <h2 className="font-serif" style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '16px' }}>What is DinePulse restaurant automation?</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '16px' }}>
          DinePulse is a restaurant automation platform by v4stay that turns every table into a self-serve ordering point using a restaurant QR menu — the fastest-growing form of restaurant automation in India. Guests scan the QR code on their table, browse your digital menu with photos, prices, and veg/non-veg tags, and send their order straight to the kitchen display — no app download, no waiter required, no misheard orders.
        </p>
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '40px' }}>
          <strong style={{ color: 'var(--text-main)' }}>Who it's for:</strong> fine-dining restaurants and heritage hotels that want royal table service, high-volume cocktail lounges and bars, cloud kitchens running lean teams, and café chains that want to raise average ticket size without adding staffing cost. Use it when guests wait too long to order, when paper menus cost a fortune to reprint, or when kitchen tickets arrive wrong or late.
        </p>

        <h2 className="font-serif" style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '16px' }}>Why is DinePulse the best restaurant automation software in India?</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '20px' }}>
          Most restaurant software in India solves one slice of the problem — a POS here, a QR menu there. DinePulse bundles the full operational loop into one restaurant automation platform, priced flat at ₹14,999/year with no hardware installation and no commissions per order:
        </p>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '40px', padding: 0 }}>
          {[
            { k: 'Restaurant QR menu & digital menu software', d: 'Table QR codes, photos, descriptions, veg/non-veg tags, and instant price updates — guests order in seconds on their own phone.' },
            { k: 'Contactless ordering & table QR ordering', d: 'Orders and re-orders land with add-ons and notes intact, cutting order errors that plague manual take.' },
            { k: 'Live kitchen display system (KDS)', d: 'Real-time, colour-coded order tickets for every station — tandoor, curry, bar, desserts — with one-tap completion.' },
            { k: 'Revenue analytics & staff management', d: 'Daily sales, top dishes, average ticket size, and role-based staff access in one hotel-grade dashboard.' },
            { k: 'Cloud kitchen & hotel-friendly', d: 'One subscription covers dine-in tables, cloud kitchen counters, hotel rooms, and lounge seats with unlimited QR codes.' }
          ].map(item => (
            <li key={item.k} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', color: 'var(--text-muted)', lineHeight: '1.65', fontSize: '0.94rem' }}>
              <CheckCircle size={16} color="#14b8a6" style={{ flexShrink: 0, marginTop: '4px' }} />
              <span><strong style={{ color: 'var(--text-main)' }}>{item.k}:</strong> {item.d}</span>
            </li>
          ))}
        </ul>

        <h2 className="font-serif" style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '20px' }}>How do you launch contactless QR dining with DinePulse?</h2>
        <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '40px', padding: 0 }}>
          {[
            { t: 'Build your digital menu', d: 'Add dishes, prices, photos, and descriptions with veg/non-veg tags in the DinePulse dashboard — no designer or developer required.' },
            { t: 'Print & place table QR standees', d: 'Every table gets its own auto-generated code; guests scan it with any phone camera and the menu opens instantly.' },
            { t: 'Go live with the kitchen display', d: 'Guest orders arrive on your KDS screen in real time, colour-coded by urgency, with one-tap prep updates for your kitchen team.' }
          ].map((step, i) => (
            <li key={step.t} className="glass-panel" style={{ padding: '16px 20px', borderRadius: '14px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <span style={{ minWidth: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #d97706, #f59e0b)', color: '#060709', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>{i + 1}</span>
              <div>
                <strong style={{ display: 'block', marginBottom: '4px', fontSize: '0.98rem' }}>{step.t}</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6' }}>{step.d}</span>
              </div>
            </li>
          ))}
        </ol>

        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '14px' }}>Explore DinePulse solutions in detail</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <Link to="/restaurant-software" className="glass-panel" style={{ padding: '16px 18px', borderRadius: '14px', textDecoration: 'none' }}>
            <strong style={{ color: '#fcd34d', display: 'block', marginBottom: '4px', fontSize: '0.92rem' }}>Restaurant Software</strong>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: '1.55' }}>QR menus, live KDS, and analytics in one all-in-one suite for full-service restaurants.</span>
          </Link>
          <Link to="/food-software" className="glass-panel" style={{ padding: '16px 18px', borderRadius: '14px', textDecoration: 'none' }}>
            <strong style={{ color: '#fcd34d', display: 'block', marginBottom: '4px', fontSize: '0.92rem' }}>Food Management Software</strong>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: '1.55' }}>Menu engineering, pricing, categories, and food-item workflows for growing kitchens and cloud kitchens.</span>
          </Link>
          <Link to="/restaurant-automation" className="glass-panel" style={{ padding: '16px 18px', borderRadius: '14px', textDecoration: 'none' }}>
            <strong style={{ color: '#fcd34d', display: 'block', marginBottom: '4px', fontSize: '0.92rem' }}>Restaurant Automation</strong>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: '1.55' }}>Contactless ordering, kitchen dispatch, and staff alerts that remove manual order-taking entirely.</span>
          </Link>
          <Link to="/contact" className="glass-panel" style={{ padding: '16px 18px', borderRadius: '14px', textDecoration: 'none' }}>
            <strong style={{ color: '#fcd34d', display: 'block', marginBottom: '4px', fontSize: '0.92rem' }}>Talk to Support</strong>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: '1.55' }}>Get an onboarding walkthrough or a setup review for your restaurant with the v4stay team.</span>
          </Link>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: '28px' }}>
          Last updated: October 2026 · DinePulse is built and maintained by v4stay.
        </p>
      </section>

      {/* High-End Fine Dining Showcase Cards (Using Crisp New 8K Indian Dining Photos) */}
      <section id="luxury-experience" className="section-pad" style={{ padding: '80px 40px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{ color: '#f59e0b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>Bespoke Indian Architecture</span>
          <h2 className="font-serif" style={{ fontSize: '2.2rem', fontWeight: '900', marginTop: '6px' }}>Crafted for Premier Indian Fine Dining & Royal Heritage Hotels</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
          
          {/* Card 1: Using Crisp 8K Indian Feast Photo 2 */}
          <div className="glass-panel" style={{ overflow: 'hidden', borderRadius: '20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '230px', overflow: 'hidden', position: 'relative' }}>
              <img src="/luxury-2.png" alt="Ultra Sharp Indian Royal Feast Table" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(18,20,29,1) 0%, transparent 60%)' }} />
              <div style={{ position: 'absolute', bottom: '14px', left: '16px', background: 'rgba(245,158,11,0.2)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.3)', padding: '3px 10px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '800' }}>
                Royal Thali & Course Pairings
              </div>
            </div>
            <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px', color: 'white' }}>Royal Heritage Table Service</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.92rem' }}>
                Enhance your dining room service. Guests scan table QR codes to view multi-course Thali pairings, allergen disclaimers, and place re-orders seamlessly.
              </p>
            </div>
          </div>

          {/* Card 2: Using Crisp 8K Indian Cocktail Lounge Photo 3 */}
          <div className="glass-panel" style={{ overflow: 'hidden', borderRadius: '20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '230px', overflow: 'hidden', position: 'relative' }}>
              <img src="/luxury-3.png" alt="Ultra Sharp Indian Lounge Bar Counter" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(18,20,29,1) 0%, transparent 60%)' }} />
              <div style={{ position: 'absolute', bottom: '14px', left: '16px', background: 'rgba(20,184,166,0.2)', color: '#2dd4bf', border: '1px solid rgba(20,184,166,0.3)', padding: '3px 10px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '800' }}>
                Boutique Bars & Hotel Lounges
              </div>
            </div>
            <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px', color: 'white' }}>High-Volume Lounge & Bar KDS</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.92rem' }}>
                Instant order dispatch straight to mixologist monitors. Guests order craft cocktails and appetizers from their lounge booths with zero waiting queues.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Showcase Tabs ("See DinePulse in Action") */}
      <section id="interactive-demo" className="section-pad" style={{ padding: '80px 40px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ color: '#f59e0b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>Interactive Software Suite</span>
            <h2 className="font-serif" style={{ fontSize: '2.2rem', fontWeight: '900', marginTop: '6px' }}>Designed for Every Corner of Your Operation</h2>
          </div>

          {/* Tab Switcher Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '32px', flexWrap: 'wrap' }}>
            {[
              { id: 'menu', label: 'Guest Digital QR Menu', icon: <Smartphone size={15} /> },
              { id: 'kitchen', label: 'Kitchen Display System (KDS)', icon: <ChefHat size={15} /> },
              { id: 'analytics', label: 'Admin Sales & Analytics', icon: <BarChart3 size={15} /> }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Active Tab Preview Display */}
          <div className="glass-panel-glow" style={{ padding: '36px', borderRadius: '24px', minHeight: '340px' }}>
            {activeTab === 'menu' && (
              <div className="feature-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: '900', marginBottom: '14px', color: 'white' }}>How does contactless QR table ordering work?</h3>
                  <p style={{ color: 'var(--text-muted)', lineHeight: '1.65', marginBottom: '20px', fontSize: '0.98rem' }}>
                    Guests point their mobile camera at the table QR standee and your QR code menu opens in 0.3 seconds with Veg/Non-Veg indicators, food imagery, and instant cart additions — the easiest contactless ordering flow for any restaurant in India.
                  </p>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', listStyle: 'none' }}>
                    {['Zero mobile app download or guest registration required', 'Clear Veg (Green) & Non-Veg (Red) dietary tags on every dish', 'Dynamic daily special highlights & instant price updates'].map(item => (
                      <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                        <CheckCircle size={15} color="#14b8a6" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '18px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.8rem', color: '#f59e0b', marginBottom: '10px', fontWeight: '800' }}>LIVE TABLE QR PREVIEW</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '1.8rem' }}>🍛</div>
                    <div>
                      <div style={{ fontWeight: '900', fontSize: '1.05rem', color: 'white' }}>Table 14 — Royal Courtyard</div>
                      <div style={{ fontSize: '0.8rem', color: '#14b8a6' }}>4 Guests Connected · Active Order #2041</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'kitchen' && (
              <div className="feature-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: '900', marginBottom: '14px', color: 'white' }}>How does the Kitchen Display System speed up service?</h3>
                  <p style={{ color: 'var(--text-muted)', lineHeight: '1.65', marginBottom: '20px', fontSize: '0.98rem' }}>
                    Eliminate paper tickets and shouting. Kitchen staff view real-time orders color-coded by urgency, mark dishes as preparing or ready, and dispatch staff automatically.
                  </p>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', listStyle: 'none' }}>
                    {['Color-coded preparation timer alerts', 'Filter orders by station (Tandoor, Curry, Bar, Desserts)', 'One-tap dish completion sync across floor devices'].map(item => (
                      <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                        <CheckCircle size={15} color="#f59e0b" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="feature-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.35)', padding: '16px', borderRadius: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '900', color: '#fcd34d' }}>Table 14</span>
                      <span style={{ fontSize: '0.7rem', background: '#d97706', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>03:45 min</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'white' }}>• 2x Hyderabadi Biryani</div>
                    <div style={{ fontSize: '0.82rem', color: 'white' }}>• 1x Dal Makhani</div>
                  </div>

                  <div style={{ background: 'rgba(20, 184, 166, 0.12)', border: '1px solid rgba(20, 184, 166, 0.35)', padding: '16px', borderRadius: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '900', color: '#2dd4bf' }}>Table 06</span>
                      <span style={{ fontSize: '0.7rem', background: '#0f766e', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>READY</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'white' }}>• 2x Paneer Tikka</div>
                    <div style={{ fontSize: '0.82rem', color: 'white' }}>• 2x Saffron Sour</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="feature-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: '900', marginBottom: '14px', color: 'white' }}>What revenue insights does DinePulse give you?</h3>
                  <p style={{ color: 'var(--text-muted)', lineHeight: '1.65', marginBottom: '20px', fontSize: '0.98rem' }}>
                    Gain total clarity over sales trends, average ticket spend, peak seating times, and guest satisfaction ratings from your administrative dashboard.
                  </p>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', listStyle: 'none' }}>
                    {['Automated revenue reports & category breakdown', 'Top performing dish rankings & guest feedback', 'Instant UPI & cash payment tracking'].map(item => (
                      <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                        <CheckCircle size={15} color="#14b8a6" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '18px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '800' }}>TODAY'S REVENUE</div>
                  <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#f59e0b', marginBottom: '14px' }}>₹1,48,500</div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '84%', height: '100%', background: 'linear-gradient(90deg, #d97706, #14b8a6)' }} />
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>84% of daily revenue target reached</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Interactive ROI Calculator */}
      <section id="roi-calculator" className="section-pad" style={{ padding: '80px 40px', maxWidth: '1000px', margin: '0 auto' }}>
        <div className="glass-panel-glow roi-panel" style={{ padding: '44px', borderRadius: '28px', textAlign: 'center' }}>
          <span style={{ color: '#f59e0b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>Growth & Profit Engine</span>
          <h2 className="font-serif" style={{ fontSize: '2.2rem', fontWeight: '900', marginTop: '6px', marginBottom: '14px' }}>Calculate Your Revenue Growth</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '36px', maxWidth: '580px', margin: '0 auto 36px' }}>
            Adjust the slider to your restaurant's dining table count to estimate your monthly revenue growth with DinePulse.
          </p>

          <div style={{ maxWidth: '580px', margin: '0 auto 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontWeight: '700', fontSize: '1.05rem' }}>Number of Tables:</span>
              <span style={{ fontSize: '1.6rem', fontWeight: '900', color: '#f59e0b' }}>{tablesCount} Tables</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="150" 
              value={tablesCount} 
              onChange={e => setTablesCount(Number(e.target.value))}
              style={{ width: '100%', height: '6px', accentColor: '#f59e0b', cursor: 'pointer' }} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.28)', padding: '20px', borderRadius: '18px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '800' }}>EST. MONTHLY REVENUE BOOST</div>
              <div style={{ fontSize: '1.9rem', fontWeight: '900', color: '#f59e0b' }}>+₹{monthlyRevenueBoost.toLocaleString('en-IN')}</div>
            </div>

            <div style={{ background: 'rgba(20, 184, 166, 0.08)', border: '1px solid rgba(20, 184, 166, 0.28)', padding: '20px', borderRadius: '18px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '800' }}>STAFF HOURS SAVED / MO</div>
              <div style={{ fontSize: '1.9rem', fontWeight: '900', color: '#14b8a6' }}>{hoursSaved} Hours</div>
            </div>

            <div style={{ background: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.28)', padding: '20px', borderRadius: '18px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '800' }}>TABLE WAIT TIME CUT</div>
              <div style={{ fontSize: '1.9rem', fontWeight: '900', color: '#fcd34d' }}>-14 Mins</div>
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '28px', maxWidth: '620px', margin: '28px auto 0', lineHeight: '1.65' }}>
            Contactless and table-side digital ordering is one of the fastest-adopted guest technologies in full-service dining, according to the
            {' '}<a href="https://restaurant.org/research-and-media" target="_blank" rel="noopener noreferrer" style={{ color: '#f59e0b', fontWeight: '700', textDecoration: 'underline' }}>National Restaurant Association's research &amp; industry reports</a>{' '}
            — the growth estimates above reflect that same shift toward self-serve QR ordering.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-pad" style={{ padding: '80px 40px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{ color: '#14b8a6', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>Endorsed by Top Chefs & Hoteliers</span>
          <h2 className="font-serif" style={{ fontSize: '2.2rem', fontWeight: '900', marginTop: '6px' }}>What Restaurant Owners Say</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {[
            { quote: "DinePulse transformed our dinner service. Table turnover speed increased by 32%, and guests love ordering specialty kebabs & cocktails directly from their phones.", author: "Chef Vikram Malhotra", role: "Owner, Royal Awadhi Bistro" },
            { quote: "Replacing physical paper menus with DinePulse digital QR standees transformed our hotel lounge. Guests order food seamlessly without waiting for staff.", author: "Ananya Roy", role: "General Manager, Heritage Resorts & Hotels" },
            { quote: "The Kitchen Display System is brilliant. Orders flow directly from guest mobile screens to our chef line with zero ticket errors.", author: "Rajesh Kumar", role: "Founder, CloudKitchen Co." }
          ].map((t, i) => (
            <div key={i} className="glass-panel" style={{ padding: '30px', borderRadius: '20px' }}>
              <div style={{ display: 'flex', gap: '3px', color: '#f59e0b', marginBottom: '14px' }}>
                {[...Array(5)].map((_, idx) => <Star key={idx} size={14} fill="#f59e0b" />)}
              </div>
              <p style={{ color: 'var(--text-main)', fontSize: '0.98rem', lineHeight: '1.6', marginBottom: '20px', fontStyle: 'italic' }}>"{t.quote}"</p>
              <div>
                <div style={{ fontWeight: '900', fontSize: '0.95rem', color: '#fcd34d' }}>{t.author}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="section-pad" style={{ padding: '80px 40px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ color: '#f59e0b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>Transparent Pricing</span>
          <h2 className="font-serif" style={{ fontSize: '2.2rem', fontWeight: '900', marginTop: '6px', marginBottom: '40px' }}>Invest in Your Restaurant's Future</h2>

          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {/* Free Trial */}
            <div className="glass-panel" style={{ flex: '1', minWidth: '280px', maxWidth: '380px', padding: '36px 30px', textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Free Trial</div>
              <div style={{ fontSize: '2.2rem', fontWeight: '900', color: 'white', marginBottom: '2px' }}>₹0</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>14 Days Full Access</div>
              
              <div style={{ flex: 1, marginBottom: '28px' }}>
                {['Digital Menu Builder', 'Unlimited Table QR Codes', 'Guest Menu Browsing', '14-Day Premium Features Access'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontSize: '0.9rem' }}>
                    <CheckCircle size={14} color="#14b8a6" /> {f}
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/auth')} className="btn-secondary" style={{ width: '100%', padding: '12px', fontSize: '0.9rem' }}>Get Started Free</button>
            </div>

            {/* Premium Plan */}
            <div className="glass-panel-glow" style={{ flex: '1', minWidth: '280px', maxWidth: '380px', padding: '36px 30px', textAlign: 'left', display: 'flex', flexDirection: 'column', position: 'relative', border: '1.5px solid #f59e0b' }}>
              <div style={{ position: 'absolute', top: '-12px', right: '24px', background: 'linear-gradient(135deg, #d97706, #f59e0b)', color: '#060709', padding: '3px 12px', borderRadius: '50px', fontSize: '0.72rem', fontWeight: '900', textTransform: 'uppercase' }}>Most Popular</div>
              <div style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', color: '#f59e0b', marginBottom: '6px' }}>Premium Annual</div>
              <div style={{ fontSize: '2.4rem', fontWeight: '900', color: 'white', marginBottom: '2px' }}>₹14,999<span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/yr</span></div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Billed annually · Complete Operating System</div>

              <div style={{ flex: 1, marginBottom: '28px' }}>
                {['Everything in Free, plus:', 'Contactless Table QR Ordering', 'Live Kitchen Display System (KDS)', 'Staff Management & Role Control', 'Sales Analytics & Revenue Charts', 'Guest Feedback & Rating System', 'Printable Receipts & Order History', 'Priority 24/7 Concierge Support'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontSize: '0.9rem', color: f.startsWith('Every') ? 'var(--text-muted)' : 'white' }}>
                    <CheckCircle size={14} color={f.startsWith('Every') ? 'var(--text-muted)' : '#f59e0b'} /> {f}
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/auth')} className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '0.9rem' }}>Start 14-Day Free Trial</button>
            </div>
          </div>

          {/* Plan Comparison Table (structured comparison for quick scans & AI answers) */}
          <table style={{ width: '100%', maxWidth: '780px', margin: '48px auto 0', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
            <caption style={{ captionSide: 'top', textAlign: 'left', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.78rem', padding: '0 4px 12px' }}>
              DinePulse plan comparison — free trial vs premium annual
            </caption>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <th scope="col" style={{ padding: '10px 12px', fontWeight: '800' }}>Feature</th>
                <th scope="col" style={{ padding: '10px 12px', fontWeight: '800' }}>Free 14-Day Trial</th>
                <th scope="col" style={{ padding: '10px 12px', fontWeight: '800', color: '#f59e0b' }}>Premium Annual (₹14,999/yr)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { f: 'Digital menu builder with photos & veg/non-veg tags', t: true, p: true },
                { f: 'Unlimited table QR codes', t: true, p: true },
                { f: 'Guest menu browsing', t: true, p: true },
                { f: 'Contactless table ordering & cart', t: false, p: true },
                { f: 'Live Kitchen Display System (KDS)', t: false, p: true },
                { f: 'Sales analytics & revenue charts', t: false, p: true },
                { f: 'Staff management & role control', t: false, p: true },
                { f: 'Guest feedback, ratings & receipts', t: false, p: true },
                { f: 'Priority 24/7 concierge support', t: false, p: true }
              ].map(row => (
                <tr key={row.f} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 12px', color: 'var(--text-main)' }}>{row.f}</td>
                  <td style={{ padding: '10px 12px', color: row.t ? '#14b8a6' : 'var(--text-subtle)', fontWeight: row.t ? '800' : '400' }}>{row.t ? '✓ Included' : '—'}</td>
                  <td style={{ padding: '10px 12px', color: '#f59e0b', fontWeight: '800' }}>✓ Included</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="section-pad" style={{ padding: '80px 40px', maxWidth: '850px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <HelpCircle size={26} color="#f59e0b" style={{ margin: '0 auto 10px' }} />
          <h2 className="font-serif" style={{ fontSize: '2.2rem', fontWeight: '900' }}>Frequently Asked Questions</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[
            { q: 'What is a QR menu for restaurants?', a: 'A QR menu is a digital menu accessible by scanning a QR code on a restaurant table with any smartphone camera. Guests view dishes, photos, and prices on their mobile browser and order directly without downloading an app.' },
            { q: 'How does restaurant automation work with DinePulse?', a: 'DinePulse automates table ordering by sending guest QR orders directly to kitchen displays and staff devices, eliminating manual order-taking and reducing wait times.' },
            { q: 'Is QR ordering safe and contactless for guests?', a: 'Yes, QR ordering is 100% contactless. Guests use their own mobile devices, eliminating touch points with shared physical menus.' },
            { q: 'How much does DinePulse cost?', a: 'DinePulse offers a 14-day free trial with access to all features. Premium plans are ₹14,999 per year with unlimited digital menus, table QR code downloads, staff logins, and real-time analytics.' },
            { q: 'Do guests need to download an app to view the menu?', a: 'No app download is required! The digital menu opens instantly in Safari, Chrome, or Firefox upon scanning the table QR code.' },
            { q: 'Which is the best restaurant automation software in India?', a: 'DinePulse is the best restaurant automation software in India for fine-dining restaurants, heritage hotels, lounges, bars, and cloud kitchens. It combines a restaurant QR menu, contactless table ordering, a live kitchen display system, staff management, and revenue analytics at ₹14,999 per year — with a 14-day free trial and zero commissions per order.' },
            { q: 'Does a restaurant QR menu work for cloud kitchens and hotel rooms in India?', a: 'Yes. A restaurant QR menu works anywhere guests can scan a code — dine-in tables, cloud kitchen pickup counters, hotel rooms, lounge seats, and boutique bars. DinePulse supports unlimited table QR codes on one subscription, so a single account covers your entire venue.' }
          ].map((item, idx) => (
            <div 
              key={idx} 
              className="glass-panel" 
              onClick={() => setOpenFaqIndex(openFaqIndex === idx ? -1 : idx)}
              style={{ padding: '18px 24px', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '800', fontSize: '1rem', color: 'white' }}>
                <span>{item.q}</span>
                <ChevronRight size={16} style={{ transform: openFaqIndex === idx ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', color: '#f59e0b' }} />
              </div>
              {openFaqIndex === idx && (
                <p style={{ marginTop: '12px', color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.92rem' }}>
                  {item.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Luxury Footer */}
      <footer style={{ padding: '44px 40px 32px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
        <div className="footer-grid" style={{ maxWidth: '1150px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '36px', marginBottom: '36px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '900', fontSize: '1.35rem', color: 'white', marginBottom: '10px' }}>
              <img src="/logo.png" alt="DinePulse Gold Logo" style={{ height: '26px', borderRadius: '6px' }} />
              <span className="font-serif">DinePulse</span>
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: '1.6', maxWidth: '300px' }}>
              The gold standard in luxury Indian restaurant automation and digital menu systems for fine dining, hotels, and cocktail lounges.
            </p>
          </div>

          <div>
            <div style={{ fontWeight: '800', color: 'white', marginBottom: '12px', fontSize: '0.9rem' }}>Solutions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <span style={{ cursor: 'pointer' }} onClick={() => navigate('/restaurant-software')}>Restaurant Software</span>
              <span style={{ cursor: 'pointer' }} onClick={() => navigate('/food-software')}>Food Management Software</span>
              <span style={{ cursor: 'pointer' }} onClick={() => navigate('/restaurant-automation')}>Restaurant Automation</span>
            </div>
          </div>

          <div>
            <div style={{ fontWeight: '800', color: 'white', marginBottom: '12px', fontSize: '0.9rem' }}>Company</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <span style={{ cursor: 'pointer' }} onClick={() => navigate('/about')}>About Us</span>
              <span style={{ cursor: 'pointer' }} onClick={() => navigate('/contact')}>Contact Support</span>
            </div>
          </div>

          <div>
            <div style={{ fontWeight: '800', color: 'white', marginBottom: '12px', fontSize: '0.9rem' }}>Legal & Privacy</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <span style={{ cursor: 'pointer' }} onClick={() => navigate('/terms')}>Terms & Conditions</span>
              <span style={{ cursor: 'pointer' }} onClick={() => navigate('/privacy')}>Privacy Policy</span>
              <span style={{ cursor: 'pointer' }} onClick={() => navigate('/cookies')}>Cookie Policy</span>
              <span style={{ cursor: 'pointer' }} onClick={() => navigate('/refund')}>Refund Policy</span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '24px', fontSize: '0.82rem' }}>
          © 2026 DinePulse (v4stay). All rights reserved. Built for luxury Indian fine dining & hospitality.
        </div>
      </footer>

    </div>
  );
}
