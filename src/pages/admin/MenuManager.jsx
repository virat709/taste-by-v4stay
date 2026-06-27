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

  // Subscribe to items for each category
  useEffect(() => {
    if (!user || categories.length === 0) return;
    const unsubs = categories.map(cat => {
      const q = query(collection(db, 'restaurants', user.uid, 'categories', cat.id, 'items'), orderBy('createdAt'));
      return onSnapshot(q, snap => {
        setCategories(prev => prev.map(c =>
          c.id === cat.id ? { ...c, items: snap.docs.map(d => ({ id: d.id, ...d.data() })) } : c
        ));
      });
    });
    return () => unsubs.forEach(u => u());
  }, [user, categories.length]);

  const addCategory = async () => {
    if (!newCatName.trim()) return;
    await addDoc(collection(db, 'restaurants', user.uid, 'categories'), {
      name: newCatName.trim(), createdAt: serverTimestamp()
    });
    setNewCatName('');
    setShowCatModal(false);
  };

  const deleteCategory = async (catId) => {
    if (!window.confirm('Delete this category and all its items?')) return;
    // Delete all items in the sub-collection first (Firestore won't cascade)
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
          <div style={{ padding: '16px 24px', borderBottom: cat.items.length > 0 ? '1px solid var(--border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,71,87,0.03)' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '700' }}>
              {cat.name}
              <span style={{ marginLeft: '10px', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '400' }}>{cat.items.length} items</span>
            </h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => setShowItemModal(cat.id)}>
                <Plus size={15} /> Add Item
              </button>
              <button onClick={() => deleteCategory(cat.id)} style={{ background: 'rgba(255,71,87,0.1)', border: 'none', borderRadius: '10px', padding: '8px 12px', cursor: 'pointer', color: 'var(--primary)', display: 'flex' }}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {cat.items.length === 0 ? (
            <div style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No items yet — click "+ Add Item" to get started.
            </div>
          ) : (
            cat.items.map(item => (
              <ItemRow key={item.id} item={item} catId={cat.id} userId={user.uid} currency={currency}
                onEdit={() => setEditItem({ ...item, catId: cat.id })} />
            ))
          )}
        </div>
      ))}

      {/* Add Category Modal */}
      {showCatModal && (
        <Modal title="New Category" onClose={() => setShowCatModal(false)}>
          <input className="input-field" placeholder='Category name (e.g. "Starters")' value={newCatName}
            onChange={e => setNewCatName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCategory()} autoFocus />
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowCatModal(false)}>Cancel</button>
            <button className="btn-primary" style={{ flex: 1 }} onClick={addCategory}>Add</button>
          </div>
        </Modal>
      )}

      {showItemModal && (
        <ItemFormModal catId={showItemModal} userId={user.uid} onClose={() => setShowItemModal(null)} />
      )}
      {editItem && (
        <ItemFormModal catId={editItem.catId} userId={user.uid} item={editItem} onClose={() => setEditItem(null)} />
      )}
    </AdminLayout>
  );
}

function ItemRow({ item, catId, userId, currency, onEdit }) {
  const handleDelete = async () => {
    if (window.confirm(`Delete "${item.name}"?`))
      await deleteDoc(doc(db, 'restaurants', userId, 'categories', catId, 'items', item.id));
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 24px', borderBottom: '1px solid var(--border)' }}>
      {item.image
        ? <img src={item.image} alt={item.name} style={{ width: '54px', height: '54px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }} />
        : <div style={{ width: '54px', height: '54px', borderRadius: '12px', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>🍽️</div>
      }
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
          {item.isVeg ? <Leaf size={13} color="#2ed573" /> : <Drumstick size={13} color="#ff4757" />}
          <span style={{ fontWeight: '700' }}>{item.name}</span>
          {item.available === false && <span style={{ fontSize: '0.72rem', background: 'rgba(164,176,190,0.2)', color: 'var(--text-muted)', borderRadius: '50px', padding: '2px 8px' }}>Unavailable</span>}
        </div>
        {item.description && <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '2px' }}>{item.description}</p>}
        <span style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.95rem' }}>{currency}{parseFloat(item.price || 0).toFixed(2)}</span>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={onEdit} style={{ background: 'rgba(30,144,255,0.1)', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#1e90ff', display: 'flex' }}><Pencil size={15} /></button>
        <button onClick={handleDelete} style={{ background: 'rgba(255,71,87,0.1)', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: 'var(--primary)', display: 'flex' }}><Trash2 size={15} /></button>
      </div>
    </div>
  );
}

