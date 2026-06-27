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

export default function TableManager() {
  const { user } = useAuth();
  const [tables, setTables] = useState([]);
  const [tableNumber, setTableNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const baseUrl = window.location.origin;

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'restaurants', user.uid, 'tables'), orderBy('createdAt'));
    return onSnapshot(q, snap => {
      setTables(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [user]);

  const addTable = async () => {
    const num = tableNumber.trim();
    if (!num) return;
    if (tables.find(t => t.number === num)) {
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
    const start = tables.length + 1;
    for (let i = start; i < start + count; i++) {
      const num = String(i);
      if (!tables.find(t => t.number === num)) {
        await addDoc(collection(db, 'restaurants', user.uid, 'tables'), {
          number: num, createdAt: serverTimestamp()
        });
      }
    }
  };

  const deleteTable = async (id) => {
    if (window.confirm('Remove this table?'))
      await deleteDoc(doc(db, 'restaurants', user.uid, 'tables', id));
  };

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
            <TableCard key={table.id} table={table} userId={user.uid} baseUrl={baseUrl} onDelete={() => deleteTable(table.id)} />
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

function TableCard({ table, userId, baseUrl, onDelete }) {
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

    const padding = 32;
    const qrSize = 200;
    const canvasW = qrSize + padding * 2;
    const canvasH = qrSize + padding * 2 + 48;

    const canvas = document.createElement('canvas');
    canvas.width = canvasW * 2;
    canvas.height = canvasH * 2;
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.roundRect(0, 0, canvasW, canvasH, 16);
    ctx.fill();

    // Border
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    ctx.stroke();

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, padding, padding, qrSize, qrSize);

      // Table label
      ctx.fillStyle = '#1a1a2e';
      ctx.font = 'bold 18px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Table ${table.number}`, canvasW / 2, qrSize + padding + 32);

      const link = document.createElement('a');
      link.download = `Taste-by-v4stay-Table-${table.number}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
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
