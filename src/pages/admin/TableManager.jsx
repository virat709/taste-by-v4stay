import React, { useEffect, useState, useRef } from 'react';
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
  { id: 'luxury', name: 'Dark Luxury', bg: ['#0f0c29', '#302b63', '#24243e'], border: '#ffd700', text: '#ffffff', accent: '#ffb142' },
  { id: 'royal', name: 'Royal Crimson', bg: ['#4a0000', '#2a0000', '#1a0000'], border: '#ffb142', text: '#ffffff', accent: '#ffcc00' },
  { id: 'forest', name: 'Forest Green', bg: ['#003314', '#00220d', '#001106'], border: '#b8e994', text: '#ffffff', accent: '#b8e994' },
  { id: 'light', name: 'Pristine White', bg: ['#ffffff', '#f8f9fa', '#e9ecef'], border: '#cccccc', text: '#1a1a2e', accent: '#1e90ff' }
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
  tablesRef.current = tables;

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
        <h1 style={{ fontSize: '1.9rem', fontWeight: '800', marginBottom: '4px' }}>Tables & QR Codes</h1>
        <p style={{ color: 'var(--text-muted)' }}>Add tables and download QR codes for your guests to scan.</p>
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
            <Plus size={18} /> Add Table
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
        <h3 style={{ fontWeight: '700', marginBottom: '16px' }}>QR Code Theme</h3>
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
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: t.accent }} />
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tables Grid */}
      {tables.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)', background: 'var(--surface)', borderRadius: '20px', border: '1px dashed var(--border)' }}>
          <QrCode size={64} style={{ marginBottom: '16px', opacity: 0.2 }} />
          <h3 style={{ marginBottom: '8px', color: 'var(--text-main)', fontWeight: '600' }}>No tables yet</h3>
          <p>Add a table number above to generate its unique QR code.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
          {tables.map(table => (
            <TableCard key={table.id} table={table} userId={user.uid} baseUrl={baseUrl} restaurantName={restaurantName} theme={selectedTheme} onDelete={() => deleteTable(table.id)} />
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

function TableCard({ table, userId, baseUrl, restaurantName, theme, onDelete }) {
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

    const canvasW = 600;
    const canvasH = 900;
    const canvas = document.createElement('canvas');
    canvas.width = canvasW * 2;
    canvas.height = canvasH * 2;
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);

    // 1. Premium Dark Background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvasH);
    bgGradient.addColorStop(0, theme.bg[0]);
    bgGradient.addColorStop(0.5, theme.bg[1]);
    bgGradient.addColorStop(1, theme.bg[2]);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvasW, canvasH);

    // 2. Gold Border
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = theme.border; 
    ctx.lineWidth = 3;
    ctx.strokeRect(24, 24, canvasW - 48, canvasH - 48);
    ctx.globalAlpha = 0.15;
    ctx.lineWidth = 1;
    ctx.strokeRect(32, 32, canvasW - 64, canvasH - 64);
    ctx.globalAlpha = 1.0;

    const loadLogo = () => new Promise(resolve => {
        const logo = new Image();
        logo.crossOrigin = 'Anonymous';
        logo.onload = () => resolve(logo);
        logo.onerror = () => resolve(null);
        logo.src = '/v4-logo.png';
    });

    const drawRest = async () => {
        const logo = await loadLogo();

        // Logo
        if (logo) {
            const logoH = 50;
            const logoW = logo.width * (logoH / logo.height);
            ctx.drawImage(logo, (canvasW - logoW) / 2, 70, logoW, logoH);
        }

        // Restaurant Name
        ctx.fillStyle = theme.text;
        ctx.font = 'bold 46px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(restaurantName || 'Scan & Order', canvasW / 2, 175);

        // Subtitle
        ctx.fillStyle = theme.accent;
        ctx.font = '600 22px Outfit, sans-serif';
        ctx.letterSpacing = '2px';
        ctx.fillText('CONTACTLESS DINING', canvasW / 2, 220);

        // QR Background (White rounded rect)
        const qrSize = 340;
        const qrX = (canvasW - qrSize) / 2;
        const qrY = 280;
        const padding = 24;

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        const rw = qrSize + padding * 2;
        const rX = qrX - padding;
        const rY = qrY - padding;
        const r = 24;
        ctx.moveTo(rX + r, rY);
        ctx.lineTo(rX + rw - r, rY);
        ctx.arcTo(rX + rw, rY, rX + rw, rY + r, r);
        ctx.lineTo(rX + rw, rY + rw - r);
        ctx.arcTo(rX + rw, rY + rw, rX + rw - r, rY + rw, r);
        ctx.lineTo(rX + r, rY + rw);
        ctx.arcTo(rX, rY + rw, rX, rY + rw - r, r);
        ctx.lineTo(rX, rY + r);
        ctx.arcTo(rX, rY, rX + r, rY, r);
        ctx.closePath();
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetY = 15;
        ctx.fill();
        
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Draw SVG onto canvas
        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

            // Table Number
            ctx.fillStyle = theme.text;
            ctx.font = 'bold 42px Outfit, sans-serif';
            ctx.fillText(`TABLE ${table.number}`, canvasW / 2, qrY + qrSize + padding + 65);

            // Trust Badges / Sayings with SVG Logos
            const badgeColor = theme.id === 'light' ? 'rgba(26, 26, 46, 0.9)' : 'rgba(255, 255, 255, 0.9)';
            
            const drawIcon = (pathD, x, y) => {
                ctx.save();
                ctx.translate(x, y);
                ctx.scale(20/24, 20/24); // Size to 20px
                ctx.strokeStyle = badgeColor;
                ctx.lineWidth = 2.5;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                if (Array.isArray(pathD)) {
                    pathD.forEach(d => ctx.stroke(new Path2D(d)));
                } else {
                    ctx.stroke(new Path2D(pathD));
                }
                ctx.restore();
            };

            const badgeY = canvasH - 120;
            ctx.fillStyle = badgeColor;
            ctx.font = '500 17px Outfit, sans-serif';
            ctx.textAlign = 'left';

            // Safe Shield
            drawIcon(['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', 'm9 12 2 2 4-4'], 55, badgeY - 16);
            ctx.fillText('100% Safe', 82, badgeY);

            // India Star
            const starD = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';
            drawIcon(starD, 195, badgeY - 16);
            ctx.fillText('100% Made in India', 222, badgeY);

            // Smartphone
            const phoneD = ['M5 2h14a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z', 'M12 18h.01'];
            drawIcon(phoneD, 400, badgeY - 16);
            ctx.fillText('No App Required', 427, badgeY);

            // Footer branding
            ctx.textAlign = 'center';
            ctx.font = '400 14px Outfit, sans-serif';
            ctx.fillStyle = theme.id === 'light' ? 'rgba(26, 26, 46, 0.4)' : 'rgba(255, 255, 255, 0.4)';
            ctx.fillText('Powered by Taste by v4stay', canvasW / 2, canvasH - 45);

            // Download
            const link = document.createElement('a');
            link.download = `Taste-by-v4stay-Table-${table.number}.png`;
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
          Table <span className="text-gradient">{table.number}</span>
        </h3>
        <button onClick={onDelete} style={{ background: 'rgba(255,71,87,0.1)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'var(--primary)', display: 'flex' }}>
          <Trash2 size={15} />
        </button>
      </div>

      {/* QR Code */}
      <div ref={svgRef} style={{ background: 'white', padding: '16px', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <QRCodeSVG
          value={qrUrl}
          size={180}
          fgColor="#1a1a2e"
          bgColor="#ffffff"
          level="M"
        />
      </div>

      {/* URL */}
      <div style={{ width: '100%', display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1, background: 'var(--bg-color)', borderRadius: '10px', padding: '8px 12px', fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {qrUrl}
        </div>
        <button onClick={copyLink} style={{ background: copied ? 'rgba(46,213,115,0.15)' : 'var(--bg-color)', border: 'none', borderRadius: '10px', padding: '8px 10px', cursor: 'pointer', color: copied ? '#2ed573' : 'var(--text-muted)', display: 'flex', flexShrink: 0 }}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>

      {/* Actions */}
      <button className="btn-primary" style={{ width: '100%' }} onClick={downloadQR}>
        <Download size={16} /> Download QR Code
      </button>
    </div>
  );
}