function ItemFormModal({ catId, userId, item, onClose }) {
  const [name, setName] = useState(item?.name || '');
  const [description, setDescription] = useState(item?.description || '');
  const [price, setPrice] = useState(item?.price || '');
  const [image, setImage] = useState(item?.image || '');
  const [isVeg, setIsVeg] = useState(item?.isVeg ?? true);
  const [available, setAvailable] = useState(item?.available ?? true);
  const [optionGroups, setOptionGroups] = useState(item?.optionGroups || []);
  const [loading, setLoading] = useState(false);

  const addOptionGroup = () => {
    setOptionGroups(prev => [...prev, { name: '', type: 'single', required: false, options: [{ name: '', price: 0 }] }]);
  };

  const updateOptionGroup = (idx, field, value) => {
    setOptionGroups(prev => prev.map((g, i) => i === idx ? { ...g, [field]: value } : g));
  };

  const removeOptionGroup = (idx) => {
    setOptionGroups(prev => prev.filter((_, i) => i !== idx));
  };

  const addOption = (gIdx) => {
    setOptionGroups(prev => prev.map((g, i) => i === gIdx ? { ...g, options: [...g.options, { name: '', price: 0 }] } : g));
  };

  const updateOption = (gIdx, oIdx, field, value) => {
    setOptionGroups(prev => prev.map((g, i) => i === gIdx ? { ...g, options: g.options.map((o, j) => j === oIdx ? { ...o, [field]: value } : o) } : g));
  };

  const removeOption = (gIdx, oIdx) => {
    setOptionGroups(prev => prev.map((g, i) => i === gIdx ? { ...g, options: g.options.filter((_, j) => j !== oIdx) } : g));
  };

  const handleSave = async () => {
    if (!name.trim() || !price) return;
    setLoading(true);
    const data = {
      name: name.trim(), description, price: parseFloat(price), image, isVeg, available,
      optionGroups: optionGroups.filter(g => g.name.trim()).map(g => ({
        ...g, name: g.name.trim(),
        options: g.options.filter(o => o.name.trim())
      }))
    };
    try {
      if (item?.id) {
        await updateDoc(doc(db, 'restaurants', userId, 'categories', catId, 'items', item.id), data);
      } else {
        await addDoc(collection(db, 'restaurants', userId, 'categories', catId, 'items'), { ...data, createdAt: serverTimestamp() });
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={item?.id ? 'Edit Item' : 'Add New Item'} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input className="input-field" placeholder="Item name *" value={name} onChange={e => setName(e.target.value)} />
        <textarea className="input-field" placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} rows={2} style={{ resize: 'vertical', fontFamily: 'inherit' }} />
        <input className="input-field" placeholder="Price (e.g. 299) *" type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} />
        <input className="input-field" placeholder="Image URL (optional)" value={image} onChange={e => setImage(e.target.value)} />

        <div style={{ display: 'flex', gap: '10px' }}>
          {[{ v: true, label: '🌿 Veg', color: '#2ed573' }, { v: false, label: '🍗 Non-Veg', color: '#ff4757' }].map(opt => (
            <button key={String(opt.v)} onClick={() => setIsVeg(opt.v)} style={{ flex: 1, padding: '10px', borderRadius: '12px', border: `2px solid ${isVeg === opt.v ? opt.color : 'var(--border)'}`, background: isVeg === opt.v ? `${opt.color}18` : 'transparent', cursor: 'pointer', fontWeight: '700', color: isVeg === opt.v ? opt.color : 'var(--text-muted)', fontFamily: 'inherit', fontSize: '0.9rem' }}>
              {opt.label}
            </button>
          ))}
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem' }}>
          <input type="checkbox" checked={available} onChange={e => setAvailable(e.target.checked)} />
          Available to order
        </label>

        {/* Option Groups / Modifiers */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>Modifiers / Options</span>
            <button onClick={addOptionGroup} style={{ background: 'none', border: '1px dashed var(--primary)', color: 'var(--primary)', borderRadius: '8px', padding: '4px 12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', fontFamily: 'inherit' }}>+ Add Group</button>
          </div>
          {optionGroups.map((g, gIdx) => (
            <div key={gIdx} style={{ background: 'var(--bg-color)', borderRadius: '12px', padding: '12px', marginBottom: '8px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                <input className="input-field" style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }} placeholder="Group name (e.g. Size)" value={g.name} onChange={e => updateOptionGroup(gIdx, 'name', e.target.value)} />
                <select value={g.type} onChange={e => updateOptionGroup(gIdx, 'type', e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', fontFamily: 'inherit', fontSize: '0.8rem' }}>
                  <option value="single">Single</option>
                  <option value="multiple">Multiple</option>
                </select>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: '600', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                  <input type="checkbox" checked={g.required} onChange={e => updateOptionGroup(gIdx, 'required', e.target.checked)} />
                  Required
                </label>
                <button onClick={() => removeOptionGroup(gIdx)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '4px' }}><Trash2 size={14} /></button>
              </div>
              {g.options.map((opt, oIdx) => (
                <div key={oIdx} style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px' }}>
                  <input className="input-field" style={{ flex: 1, padding: '6px 10px', fontSize: '0.82rem' }} placeholder="Option name" value={opt.name} onChange={e => updateOption(gIdx, oIdx, 'name', e.target.value)} />
                  <input className="input-field" style={{ width: '80px', padding: '6px 10px', fontSize: '0.82rem' }} placeholder="Price" type="number" min="0" value={opt.price} onChange={e => updateOption(gIdx, oIdx, 'price', Number(e.target.value))} />
                  <button onClick={() => removeOption(gIdx, oIdx)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}><X size={14} /></button>
                </div>
              ))}
              <button onClick={() => addOption(gIdx)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', fontFamily: 'inherit', padding: '4px 0' }}>+ Add option</button>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
        <button className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
        <button className="btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : item?.id ? 'Save Changes' : 'Add Item'}
        </button>
      </div>
    </Modal>
  );
}

export function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div className="glass animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '28px', borderRadius: '24px', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'var(--bg-color)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
