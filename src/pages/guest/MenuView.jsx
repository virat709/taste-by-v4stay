import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../lib/firebase';
import {
  doc, collection, onSnapshot, addDoc, serverTimestamp,
  query, orderBy, getDoc
} from 'firebase/firestore';
import { ShoppingCart, X, Plus, Minus, ChefHat, Check, AlertCircle, MessageSquare, Star, Crown } from 'lucide-react';
import { canPlaceOrders } from '../../lib/subscription';

export default function MenuView() {
  const { restaurantId, tableNumber } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showUpi, setShowUpi] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Feedback State
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Modifiers & Instructions
  const [showOptionsFor, setShowOptionsFor] = useState(null);
  const [itemOptions, setItemOptions] = useState([]);
  const [instructions, setInstructions] = useState('');

  // Track item listener unsubscribers to prevent memory leaks
  const itemUnsubs = useRef([]);

  // Load restaurant
  useEffect(() => {
    getDoc(doc(db, 'restaurants', restaurantId)).then(snap => {
      if (snap.exists()) setRestaurant(snap.data());
      else setNotFound(true);
    });
  }, [restaurantId]);

  // Load categories in real-time, then subscribe to their items
  useEffect(() => {
    const q = query(collection(db, 'restaurants', restaurantId, 'categories'), orderBy('createdAt'));
    const unsubCategories = onSnapshot(q, snap => {
      const cats = snap.docs.map(d => ({ id: d.id, ...d.data(), items: [] }));

      // Clean up previous item listeners before creating new ones
      itemUnsubs.current.forEach(unsub => unsub());
      itemUnsubs.current = [];

      // For each category, subscribe to its items
      cats.forEach(cat => {
        const iq = query(collection(db, 'restaurants', restaurantId, 'categories', cat.id, 'items'), orderBy('createdAt'));
        const unsubItem = onSnapshot(iq, iSnap => {
          setCategories(prev => prev.map(c =>
            c.id === cat.id
              ? { ...c, items: iSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(i => i.available !== false) }
              : c
          ));
        });
        itemUnsubs.current.push(unsubItem);
      });

      setCategories(cats);
      if (cats.length > 0) setActiveCategory(cats[0].id);
    });

    return () => {
      unsubCategories();
      itemUnsubs.current.forEach(unsub => unsub());
      itemUnsubs.current = [];
    };
  }, [restaurantId]);

  const currency = restaurant?.currency || '₹';
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const taxRate = restaurant?.taxRate || 0;
  const taxAmount = cartTotal * (taxRate / 100);
  const finalTotal = cartTotal + taxAmount;

  const getCartKey = (item, modifiers = []) => {
    if (modifiers.length === 0) return item.id;
    return item.id + '_' + modifiers.map(m => `${m.groupName}_${m.optionName}`).sort().join('|');
  };

  const addToCart = (item, modifiers = []) => {
    const cartKey = getCartKey(item, modifiers);
    const modifierPrice = modifiers.reduce((s, m) => s + (m.price || 0), 0);
    setCart(prev => {
      const exists = prev.find(i => i.cartKey === cartKey);
      return exists
        ? prev.map(i => i.cartKey === cartKey ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...item, cartKey, modifiers, qty: 1, basePrice: item.price, price: item.price + modifierPrice }];
    });
    setShowOptionsFor(null);
    setItemOptions([]);
  };

  const removeFromCart = (cartKey) => {
    setCart(prev => {
      const item = prev.find(i => i.cartKey === cartKey);
      if (item?.qty === 1) return prev.filter(i => i.cartKey !== cartKey);
      return prev.map(i => i.cartKey === cartKey ? { ...i, qty: i.qty - 1 } : i);
    });
  };

  const getQty = (id) => cart.reduce((s, i) => s + (i.id === id ? i.qty : 0), 0);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const placeOrder = async (method = 'Cash') => {
    if (cart.length === 0) return;
    setOrdering(true);
    try {
      await addDoc(collection(db, 'restaurants', restaurantId, 'orders'), {
        tableNumber,
        items: cart.map(i => ({
          id: i.id, name: i.name, price: i.price, qty: i.qty,
          modifiers: i.modifiers || [],
          basePrice: i.basePrice || i.price
        })),
        subtotal: cartTotal,
        taxAmount,
        total: finalTotal,
        status: 'pending',
        createdAt: serverTimestamp(),
        paymentMethod: method,
        instructions: instructions.trim() || '',
      });
      setCart([]);
      setShowCart(false);
      setShowUpi(false);
      showToast('Order placed! The kitchen has been notified. 🍳');
    } catch (err) {
      console.error('placeOrder error:', err);
      showToast('Failed to place order. Please try again.', 'error');
    } finally {
      setOrdering(false);
    }
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    if (rating === 0) return showToast('Please select a rating', 'error');
    
    setSubmittingFeedback(true);
    try {
      await addDoc(collection(db, 'restaurants', restaurantId, 'feedback'), {
        tableNumber,
        rating,
        review,
        createdAt: serverTimestamp(),
      });
      setShowFeedback(false);
      setRating(0);
      setReview('');
      showToast('Thank you for your feedback! 🌟');
    } catch (err) {
      console.error('submitFeedback error:', err);
      showToast('Failed to submit feedback', 'error');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Filtered menu
  const filteredCategories = searchQuery.trim()
    ? categories.map(c => ({
        ...c,
        items: c.items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
      })).filter(c => c.items.length > 0)
    : categories;

  if (notFound) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', flexDirection: 'column', gap: '16px', padding: '20px', textAlign: 'center' }}>
      <AlertCircle size={64} color="var(--primary)" style={{ opacity: 0.5 }} />
      <h2>Restaurant Not Found</h2>
      <p style={{ color: 'var(--text-muted)' }}>This QR code may be invalid or the restaurant may no longer be active.</p>
    </div>
  );

  if (!restaurant) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '48px', height: '48px', border: '4px solid var(--border)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: 'var(--text-muted)' }}>Loading menu...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', maxWidth: '640px', margin: '0 auto', position: 'relative' }}>
      {/* Toast */}
      {toast && (
        <div className="animate-fade-in" style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 2000, background: toast.type === 'error' ? '#ff4757' : '#2ed573', color: 'white', padding: '14px 24px', borderRadius: '50px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 24px rgba(0,0,0,0.2)', whiteSpace: 'nowrap' }}>
          <Check size={18} /> {toast.msg}
        </div>
      )}

      {/* Header */}
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.3px', margin: 0 }}>{restaurant.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px' }}>
                <ChefHat size={13} /> Table {tableNumber}
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: '0 20px 12px' }}>
          <input
            style={{ width: '100%', padding: '10px 16px', borderRadius: '50px', border: '1px solid var(--border)', background: 'var(--bg-color)', color: 'var(--text-main)', fontFamily: 'inherit', fontSize: '0.92rem', outline: 'none' }}
            placeholder="🔍  Search menu..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Pills */}
        {!searchQuery && categories.length > 1 && (
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '0 20px 14px', scrollbarWidth: 'none' }}>
            {categories.map(cat => (
              <button key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  document.getElementById(`cat-${cat.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                style={{ whiteSpace: 'nowrap', padding: '8px 18px', borderRadius: '50px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', fontFamily: 'inherit', transition: 'all 0.2s',
                  background: activeCategory === cat.id ? 'var(--primary)' : 'var(--bg-color)',
                  color: activeCategory === cat.id ? 'white' : 'var(--text-muted)'
                }}>
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Menu */}
      <main style={{ padding: '20px', paddingBottom: cartCount > 0 ? '100px' : '40px' }}>
        {filteredCategories.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔍</div>
            <p>No items found for "{searchQuery}"</p>
          </div>
        )}

        {filteredCategories.map(cat => (
          <section key={cat.id} id={`cat-${cat.id}`} style={{ marginBottom: '36px', scrollMarginTop: '180px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {cat.name}
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '400' }}>({cat.items.length})</span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {cat.items.map(item => (
                <ItemCard key={item.id} item={item} currency={currency} qty={getQty(item.id)}
                  onAdd={() => {
                    if (item.optionGroups?.length > 0) {
                      setShowOptionsFor(item.id);
                      setItemOptions(item.optionGroups.map(g => ({
                        groupName: g.name, type: g.type, required: g.required,
                        options: g.options,
                        selected: g.type === 'single' ? null : []
                      })));
                    } else {
                      addToCart(item);
                    }
                  }}
                  onRemove={() => {
                    const entry = cart.find(i => i.id === item.id && (!i.modifiers || i.modifiers.length === 0));
                    removeFromCart(entry?.cartKey || item.id);
                  }} />
              ))}
            </div>
          </section>
        ))}

        {/* Feedback Button */}
        <div style={{ textAlign: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
          <button onClick={() => setShowFeedback(true)} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '50px', padding: '10px 20px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem', fontFamily: 'inherit' }}>
            <MessageSquare size={16} /> Leave Feedback
          </button>
        </div>
      </main>

      {/* Free Plan Banner */}
      {!canPlaceOrders(restaurant) && (
        <div style={{ position: 'fixed', bottom: '24px', left: '16px', right: '16px', maxWidth: '608px', margin: '0 auto', background: 'rgba(30,30,40,0.95)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '16px 20px', color: 'white', textAlign: 'center', zIndex: 50, border: '1px solid rgba(255,255,255,0.1)' }}>
          <Crown size={20} style={{ marginBottom: '4px', opacity: 0.5 }} />
          <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>Menu browsing only</div>
          <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>Online ordering not available on the free plan.</div>
        </div>
      )}

      {/* Floating Cart Bar (When Items Exist) */}
      {canPlaceOrders(restaurant) && cartCount > 0 && !showCart && (
        <button className="animate-fade-in" onClick={() => setShowCart(true)} style={{ position: 'fixed', bottom: '20px', left: '16px', right: '16px', maxWidth: '608px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', padding: '16px 22px', background: 'linear-gradient(135deg, #ff4757, #ff6b81)', border: 'none', borderRadius: '18px', color: 'white', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 24px rgba(255,71,87,0.4)', alignItems: 'center', zIndex: 50 }}>
          <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '3px 10px' }}>{cartCount} item{cartCount > 1 ? 's' : ''}</span>
          <span>View Cart</span>
          <span style={{ fontWeight: '800' }}>{currency}{cartTotal.toFixed(2)}</span>
        </button>
      )}

      {/* Floating Order Button (When Empty) */}
      {canPlaceOrders(restaurant) && cartCount === 0 && !showCart && (
        <button className="animate-fade-in" onClick={() => setShowCart(true)} style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '50px', color: 'var(--text-main)', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', zIndex: 50 }}>
          <ShoppingCart size={18} /> Order Food
        </button>
      )}

      {/* Cart Drawer */}
      {showCart && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
          <div onClick={() => setShowCart(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }} />
          <div className="animate-fade-in" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, maxWidth: '640px', margin: '0 auto', background: 'var(--surface)', borderRadius: '28px 28px 0 0', padding: '28px 24px 40px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Your Order</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Table {tableNumber} • {cart.length} item{cart.length !== 1 ? 's' : ''}</p>
              </div>
              <button onClick={() => setShowCart(false)} style={{ background: 'var(--bg-color)', border: 'none', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                <ShoppingCart size={48} style={{ marginBottom: '12px', opacity: 0.2 }} />
                <p style={{ fontWeight: '500' }}>Your cart is empty</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                  {cart.map(item => (
                    <div key={item.cartKey || item.id} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', marginBottom: '2px' }}>{item.name}</div>
                        {item.modifiers?.length > 0 && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                            {item.modifiers.map(m => m.optionName).join(', ')}
                          </div>
                        )}
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{currency}{(item.basePrice || item.price).toFixed(2)} each{item.modifiers?.length > 0 && item.price !== item.basePrice ? ` + modifiers` : ''}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button onClick={() => removeFromCart(item.cartKey || item.id)} style={{ background: 'var(--bg-color)', border: '1px solid var(--border)', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Minus size={14} /></button>
                        <span style={{ fontWeight: '800', minWidth: '20px', textAlign: 'center' }}>{item.qty}</span>
                        <button onClick={() => addToCart(item, item.modifiers || [])} style={{ background: 'var(--primary)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Plus size={14} color="white" /></button>
                        <span style={{ fontWeight: '700', minWidth: '68px', textAlign: 'right' }}>{currency}{(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {taxRate > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', color: 'var(--text-muted)' }}>
                    <span>Tax ({taxRate}%)</span>
                    <span>{currency}{taxAmount.toFixed(2)}</span>
                  </div>
                )}

                {/* Special Instructions */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>Special Instructions</label>
                  <textarea value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="Any special requests? (e.g. no onions, extra spicy)"
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-color)', color: 'var(--text-main)', fontFamily: 'inherit', resize: 'none', fontSize: '0.9rem', height: '60px' }} />
                </div>

                <div style={{ borderTop: '2px solid var(--border)', paddingTop: '18px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>Total</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--primary)' }}>{currency}{finalTotal.toFixed(2)}</span>
                </div>

                {!canPlaceOrders(restaurant) ? (
                  <div style={{ textAlign: 'center', padding: '32px 16px', background: 'var(--bg-color)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
                    <Crown size={48} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: '12px' }} />
                    <h3 style={{ fontWeight: '700', marginBottom: '8px' }}>Ordering is not available</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px', lineHeight: '1.5' }}>
                      This restaurant is using the <strong>Free Plan</strong>.<br />
                      Online ordering is available with the Premium plan.
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      Please contact the restaurant directly to place your order.
                    </p>
                  </div>
                ) : !showUpi ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(restaurant.upiId || restaurant.upiQrUrl) ? (
                      <>
                        <button onClick={() => placeOrder('Cash')} disabled={ordering} style={{ width: '100%', padding: '16px', background: 'var(--surface)', color: 'var(--text-main)', border: '2px solid var(--border)', borderRadius: '16px', fontWeight: '800', fontSize: '1.05rem', cursor: ordering ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                          💵 Place Order
                        </button>
                        <button onClick={() => setShowUpi(true)} disabled={ordering} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #ff4757, #ff6b81)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '800', fontSize: '1.05rem', cursor: ordering ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(255,71,87,0.35)' }}>
                          📱 Online payment for upi
                        </button>
                      </>
                    ) : (
                      <button onClick={() => placeOrder('Cash')} disabled={ordering} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #ff4757, #ff6b81)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '800', fontSize: '1.05rem', cursor: ordering ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(255,71,87,0.35)' }}>
                        {ordering ? 'Sending to Kitchen...' : '🍳 Place Order'}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="animate-fade-in" style={{ background: 'var(--bg-color)', borderRadius: '16px', padding: '24px', textAlign: 'center', border: '1px solid var(--primary)' }}>
                    <h3 style={{ fontWeight: '800', marginBottom: '8px', color: 'var(--primary)' }}>Pay {currency}{finalTotal.toFixed(2)} Online</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>Scan the QR code or use the UPI ID below to pay.</p>
                    {restaurant.upiQrUrl && (
                      <img src={restaurant.upiQrUrl} alt="UPI QR Code" style={{ width: '200px', height: '200px', objectFit: 'contain', background: 'white', padding: '8px', borderRadius: '12px', marginBottom: '16px', border: '1px solid var(--border)' }} />
                    )}
                    {restaurant.upiId && (
                      <a href={`upi://pay?pa=${restaurant.upiId}&pn=${encodeURIComponent(restaurant.name || 'Restaurant')}&am=${finalTotal.toFixed(2)}&cu=INR`} 
                         style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '14px', background: 'var(--bg-color)', color: 'var(--primary)', border: '2px solid var(--primary)', borderRadius: '12px', fontWeight: '800', fontSize: '1.05rem', textDecoration: 'none', marginBottom: '20px' }}>
                          ⚡ Pay via UPI App (PhonePe, GPay)
                      </a>
                    )}
                    <button onClick={() => placeOrder('UPI')} disabled={ordering} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #2ed573, #26de81)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '1.05rem', cursor: ordering ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(46,213,115,0.3)' }}>
                      {ordering ? 'Sending to Kitchen...' : '✅ I have paid, Place Order'}
                    </button>
                  </div>
                )}
                
                {!showUpi && canPlaceOrders(restaurant) && (
                  <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Your order will be sent directly to the kitchen.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Options / Modifiers Modal */}
      {showOptionsFor && (() => {
        const item = categories.flatMap(c => c.items).find(i => i.id === showOptionsFor);
        if (!item) return null;
        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div onClick={() => { setShowOptionsFor(null); setItemOptions([]); }} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }} />
            <div className="animate-fade-in" style={{ position: 'relative', width: '100%', maxWidth: '420px', background: 'var(--surface)', borderRadius: '24px', padding: '28px', zIndex: 301, border: '1px solid var(--border)', boxShadow: '0 12px 40px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Customize {item.name}</h2>
                <button onClick={() => { setShowOptionsFor(null); setItemOptions([]); }} style={{ background: 'var(--bg-color)', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={16} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {itemOptions.map((g, gIdx) => (
                  <div key={g.groupName}>
                    <div style={{ fontWeight: '700', marginBottom: '8px', fontSize: '0.95rem' }}>
                      {g.groupName} {g.required ? <span style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>*</span> : <span style={{ color: 'var(--text-muted)', fontWeight: '400', fontSize: '0.8rem' }}>(optional)</span>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {g.options.map((opt, oIdx) => {
                        const isSelected = g.type === 'single' ? g.selected === oIdx : g.selected.includes(oIdx);
                        return (
                          <button key={oIdx} onClick={() => {
                            setItemOptions(prev => prev.map((pg, i) => {
                              if (i !== gIdx) return pg;
                              if (g.type === 'single') return { ...pg, selected: pg.selected === oIdx ? null : oIdx };
                              return { ...pg, selected: pg.selected.includes(oIdx) ? pg.selected.filter(s => s !== oIdx) : [...pg.selected, oIdx] };
                            }));
                          }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '12px', border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`, background: isSelected ? 'rgba(255,71,87,0.05)' : 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.15s' }}>
                            <span style={{ fontWeight: isSelected ? '700' : '500', color: 'var(--text-main)' }}>{opt.name}</span>
                            {opt.price > 0 && <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>+{currency}{opt.price}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => {
                const missingRequired = itemOptions.filter(g => g.required).some(g => g.type === 'single' ? g.selected === null : g.selected.length === 0);
                if (missingRequired) {
                  showToast('Please select all required options', 'error');
                  return;
                }
                const selectedModifiers = itemOptions.flatMap(g => {
                  const indices = g.type === 'single' ? (g.selected !== null ? [g.selected] : []) : g.selected;
                  return indices.map(i => ({ groupName: g.groupName, optionName: g.options[i].name, price: g.options[i].price || 0 }));
                });
                addToCart(item, selectedModifiers);
              }} style={{ width: '100%', marginTop: '24px', padding: '16px', background: 'linear-gradient(135deg, #ff4757, #ff6b81)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(255,71,87,0.35)' }}>
                Add to Cart — {currency}{(item.price + itemOptions.reduce((s, g) => s + (g.type === 'single' ? (g.selected !== null ? (g.options[g.selected]?.price || 0) : 0) : g.selected.reduce((ss, oi) => ss + (g.options[oi]?.price || 0), 0)), 0)).toFixed(2)}
              </button>
            </div>
          </div>
        );
      })()}

      {/* Feedback Modal */}
      {showFeedback && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={() => setShowFeedback(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }} />
          <div className="animate-fade-in" style={{ position: 'relative', width: '100%', maxWidth: '400px', background: 'var(--surface)', borderRadius: '24px', padding: '28px', zIndex: 301, border: '1px solid var(--border)', boxShadow: '0 12px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>How was your meal?</h2>
              <button onClick={() => setShowFeedback(false)} style={{ background: 'var(--bg-color)', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={submitFeedback}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button 
                    key={star} 
                    type="button" 
                    onClick={() => setRating(star)} 
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  >
                    <Star size={32} fill={rating >= star ? '#feca57' : 'transparent'} color={rating >= star ? '#feca57' : 'var(--border)'} />
                  </button>
                ))}
              </div>
              
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="What did you love? Any suggestions?"
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-color)', color: 'var(--text-main)', fontFamily: 'inherit', resize: 'none', height: '100px', marginBottom: '20px' }}
              />
              
              <button type="submit" disabled={submittingFeedback} style={{ width: '100%', padding: '14px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '1rem', cursor: submittingFeedback ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ItemCard({ item, currency, qty, onAdd, onRemove }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: '18px', border: '1px solid var(--border)', padding: '14px', display: 'flex', gap: '14px', alignItems: 'center' }}>
      {/* Image */}
      {item.image
        ? <img src={item.image} alt={item.name} style={{ width: '84px', height: '84px', borderRadius: '14px', objectFit: 'cover', flexShrink: 0 }} onError={e => { e.target.style.display = 'none'; }} />
        : <div style={{ width: '84px', height: '84px', borderRadius: '14px', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>🍽️</div>
      }

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          {item.isVeg
            ? <span style={{ width: '14px', height: '14px', border: '2px solid #2ed573', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ width: '6px', height: '6px', background: '#2ed573', borderRadius: '50%', display: 'block' }} /></span>
            : <span style={{ width: '14px', height: '14px', border: '2px solid #ff4757', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ width: '0', height: '0', borderLeft: '3px solid transparent', borderRight: '3px solid transparent', borderBottom: '6px solid #ff4757', display: 'block' }} /></span>
          }
          <span style={{ fontWeight: '700', fontSize: '0.98rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
        </div>
        {item.description && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {item.description}
          </p>
        )}
        <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '1rem' }}>{currency}{parseFloat(item.price).toFixed(2)}</span>
      </div>

      {/* Add/Remove Button */}
      <div style={{ flexShrink: 0 }}>
        {qty === 0 ? (
          <button onClick={onAdd} style={{ background: 'var(--surface)', border: '2px solid var(--primary)', color: 'var(--primary)', borderRadius: '12px', padding: '9px 20px', fontWeight: '800', fontSize: '0.92rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--primary)'; }}>
            ADD
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #ff4757, #ff6b81)', borderRadius: '12px', padding: '7px 10px' }}>
            <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', padding: '2px' }}><Minus size={16} /></button>
            <span style={{ color: 'white', fontWeight: '800', minWidth: '18px', textAlign: 'center' }}>{qty}</span>
            <button onClick={onAdd} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', padding: '2px' }}><Plus size={16} /></button>
          </div>
        )}
      </div>
    </div>
  );
}
