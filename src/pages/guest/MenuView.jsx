import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../lib/firebase';
import {
  doc, collection, onSnapshot, addDoc, serverTimestamp,
  query, orderBy, getDoc
} from 'firebase/firestore';
import { X, Plus, Minus, ChefHat, Check, AlertCircle, Star, Crown, CreditCard, Smartphone } from 'lucide-react';
import { canPlaceOrders } from '../../lib/subscription';
import { initializeRazorpayPayment, DEFAULT_RAZORPAY_KEY } from '../../lib/razorpay';

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

  // Menu cards only know the item id — decrement whichever cart entry
  // (including modifier variants) belongs to that item.
  const removeFromCartById = (id) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.id === id);
      if (idx === -1) return prev;
      if (prev[idx].qty <= 1) return prev.filter(i => i !== prev[idx]);
      return prev.map((i, index) => index === idx ? { ...i, qty: i.qty - 1 } : i);
    });
  };

  const getQty = (id) => cart.reduce((s, i) => s + (i.id === id ? i.qty : 0), 0);

  const toastTimeout = useRef(null);

  const showToast = (msg, type = 'success') => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToast({ msg, type });
    toastTimeout.current = setTimeout(() => {
      setToast(null);
      toastTimeout.current = null;
    }, 3500);
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
          basePrice: i.basePrice ?? i.price
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

  const placeOrderWithRazorpay = async () => {
    if (cart.length === 0) return;
    setOrdering(true);
    try {
      const customKey = restaurant?.razorpayKeyId || DEFAULT_RAZORPAY_KEY;
      await initializeRazorpayPayment({
        amount: finalTotal,
        currency: currency === '₹' ? 'INR' : currency,
        name: restaurant?.name || 'DinePulse Fine Dining',
        description: `Order for Table ${tableNumber}`,
        key: customKey,
        onSuccess: async (res) => {
          await addDoc(collection(db, 'restaurants', restaurantId, 'orders'), {
            tableNumber,
            items: cart.map(i => ({
              id: i.id, name: i.name, price: i.price, qty: i.qty,
              modifiers: i.modifiers || [],
              basePrice: i.basePrice ?? i.price
            })),
            subtotal: cartTotal,
            taxAmount,
            total: finalTotal,
            status: 'pending',
            paymentMethod: 'Razorpay Online',
            paymentStatus: 'paid',
            razorpayPaymentId: res.razorpay_payment_id,
            createdAt: serverTimestamp(),
            instructions: instructions.trim() || '',
          });
          setCart([]);
          setShowCart(false);
          setShowUpi(false);
          showToast('Payment successful! Your order has been sent to the kitchen. 🍳');
          setOrdering(false);
        },
        onFailure: (err) => {
          setOrdering(false);
          if (!err?.dismissed) {
            showToast('Razorpay Payment failed or cancelled.', 'error');
          }
        }
      });
    } catch (err) {
      console.error('Razorpay Order Error:', err);
      setOrdering(false);
      showToast('Failed to open Razorpay payment gateway.', 'error');
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
        items: (c.items || []).filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
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
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', paddingBottom: '90px' }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 999, background: toast.type === 'error' ? '#ff4757' : 'linear-gradient(135deg, #d97706, #f59e0b)', color: toast.type === 'error' ? 'white' : '#060709', padding: '12px 24px', borderRadius: '50px', fontWeight: '800', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
          {toast.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '16px 20px', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(16px)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {restaurant.logo ? (
              <img src={restaurant.logo} alt={restaurant.name} style={{ width: '40px', height: '40px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border)' }} />
            ) : (
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #d97706, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#060709', fontSize: '1.2rem' }}>
                {restaurant.name?.[0] || 'D'}
              </div>
            )}
            <div>
              <h1 style={{ fontSize: '1.1rem', fontWeight: '900', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {restaurant.name}
              </h1>
              <span style={{ fontSize: '0.78rem', color: '#14b8a6', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#14b8a6' }} /> Table {tableNumber}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={() => setShowFeedback(true)} style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#f59e0b', borderRadius: '50px', padding: '8px 14px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star size={14} fill="#f59e0b" /> Feedback
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ maxWidth: '600px', margin: '14px auto 0' }}>
          <input 
            type="text" 
            placeholder="Search dishes or drinks..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input-field" 
            style={{ padding: '10px 16px', fontSize: '0.88rem', borderRadius: '50px' }}
          />
        </div>
      </header>

      {/* Category Pills Bar */}
      {categories.length > 0 && (
        <div style={{ background: 'var(--surface-glass)', borderBottom: '1px solid var(--border)', padding: '12px 20px', position: 'sticky', top: '110px', zIndex: 90, backdropFilter: 'blur(16px)' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {categories.map(cat => (
              <button 
                key={cat.id} 
                onClick={() => {
                  setActiveCategory(cat.id);
                  const el = document.getElementById(`cat-${cat.id}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  background: activeCategory === cat.id ? 'linear-gradient(135deg, #d97706, #f59e0b)' : 'var(--bg-secondary)',
                  color: activeCategory === cat.id ? '#060709' : 'var(--text-muted)',
                  border: activeCategory === cat.id ? 'none' : '1px solid var(--border)',
                  padding: '7px 16px', borderRadius: '50px', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s'
                }}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Menu Categories List */}
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        {filteredCategories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <ChefHat size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p>No dishes found matching your search.</p>
          </div>
        ) : (
          filteredCategories.map(cat => (
            <div key={cat.id} id={`cat-${cat.id}`} style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '14px', letterSpacing: '-0.3px', color: '#fcd34d', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                {cat.name}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(cat.items || []).map(item => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    currency={currency}
                    qty={getQty(item.id)}
                    onAdd={() => {
                      if (item.options && item.options.length > 0) {
                        setShowOptionsFor(item.id);
                        setItemOptions(item.options.map(g => ({
                          groupName: g.groupName,
                          type: g.type || 'single',
                          required: g.required || false,
                          options: g.options || [],
                          selected: g.type === 'single' ? null : []
                        })));
                      } else {
                        addToCart(item);
                      }
                    }}
                    onRemove={() => removeFromCartById(item.id)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </main>

      {/* Sticky Bottom Cart Bar */}
      {cartCount > 0 && !showCart && (
        <div style={{ position: 'fixed', bottom: '20px', left: '20px', right: '20px', zIndex: 100, maxWidth: '560px', margin: '0 auto' }}>
          <div 
            onClick={() => setShowCart(true)}
            style={{
              background: 'linear-gradient(135deg, #d97706, #f59e0b)',
              color: '#060709',
              padding: '14px 22px',
              borderRadius: '50px',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(245, 158, 11, 0.4)',
              fontWeight: '900'
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: '#060709', color: '#f59e0b', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
                {cartCount}
              </div>
              <span style={{ fontSize: '0.98rem' }}>View Order Cart</span>
            </div>
            <div style={{ fontSize: '1.05rem' }}>
              {currency}{finalTotal.toFixed(2)} →
            </div>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div onClick={() => setShowCart(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }} />
          <div className="animate-fade-in" style={{ position: 'relative', width: '100%', maxWidth: '600px', background: 'var(--surface)', borderTopLeftRadius: '28px', borderTopRightRadius: '28px', padding: '24px', maxHeight: '85vh', overflowY: 'auto', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#fcd34d' }}>Your Table Order</h2>
              <button onClick={() => setShowCart(false)} style={{ background: 'var(--bg-color)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Your cart is empty.</div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  {cart.map(item => (
                    <div key={item.cartKey} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-color)', padding: '12px 16px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>{item.name}</div>
                        {item.modifiers && item.modifiers.length > 0 && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {item.modifiers.map(m => `${m.groupName}: ${m.optionName}`).join(', ')}
                          </div>
                        )}
                        <div style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: '800', marginTop: '2px' }}>
                          {currency}{(item.price * item.qty).toFixed(2)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface)', padding: '4px 8px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                        <button onClick={() => removeFromCart(item.cartKey)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}><Minus size={14} /></button>
                        <span style={{ fontWeight: '800', fontSize: '0.9rem', minWidth: '16px', textAlign: 'center' }}>{item.qty}</span>
                        <button onClick={() => addToCart(item, item.modifiers)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}><Plus size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Special Instructions */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px' }}>Special Kitchen Instructions</label>
                  <textarea value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="E.g., extra spicy, no onions, allergies..."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-color)', color: 'var(--text-main)', fontFamily: 'inherit', resize: 'none', fontSize: '0.88rem', height: '60px' }} />
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: '800' }}>Total Bill</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: '900', color: '#f59e0b' }}>{currency}{finalTotal.toFixed(2)}</span>
                </div>

                {!canPlaceOrders(restaurant) ? (
                  <div style={{ textAlign: 'center', padding: '24px 16px', background: 'var(--bg-color)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
                    <Crown size={32} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: '8px' }} />
                    <h3 style={{ fontWeight: '700', marginBottom: '6px' }}>Ordering Unavailable</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>This restaurant is using the Free Plan preview mode.</p>
                  </div>
                ) : !showUpi ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Razorpay Online Payment */}
                    <button onClick={placeOrderWithRazorpay} disabled={ordering} 
                      style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #d97706, #f59e0b)', color: '#060709', border: 'none', borderRadius: '14px', fontWeight: '900', fontSize: '1rem', cursor: ordering ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: '0 6px 20px rgba(245,158,11,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <CreditCard size={18} /> {ordering ? 'Opening Razorpay...' : 'Pay via Razorpay (Cards, UPI, NetBanking)'}
                    </button>

                    {/* Manual UPI */}
                    {(restaurant.upiId || restaurant.upiQrUrl) && (
                      <button onClick={() => setShowUpi(true)} disabled={ordering} 
                        style={{ width: '100%', padding: '14px', background: 'var(--surface)', color: '#14b8a6', border: '1.5px solid #14b8a6', borderRadius: '14px', fontWeight: '800', fontSize: '0.95rem', cursor: ordering ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Smartphone size={16} /> Pay via Static UPI QR
                      </button>
                    )}

                    {/* Pay at Table / Cash */}
                    <button onClick={() => placeOrder('Cash')} disabled={ordering} 
                      style={{ width: '100%', padding: '14px', background: 'var(--bg-color)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '14px', fontWeight: '700', fontSize: '0.92rem', cursor: ordering ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                      💵 Pay Cash / Pay at Table
                    </button>
                  </div>
                ) : (
                  <div className="animate-fade-in" style={{ background: 'var(--bg-color)', borderRadius: '16px', padding: '20px', textAlign: 'center', border: '1px solid var(--primary)' }}>
                    <h3 style={{ fontWeight: '800', marginBottom: '8px', color: '#fcd34d' }}>Pay {currency}{finalTotal.toFixed(2)} via UPI QR</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '14px' }}>Scan the QR code below to complete payment.</p>
                    {restaurant.upiQrUrl && (
                      <img src={restaurant.upiQrUrl} alt="UPI QR Code" style={{ width: '180px', height: '180px', objectFit: 'contain', background: 'white', padding: '8px', borderRadius: '12px', marginBottom: '14px', border: '1px solid var(--border)' }} />
                    )}
                    {restaurant.upiId && (
                      <a href={`upi://pay?pa=${restaurant.upiId}&pn=${encodeURIComponent(restaurant.name || 'Restaurant')}&am=${finalTotal.toFixed(2)}&cu=INR`} 
                         style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '12px', background: 'var(--bg-color)', color: '#14b8a6', border: '1.5px solid #14b8a6', borderRadius: '12px', fontWeight: '800', fontSize: '0.95rem', textDecoration: 'none', marginBottom: '16px' }}>
                          ⚡ Pay via PhonePe / GPay App
                      </a>
                    )}
                    <button onClick={() => placeOrder('UPI QR')} disabled={ordering} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #0f766e, #14b8a6)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '0.95rem', cursor: ordering ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(20,184,166,0.3)' }}>
                      {ordering ? 'Sending to Kitchen...' : '✅ I have paid, Send Order to Kitchen'}
                    </button>
                  </div>
                )}
                
                {!showUpi && canPlaceOrders(restaurant) && (
                  <p style={{ textAlign: 'center', marginTop: '14px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Orders are routed instantly to the kitchen display screen.
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
            <div onClick={() => { setShowOptionsFor(null); setItemOptions([]); }} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }} />
            <div className="animate-fade-in" style={{ position: 'relative', width: '100%', maxWidth: '420px', background: 'var(--surface)', borderRadius: '24px', padding: '24px', zIndex: 301, border: '1px solid var(--border)', boxShadow: '0 12px 40px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: '800' }}>Customize {item.name}</h2>
                <button onClick={() => { setShowOptionsFor(null); setItemOptions([]); }} style={{ background: 'var(--bg-color)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={16} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {itemOptions.map((g, gIdx) => (
                  <div key={g.groupName}>
                    <div style={{ fontWeight: '700', marginBottom: '6px', fontSize: '0.9rem' }}>
                      {g.groupName} {g.required ? <span style={{ color: '#f59e0b', fontSize: '0.8rem' }}>*</span> : <span style={{ color: 'var(--text-muted)', fontWeight: '400', fontSize: '0.78rem' }}>(optional)</span>}
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
                          }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '12px', border: `1.5px solid ${isSelected ? '#f59e0b' : 'var(--border)'}`, background: isSelected ? 'rgba(245, 158, 11, 0.1)' : 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.15s' }}>
                            <span style={{ fontWeight: isSelected ? '700' : '500', color: 'var(--text-main)', fontSize: '0.88rem' }}>{opt.name}</span>
                            {opt.price > 0 && <span style={{ fontWeight: '600', color: '#f59e0b', fontSize: '0.85rem' }}>+{currency}{opt.price}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => {
                const selectedModifiers = itemOptions.flatMap(g => {
                  if (g.type === 'single') {
                    if (g.selected === null) return [];
                    return [{ groupName: g.groupName, optionName: g.options[g.selected]?.name ?? 'Option', price: g.options[g.selected]?.price ?? 0 }];
                  }
                  const indices = g.selected || [];
                  return indices.map(i => ({ groupName: g.groupName, optionName: g.options[i]?.name ?? 'Option', price: g.options[i]?.price ?? 0 }));
                });
                addToCart(item, selectedModifiers);
              }} style={{ width: '100%', marginTop: '20px', padding: '14px', background: 'linear-gradient(135deg, #d97706, #f59e0b)', color: '#060709', border: 'none', borderRadius: '14px', fontWeight: '900', fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(245,158,11,0.35)' }}>
                Add to Cart — {currency}{(item.price + itemOptions.reduce((s, g) => s + (g.type === 'single' ? (g.selected !== null ? (g.options[g.selected]?.price || 0) : 0) : g.selected.reduce((ss, oi) => ss + (g.options[oi]?.price || 0), 0)), 0)).toFixed(2)}
              </button>
            </div>
          </div>
        );
      })()}

      {/* Feedback Modal */}
      {showFeedback && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={() => setShowFeedback(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }} />
          <div className="animate-fade-in" style={{ position: 'relative', width: '100%', maxWidth: '400px', background: 'var(--surface)', borderRadius: '24px', padding: '24px', zIndex: 301, border: '1px solid var(--border)', boxShadow: '0 12px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800' }}>How was your dining experience?</h2>
              <button onClick={() => setShowFeedback(false)} style={{ background: 'var(--bg-color)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={submitFeedback}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button 
                    key={star} 
                    type="button" 
                    onClick={() => setRating(star)} 
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  >
                    <Star size={28} fill={rating >= star ? '#f59e0b' : 'transparent'} color={rating >= star ? '#f59e0b' : 'var(--border)'} />
                  </button>
                ))}
              </div>
              
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="What did you enjoy? Any dish suggestions?"
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-color)', color: 'var(--text-main)', fontFamily: 'inherit', resize: 'none', height: '90px', marginBottom: '18px', fontSize: '0.88rem' }}
              />
              
              <button type="submit" disabled={submittingFeedback} style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #d97706, #f59e0b)', color: '#060709', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '0.95rem', cursor: submittingFeedback ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                {submittingFeedback ? 'Submitting...' : 'Submit Review'}
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
    <div style={{ background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', padding: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
      {/* Image */}
      {item.image
        ? <img src={item.image} alt={item.name} style={{ width: '74px', height: '74px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }} onError={e => { e.target.style.display = 'none'; }} />
        : <div style={{ width: '74px', height: '74px', borderRadius: '12px', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0 }}>🍽️</div>
      }

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
          {item.isVeg
            ? <span style={{ width: '12px', height: '12px', border: '2px solid #10b981', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ width: '5px', height: '5px', background: '#10b981', borderRadius: '50%', display: 'block' }} /></span>
            : <span style={{ width: '12px', height: '12px', border: '2px solid #ef4444', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ width: '0', height: '0', borderLeft: '3px solid transparent', borderRight: '3px solid transparent', borderBottom: '5px solid #ef4444', display: 'block' }} /></span>
          }
          <span style={{ fontWeight: '800', fontSize: '0.92rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
        </div>
        {item.description && (
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '6px', lineHeight: '1.35', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {item.description}
          </p>
        )}
        <span style={{ fontWeight: '900', color: '#f59e0b', fontSize: '0.95rem' }}>{currency}{parseFloat(item.price).toFixed(2)}</span>
      </div>

      {/* Add/Remove Button */}
      <div style={{ flexShrink: 0 }}>
        {qty === 0 ? (
          <button onClick={onAdd} style={{ background: 'var(--surface)', border: '1.5px solid #f59e0b', color: '#f59e0b', borderRadius: '10px', padding: '7px 16px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f59e0b'; e.currentTarget.style.color = '#060709'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = '#f59e0b'; }}>
            ADD
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #d97706, #f59e0b)', borderRadius: '10px', padding: '5px 8px' }}>
            <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#060709', display: 'flex', padding: '2px' }}><Minus size={14} /></button>
            <span style={{ color: '#060709', fontWeight: '900', minWidth: '16px', textAlign: 'center', fontSize: '0.85rem' }}>{qty}</span>
            <button onClick={onAdd} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#060709', display: 'flex', padding: '2px' }}><Plus size={14} /></button>
          </div>
        )}
      </div>
    </div>
  );
}
