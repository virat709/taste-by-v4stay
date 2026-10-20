import { useEffect, useState, useRef } from 'react';
import { AdminLayout } from './Dashboard';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import {
  collection, onSnapshot, addDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy
} from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import { Plus, Trash2, Download, QrCode, Copy, Check } from 'lucide-react';

const THEMES = [
  { id: 'poster', name: '👑 Royal Smarter Dining (Poster)', bg: ['#090c15', '#0f1422', '#080a11'], border: '#f59e0b', text: '#ffffff', accent: '#fcd34d' },
  { id: 'luxury', name: '✨ Dark Obsidian Luxury', bg: ['#060709', '#0e1017', '#060709'], border: '#d97706', text: '#ffffff', accent: '#fbbf24' },
  { id: 'pristine', name: '⚪ Pristine White', bg: ['#ffffff', '#f8fafc', '#f1f5f9'], border: '#d97706', text: '#0f172a', accent: '#0f766e' }
];

export default function TableManager() {
  const { user } = useAuth();
  const [tables, setTables] = useState([]);
  const [restaurantName, setRestaurantName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const baseUrl = window.location.origin;
  const tablesRef = useRef(tables);

  useEffect(() => {
    tablesRef.current = tables;
  }, [tables]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'restaurants', user.uid, 'tables'), orderBy('createdAt'));
    const unsubTables = onSnapshot(q, snap => {
      setTables(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubRest = onSnapshot(doc(db, 'restaurants', user.uid), snap => {
      if (snap.exists()) setRestaurantName(snap.data().restaurantName || snap.data().name || 'Our Restaurant');
    });

    return () => {
      unsubTables();
      unsubRest();
    };
  }, [user]);

  const addTable = async () => {
    if (!user) return;
    const num = tableNumber.trim();
    if (!num) return;
    const current = tablesRef.current;
    if (current.find(t => t.number === num)) {
      alert(`Table "${num}" already exists!`);
      return;
    }
    setLoading(true);
    await addDoc(collection(db, 'restaurants', user.uid, 'tables'), {
      number: num, createdAt: serverTimestamp()
    });
    setTableNumber('');
    setLoading(false);
  };

  const addBulkTables = async (count) => {
    if (!user) return;
    const current = tablesRef.current;
    const start = current.length + 1;
    for (let i = start; i < start + count; i++) {
      const num = String(i);
      if (!current.find(t => t.number === num)) {
        await addDoc(collection(db, 'restaurants', user.uid, 'tables'), {
          number: num, createdAt: serverTimestamp()
        });
      }
    }
  };

  const deleteTable = async (id) => {
    if (!user) return;
    if (window.confirm('Remove this table?'))
      await deleteDoc(doc(db, 'restaurants', user.uid, 'tables', id));
  };

  if (!user) return null;

  return (
    <AdminLayout>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.9rem', fontWeight: '800', marginBottom: '4px' }}>Tables & QR Standees</h1>
        <p style={{ color: 'var(--text-muted)' }}>Generate high-definition printable QR standee posters for your dining tables.</p>
      </div>

      {/* Add Table Panel */}
      <div style={{ background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--border)', padding: '24px', marginBottom: '28px' }}>
        <h3 style={{ fontWeight: '700', marginBottom: '16px' }}>Add a Table</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Table Number / Name</label>
            <input className="input-field" placeholder='e.g. 1, VIP, Terrace, Bar'
              value={tableNumber} onChange={e => setTableNumber(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTable()} />
          </div>
          <button className="btn-primary" onClick={addTable} disabled={loading} style={{ alignSelf: 'flex-end' }}>
            <Plus size={16} /> Add Table
          </button>
        </div>

        {/* Bulk add shortcuts */}
        <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Quick add:</span>
          {[5, 10, 20].map(n => (
            <button key={n} onClick={() => addBulkTables(n)} style={{ background: 'var(--bg-color)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', fontFamily: 'inherit', color: 'var(--text-muted)' }}>
              +{n} tables
            </button>
          ))}
        </div>
      </div>

      {/* Theme Selector */}
      <div style={{ background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--border)', padding: '24px', marginBottom: '28px' }}>
        <h3 style={{ fontWeight: '700', marginBottom: '16px' }}>QR Standee Design Theme</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {THEMES.map(t => (
            <button 
              key={t.id}
              onClick={() => setSelectedTheme(t)}
              style={{
                background: t.bg[0],
                color: t.text,
                border: selectedTheme.id === t.id ? `2px solid ${t.accent}` : '2px solid transparent',
                borderRadius: '12px',
                padding: '10px 16px',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: selectedTheme.id === t.id ? `0 4px 12px ${t.accent}40` : 'none',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: t.accent }} />
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tables Grid */}
      {tables.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)', background: 'var(--surface)', borderRadius: '20px', border: '1px dashed var(--border)' }}>
          <QrCode size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
          <h3 style={{ marginBottom: '8px', color: 'var(--text-main)', fontWeight: '600' }}>No tables yet</h3>
          <p>Add a table number above to generate its unique QR code poster.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {tables.map(table => (
            <TableCard key={table.id} table={table} userId={user.uid} baseUrl={baseUrl} restaurantName={restaurantName} theme={selectedTheme} onDelete={() => deleteTable(table.id)} />
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

function TableCard({ table, userId, baseUrl, restaurantName: _restaurantName, theme: _theme, onDelete }) {
  const qrUrl = `${baseUrl}/menu/${userId}/${table.number}`;
  const svgRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const svg = svgRef.current?.querySelector('svg');
    if (!svg) return;

    // High-Resolution 8K Canvas Output (800x1250 @ 2x scale)
    const canvasW = 800;
    const canvasH = 1250;
    const canvas = document.createElement('canvas');
    canvas.width = canvasW * 2;
    canvas.height = canvasH * 2;
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);

    // 1. Deep Royal Navy Background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvasH);
    bgGradient.addColorStop(0, '#090c15');
    bgGradient.addColorStop(0.5, '#0f1422');
    bgGradient.addColorStop(1, '#080a11');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvasW, canvasH);

    // 2. Double Golden Framing Lines
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, canvasW - 40, canvasH - 40);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
    ctx.lineWidth = 1;
    ctx.strokeRect(28, 28, canvasW - 56, canvasH - 56);

    const loadLogo = () => new Promise(resolve => {
      const logo = new Image();
      logo.crossOrigin = 'Anonymous';
      logo.onload = () => resolve(logo);
      logo.onerror = () => resolve(null);
      logo.src = '/logo.png';
    });

    const drawRest = async () => {
      const logo = await loadLogo();

      // Shifted UPWARDS for perfect vertical symmetry:
      // Top Logo Badge (Circular Gold Frame)
      const logoCenterY = 65;
      if (logo) {
        const logoR = 30;
        ctx.save();
        ctx.beginPath();
        ctx.arc(canvasW / 2, logoCenterY, logoR + 4, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(canvasW / 2, logoCenterY, logoR, 0, Math.PI * 2);
        ctx.fillStyle = '#090c15';
        ctx.fill();
        ctx.clip();
        ctx.drawImage(logo, canvasW / 2 - logoR, logoCenterY - logoR, logoR * 2, logoR * 2);
        ctx.restore();
      }

      // Ornamental Flourishes next to logo
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(canvasW / 2 - 140, logoCenterY);
      ctx.lineTo(canvasW / 2 - 48, logoCenterY);
      ctx.moveTo(canvasW / 2 + 48, logoCenterY);
      ctx.lineTo(canvasW / 2 + 140, logoCenterY);
      ctx.stroke();

      // Welcome Header
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 44px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('WELCOME', canvasW / 2, 138);

      ctx.fillStyle = '#f59e0b';
      ctx.font = '800 18px Outfit, sans-serif';
      ctx.letterSpacing = '2px';
      ctx.fillText('TO A SMARTER DINING EXPERIENCE', canvasW / 2, 168);

      // Points Above Scanner Card (Top Feature Bar)
      const topPillW = 540;
      const topPillH = 38;
      const topPillX = (canvasW - topPillW) / 2;
      const topPillY = 186;

      ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(topPillX, topPillY, topPillW, topPillH, 19);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fcd34d';
      ctx.font = '800 13.5px Outfit, sans-serif';
      ctx.letterSpacing = '1px';
      ctx.fillText('📱 SCAN THE CODE   •   📖 EXPLORE MENU   •   🍛 ORDER FAVORITES', canvasW / 2, topPillY + 24);

      // Main White Rounded Card Container (Positioned UPWARDS at cardY = 238px)
      const cardW = 560;
      const cardH = 680;
      const cardX = (canvasW - cardW) / 2;
      const cardY = 238;
      const cardR = 36;

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, cardR);
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 45;
      ctx.shadowOffsetY = 22;
      ctx.fill();
      ctx.shadowColor = 'transparent';

      // Gold Banner Inside Card ("SCAN THIS FOR")
      const bannerW = 380;
      const bannerH = 48;
      const bannerX = (canvasW - bannerW) / 2;
      const bannerY = cardY + 30;

      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 24);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 18px Outfit, sans-serif';
      ctx.letterSpacing = '2px';
      ctx.fillText('SCAN THIS FOR', canvasW / 2, bannerY + 30);

      // Large MENU Header
      ctx.fillStyle = '#060709';
      ctx.font = '900 58px Outfit, sans-serif';
      ctx.letterSpacing = '2px';
      ctx.fillText('MENU', canvasW / 2, cardY + 135);

      ctx.fillStyle = '#f59e0b';
      ctx.font = '800 15px Outfit, sans-serif';
      ctx.letterSpacing = '1.5px';
      ctx.fillText('• CONTACTLESS FAST EASY •', canvasW / 2, cardY + 164);

      // Center High-Contrast Much Bigger QR Code (360px x 360px)
      const qrSize = 360;
      const qrX = (canvasW - qrSize) / 2;
      const qrY = cardY + 185;

      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();

      img.onload = () => {
        ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

        // Table Pill Container at Bottom of White Card
        const pillW = 340;
        const pillH = 56;
        const pillX = (canvasW - pillW) / 2;
        const pillY = cardY + cardH - 74;

        ctx.fillStyle = '#0f1422';
        ctx.beginPath();
        ctx.roundRect(pillX, pillY, pillW, pillH, 28);
        ctx.fill();

        ctx.fillStyle = '#f59e0b';
        ctx.font = '900 26px Outfit, sans-serif';
        ctx.letterSpacing = '1px';
        ctx.fillText(`— TABLE ${table.number} —`, canvasW / 2, pillY + 37);

        // Points Below Scanner Card (Balanced Spacing in the Lower Half)
        const botBadgesY = cardY + cardH + 48;
        const badgeSpacing = 210;
        const startX = canvasW / 2 - badgeSpacing;

        const bottomPoints = [
          { emoji: '🛡️', title: '100% SAFE', sub: 'Contactless' },
          { emoji: '🇮🇳', title: 'MADE IN INDIA', sub: 'Hospitality' },
          { emoji: '🍃', title: 'PAPERLESS', sub: 'Eco-Friendly' }
        ];

        bottomPoints.forEach((p, idx) => {
          const bx = startX + idx * badgeSpacing;
          
          // Badge Circle Icon
          ctx.fillStyle = 'rgba(20, 184, 166, 0.15)';
          ctx.strokeStyle = '#14b8a6';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(bx, botBadgesY, 20, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.font = '18px Outfit, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(p.emoji, bx, botBadgesY + 6);

          // Text under badge circle
          ctx.fillStyle = '#ffffff';
          ctx.font = '800 13px Outfit, sans-serif';
          ctx.fillText(p.title, bx, botBadgesY + 36);

          ctx.fillStyle = 'rgba(255,255,255,0.65)';
          ctx.font = '500 11px Outfit, sans-serif';
          ctx.fillText(p.sub, bx, botBadgesY + 50);
        });

        // Calligraphic Footer (Balanced spacing fill)
        const footerY = canvasH - 118;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fcd34d';
        ctx.font = 'italic 700 26px Cinzel, serif';
        ctx.fillText('Thank You!', canvasW / 2, footerY);

        ctx.fillStyle = '#ffffff';
        ctx.font = '800 15px Outfit, sans-serif';
        ctx.letterSpacing = '2px';
        ctx.fillText('ENJOY YOUR MEAL', canvasW / 2, footerY + 28);

        // Powered by DinePulse Pill at Bottom
        const powW = 250;
        const powH = 38;
        const powX = (canvasW - powW) / 2;
        const powY = canvasH - 58;

        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.roundRect(powX, powY, powW, powH, 19);
        ctx.fill();

        ctx.fillStyle = '#060709';
        ctx.font = '800 13px Outfit, sans-serif';
        ctx.letterSpacing = '1px';
        ctx.fillText('POWERED BY DINEPULSE', canvasW / 2, powY + 24);

        // Download Image
        const link = document.createElement('a');
        link.download = `DinePulse-Table-${table.number}-Standee.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    drawRest();
  };

  return (
    <div style={{ background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--border)', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
      {/* Header */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontWeight: '800', fontSize: '1.1rem' }}>
          Table <span className="text-gradient-gold">{table.number}</span>
        </h3>
        <button onClick={onDelete} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#ef4444', display: 'flex' }}>
          <Trash2 size={15} />
        </button>
      </div>

      {/* QR Code */}
      <div ref={svgRef} style={{ background: 'white', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
        <QRCodeSVG
          value={qrUrl}
          size={180}
          fgColor="#060709"
          bgColor="#ffffff"
          level="M"
        />
      </div>

      {/* URL */}
      <div style={{ width: '100%', display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1, background: 'var(--bg-color)', borderRadius: '10px', padding: '8px 12px', fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {qrUrl}
        </div>
        <button onClick={copyLink} style={{ background: copied ? 'rgba(20,184,166,0.15)' : 'var(--bg-color)', border: 'none', borderRadius: '10px', padding: '8px 10px', cursor: 'pointer', color: copied ? '#14b8a6' : 'var(--text-muted)', display: 'flex', flexShrink: 0 }}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>

      {/* Actions */}
      <button className="btn-primary" style={{ width: '100%', fontSize: '0.9rem', padding: '12px' }} onClick={downloadQR}>
        <Download size={15} /> Download Standee Poster
      </button>
    </div>
  );
}
