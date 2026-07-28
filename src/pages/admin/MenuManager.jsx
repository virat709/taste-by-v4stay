import React, { useEffect, useState } from 'react';
import { AdminLayout } from './Dashboard';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy, getDocs
} from 'firebase/firestore';
import { Plus, Trash2, Pencil, X, Leaf, Drumstick } from 'lucide-react';

export default function MenuManager() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [showItemModal, setShowItemModal] = useState(null);
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'restaurants', user.uid, 'categories'), orderBy('createdAt'));
    return onSnapshot(q, snap => {
      setCategories(prev => {
        const updated = snap.docs.map(d => {
          const existing = prev.find(c => c.id === d.id);
          return { id: d.id, ...d.data(), items: existing?.items || [] };
        });
        return updated;
      });
    });
  }, [user]);

  // Load restaurant settings (for currency)
  useEffect(() => {
    if (!user) return;
    return onSnapshot(doc(db, 'restaurants', user.uid), snap => {
      if (snap.exists()) setRestaurant(snap.data());
    });
  }, [user]);

  const currency = restaurant?.currency || '₹';
  const categoryIdsKey = categories.map(c => c.id).join(',');

  // Subscribe to items for each category cleanly without infinite re-render loops
  useEffect(() => {
    if (!user || !categoryIdsKey) return;
    const catIds = categoryIdsKey.split(',').filter(Boolean);
    const unsubs = catIds.map(catId => {
      const q = query(collection(db, 'restaurants', user.uid, 'categories', catId, 'items'), orderBy('createdAt'));
      return onSnapshot(q, snap => {
        setCategories(prev => prev.map(c =>
          c.id === catId ? { ...c, items: snap.docs.map(d => ({ id: d.id, ...d.data() })) } : c
        ));
      });
    });
    return () => unsubs.forEach(u => u());
  }, [user, categoryIdsKey]);

  if (!user) return null;

  const addCategory = async () => {
    if (!newCatName.trim() || !user) return;
    await addDoc(collection(db, 'restaurants', user.uid, 'categories'), {
      name: newCatName.trim(), createdAt: serverTimestamp()
    });
    setNewCatName('');
    setShowCatModal(false);
  };

  const deleteCategory = async (catId) => {
    if (!user || !window.confirm('Delete this category and all its items?')) return;
    const itemsSnap = await getDocs(collection(db, 'restaurants', user.uid, 'categories', catId, 'items'));
    const deletePromises = itemsSnap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletePromises);
    await deleteDoc(doc(db, 'restaurants', user.uid, 'categories', catId));
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: '800', marginBottom: '4px' }}>Menu Manager</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your categories and food items.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCatModal(true)}><Plus size={18} /> Add Category</button>
      </div>

      {categories.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)', background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🍕</div>
          <h3 style={{ marginBottom: '8px', color: 'var(--text-main)' }}>Your menu is empty</h3>
          <p>Add a category like "Starters", "Mains", or "Drinks" to begin.</p>
        </div>
      )}

      {categories.map(cat => (
        <div key={cat.id} style={{ background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--border)', marginBottom: '20px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: cat.items.length > 0 ? '1px solid var(--border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(245,158,11,0.03)' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '700' }}>
              {cat.name} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '400' }}>({cat.items.length} items)</span>
            </h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => { setShowItemModal(cat.id); setEditItem(null); }} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                <Plus size={15} /> Add Item
              </button>
              <button onClick={() => deleteCategory(cat.id)} style={{ background: 'none', border: 'none', color: '#ff4757', cursor: 'pointer', padding: '6px' }}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div style={{ padding: cat.items.length > 0 ? '12px 24px' : '0' }}>
            {cat.items.map((item, i) => (
              <ItemRow key={item.id} item={item} currency={currency} catId={cat.id} userId={user.uid} isLast={i === cat.items.length - 1} onEdit={() => { setEditItem(item); setShowItemModal(cat.id); }} />
            ))}
          </div>
        </div>
      ))}

      {/* Add Category Modal */}
      {showCatModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '28px', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Add Category</h2>
              <button onClick={() => setShowCatModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <input className="input-field" placeholder="Category Name (e.g. Starters)" value={newCatName} onChange={e => setNewCatName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCategory()} autoFocus style={{ marginBottom: '20px' }} />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowCatModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={addCategory}>Create Category</button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Item Modal */}
      {showItemModal && (
        <ItemModal catId={showItemModal} item={editItem} userId={user.uid} onClose={() => { setShowItemModal(null); setEditItem(null); }} />
      )}
    </AdminLayout>
  );
}

function ItemRow({ item, currency, catId, userId, isLast, onEdit }) {
  const toggleAvailable = async () => {
    await updateDoc(doc(db, 'restaurants', userId, 'categories', catId, 'items', item.id), {
      available: item.available === false ? true : false
    });
  };

  const deleteItem = async () => {
    if (window.confirm(`Delete "${item.name}"?`)) {
      await deleteDoc(doc(db, 'restaurants', userId, 'categories', catId, 'items', item.id));
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: isLast ? 'none' : '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
        {item.image ? (
          <img src={item.image} alt={item.name} style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>🍽️</div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <span style={{ fontWeight: '700', fontSize: '0.98rem', opacity: item.available === false ? 0.5 : 1 }}>{item.name}</span>
            {item.isVeg ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}><Leaf size={11} /> Veg</span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}><Drumstick size={11} /> Non-Veg</span>
            )}
          </div>
          {item.description && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</p>}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
        <span style={{ fontWeight: '800', fontSize: '1rem', color: '#f59e0b' }}>{currency}{parseFloat(item.price || 0).toFixed(2)}</span>
        <button onClick={toggleAvailable} style={{ background: item.available === false ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: item.available === false ? '#ef4444' : '#10b981', border: 'none', padding: '4px 10px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
          {item.available === false ? 'Out of Stock' : 'In Stock'}
        </button>
        <button onClick={onEdit} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}><Pencil size={15} /></button>
        <button onClick={deleteItem} style={{ background: 'none', border: 'none', color: '#ff4757', cursor: 'pointer', padding: '4px' }}><Trash2 size={15} /></button>
      </div>
    </div>
  );
}

function ItemModal({ catId, item, userId, onClose }) {
  const [name, setName] = useState(item?.name || '');
  const [description, setDescription] = useState(item?.description || '');
  const [price, setPrice] = useState(item?.price || '');
  const [image, setImage] = useState(item?.image || '');
  const [isVeg, setIsVeg] = useState(item?.isVeg ?? true);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim() || !price) return;
    setSaving(true);

    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price) || 0,
      image: image.trim(),
      isVeg,
      updatedAt: serverTimestamp()
    };

    if (item) {
      await updateDoc(doc(db, 'restaurants', userId, 'categories', catId, 'items', item.id), payload);
    } else {
      await addDoc(collection(db, 'restaurants', userId, 'categories', catId, 'items'), {
        ...payload,
        available: true,
        createdAt: serverTimestamp()
      });
    }

    setSaving(false);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)', padding: '20px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '28px', borderRadius: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800' }}>{item ? 'Edit Dish' : 'Add New Dish'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px' }}>Dish Name *</label>
            <input className="input-field" placeholder="e.g. Royal Awadhi Biryani" value={name} onChange={e => setName(e.target.value)} required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px' }}>Description</label>
            <textarea className="input-field" placeholder="Ingredients, taste, cooking style..." value={description} onChange={e => setDescription(e.target.value)} rows={2} style={{ resize: 'none' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px' }}>Price (₹) *</label>
              <input className="input-field" type="number" step="0.01" min="0" placeholder="e.g. 580" value={price} onChange={e => setPrice(e.target.value)} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px' }}>Dietary Type</label>
              <select className="input-field" value={isVeg ? 'veg' : 'non-veg'} onChange={e => setIsVeg(e.target.value === 'veg')}>
                <option value="veg">🟢 Veg</option>
                <option value="non-veg">🔴 Non-Veg</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px' }}>Image URL</label>
            <input className="input-field" placeholder="https://example.com/photo.jpg" value={image} onChange={e => setImage(e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : item ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
